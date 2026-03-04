import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById } from "@/lib/db/queries/sessions";
import { getLatestDocument, createDocument } from "@/lib/db/queries/documents";
import { createMessage } from "@/lib/db/queries/messages";
import { getUserById } from "@/lib/db/queries/users";
import { orchestrate } from "@/lib/ai/agents/orchestrator";
import { runRequirementAgent } from "@/lib/ai/agents/requirement-agent";
import { runDesignAgent } from "@/lib/ai/agents/design-agent";
import { runERAgent } from "@/lib/ai/agents/er-agent";
import { runAPIAgent } from "@/lib/ai/agents/api-agent";
import { runPlanAgent } from "@/lib/ai/agents/plan-agent";
import { AGENT_LABELS } from "@/lib/ai/agent-meta";
import type { AgentType } from "@/lib/ai/agents/orchestrator";
import type { PersistedAgentStep, PersistedAgentTool } from "@/types";

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, prompt, confirmedAgents } = body as {
    sessionId?: string;
    prompt?: string;
    confirmedAgents?: AgentType[];
  };

  if (!sessionId || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [sessionData, user] = await Promise.all([
    getSessionById(sessionId),
    getUserById(session.user.id),
  ]);
  if (!sessionData || sessionData.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPrompt = user?.userMd
    ? `${prompt}\n\n[用户背景信息]\n${user.userMd}`
    : prompt;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        // Step 1: Orchestrate (skip if confirmedAgents provided)
        let agentsToRun: AgentType[];
        if (confirmedAgents && confirmedAgents.length > 0) {
          agentsToRun = confirmedAgents.filter((a): a is AgentType =>
            ["requirement", "design", "er", "api", "plan"].includes(a)
          );
          send({ type: "status", message: "开始执行已确认的 Agent..." });
        } else {
          send({ type: "status", message: "正在分析需求，决定调用哪些 Agent..." });
          agentsToRun = await orchestrate(fullPrompt);
        }
        send({ type: "agents", agents: agentsToRun });

        // Step 2: Get existing documents for context
        const existingMermaid = await getLatestDocument(sessionId, "mermaid");
        const existingApiSpec = await getLatestDocument(sessionId, "api_spec");

        // Step 3: Run agents — fire all, stream as each completes
        const savedDocs: string[] = [];
        const statusLabel = confirmedAgents ? "开始执行已确认的 Agent..." : "正在分析需求，决定调用哪些 Agent...";
        const persistedSteps: PersistedAgentStep[] = [
          { id: `step-${Date.now()}`, label: statusLabel, status: "done" },
        ];
        const persistedTools: PersistedAgentTool[] = [];

        const agentLabels = AGENT_LABELS;

        const agentTasks: { agent: AgentType; promise: Promise<string> }[] = [];

        for (const agent of agentsToRun) {
          let agentInput: Record<string, unknown> = { prompt: fullPrompt };
          switch (agent) {
            case "requirement":
              if (existingApiSpec?.content) agentInput.existingContext = existingApiSpec.content;
              send({ type: "agent_start", agent, label: agentLabels[agent], input: agentInput });
              agentTasks.push({
                agent: "requirement",
                promise: runRequirementAgent(fullPrompt, existingApiSpec?.content),
              });
              break;
            case "design":
              if (existingMermaid?.content) agentInput.existingContext = existingMermaid.content;
              send({ type: "agent_start", agent, label: agentLabels[agent], input: agentInput });
              agentTasks.push({
                agent: "design",
                promise: runDesignAgent(fullPrompt, existingMermaid?.content),
              });
              break;
            case "er":
              if (existingMermaid?.content) agentInput.existingContext = existingMermaid.content;
              send({ type: "agent_start", agent, label: agentLabels[agent], input: agentInput });
              agentTasks.push({
                agent: "er",
                promise: runERAgent(fullPrompt, existingMermaid?.content),
              });
              break;
            case "api":
              if (existingApiSpec?.content) agentInput.existingContext = existingApiSpec.content;
              send({ type: "agent_start", agent, label: agentLabels[agent], input: agentInput });
              agentTasks.push({
                agent: "api",
                promise: runAPIAgent(fullPrompt, existingApiSpec?.content),
              });
              break;
            case "plan":
              send({ type: "agent_start", agent, label: agentLabels[agent], input: agentInput });
              agentTasks.push({
                agent: "plan",
                promise: runPlanAgent(fullPrompt),
              });
              break;
          }
        }

        // Start all agents, stream progress as each one finishes
        send({ type: "status", message: `正在并行运行 ${agentTasks.length} 个 Agent...` });
        persistedSteps.push({ id: `step-${Date.now()}`, label: `正在并行运行 ${agentTasks.length} 个 Agent...`, status: "done" });

        // Use Promise.allSettled-like pattern but stream as each resolves
        const pending = agentTasks.map(({ agent, promise }) =>
          promise
            .then(async (result) => {
              send({ type: "agent_output", agent, label: agentLabels[agent], output: { content: result } });

              // Save document immediately
              switch (agent) {
                case "design":
                  await createDocument({
                    sessionId,
                    type: "mermaid",
                    diagramType: "architecture",
                    content: result,
                    title: "系统架构图",
                  });
                  savedDocs.push("架构图");
                  break;
                case "er":
                  await createDocument({
                    sessionId,
                    type: "mermaid",
                    diagramType: "er",
                    content: result,
                    title: "ER 图",
                  });
                  savedDocs.push("ER 图");
                  break;
                case "api":
                  await createDocument({
                    sessionId,
                    type: "api_spec",
                    content: result,
                    title: "API 接口规范",
                  });
                  savedDocs.push("API 规范");
                  break;
                case "requirement":
                  await createDocument({
                    sessionId,
                    type: "arch_design",
                    content: result,
                    title: "需求分析文档",
                  });
                  savedDocs.push("需求分析");
                  break;
                case "plan":
                  await createDocument({
                    sessionId,
                    type: "dev_plan",
                    content: result,
                    title: "发展计划",
                  });
                  savedDocs.push("发展计划");
                  break;
              }

              send({ type: "doc_saved", agent, label: agentLabels[agent] });
              persistedTools.push({ agent, label: agentLabels[agent], state: "output-available" });
            })
            .catch((err) => {
              send({ type: "agent_error", agent, label: agentLabels[agent], errorText: String(err) });
              persistedTools.push({ agent, label: agentLabels[agent], state: "output-error", errorText: String(err) });
            })
        );

        await Promise.all(pending);

        // Step 4: Save assistant summary message
        const summary = `已完成生成: ${savedDocs.join("、")}。\n\n调用的 Agent: ${agentsToRun.join(", ")}`;
        await createMessage({
          sessionId,
          role: "assistant",
          content: summary,
          metadata: { agents: agentsToRun, generatedTypes: savedDocs, steps: persistedSteps, tools: persistedTools },
        });

        send({ type: "done", summary, generated: savedDocs });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "生成失败";
        send({ type: "error", error: errorMsg });

        await createMessage({
          sessionId,
          role: "assistant",
          content: `生成失败: ${errorMsg}`,
        }).catch(() => {});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

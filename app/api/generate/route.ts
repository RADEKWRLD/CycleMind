import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById } from "@/lib/db/queries/sessions";
import { getLatestDocument, createDocument } from "@/lib/db/queries/documents";
import { createMessage } from "@/lib/db/queries/messages";
import { orchestrate, type AgentType } from "@/lib/ai/agents/orchestrator";
import { runRequirementAgent } from "@/lib/ai/agents/requirement-agent";
import { runDesignAgent } from "@/lib/ai/agents/design-agent";
import { runERAgent } from "@/lib/ai/agents/er-agent";
import { runAPIAgent } from "@/lib/ai/agents/api-agent";
import { runPlanAgent } from "@/lib/ai/agents/plan-agent";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId, prompt } = body;

  if (!sessionId || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sessionData = await getSessionById(sessionId);
  if (!sessionData || sessionData.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Step 1: Orchestrator decides which agents to call
    const agentsToRun = await orchestrate(prompt);

    // Step 2: Get existing documents for context
    const existingMermaid = await getLatestDocument(sessionId, "mermaid");
    const existingApiSpec = await getLatestDocument(sessionId, "api_spec");

    // Step 3: Run agents in parallel
    const results: Record<string, string> = {};
    const agentPromises: Promise<void>[] = [];

    for (const agent of agentsToRun) {
      switch (agent) {
        case "requirement":
          agentPromises.push(
            runRequirementAgent(prompt, existingApiSpec?.content).then(
              (r) => { results.requirement = r; }
            )
          );
          break;
        case "design":
          agentPromises.push(
            runDesignAgent(prompt, existingMermaid?.content).then(
              (r) => { results.design = r; }
            )
          );
          break;
        case "er":
          agentPromises.push(
            runERAgent(prompt, existingMermaid?.content).then(
              (r) => { results.er = r; }
            )
          );
          break;
        case "api":
          agentPromises.push(
            runAPIAgent(prompt, existingApiSpec?.content).then(
              (r) => { results.api = r; }
            )
          );
          break;
        case "plan":
          agentPromises.push(
            runPlanAgent(prompt).then(
              (r) => { results.plan = r; }
            )
          );
          break;
      }
    }

    await Promise.all(agentPromises);

    // Step 4: Save generated documents
    const savedDocs: string[] = [];

    if (results.design) {
      await createDocument({
        sessionId,
        type: "mermaid",
        diagramType: "architecture",
        content: results.design,
        title: "系统架构图",
      });
      savedDocs.push("架构图");
    }

    if (results.er) {
      await createDocument({
        sessionId,
        type: "mermaid",
        diagramType: "er",
        content: results.er,
        title: "ER 图",
      });
      savedDocs.push("ER 图");
    }

    if (results.api) {
      await createDocument({
        sessionId,
        type: "api_spec",
        content: results.api,
        title: "API 接口规范",
      });
      savedDocs.push("API 规范");
    }

    if (results.requirement) {
      await createDocument({
        sessionId,
        type: "arch_design",
        content: results.requirement,
        title: "需求分析文档",
      });
      savedDocs.push("需求分析");
    }

    if (results.plan) {
      await createDocument({
        sessionId,
        type: "dev_plan",
        content: results.plan,
        title: "发展计划",
      });
      savedDocs.push("发展计划");
    }

    // Step 5: Save assistant message summary
    const summary = `已完成生成: ${savedDocs.join("、")}。\n\n调用的 Agent: ${agentsToRun.join(", ")}`;
    await createMessage({
      sessionId,
      role: "assistant",
      content: summary,
      metadata: { agents: agentsToRun, generatedTypes: savedDocs },
    });

    return NextResponse.json({
      success: true,
      agents: agentsToRun,
      generated: savedDocs,
      summary,
    });
  } catch (err) {
    console.error("Generation error:", err);
    const errorMsg = err instanceof Error ? err.message : "生成失败";

    await createMessage({
      sessionId,
      role: "assistant",
      content: `生成失败: ${errorMsg}`,
    });

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

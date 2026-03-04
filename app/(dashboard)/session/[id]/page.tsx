"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { AGENT_LABELS, AGENT_DESCRIPTIONS } from "@/lib/ai/agent-meta";
import type { Session, Message, Document, StreamStep, AgentToolPart, AgentConfirmationItem } from "@/types";

type DocTab = "mermaid" | "er" | "api_spec" | "arch_design" | "dev_plan";


export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    mermaid: null,
    er: null,
    api_spec: null,
    arch_design: null,
    dev_plan: null,
  });
  const [isChatting, setIsChatting] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    agents: AgentConfirmationItem[];
    prompt: string;
  } | null>(null);
  const [streamSteps, setStreamSteps] = useState<StreamStep[]>([]);
  const [agentToolParts, setAgentToolParts] = useState<Map<string, AgentToolPart>>(new Map());
  const [previewOpen, setPreviewOpen] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const [sessionRes, messagesRes, docsRes] = await Promise.all([
      fetch(`/api/sessions/${id}`),
      fetch(`/api/sessions/${id}/messages`),
      fetch(`/api/sessions/${id}/documents`),
    ]);

    if (sessionRes.ok) {
      const data = await sessionRes.json();
      setSession(data.session);
    }
    if (messagesRes.ok) {
      const data = await messagesRes.json();
      setMessages(data.messages);
    }
    if (docsRes.ok) {
      const data = await docsRes.json();
      const grouped: Record<string, Document | null> = {
        mermaid: null,
        er: null,
        api_spec: null,
        arch_design: null,
        dev_plan: null,
      };
      for (const doc of data.documents as Document[]) {
        const key = doc.type === "mermaid"
          ? (doc.diagramType === "er" ? "er" : "mermaid")
          : doc.type;
        if (!grouped[key] || doc.version > (grouped[key]?.version ?? 0)) {
          grouped[key] = doc;
        }
      }
      setDocuments(grouped);
    }
  }, [id]);

  const fetchDocuments = useCallback(async () => {
    const docsRes = await fetch(`/api/sessions/${id}/documents`);
    if (docsRes.ok) {
      const data = await docsRes.json();
      const grouped: Record<string, Document | null> = {
        mermaid: null,
        er: null,
        api_spec: null,
        arch_design: null,
        dev_plan: null,
      };
      for (const doc of data.documents as Document[]) {
        const key = doc.type === "mermaid"
          ? (doc.diagramType === "er" ? "er" : "mermaid")
          : doc.type;
        if (!grouped[key] || doc.version > (grouped[key]?.version ?? 0)) {
          grouped[key] = doc;
        }
      }
      setDocuments(grouped);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isSending = isChatting || isOrchestrating || isExecuting;

  // Phase 1: Chat with conversation agent (streaming)
  async function handleSend(content: string) {
    if (isSending) return;

    setIsChatting(true);
    setStreamingText("");
    setStreamSteps([]);
    setAgentToolParts(new Map());
    setPendingConfirmation(null);

    // Optimistic: show user message immediately
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sessionId: id,
      role: "user",
      content,
      metadata: null,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    let readyToGenerate = false;
    let chatSummary = "";

    try {
      // User message is saved by the chat route, not here
      const res = await fetch(`/api/sessions/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "");
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine);
              switch (event.type) {
                case "token":
                  setStreamingText((prev) => prev + event.token);
                  break;
                case "done":
                  readyToGenerate = event.readyToGenerate;
                  chatSummary = event.content || "";
                  break;
                case "error":
                  throw new Error(event.error);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== "SSE parse error") {
                throw parseErr;
              }
              console.warn("SSE parse error:", parseErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat failed:", err);
    }

    // Refresh messages from DB first, then hide streaming bubble
    const messagesRes = await fetch(`/api/sessions/${id}/messages`);
    if (messagesRes.ok) {
      const data = await messagesRes.json();
      setMessages(data.messages);
    }
    setStreamingText("");
    setIsChatting(false);

    // If agent says ready, auto-trigger orchestration with full context
    if (readyToGenerate) {
      const prompt = chatSummary
        ? `用户需求: ${content}\n\n需求总结: ${chatSummary}`
        : content;
      await triggerOrchestration(prompt);
    }
  }

  // Orchestrate — get agent plan, show confirmation
  async function triggerOrchestration(prompt: string) {
    setIsOrchestrating(true);
    setStreamSteps([{ id: "orch", label: "需求已就绪，正在分析...", status: "done" }]);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, prompt }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { agents } = await res.json() as { agents: string[] };

      const items: AgentConfirmationItem[] = agents.map((a) => ({
        id: a,
        label: AGENT_LABELS[a as keyof typeof AGENT_LABELS] ?? a,
        description: AGENT_DESCRIPTIONS[a as keyof typeof AGENT_DESCRIPTIONS] ?? "",
        enabled: true,
      }));

      setStreamSteps([]);
      setPendingConfirmation({ agents: items, prompt });
    } catch (err) {
      console.error("Orchestration failed:", err);
      setStreamSteps([
        { id: `error-${Date.now()}`, label: "分析失败，请重试", status: "error" },
      ]);
    } finally {
      setIsOrchestrating(false);
    }
  }

  // Phase 2: Execute confirmed agents
  async function handleConfirm(selectedIds: string[]) {
    if (!pendingConfirmation) return;
    const { prompt } = pendingConfirmation;
    setPendingConfirmation(null);
    setIsExecuting(true);
    setStreamSteps([]);
    setAgentToolParts(new Map());

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, prompt, confirmedAgents: selectedIds }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "");
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine);
              switch (event.type) {
                case "status":
                  setStreamSteps((prev) => [
                    ...prev,
                    { id: `status-${Date.now()}`, label: event.message, status: "done" },
                  ]);
                  break;
                case "agent_start":
                  setAgentToolParts((prev) => {
                    const next = new Map(prev);
                    next.set(event.agent, {
                      type: event.label,
                      state: "input-streaming",
                      input: event.input,
                      toolCallId: event.agent,
                    });
                    return next;
                  });
                  break;
                case "agent_output":
                  setAgentToolParts((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(event.agent);
                    if (existing) {
                      next.set(event.agent, {
                        ...existing,
                        state: "output-available",
                        output: event.output,
                      });
                    }
                    return next;
                  });
                  break;
                case "doc_saved":
                  fetchDocuments();
                  break;
                case "agent_error":
                  setAgentToolParts((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(event.agent);
                    if (existing) {
                      next.set(event.agent, {
                        ...existing,
                        state: "output-error",
                        errorText: event.errorText,
                      });
                    }
                    return next;
                  });
                  break;
                case "done":
                  break;
                case "error":
                  setStreamSteps((prev) => [
                    ...prev,
                    { id: `error-${Date.now()}`, label: event.error, status: "error" },
                  ]);
                  break;
              }
            } catch (parseErr) {
              console.warn("SSE parse error:", parseErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setStreamSteps((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, label: "网络错误，请重试", status: "error" },
      ]);
    }

    await fetchData();
    setIsExecuting(false);
  }

  function handleCancel() {
    setPendingConfirmation(null);
  }

  function togglePreview() {
    const next = !previewOpen;
    setPreviewOpen(next);

    if (next) {
      // Expand preview
      gsap.to(previewRef.current, {
        width: "auto",
        flex: 1,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(chatRef.current, {
        flex: "0 0 420px",
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      // Collapse preview
      gsap.to(previewRef.current, {
        width: 0,
        flex: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
      gsap.to(chatRef.current, {
        flex: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }

  async function handleSaveDocument(type: DocTab, content: string) {
    const isMermaid = type === "mermaid" || type === "er";
    await fetch(`/api/sessions/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: isMermaid ? "mermaid" : type,
        content,
        ...(type === "mermaid" ? { diagramType: "architecture" } : {}),
        ...(type === "er" ? { diagramType: "er" } : {}),
      }),
    });
    await fetchData();
  }

  return (
    <>
      <Header title={session?.title || "加载中..."} />
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-[var(--card)]/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          {session?.description && (
            <span className="text-sm text-[var(--muted-foreground)] truncate">
              {session.description}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={togglePreview}>
          {previewOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 flex min-h-0">
        <div
          ref={chatRef}
          className="overflow-hidden bg-[var(--background)]"
          style={{ flex: "0 0 420px", minWidth: 320 }}
        >
          <ChatPanel
            sessionId={id}
            messages={messages}
            onSend={handleSend}
            isSending={isSending}
            isChatting={isChatting}
            streamingText={streamingText}
            streamSteps={streamSteps}
            agentToolParts={agentToolParts}
            pendingConfirmation={pendingConfirmation}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
        <div
          ref={previewRef}
          className="overflow-hidden"
          style={{ flex: 1 }}
        >
          <PreviewPanel
            documents={documents}
            onSaveDocument={handleSaveDocument}
          />
        </div>
      </div>
    </>
  );
}

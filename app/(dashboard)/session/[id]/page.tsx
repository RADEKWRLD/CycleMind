"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { useGenerationStore } from "@/stores/generation-store";
import { AGENT_LABELS, AGENT_DESCRIPTIONS } from "@/lib/ai/agent-meta";
import type { Session, Message, Document, AgentConfirmationItem } from "@/types";

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
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    agents: AgentConfirmationItem[];
    prompt: string;
  } | null>(null);
  const [orchSteps, setOrchSteps] = useState<{ id: string; label: string; status: "running" | "done" | "error" }[]>([]);
  const [previewOpen, setPreviewOpen] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Generation state from global store (survives page navigation)
  const generationRun = useGenerationStore((s) => s.runs.get(id));
  const startGeneration = useGenerationStore((s) => s.startGeneration);
  const clearGeneration = useGenerationStore((s) => s.clearGeneration);

  const isExecuting = generationRun?.status === "running";
  const streamSteps = isOrchestrating ? orchSteps : (generationRun?.streamSteps ?? []);
  const agentToolParts = generationRun?.agentToolParts ?? new Map();
  const prevDocCountRef = useRef(0);

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

  // Sync doc count ref on mount (in case returning to a running generation)
  useEffect(() => {
    if (generationRun) {
      prevDocCountRef.current = generationRun.completedDocs.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to generation store changes: refetch docs and data
  useEffect(() => {
    if (!generationRun) return;

    const currentDocCount = generationRun.completedDocs.length;
    if (currentDocCount > prevDocCountRef.current) {
      fetchDocuments();
      prevDocCountRef.current = currentDocCount;
    }

    if (generationRun.status === "completed" || generationRun.status === "error") {
      fetchData();
      prevDocCountRef.current = 0;
      // Clear finished generation from store after data refresh
      clearGeneration(id);
    }
  }, [generationRun?.completedDocs.length, generationRun?.status, fetchDocuments, fetchData, clearGeneration, id]);

  const isSending = isChatting || isOrchestrating || isExecuting;

  // Phase 1: Chat with conversation agent (streaming)
  async function handleSend(content: string) {
    if (isSending) return;

    setIsChatting(true);
    setStreamingText("");
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
    setOrchSteps([{ id: "orch", label: "需求已就绪，正在分析...", status: "done" }]);

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

      setOrchSteps([]);
      setPendingConfirmation({ agents: items, prompt });
    } catch (err) {
      console.error("Orchestration failed:", err);
      setOrchSteps([
        { id: `error-${Date.now()}`, label: "分析失败，请重试", status: "error" },
      ]);
    } finally {
      setIsOrchestrating(false);
    }
  }

  // Phase 2: Execute confirmed agents (delegated to global generation store)
  function handleConfirm(selectedIds: string[]) {
    if (!pendingConfirmation) return;
    const { prompt } = pendingConfirmation;
    setPendingConfirmation(null);

    startGeneration({
      sessionId: id,
      sessionTitle: session?.title || "未命名会话",
      prompt,
      confirmedAgents: selectedIds,
    });
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
          className="overflow-hidden bg-background border border-border rounded-lg m-1"
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
          className="overflow-hidden border border-border rounded-lg m-1"
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

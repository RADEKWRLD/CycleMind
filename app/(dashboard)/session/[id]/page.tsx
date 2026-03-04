"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PanelRightOpen, PanelRightClose } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import type { Session, Message, Document } from "@/types";

type DocTab = "mermaid" | "api_spec" | "arch_design" | "dev_plan";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    mermaid: null,
    api_spec: null,
    arch_design: null,
    dev_plan: null,
  });
  const [isSending, setIsSending] = useState(false);
  const [streamStatus, setStreamStatus] = useState("");
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
        api_spec: null,
        arch_design: null,
        dev_plan: null,
      };
      for (const doc of data.documents as Document[]) {
        const key = doc.type;
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
        api_spec: null,
        arch_design: null,
        dev_plan: null,
      };
      for (const doc of data.documents as Document[]) {
        const key = doc.type;
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

  async function handleSend(content: string) {
    setIsSending(true);
    setStreamStatus("");

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

    // Save user message to DB
    await fetch(`/api/sessions/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    // Call AI generation via SSE
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, prompt: content }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
                  setStreamStatus(event.message);
                  break;
                case "agents":
                  setStreamStatus(`调用 Agent: ${event.agents.join(", ")}`);
                  break;
                case "agent_done":
                  setStreamStatus(`${event.label} 生成完成`);
                  break;
                case "doc_saved":
                  // Refresh documents as each one is saved
                  fetchDocuments();
                  setStreamStatus(`${event.label} 已保存`);
                  break;
                case "agent_error":
                  setStreamStatus(`${event.agent} 失败: ${event.error}`);
                  break;
                case "done":
                  setStreamStatus("");
                  break;
                case "error":
                  setStreamStatus(`错误: ${event.error}`);
                  break;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
    }

    // Refresh all data
    await fetchData();
    setIsSending(false);
    setStreamStatus("");
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
    await fetch(`/api/sessions/${id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        content,
        ...(type === "mermaid" ? { diagramType: "architecture" } : {}),
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
            streamStatus={streamStatus}
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

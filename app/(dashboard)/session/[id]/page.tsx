"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      // Group by type, pick latest version of each
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

    // Save user message
    await fetch(`/api/sessions/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    // Call AI generation
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          prompt: content,
          generateTypes: ["mermaid", "api_spec", "arch_design", "dev_plan"],
          diagramType: "architecture",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Save AI response as message
        if (data.summary) {
          await fetch(`/api/sessions/${id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: data.summary }),
          });
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
    }

    // Refresh all data
    await fetchData();
    setIsSending(false);
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
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]">
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
      <div className="flex-1 flex h-[calc(100vh-7rem)]">
        <div className="w-2/5 min-w-[300px] border-r border-[var(--border)]">
          <ChatPanel
            sessionId={id}
            messages={messages}
            onSend={handleSend}
            isSending={isSending}
          />
        </div>
        <div className="flex-1">
          <PreviewPanel
            documents={documents}
            onSaveDocument={handleSaveDocument}
          />
        </div>
      </div>
    </>
  );
}

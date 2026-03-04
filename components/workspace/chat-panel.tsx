"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/types";

interface ChatPanelProps {
  sessionId: string;
  messages: Message[];
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  streamStatus?: string;
}

export function ChatPanel({ sessionId, messages, onSend, isSending, streamStatus }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput("");
    await onSend(content);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--muted-foreground)] mt-8">
            输入需求开始对话
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-2xl rounded-br-md"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[var(--secondary)] rounded-2xl rounded-bl-md px-4 py-3">
              {streamStatus ? (
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                  {streamStatus}
                </div>
              ) : (
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-[var(--card)]">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的需求..."
            rows={2}
            className="resize-none"
            disabled={isSending}
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={isSending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

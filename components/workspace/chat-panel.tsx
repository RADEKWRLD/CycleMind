"use client";

import { useState } from "react";
import { Send, Square, Copy, Check, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import { Tool } from "@/components/ui/tool";
import type { Message as MessageType, StreamStep, AgentToolPart } from "@/types";

interface ChatPanelProps {
  sessionId: string;
  messages: MessageType[];
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  streamSteps?: StreamStep[];
  agentToolParts?: Map<string, AgentToolPart>;
}

export function ChatPanel({ sessionId, messages, onSend, isSending, streamSteps = [], agentToolParts = new Map() }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleSubmit() {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput("");
    await onSend(content);
  }

  function handleCopy(id: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="p-4 space-y-4">
          {messages.length === 0 && !isSending && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              输入需求开始对话
            </p>
          )}
          {messages.map((msg) => (
            <Message
              key={msg.id}
              className={msg.role === "user" ? "justify-end" : "justify-start"}
            >
              <div className="flex flex-col gap-1 max-w-[80%]">
                <MessageContent
                  markdown={msg.role === "assistant"}
                  className={
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm whitespace-pre-wrap"
                      : "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm"
                  }
                >
                  {msg.content}
                </MessageContent>
                {msg.role === "assistant" && (
                  <MessageActions className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageAction tooltip="复制">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleCopy(msg.id, msg.content)}
                      >
                        {copiedId === msg.id ? (
                          <Check className="size-3 text-green-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </MessageAction>
                  </MessageActions>
                )}
              </div>
            </Message>
          ))}

          {/* Agent thinking chain */}
          {isSending && (
            <Message className="justify-start">
              <div className="min-w-70 max-w-[95%]">
                {streamSteps.length === 0 && agentToolParts.size === 0 ? (
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                      分析中...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {streamSteps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 text-sm px-1 py-0.5"
                      >
                        {step.status === "done" && (
                          <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                        )}
                        {step.status === "error" && (
                          <XCircle className="size-3.5 text-destructive shrink-0" />
                        )}
                        <span className={step.status === "error" ? "text-destructive" : "text-muted-foreground"}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                    {Array.from(agentToolParts.values()).map((toolPart) => (
                      <Tool
                        key={toolPart.toolCallId}
                        toolPart={toolPart}
                        defaultOpen={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Message>
          )}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>

        {/* Scroll to bottom button */}
        <div className="absolute bottom-20 right-4 z-10">
          <ScrollButton />
        </div>
      </ChatContainerRoot>

      {/* Input */}
      <div className="p-4 bg-card">
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isSending}
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea
            placeholder="输入你的需求..."
            disabled={isSending}
          />
          <PromptInputActions className="justify-end px-2 pb-2">
            <PromptInputAction tooltip={isSending ? "停止" : "发送"}>
              <Button
                size="sm"
                className="rounded-full h-8 w-8"
                disabled={!isSending && !input.trim()}
                onClick={handleSubmit}
              >
                {isSending ? (
                  <Square className="size-3 fill-current" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}

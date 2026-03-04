import type { InferSelectModel } from "drizzle-orm";
import type { users, sessions, documents, messages, templates } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Document = InferSelectModel<typeof documents>;
export type Message = InferSelectModel<typeof messages>;
export type Template = InferSelectModel<typeof templates>;

export type DocumentType = "mermaid" | "api_spec" | "arch_design" | "dev_plan" | "markdown";
export type DiagramType = "architecture" | "er" | "flow" | "sequence" | "class" | "other";
export type SessionStatus = "active" | "archived" | "completed";
export type MessageRole = "user" | "assistant" | "system";

export type StreamStep = {
  id: string;
  label: string;
  status: "running" | "done" | "error";
};

export type AgentToolPart = {
  type: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolCallId?: string;
  errorText?: string;
};

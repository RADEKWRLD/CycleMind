import type { InferSelectModel } from "drizzle-orm";
import type { users, sessions, documents, messages } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type Document = InferSelectModel<typeof documents>;
export type Message = InferSelectModel<typeof messages>;

export type DocumentType = "mermaid" | "api_spec" | "arch_design" | "dev_plan" | "markdown";
export type DiagramType = "architecture" | "er" | "flow" | "sequence" | "class" | "other";
export type SessionStatus = "active" | "archived" | "completed";
export type MessageRole = "user" | "assistant" | "system";

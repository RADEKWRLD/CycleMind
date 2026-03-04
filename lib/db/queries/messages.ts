import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getSessionMessages(sessionId: string, limit = 50) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function createMessage(data: {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}

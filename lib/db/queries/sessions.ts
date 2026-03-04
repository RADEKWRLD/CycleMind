import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getUserSessions(userId: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.updatedAt));
}

export async function getSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return session ?? null;
}

export async function createSession(data: {
  userId: string;
  title: string;
  description?: string;
}) {
  const [session] = await db.insert(sessions).values(data).returning();
  return session;
}

export async function updateSession(
  sessionId: string,
  data: { title?: string; description?: string; status?: "active" | "archived" | "completed" }
) {
  const [session] = await db
    .update(sessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId))
    .returning();
  return session;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

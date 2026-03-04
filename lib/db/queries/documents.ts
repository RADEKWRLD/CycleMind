import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSessionDocuments(sessionId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.sessionId, sessionId))
    .orderBy(desc(documents.createdAt));
}

export async function getLatestDocument(
  sessionId: string,
  type: "mermaid" | "api_spec" | "arch_design" | "dev_plan" | "markdown",
  diagramType?: string
) {
  const conditions = [
    eq(documents.sessionId, sessionId),
    eq(documents.type, type),
  ];
  if (diagramType) {
    conditions.push(
      eq(documents.diagramType, diagramType as "architecture" | "er" | "flow" | "sequence" | "class" | "other")
    );
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.version))
    .limit(1);
  return doc ?? null;
}

export async function createDocument(data: {
  sessionId: string;
  type: "mermaid" | "api_spec" | "arch_design" | "dev_plan" | "markdown";
  diagramType?: "architecture" | "er" | "flow" | "sequence" | "class" | "other";
  title?: string;
  content: string;
}) {
  // Get latest version for this type
  const latest = await getLatestDocument(data.sessionId, data.type, data.diagramType);
  const newVersion = latest ? latest.version + 1 : 1;
  const parentVersionId = latest?.id ?? null;

  const [doc] = await db
    .insert(documents)
    .values({
      ...data,
      version: newVersion,
      parentVersionId,
    })
    .returning();
  return doc;
}

export async function getDocumentVersions(
  sessionId: string,
  type: string,
  diagramType?: string
) {
  const conditions = [
    eq(documents.sessionId, sessionId),
    eq(documents.type, type as "mermaid" | "api_spec" | "arch_design" | "dev_plan" | "markdown"),
  ];
  if (diagramType) {
    conditions.push(
      eq(documents.diagramType, diagramType as "architecture" | "er" | "flow" | "sequence" | "class" | "other")
    );
  }

  return db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.version));
}

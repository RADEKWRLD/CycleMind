import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllTemplates() {
  return db
    .select()
    .from(templates)
    .orderBy(desc(templates.isBuiltin), desc(templates.createdAt));
}

export async function getTemplateById(templateId: string) {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, templateId))
    .limit(1);
  return template ?? null;
}

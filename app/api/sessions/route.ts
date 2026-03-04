import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSessions, createSession } from "@/lib/db/queries/sessions";
import { getTemplateById } from "@/lib/db/queries/templates";
import { createMessage } from "@/lib/db/queries/messages";
import { createSessionSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await getUserSessions(session.user.id);
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { templateId, ...sessionData } = parsed.data;

  // If templateId provided, fetch template and use its prompt as initial message
  let templatePrompt: string | null = null;
  if (templateId) {
    const template = await getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    templatePrompt = template.prompt;
  }

  const newSession = await createSession({
    userId: session.user.id,
    ...sessionData,
  });

  // Create initial user message from template prompt
  if (templatePrompt) {
    await createMessage({
      sessionId: newSession.id,
      role: "user",
      content: templatePrompt,
    });
  }

  return NextResponse.json({ session: newSession }, { status: 201 });
}

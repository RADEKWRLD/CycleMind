import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById } from "@/lib/db/queries/sessions";
import { getSessionMessages, createMessage } from "@/lib/db/queries/messages";
import { sendMessageSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sessionData = await getSessionById(id);
  if (!sessionData || sessionData.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await getSessionMessages(id);
  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sessionData = await getSessionById(id);
  if (!sessionData || sessionData.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const message = await createMessage({
    sessionId: id,
    role: "user",
    content: parsed.data.content,
  });

  return NextResponse.json({ message }, { status: 201 });
}

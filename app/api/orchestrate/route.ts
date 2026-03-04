import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById } from "@/lib/db/queries/sessions";
import { getUserById } from "@/lib/db/queries/users";
import { orchestrate } from "@/lib/ai/agents/orchestrator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, prompt } = body as { sessionId?: string; prompt?: string };

  if (!sessionId || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [sessionData, user] = await Promise.all([
    getSessionById(sessionId),
    getUserById(session.user.id),
  ]);
  if (!sessionData || sessionData.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPrompt = user?.userMd
    ? `${prompt}\n\n[用户背景信息]\n${user.userMd}`
    : prompt;

  try {
    const agents = await orchestrate(fullPrompt);
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ error: "Orchestration failed" }, { status: 500 });
  }
}

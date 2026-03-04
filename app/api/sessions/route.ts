import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSessions, createSession } from "@/lib/db/queries/sessions";
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

  const newSession = await createSession({
    userId: session.user.id,
    ...parsed.data,
  });
  return NextResponse.json({ session: newSession }, { status: 201 });
}

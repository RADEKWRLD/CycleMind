import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionById } from "@/lib/db/queries/sessions";
import { getSessionDocuments, createDocument } from "@/lib/db/queries/documents";
import { createDocumentSchema } from "@/lib/validations";

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

  const documents = await getSessionDocuments(id);
  return NextResponse.json({ documents });
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
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const doc = await createDocument({ sessionId: id, ...parsed.data });
  return NextResponse.json({ document: doc }, { status: 201 });
}

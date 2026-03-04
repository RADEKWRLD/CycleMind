import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllTemplates } from "@/lib/db/queries/templates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const templates = await getAllTemplates();
  return NextResponse.json({ templates });
}

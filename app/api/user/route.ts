import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById, updateUserMd, updateUserPreferences } from "@/lib/db/queries/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      userMd: user.userMd,
      preferences: user.preferences,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.userMd !== undefined) {
    const user = await updateUserMd(session.user.id, body.userMd);
    return NextResponse.json({ user });
  }

  if (body.preferences !== undefined) {
    const user = await updateUserPreferences(session.user.id, body.preferences);
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}

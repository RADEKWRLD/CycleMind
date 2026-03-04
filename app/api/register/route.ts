import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { getUserByEmail, createUser } from "@/lib/db/queries/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "输入无效", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const user = await createUser({ name, email, password });
    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      passwordHash,
      userMd: `# ${data.name}\n\n个人信息和偏好设置`,
    })
    .returning();
  return user;
}

export async function updateUserMd(userId: string, userMd: string) {
  const [user] = await db
    .update(users)
    .set({ userMd, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, unknown>
) {
  const [user] = await db
    .update(users)
    .set({ preferences, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

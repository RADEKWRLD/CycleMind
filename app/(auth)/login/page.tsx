"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码错误");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Mobile-only logo */}
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">CycleMind</h1>
      </div>

      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">登录</h2>
        <p className="text-[var(--muted-foreground)]">智能软件生命周期辅助系统</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50">
            <p className="text-sm text-[var(--destructive)] text-center">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold">邮箱</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">密码</label>
          <Input
            type="password"
            placeholder="至少 6 个字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full h-px bg-[var(--secondary)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--background)] px-3 text-[var(--muted-foreground)] font-medium">或</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          GitHub 登录
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        没有账号？{" "}
        <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}

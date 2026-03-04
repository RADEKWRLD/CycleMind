"use client";

import { useSession } from "next-auth/react";

export function Header({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold">{title || "工作台"}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted-foreground)]">
          {session?.user?.name || session?.user?.email}
        </span>
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full"
          />
        )}
      </div>
    </header>
  );
}

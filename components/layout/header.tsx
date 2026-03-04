"use client";

import { useSession } from "next-auth/react";

export function Header({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="h-16 shrink-0 bg-[var(--card)]/80 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <img src="/logo-solid.svg" alt="CycleMind" className="h-8 w-8" />
        <h1 className="text-xl font-bold tracking-tight">{title || "工作台"}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--muted-foreground)] font-medium">
          {session?.user?.name || session?.user?.email}
        </span>
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-9 w-9 rounded-full ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
            {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}

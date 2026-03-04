"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Session } from "@/types";

export function SidebarRecent() {
  const pathname = usePathname();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract current session id from pathname like /session/xxx
  const currentSessionId = pathname.startsWith("/session/")
    ? pathname.split("/")[2]
    : null;

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions((data.sessions ?? []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  if (loading) {
    return (
      <div className="px-3 py-2">
        <p className="px-3 py-1 text-xs font-medium text-[#999] uppercase tracking-wider">
          最近项目
        </p>
        <div className="space-y-1 mt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-[#FA5D29]/5 animate-pulse mx-1"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <p className="px-3 py-1 text-xs font-medium text-[#999] uppercase tracking-wider">
        最近项目
      </p>
      <div className="space-y-0.5 mt-1">
        {sessions.map((s) => {
          const isActive = s.id === currentSessionId;
          return (
            <Link
              key={s.id}
              href={`/session/${s.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full truncate ${
                isActive
                  ? "bg-[#FA5D29]/15 text-[#FA5D29] font-medium"
                  : "text-[#666] hover:bg-[#FA5D29]/10 hover:text-[#FA5D29]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  isActive ? "bg-[#FA5D29]" : "bg-[#CCC]"
                }`}
              />
              <span className="truncate">{s.title}</span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 px-3 py-1.5 mt-1 text-xs text-[#999] hover:text-[#FA5D29] transition-colors"
      >
        查看全部
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

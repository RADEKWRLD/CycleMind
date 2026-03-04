"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { href: "/profile", label: "个人资料", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="text-lg font-bold">
          AI-SDLC
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-[var(--secondary)] text-[var(--foreground)] font-medium"
                : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}

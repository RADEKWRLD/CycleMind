"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Plus, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarRecent } from "./sidebar-recent";
import { SidebarTemplates } from "./sidebar-templates";

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 pb-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo-solid.svg" alt="CycleMind" className="h-7 w-7" />
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            CycleMind
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <div className="px-3 py-2 space-y-0.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full"
        >
          <Plus className="h-4 w-4" />
          工作台
        </Link>
        <SidebarTemplates />
      </div>

      {/* Recent projects */}
      <div className="flex-1 overflow-y-auto">
        <SidebarRecent />
      </div>

      {/* User menu */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary w-full transition-all duration-200 outline-none">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
              </div>
            )}
            <span className="truncate">
              {session?.user?.name || session?.user?.email || "用户"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
            >
              <User className="h-4 w-4" />
              个人资料
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

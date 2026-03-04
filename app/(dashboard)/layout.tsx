import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { GenerationWatcher } from "@/components/layout/generation-watcher";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
      </div>
      <GenerationWatcher />
    </SessionProvider>
  );
}

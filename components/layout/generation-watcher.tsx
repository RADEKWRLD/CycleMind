"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGenerationStore } from "@/stores/generation-store";

export function GenerationWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const runs = useGenerationStore((s) => s.runs);
  const prevStatuses = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    for (const [sessionId, run] of runs) {
      const prevStatus = prevStatuses.current.get(sessionId);
      const isOnSessionPage = pathname === `/session/${sessionId}`;

      if (!isOnSessionPage) {
        // Show loading toast when generation is running and wasn't before
        if (run.status === "running" && prevStatus !== "running") {
          toast.loading(`"${run.sessionTitle}" 正在生成中...`, {
            id: `gen-${sessionId}`,
            duration: Infinity,
          });
        }

        // Show success toast when generation completes
        if (run.status === "completed" && prevStatus === "running") {
          toast.success(`"${run.sessionTitle}" 生成完成`, {
            id: `gen-${sessionId}`,
            description: run.completedDocs.length > 0
              ? `已生成: ${run.completedDocs.join("、")}`
              : undefined,
            action: {
              label: "查看",
              onClick: () => router.push(`/session/${sessionId}`),
            },
          });
        }

        // Show error toast when generation fails
        if (run.status === "error" && prevStatus === "running") {
          toast.error(`"${run.sessionTitle}" 生成失败`, {
            id: `gen-${sessionId}`,
            description: run.errorMessage,
          });
        }
      } else {
        // User is on the session page — dismiss the toast
        toast.dismiss(`gen-${sessionId}`);
      }

      prevStatuses.current.set(sessionId, run.status);
    }
  }, [runs, pathname, router]);

  return null;
}

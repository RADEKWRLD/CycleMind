"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate,
  Globe,
  Smartphone,
  Boxes,
  Server,
  Database,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Template } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Boxes,
  Server,
  Database,
};

export function SidebarTemplates() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  async function handleSelect(template: Template) {
    if (creating) return;
    setCreating(template.id);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.name,
          description: template.description ?? "",
          templateId: template.id,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOpen(false);
      router.push(`/session/${data.session.id}`);
    } catch {
      setCreating(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#666] hover:bg-[#FA5D29]/10 hover:text-[#FA5D29] transition-all duration-200 w-full"
      >
        <LayoutTemplate className="h-4 w-4" />
        模板库
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>从模板创建项目</DialogTitle>
              <button
                onClick={() => setOpen(false)}
                className="text-[#999] hover:text-[#666] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-[#999]">
              选择一个模板快速开始，模板会预填需求描述
            </p>
          </DialogHeader>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-[var(--muted)]/50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => {
                const Icon = iconMap[t.icon ?? "Globe"] ?? Globe;
                const isCreating = creating === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    disabled={!!creating}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[#FA5D29]/40 hover:bg-[#FA5D29]/5 transition-all duration-200 text-left disabled:opacity-50"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[#FA5D29]/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#FA5D29]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {isCreating ? "创建中..." : t.name}
                      </p>
                      {t.description && (
                        <p className="text-xs text-[#999] mt-0.5 line-clamp-2">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

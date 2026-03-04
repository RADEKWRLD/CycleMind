"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ProjectCard } from "@/components/dashboard/project-card";
import type { Session } from "@/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified form dialog: editingSession === null means "create", otherwise "edit"
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  function openCreate() {
    setEditingSession(null);
    setTitle("");
    setDescription("");
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(session: Session) {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description || "");
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingSession(null);
    setTitle("");
    setDescription("");
    setFormError("");
  }

  async function fetchSessions() {
    const res = await fetch("/api/sessions");
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      if (editingSession) {
        const res = await fetch(`/api/sessions/${editingSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) throw new Error();
        setSessions((prev) =>
          prev.map((s) => (s.id === editingSession.id ? { ...s, title, description } : s))
        );
      } else {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) throw new Error();
        fetchSessions();
      }
      closeForm();
    } catch {
      setFormError(editingSession ? "保存失败，请重试" : "创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel: Record<string, string> = {
    active: "进行中",
    completed: "已完成",
    archived: "已归档",
  };

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">我的项目</h2>
            <p className="text-[var(--muted-foreground)] mt-1">管理你的 AI 辅助设计项目</p>
          </div>
          <Button onClick={openCreate} size="lg">
            <Plus className="h-4 w-4" />
            新建项目
          </Button>
        </div>

        <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSession ? "编辑项目" : "新建项目"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="项目标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder={editingSession ? "项目描述（可选）" : "初始需求描述（可选）"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              {formError && <p className="text-sm text-[var(--destructive)]">{formError}</p>}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={closeForm}>
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (editingSession ? "保存中..." : "创建中...") : (editingSession ? "保存" : "创建")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <p className="text-center text-[var(--muted-foreground)] py-12">加载中...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 mb-6">
              <Plus className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <p className="text-lg font-semibold mb-2">还没有项目</p>
            <p className="text-[var(--muted-foreground)] mb-6">创建你的第一个 AI 辅助设计项目</p>
            <Button onClick={openCreate} size="lg">
              <Plus className="h-4 w-4" />
              新建项目
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <ProjectCard
                key={s.id}
                session={s}
                statusLabel={statusLabel}
                onRequestEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

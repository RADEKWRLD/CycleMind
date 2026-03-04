"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProjectCard } from "@/components/dashboard/project-card";
import type { Session } from "@/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    const res = await fetch("/api/sessions");
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setShowCreate(false);
      fetchSessions();
    }
    setCreating(false);
  }

  const statusLabel: Record<string, string> = {
    active: "进行中",
    completed: "已完成",
    archived: "已归档",
  };

  async function handleEdit(id: string, data: { title: string; description: string }) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <>
      <Header title="工作台" />
      <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">我的项目</h2>
            <p className="text-[var(--muted-foreground)] mt-1">管理你的 AI 辅助设计项目</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} size="lg">
            <Plus className="h-4 w-4" />
            新建项目
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="项目标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="初始需求描述（可选）"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "创建中..." : "创建"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-[var(--muted-foreground)] py-12">加载中...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 mb-6">
              <Plus className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <p className="text-lg font-semibold mb-2">还没有项目</p>
            <p className="text-[var(--muted-foreground)] mb-6">创建你的第一个 AI 辅助设计项目</p>
            <Button onClick={() => setShowCreate(true)} size="lg">
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
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

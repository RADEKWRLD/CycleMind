"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
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

  return (
    <>
      <Header title="工作台" />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">我的项目</h2>
          <Button onClick={() => setShowCreate(!showCreate)}>
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
          <div className="text-center py-20">
            <p className="text-[var(--muted-foreground)] mb-4">还没有项目，创建第一个吧</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              新建项目
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <Link key={s.id} href={`/session/${s.id}`}>
                <Card className="hover:shadow-md transition cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{s.title}</CardTitle>
                      <Badge variant="secondary">{statusLabel[s.status] || s.status}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {s.description || "暂无描述"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: zhCN })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProfilePage() {
  const [userMd, setUserMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        setUserMd(data.user?.userMd || "");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMd }),
    });
    setSaving(false);
  }

  return (
    <>
      <Header title="个人资料" />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">user.md</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "edit" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("edit")}
            >
              编辑
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              预览
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          这是你的个人信息文档，存储偏好和项目约定，AI 生成时会参考此内容。
        </p>

        {loading ? (
          <p className="text-center py-12 text-[var(--muted-foreground)]">加载中...</p>
        ) : viewMode === "edit" ? (
          <Textarea
            value={userMd}
            onChange={(e) => setUserMd(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="# 你的名字&#10;&#10;在这里写下你的个人信息、技术偏好、项目约定..."
          />
        ) : (
          <div className="border border-[var(--border)] rounded-md p-6 min-h-[500px] prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {userMd || "*暂无内容*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}

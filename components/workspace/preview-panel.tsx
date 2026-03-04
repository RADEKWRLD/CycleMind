"use client";

import { useState } from "react";
import { MermaidRenderer } from "./mermaid-renderer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Code, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Document } from "@/types";

type TabKey = "mermaid" | "api_spec" | "arch_design" | "dev_plan";

const tabs: { key: TabKey; label: string }[] = [
  { key: "mermaid", label: "架构图" },
  { key: "api_spec", label: "API 规范" },
  { key: "arch_design", label: "架构设计" },
  { key: "dev_plan", label: "发展计划" },
];

interface PreviewPanelProps {
  documents: Record<string, Document | null>;
  onSaveDocument: (type: TabKey, content: string) => Promise<void>;
}

export function PreviewPanel({ documents, onSaveDocument }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("mermaid");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const currentDoc = documents[activeTab];
  const content = currentDoc?.content || "";

  function switchToEdit() {
    setEditContent(content);
    setViewMode("edit");
  }

  async function handleSave() {
    setSaving(true);
    await onSaveDocument(activeTab, editContent);
    setViewMode("preview");
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setViewMode("preview"); }}
              className={`px-4 py-3 text-sm border-b-2 transition ${
                activeTab === tab.key
                  ? "border-[var(--primary)] text-[var(--foreground)] font-medium"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("preview")}
            className={viewMode === "preview" ? "bg-[var(--secondary)]" : ""}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={switchToEdit}
            className={viewMode === "edit" ? "bg-[var(--secondary)]" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === "preview" ? (
          activeTab === "mermaid" ? (
            <MermaidRenderer code={content} className="flex justify-center" />
          ) : content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-8">
              暂无内容，发送需求后自动生成
            </p>
          )
        ) : (
          <div className="space-y-3 h-full flex flex-col">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 font-mono text-sm resize-none"
              placeholder={activeTab === "mermaid" ? "输入 Mermaid 代码..." : "输入 Markdown 内容..."}
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {saving ? "保存中..." : "保存新版本"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Version info */}
      {currentDoc && (
        <div className="px-4 py-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
          版本 {currentDoc.version} · {new Date(currentDoc.createdAt).toLocaleString("zh-CN")}
        </div>
      )}
    </div>
  );
}

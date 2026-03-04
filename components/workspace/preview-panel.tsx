"use client";

import { useState, useCallback } from "react";
import { MermaidRenderer } from "./mermaid-renderer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Code, Save, Download } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import type { Document } from "@/types";

type TabKey = "mermaid" | "er" | "api_spec" | "arch_design" | "dev_plan";

const tabs: { key: TabKey; label: string }[] = [
  { key: "mermaid", label: "架构图" },
  { key: "er", label: "ER 图" },
  { key: "arch_design", label: "需求分析" },
  { key: "api_spec", label: "API 规范" },
  { key: "dev_plan", label: "发展计划" },
];

const isMermaidTab = (key: TabKey) => key === "mermaid" || key === "er";

interface PreviewPanelProps {
  documents: Record<string, Document | null>;
  onSaveDocument: (type: TabKey, content: string) => Promise<void>;
}

export function PreviewPanel({ documents, onSaveDocument }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("mermaid");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentSvg, setCurrentSvg] = useState("");

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

  const handleSvgChange = useCallback((svg: string) => {
    setCurrentSvg(svg);
  }, []);

  function handleDownload() {
    if (isMermaidTab(activeTab) && currentSvg) {
      const blob = new Blob([currentSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.svg";
      a.click();
      URL.revokeObjectURL(url);
    } else if (content) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  const canDownload = isMermaidTab(activeTab) ? !!currentSvg : !!content;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 bg-[var(--card)]">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setViewMode("preview"); }}
              className={`px-4 py-3 text-sm rounded-lg transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] text-[var(--foreground)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
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
            onClick={handleDownload}
            disabled={!canDownload}
            title="导出下载"
          >
            <Download className="h-4 w-4" />
          </Button>
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
      <div className={`flex-1 ${viewMode === "preview" && isMermaidTab(activeTab) ? "overflow-hidden" : "overflow-auto p-4"}`}>
        {viewMode === "preview" ? (
          isMermaidTab(activeTab) ? (
            <MermaidRenderer code={content} className="h-full" onSvgChange={handleSvgChange} />
          ) : content ? (
            <MarkdownRenderer>{content}</MarkdownRenderer>
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
              placeholder={isMermaidTab(activeTab) ? "输入 Mermaid 代码..." : "输入 Markdown 内容..."}
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
        <div className="px-4 py-2.5 bg-[var(--card)] text-xs text-[var(--muted-foreground)] flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          版本 {currentDoc.version} · {new Date(currentDoc.createdAt).toLocaleString("zh-CN")}
        </div>
      )}
    </div>
  );
}

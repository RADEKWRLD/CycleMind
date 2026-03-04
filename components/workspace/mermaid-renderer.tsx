"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    import("mermaid").then((m) => {
      m.default.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
      setMermaidLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!mermaidLoaded || !code.trim()) {
      setSvg("");
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const id = `mermaid-${Date.now()}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Mermaid 语法错误");
          setSvg("");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [code, mermaidLoaded]);

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted-foreground)] text-sm">
        暂无图表内容
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-2">
        <p className="text-sm text-red-500">渲染错误: {error}</p>
        <pre className="text-xs bg-[var(--secondary)] p-3 rounded overflow-auto">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MermaidRendererProps {
  code: string;
  className?: string;
  onSvgChange?: (svg: string) => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.1;

export function MermaidRenderer({ code, className, onSvgChange }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  // Pan & zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Reset transform and notify parent when SVG changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    onSvgChange?.(svg);
  }, [svg, onSvgChange]);

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

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Cursor position relative to container
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - e.deltaY * 0.001));
      const ratio = next / prev;
      // Zoom toward cursor
      setTranslate((t) => ({
        x: cx - ratio * (cx - t.x),
        y: cy - ratio * (cy - t.y),
      }));
      return next;
    });
  }, []);

  // Pointer drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

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

  const scalePercent = Math.round(scale * 100);

  return (
    <div className={cn("relative h-full", className)}>
      {/* Viewport */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
          className="inline-block"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm px-1.5 py-1 shadow-sm">
        <button
          type="button"
          className="px-1.5 py-0.5 text-sm hover:bg-[var(--accent)] rounded transition-colors cursor-pointer"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP))}
        >
          −
        </button>
        <button
          type="button"
          className="px-2 py-0.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--accent)] rounded transition-colors cursor-pointer min-w-[3rem] text-center"
          onClick={handleReset}
        >
          {scalePercent}%
        </button>
        <button
          type="button"
          className="px-1.5 py-0.5 text-sm hover:bg-[var(--accent)] rounded transition-colors cursor-pointer"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP))}
        >
          +
        </button>
      </div>
    </div>
  );
}

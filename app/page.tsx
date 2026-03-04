import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">AI-SDLC</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm rounded-md border border-[var(--border)] hover:bg-[var(--secondary)] transition"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              开始使用
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            智能软件生命周期辅助系统
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            输入自然语言需求，AI 自动生成架构图、ER 图、API 规范和发展计划。
            支持版本追踪与设计演化。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition"
            >
              免费开始
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-md border border-[var(--border)] font-medium hover:bg-[var(--secondary)] transition"
            >
              已有账号
            </Link>
          </div>
        </div>

        <div className="mt-20 max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">需求结构化</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              自然语言需求自动解析为结构化模块，AI 智能拆解
            </p>
          </div>
          <div className="p-6 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">Mermaid 图生成</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              自动生成架构图、ER 图、流程图，实时渲染预览
            </p>
          </div>
          <div className="p-6 rounded-lg border border-[var(--border)]">
            <h3 className="font-semibold mb-2">版本演化追踪</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              需求变更自动更新图结构，支持版本对比与回溯
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted-foreground)]">
        AI-SDLC - AI 驱动的软件设计自动化平台
      </footer>
    </div>
  );
}

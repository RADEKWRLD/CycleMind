export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] flex-col justify-between p-12">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CycleMind</h1>
          <p className="text-sm text-[#666] mt-1">AI-Powered Software Design</p>
        </div>
        <div>
          <p className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            让 AI 重新定义<br />
            <span className="text-[#FA5D29]">软件设计流程</span>
          </p>
        </div>
        <p className="text-xs text-[#666]">&copy; 2026 CycleMind</p>
      </div>
      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        {children}
      </div>
    </div>
  );
}

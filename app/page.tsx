"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle, Route, Shield, Terminal, ListChecks, Clock, Github as GithubIcon, Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { href: "#orchestrator", label: "多 Agent" },
  { href: "#architecture", label: "架构设计" },
  { href: "#er-diagrams", label: "ER 图" },
  { href: "#templates", label: "模板库" },
  { href: "#dev-tools", label: "开发工具" },
  { href: "#tracking", label: "版本追踪" },
];

const architectureFeatures = [
  "自动生成 Mermaid 系统架构图",
  "模块依赖关系与数据流可视化",
  "微服务 / 单体 / Serverless 架构适配",
  "支持手动调整与交互式画布",
];

const apiCards = [
  { title: "接口映射", desc: "AI 从架构中自动提取所有 CRUD 和专用端点，生成完整的路由映射。", icon: Route, code: "GET /api/v1/projects/{id}" },
  { title: "认证集成", desc: "自动识别需要认证的接口，生成 JWT、OAuth2 或 API Key 认证头文档。", icon: Shield, code: "security: - bearerAuth: []" },
];

const devPlanFeatures = [
  "自动生成项目开发周期文档",
  "智能工作量分配与瓶颈检测",
];

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const scroller = rootRef.current;
    const target = scroller?.querySelector(href);
    if (target && scroller) {
      const top = (target as HTMLElement).offsetTop - 80;
      scroller.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const scroller = rootRef.current;
    if (!scroller) return;

    ScrollTrigger.defaults({ scroller });

    const ctx = gsap.context(() => {
      const ease = "power2.out";

      // Hero entrance — fade up with stagger
      const heroTl = gsap.timeline({ defaults: { ease } });
      heroTl
        .from("[data-anim='tagline']", { y: 24, opacity: 0, duration: 0.6 })
        .from("[data-anim='headline']", { y: 24, opacity: 0, duration: 0.6 }, "-=0.3")
        .from("[data-anim='desc']", { y: 24, opacity: 0, duration: 0.6 }, "-=0.3")
        .from("[data-anim='cta']", { y: 24, opacity: 0, duration: 0.5 }, "-=0.2");

      // Orchestrator section
      gsap.from("[data-anim='orch-text']", {
        scrollTrigger: { trigger: "#orchestrator", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
      gsap.from("[data-anim='orch-img']", {
        scrollTrigger: { trigger: "#orchestrator", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, delay: 0.08, ease,
      });

      // Architecture section
      gsap.from("[data-anim='arch-img']", {
        scrollTrigger: { trigger: "#architecture", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
      gsap.from("[data-anim='arch-text']", {
        scrollTrigger: { trigger: "#architecture", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, delay: 0.08, ease,
      });

      // ER section
      gsap.from("[data-anim='er-text']", {
        scrollTrigger: { trigger: "#er-diagrams", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
      gsap.from("[data-anim='er-img']", {
        scrollTrigger: { trigger: "#er-diagrams", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, delay: 0.08, ease,
      });

      // Templates
      gsap.from("[data-anim='tpl-text']", {
        scrollTrigger: { trigger: "#templates", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
      gsap.from("[data-anim='tpl-img']", {
        scrollTrigger: { trigger: "#templates", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, delay: 0.08, ease,
      });
      // SVG path draw + arrowhead
      gsap.to("[data-anim='tpl-path']", {
        scrollTrigger: { trigger: "[data-anim='tpl-flow']", start: "top 80%" },
        strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut",
      });
      gsap.to("[data-anim='tpl-arrowhead']", {
        scrollTrigger: { trigger: "[data-anim='tpl-flow']", start: "top 80%" },
        opacity: 1, duration: 0.4, delay: 1.3, ease,
      });
      // Stagger cards
      gsap.from("[data-anim='tpl-card']", {
        scrollTrigger: { trigger: "[data-anim='tpl-flow']", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease,
      });

      // API cards
      gsap.from("[data-anim='api-card']", {
        scrollTrigger: { trigger: "#dev-tools", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease,
      });

      // Dev plans
      gsap.from("[data-anim='plan-chart']", {
        scrollTrigger: { trigger: "[data-anim='plan-chart']", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
      gsap.from("[data-anim='plan-text']", {
        scrollTrigger: { trigger: "[data-anim='plan-text']", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, delay: 0.08, ease,
      });

      // Tracking
      gsap.from("[data-anim='tracking-card']", {
        scrollTrigger: { trigger: "#tracking", start: "top 80%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });

      // Section titles
      document.querySelectorAll("[data-anim='section-title']").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%" },
          y: 24, opacity: 0, duration: 0.7, ease,
        });
      });

      // CTA banner
      gsap.from("[data-anim='cta-banner']", {
        scrollTrigger: { trigger: "[data-section='cta-banner']", start: "top 85%" },
        y: 24, opacity: 0, duration: 0.7, ease,
      });
    }, rootRef);

    return () => {
      ctx.revert();
      ScrollTrigger.defaults({ scroller: undefined });
    };
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col bg-background overflow-y-auto h-screen noise-overlay">
      {/* ===== Glass Nav ===== */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-ambient">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 lg:px-10 py-4">
          <div className="text-2xl font-serif font-medium tracking-normal text-primary">CycleMind</div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium rounded-full bg-secondary hover:bg-accent hover:text-primary transition-all duration-300 btn-press focus-anthropic">
              登录
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-all duration-300 shadow-sm btn-press focus-anthropic">
              开始使用
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section
        className="relative z-10 min-h-[calc(100vh-64px)] pt-28 pb-24 px-6 lg:px-10 overflow-hidden flex items-center"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 70% 30%, rgba(250,93,41,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(106,155,204,0.05) 0%, transparent 50%),
            var(--background)
          `,
        }}
      >
        {/* Spinning logo background */}
        <div className="absolute top-1/2 -right-[-10%] -translate-y-1/2 opacity-[0.12] pointer-events-none select-none">
          <img src="/logo.svg" alt="" className="w-125 h-125 animate-[spin_20s_linear_infinite]" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <span data-anim="tagline" className="inline-block text-primary text-sm font-medium mb-6 tracking-widest uppercase font-sans">
              AI 驱动的软件设计平台
            </span>
            <h2 data-anim="headline" className="heading-display text-foreground">
              从需求到设计
              <br />
              <span className="text-primary">AI 一步到位</span>
            </h2>
            <p data-anim="desc" className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-[1.75] font-serif">
              输入自然语言需求，AI 自动生成架构图、ER 图、API 规范和发展计划。
              五大 Agent 并行协作，SSE 实时推送，版本自动追踪。
            </p>
            <div data-anim="cta" className="mt-10 flex gap-4 items-center flex-wrap">
              <Link href="/register" className="px-8 py-4 rounded-full bg-primary text-white text-base font-medium hover:opacity-90 transition-all duration-300 shadow-md btn-press focus-anthropic">
                免费开始 &rarr;
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-full bg-secondary text-base font-medium hover:bg-accent hover:text-primary transition-all duration-300 btn-press focus-anthropic">
                已有账号
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Orchestrator — 居中宽幅：标题居中 + 全宽大图 ===== */}
      <section id="orchestrator" className="py-32 px-6 lg:px-10 bg-surface-mid">
        <div className="max-w-7xl mx-auto">
          <div data-anim="orch-text" className="text-center max-w-3xl mx-auto mb-16">
            <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
              多 Agent <span className="text-primary">并行协作</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-[1.75] font-serif">
              Orchestrator 智能分析你的需求，自动拆解任务并调度五大专业 Agent 并行运行。SSE 实时推送每个 Agent 的生成进度。
            </p>
          </div>
          <div data-anim="orch-img" className="relative max-w-4xl mx-auto">
            <div className="bg-surface-lowest rounded-2xl p-6 lg:p-10 shadow-ambient overflow-hidden relative">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <img className="w-full rounded-xl relative z-10" src="/five-agents.png" alt="五大 Agent 并行架构示意" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { label: "智能需求分析", desc: "Orchestrator 自动拆解任务" },
              { label: "五大 Agent 并行", desc: "效率倍增，同时处理" },
              { label: "SSE 实时推送", desc: "流式返回生成进度" },
              { label: "增量更新", desc: "追加需求自动演进" },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-surface-lowest rounded-xl shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-medium text-sm font-sans">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="font-medium text-sm mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Architecture — 深色区块，黄金比例布局 ===== */}
      <section id="architecture" className="py-32 px-6 lg:px-10 section-dark">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[3fr_2fr] gap-16 items-center">
          <div data-anim="arch-img" className="order-2 md:order-1">
            <div className="bg-surface-lowest rounded-2xl shadow-ambient overflow-hidden relative">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="p-6 flex items-center gap-2 text-primary">
                <Terminal size={18} />
                <span className="font-medium text-sm tracking-widest uppercase font-sans">系统设计输出</span>
              </div>
              <div className="px-6 pb-6">
                <img className="w-full rounded-xl relative z-10" src="/mermaid-display.png" alt="系统架构图预览" />
              </div>
              <div className="h-1.5 bg-linear-to-r from-primary via-[#ff8c66] to-primary/30" />
            </div>
          </div>
          <div data-anim="arch-text" className="order-1 md:order-2">
            <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
              系统架构<span className="text-primary">一键生成</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-[1.75] font-serif">
              AI 深入分析你的需求，自动输出模块划分、依赖关系和 Mermaid 架构图。支持微服务、单体、Serverless 等多种架构模式。
            </p>
            <ul className="space-y-4 mb-10">
              {architectureFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== ER Diagrams — 浅色区块，黄金比例 ===== */}
      <section id="er-diagrams" className="py-32 px-6 lg:px-10 bg-surface-mid relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[2fr_3fr] gap-12 items-center">
          <div data-anim="er-img" className="order-2 md:order-1">
            <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
              一键生成 <span className="text-primary">ER 图</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-[1.75] font-serif">
              从需求中自动识别数据实体、属性和关联关系，生成 Mermaid ER 关系图。清晰展示表结构与外键关系。
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                <span className="font-medium">自动识别实体与关联关系</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                <span className="font-medium">Mermaid 格式实时渲染</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 shrink-0" size={20} />
                <span className="font-medium">编辑代码后即时刷新预览</span>
              </li>
            </ul>
          </div>
          <div data-anim="er-text" className="order-1 md:order-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-surface-lowest p-3">
              <img className="w-full rounded-xl" src="/img-er.png" alt="ER 关系图预览" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Templates — 深色区块 ===== */}
      <section id="templates" className="py-32 px-6 lg:px-10 section-dark">
        <div className="max-w-7xl mx-auto">
          <div data-anim="tpl-text" className="text-center max-w-3xl mx-auto mb-12">
            <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
              五大模板库<span className="text-primary">让你快人一步</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-[1.75] font-serif">
              内置丰富的项目模板，覆盖 Web 应用、移动端、微服务等常见架构。选择模板一键生成完整设计文档，快速启动你的下一个项目。
            </p>
          </div>
          <div data-anim="tpl-flow" className="relative mb-12">
            {/* SVG 曲线连接线 */}
            <svg className="hidden md:block absolute top-[60%] left-0 w-full h-20 -translate-y-1/2 z-20 pointer-events-none" viewBox="0 0 1200 80" fill="none" preserveAspectRatio="none">
              <path
                data-anim="tpl-path"
                d="M 100,40 C 250,40 250,60 400,60 C 480,60 480,20 560,20 C 640,20 640,60 720,60 C 800,60 800,40 900,40 L 1080,40"
                stroke="url(#tpl-gradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="1400"
                strokeDashoffset="1400"
              />
              {/* 箭头 */}
              <polygon data-anim="tpl-arrowhead" points="1090,40 1068,28 1068,52" fill="var(--primary)" opacity="0" />
              <defs>
                <linearGradient id="tpl-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                { num: "01", title: "覆盖主流技术栈", desc: "Web、移动端、微服务等架构模式" },
                { num: "02", title: "一键生成文档", desc: "完整设计文档即刻可用" },
                { num: "03", title: "支持二次迭代", desc: "基于模板追加需求持续演进" },
              ].map((item, i) => (
                <div key={item.num} data-anim="tpl-card" className="p-6 bg-surface-lowest rounded-xl group card-hover relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-sm font-medium text-primary font-sans">{item.num}</span>
                  </div>
                  <h4 className="text-lg font-medium">{item.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4.5 -translate-y-1/2 w-7 h-7 rounded-full bg-background items-center justify-center z-30 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-primary/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div data-anim="tpl-img" className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden shadow-ambient">
            <img className="w-full" src="/template.png" alt="模板库截图" />
          </div>
        </div>
      </section>

      {/* ===== API Specs + Dev Plans — 浅色区块合并 ===== */}
      <section id="dev-tools" className="py-32 px-6 lg:px-10 bg-surface-mid">
        <div className="max-w-7xl mx-auto">
          {/* API Specs */}
          <div className="mb-24">
            <div data-anim="section-title" className="text-center mb-16">
              <h2 className="text-4xl font-serif font-medium mb-4">
                标准化 <span className="text-primary">API 规范</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto font-serif">基于架构设计自动生成 Swagger/OpenAPI 3.0 接口文档</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {apiCards.map((card, i) => (
                <div key={i} data-anim="api-card" className="p-8 bg-surface-lowest rounded-2xl shadow-ambient hover:shadow-2xl transition-all group card-hover">
                  <card.icon className="text-primary mb-4" size={28} />
                  <h3 className="text-xl font-medium mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 font-serif">{card.desc}</p>
                  <code className="block bg-surface-mid p-3 rounded-lg text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {card.code}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Dev Plans */}
          <div className="max-w-7xl mx-auto grid md:grid-cols-[3fr_2fr] gap-16 items-center">
            <div data-anim="plan-chart" className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-medium text-lg">项目路线图: V1.0</h4>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium font-sans">AI</div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="relative h-8 w-full bg-surface-mid rounded-full">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full" />
                  <span className="absolute -top-6 left-0 text-[10px] font-medium text-muted-foreground">第 1 周：需求分析</span>
                </div>
                <div className="relative h-8 w-full bg-surface-mid rounded-full">
                  <div className="absolute left-[33%] top-0 h-full w-[50%] bg-[#ff8c66] rounded-full" />
                  <span className="absolute -top-6 left-[33%] text-[10px] font-medium text-muted-foreground">第 2-3 周：核心开发</span>
                </div>
                <div className="relative h-8 w-full bg-surface-mid rounded-full">
                  <div className="absolute left-[70%] top-0 h-full w-[20%] bg-muted-foreground/30 rounded-full" />
                  <span className="absolute -top-6 left-[70%] text-[10px] font-medium text-muted-foreground">第 4 周：测试</span>
                </div>
              </div>
            </div>
            <div data-anim="plan-text">
              <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
                Sprint 级 <span className="text-primary">开发计划</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-[1.75] font-serif">
                Dev Plan Agent 将架构决策拆解为可执行的任务列表。自动估算复杂度、推荐依赖关系，并生成合理的开发时间线。
              </p>
              <div className="space-y-4">
                {devPlanFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-lowest hover:shadow-ambient transition-all cursor-default group">
                    <ListChecks className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Version Tracking ===== */}
      <section id="tracking" className="py-32 px-6 lg:px-10 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-surface-lowest px-4 py-2 rounded-full mb-8 shadow-sm">
            <Clock className="text-primary" size={14} />
            <span className="text-xs font-medium uppercase tracking-widest font-sans">版本追踪</span>
          </div>
          <h2 data-anim="section-title" className="text-4xl font-serif font-medium mb-6">
            每次迭代<span className="text-primary">自动记录</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto font-serif leading-[1.75]">
            追加需求时自动对比差异，生成变更日志。版本持续演进，完整追踪设计历史。
          </p>
          <div data-anim="tracking-card" className="bg-surface-lowest rounded-2xl p-8 shadow-ambient text-left">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                <Terminal size={20} />
              </div>
              <div>
                <div className="font-medium text-lg">Release v2.4.0</div>
                <div className="text-xs text-muted-foreground">由 CycleMind AI 生成 · 2 分钟前</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-medium text-sm mb-4 uppercase tracking-tight text-muted-foreground font-sans">架构图更新</h5>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm font-medium">负载均衡器升级为网络 LB</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-medium">新增 RDS 只读副本到架构</span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-sm mb-4 uppercase tracking-tight text-muted-foreground font-sans">Schema 变更</h5>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                  <span className="text-sm font-medium">User 表新增 last_login 字段</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm font-medium">Orders 表废弃 legacy_id 字段</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA Banner — 深色区块 ===== */}
      <section data-section="cta-banner" className="py-24 px-6 lg:px-10 section-dark">
        <div data-anim="cta-banner" className="max-w-4xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-serif font-medium text-foreground tracking-tight">
              开始用 AI 设计你的<br />下一个项目
            </h3>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto font-serif">无需手动绘图，无需编写模板。输入需求，CycleMind 帮你生成一切。</p>
            <div className="mt-8">
              <Link href="/register" className="px-10 py-5 rounded-full bg-primary text-white text-lg font-medium hover:opacity-90 hover:scale-[1.02] transition-all duration-300 btn-press focus-anthropic">
                免费注册 &rarr;
              </Link>
            </div>
            <p className="mt-6 text-muted-foreground text-sm">五分钟完成你的设计</p>
          </div>
        </div>
      </section>

      {/* ===== Footer — 深色 ===== */}
      <footer className="py-12 px-6 lg:px-10 section-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-serif font-medium text-primary text-xl">CycleMind</div>
            <p className="text-muted-foreground text-sm">© 2026 CycleMind · AI 驱动的软件设计平台</p>
          </div>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-muted-foreground hover:text-primary transition-all" href="https://github.com/RADEKWRLD" target="_blank" rel="noopener noreferrer">
              <GithubIcon size={18} />
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-muted-foreground hover:text-primary transition-all" href="#">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

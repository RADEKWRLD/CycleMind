"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-anim='tagline']", { y: 30, opacity: 0, duration: 0.6 })
        .from("[data-anim='headline']", { y: 40, opacity: 0, duration: 0.7 }, "-=0.3")
        .from("[data-anim='desc']", { y: 30, opacity: 0, duration: 0.6 }, "-=0.3")
        .from("[data-anim='cta']", { y: 20, opacity: 0, duration: 0.5 }, "-=0.2")
        .from(
          "[data-anim='feature']",
          { y: 40, opacity: 0, duration: 0.6, stagger: 0.15 },
          "-=0.1"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">CycleMind</h1>
          <div className="flex gap-3 items-center">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--secondary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-all duration-300"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--primary)] text-white hover:brightness-110 transition-all duration-300 shadow-sm"
            >
              开始使用
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 px-6 lg:px-10 overflow-hidden">
          {/* Background logo watermark */}
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 opacity-[0.8] pointer-events-none select-none">
            <img src="/logo.svg" alt="" className="w-[400px] h-[400px]" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-4xl">
              <p data-anim="tagline" className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest mb-6">
                AI-Powered Software Design
              </p>
              <h2 data-anim="headline" className="heading-display text-[var(--foreground)]">
                智能软件生命周期
                <br />
                <span className="text-[var(--primary)]">自动化辅助系统</span>
              </h2>
              <p data-anim="desc" className="mt-8 text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl leading-relaxed font-light">
                输入自然语言需求，AI 自动生成架构图、ER 图、API 规范和发展计划。
                支持版本追踪与设计演化。
              </p>
              <div data-anim="cta" className="mt-10 flex gap-4 items-center">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl bg-[var(--primary)] text-white text-base font-bold hover:brightness-110 transition-all duration-300 shadow-lg shadow-[var(--primary)]/20"
                >
                  免费开始 &rarr;
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-xl bg-[var(--secondary)] text-base font-semibold hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-all duration-300"
                >
                  已有账号
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial separator */}
        <hr className="separator-editorial max-w-7xl mx-auto" />

        {/* Features Section */}
        <section className="py-20 px-6 lg:px-10" ref={featuresRef}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: "01",
                  title: "需求结构化",
                  desc: "自然语言需求自动解析为结构化模块，AI 智能拆解功能点与约束条件",
                },
                {
                  num: "02",
                  title: "Mermaid 图生成",
                  desc: "自动生成架构图、ER 图、流程图，实时渲染预览与版本对比",
                },
                {
                  num: "03",
                  title: "版本演化追踪",
                  desc: "需求变更自动更新图结构，支持版本对比与设计回溯",
                },
              ].map((feature) => (
                <div
                  key={feature.num}
                  data-anim="feature"
                  className="group p-8 rounded-xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] card-hover"
                >
                  <span className="text-4xl font-extrabold text-[var(--primary)]/20 group-hover:text-[var(--primary)]/40 transition-all duration-300">
                    {feature.num}
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">
            CycleMind - AI-Powered Software Design
          </span>
          <span className="text-sm font-bold text-[var(--primary)]">2026</span>
        </div>
      </footer>
    </div>
  );
}

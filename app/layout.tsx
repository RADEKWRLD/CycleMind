import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const funnelDisplay = localFont({
  src: "../public/Funnel_Display/FunnelDisplay-VariableFont_wght.ttf",
  variable: "--font-funnel-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CycleMind - AI-Powered Software Design",
  description: "输入自然语言需求，AI 自动生成架构图、ER 图、API 规范和发展计划",
  icons: {
    icon: "/logo-solid.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${funnelDisplay.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

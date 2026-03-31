import type { Metadata } from "next";
import { Lora, Poppins, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${lora.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

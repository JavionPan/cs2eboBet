import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "CS2 Fun Predict",
  description: "CS2 电竞预测娱乐网站 MVP，仅使用站内虚拟代币。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main className="mx-auto min-h-[calc(100vh-140px)] max-w-7xl px-4 py-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

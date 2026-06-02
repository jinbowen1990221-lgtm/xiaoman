import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppFrame } from "@/components/app-frame";

export const metadata: Metadata = {
  title: "小满",
  description: "一个话不多但一直在观察你的 AI 朋友"
};

export const viewport: Viewport = {
  themeColor: "#FAF6EF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "oh-my-tool — 스위스아미나이프",
  description: "다양한 도구를 제공하는 웹 애플리케이션",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex flex-col lg:flex-row h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
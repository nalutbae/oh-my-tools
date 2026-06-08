"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🛠️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">oh-my-tool</h1>
            <p className="text-xs text-gray-400">스위스아미나이프</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {/* 홈 */}
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span className="text-lg">🏠</span>
          <div>
            <div>홈</div>
            <div className="text-xs text-gray-400 font-normal">도구 목록</div>
          </div>
        </Link>
        {/* 도구들 */}
        {tools.map((tool) => {
          const isActive = pathname === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div>
                <div>{tool.name}</div>
                <div className="text-xs text-gray-400 font-normal">{tool.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
        oh-my-tool v0.1.0
      </div>
    </aside>
  );
}

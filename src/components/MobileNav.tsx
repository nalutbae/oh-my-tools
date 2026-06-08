"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center py-1.5 px-1">
        {/* 홈 */}
        <Link
          href="/"
          className={`flex flex-col items-center px-1.5 py-1 rounded-lg transition-colors min-h-0 min-w-0 ${
            pathname === "/"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="text-xl mb-0.5">🏠</span>
          <span className="text-[11px] font-medium leading-tight">홈</span>
        </Link>
        {/* 도구들 */}
        {tools.map((tool) => {
          const isActive = pathname === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`flex flex-col items-center px-1.5 py-1 rounded-lg transition-colors min-h-0 min-w-0 ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xl mb-0.5">{tool.icon}</span>
              <span className="text-[11px] font-medium leading-tight truncate max-w-[64px]">
                {tool.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

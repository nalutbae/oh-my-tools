"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {tools.map((tool) => {
          const isActive = pathname === tool.href;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xl mb-0.5">{tool.icon}</span>
              <span className="text-[10px] font-medium">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
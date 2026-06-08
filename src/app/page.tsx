import Link from "next/link";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          🛠️ oh-my-tool
        </h1>
        <p className="text-sm sm:text-lg text-gray-500">
          스위스아미나이프 — 필요한 도구를 한 곳에
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md active:bg-blue-50 transition-all min-h-[72px] sm:min-h-[88px] touch-auto"
          >
            <span className="text-2xl sm:text-3xl shrink-0">{tool.icon}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 text-sm sm:text-base">
                {tool.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

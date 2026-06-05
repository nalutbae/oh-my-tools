import Link from "next/link";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛠️ oh-my-tool
        </h1>
        <p className="text-gray-500 text-lg">
          스위스아미나이프 — 필요한 도구를 한 곳에
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

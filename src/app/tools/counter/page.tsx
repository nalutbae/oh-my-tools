"use client";

import { useState } from "react";

interface Stats {
  totalChars: number;
  charsNoSpace: number;
  bytes: number;
  lines: number;
  words: number;
}

function computeStats(text: string): Stats {
  const totalChars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const bytes = new TextEncoder().encode(text).length;
  const lines = text === "" ? 0 : text.split(/\r?\n/).length;
  const words = (text.match(/[가-힣]+|[a-zA-Z]+|[0-9]+/g) || []).length;
  return { totalChars, charsNoSpace, bytes, lines, words };
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange" | "pink";
}) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
    pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-3 sm:p-4 text-center`}>
      <div className={`text-2xl sm:text-3xl font-bold ${c.text} tabular-nums`}>{value.toLocaleString()}</div>
      <div className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function CounterPage() {
  const [text, setText] = useState("");
  const stats = computeStats(text);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🔢 글자수 체크</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          텍스트 길이, 단어 수, 바이트 수를 실시간으로 확인합니다
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 lg:mb-6">
        <StatCard label="전체 글자수" value={stats.totalChars} color="blue" />
        <StatCard label="공백 제외" value={stats.charsNoSpace} color="green" />
        <StatCard label="UTF-8 바이트" value={stats.bytes} color="purple" />
        <StatCard label="줄 수" value={stats.lines} color="orange" />
        <StatCard label="단어 수" value={stats.words} color="pink" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-700">📝 텍스트 입력</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트를 입력하세요..."
          className="w-full min-h-[240px] sm:min-h-[320px] px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white text-gray-800 text-sm focus:outline-none resize-y"
        />
      </div>
    </div>
  );
}
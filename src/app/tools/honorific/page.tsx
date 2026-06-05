"use client";

import { useState } from "react";
import { toHonorific, type HonorificLevel } from "@/lib/honorific";

export default function HonorificPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [level, setLevel] = useState<HonorificLevel>("haeyo");

  const handleConvert = () => {
    setOutput(toHonorific(input, level));
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🙇 경어체 변환</h1>
        <p className="text-sm text-gray-500">반말 또는 평문 한글 텍스트를 높임말로 변환합니다</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setLevel("haeyo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${level === "haeyo" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          🙇 해요체 (일상 높임말)
        </button>
        <button
          onClick={() => setLevel("hapsyo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${level === "hapsyo" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          🎩 합쇼체 (격식 높임말)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">📥 입력 텍스트</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="변환할 텍스트를 입력하세요.&#10;예: 나 어제 학교 갔어. 같이 공부하자!"
            className="w-full h-64 p-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{input.length}자</span>
            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              변환하기 →
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">📤 변환 결과</label>
          <textarea
            readOnly
            value={output}
            placeholder="변환 결과가 여기에 표시됩니다"
            className="w-full h-64 p-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-gray-50 resize-none focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{output.length}자</span>
            <button
              onClick={() => { if (output) navigator.clipboard.writeText(output); }}
              disabled={!output}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              📋 복사
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 알아두세요</h3>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>해요체는 일상적인 높임말(해요, 했어요)로 변환합니다.</li>
          <li>합쇼체는 격식 있는 높임말(합니다, 하십시오)로 변환합니다.</li>
          <li>AI 기반이 아닌 규칙 기반 변환이므로 100% 완벽하지 않을 수 있습니다.</li>
          <li>더 정확한 변환을 위해 짧은 문장 단위로 입력하는 것을 권장합니다.</li>
        </ul>
      </div>
    </div>
  );
}

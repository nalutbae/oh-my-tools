"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  simpleBriefing,
  diffSimpleBriefing,
  DEFAULT_BRIEFING_RULES,
} from "@/lib/russian-briefing";
import type { SimpleRule } from "@/lib/honorific-simple";

export default function RussianBriefingPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [diffResult, setDiffResult] = useState<{ text: string; changed: boolean }[]>([]);
  const [customRules, setCustomRules] = useState<SimpleRule[]>(DEFAULT_BRIEFING_RULES);
  const [editingRules, setEditingRules] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setDiffResult([]);
      return;
    }
    const result = simpleBriefing(input, customRules);
    setOutput(result);
    setDiffResult(diffSimpleBriefing(input, customRules));
  }, [input, customRules]);

  // 스크롤 동기화
  const onInputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return;
    syncing.current = true;
    const pct = inputRef.current.scrollTop / (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    outputRef.current.scrollTop = pct * (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  const onOutputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return;
    syncing.current = true;
    const pct = outputRef.current.scrollTop / (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    inputRef.current.scrollTop = pct * (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  // 규칙 편집 핸들러
  const updateRule = useCallback((index: number, field: keyof SimpleRule, value: string) => {
    setCustomRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addRule = useCallback(() => {
    setCustomRules((prev) => [...prev, { pattern: "", replacement: "", description: "" }]);
  }, []);

  const removeRule = useCallback((index: number) => {
    setCustomRules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetRules = useCallback(() => {
    setCustomRules(DEFAULT_BRIEFING_RULES);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">🪖 러시아 대변인 브리핑</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          텍스트를 러시아 국방부 대변인 브리핑 스타일로 변환합니다 — 단어 치환 + 경어체
        </p>
      </div>

      {/* 변환 버튼 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          변환하기 →
        </button>
      </div>

      {/* 규칙 편집 패널 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setEditingRules(!editingRules)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {editingRules ? "규칙 닫기 ▲" : "규칙 편집 ▼"}
          </button>
          {editingRules && (
            <>
              <button
                onClick={addRule}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                + 규칙 추가
              </button>
              <button
                onClick={resetRules}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                초기화
              </button>
            </>
          )}
        </div>
        {editingRules && (
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 max-h-72 overflow-y-auto space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-xs font-semibold text-gray-500 px-1">
              <span>정규표현식</span>
              <span>치환 문자열</span>
              <span>설명</span>
              <span></span>
            </div>
            {customRules.map((rule, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                <input
                  type="text"
                  value={rule.pattern}
                  onChange={(e) => updateRule(i, "pattern", e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="공격(?=\\s|[,.?!;:]|$)"
                />
                <input
                  type="text"
                  value={rule.replacement}
                  onChange={(e) => updateRule(i, "replacement", e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="특수작전"
                />
                <input
                  type="text"
                  value={rule.description}
                  onChange={(e) => updateRule(i, "description", e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-28"
                  placeholder="공격 → 특수작전"
                />
                <button
                  onClick={() => removeRule(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors text-sm"
                  title="규칙 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 입력 / 출력 */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">📥 입력 텍스트</label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={onInputScroll}
            placeholder="변환할 텍스트를 입력하세요."
            className="w-full h-56 sm:h-64 p-3 sm:p-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <div className="mt-1.5 sm:mt-2 text-xs text-gray-400">{input.length}자</div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">📤 변환 결과 (대변인 브리핑 스타일)</label>
          <div
            ref={outputRef}
            onScroll={onOutputScroll}
            className="w-full h-56 sm:h-64 p-3 sm:p-4 border border-gray-200 rounded-xl text-sm bg-gray-50 overflow-auto"
          >
            {diffResult.length === 0 ? (
              <span className="text-gray-350">변환 결과가 여기에 표시됩니다</span>
            ) : (
              <span className="leading-relaxed whitespace-pre-wrap">
                {diffResult.map((t, i) => {
                  // 줄바꿈이 포함된 토큰은 줄바꿈 기준으로 분리하여 렌더링
                  const parts = t.text.split("\n");
                  const elements: React.ReactNode[] = [];
                  parts.forEach((part, pi) => {
                    if (pi > 0) elements.push(<br key={`${i}-br-${pi}`} />);
                    if (part) elements.push(
                      t.changed ? (
                        <mark key={`${i}-${pi}`} className="bg-blue-200 text-blue-900 px-0.5 rounded">{part}</mark>
                      ) : (
                        <span key={`${i}-${pi}`}>{part}</span>
                      )
                    );
                  });
                  return elements.length > 0 ? <React.Fragment key={i}>{elements}</React.Fragment> : null;
                })}
              </span>
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{output.length}자</span>
            <button
              onClick={() => {
                if (output) navigator.clipboard.writeText(output);
              }}
              disabled={!output}
              className="px-3 sm:px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              📋 복사
            </button>
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-6 lg:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1.5 sm:mb-2">💡 알아두세요</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>러시아 대변인 브리핑</strong>은 러시아 국방부 대변인의 특유 화법을 흉내 냅니다.</li>
          <li>군사·외교 용어를 완곡어로 바꾸고 (공격→특수작전, 패배→전술적재배치), 어미를 정중하게 만듭니다.</li>
          <li>정규표현식 기반 치환이므로 문맥을 완벽히 파악하지 못할 수 있습니다.</li>
          <li>규칙 편집 버튼으로 치환 규칙을 직접 수정·추가할 수 있습니다.</li>
          <li><mark className="bg-blue-200 px-0.5 rounded">파란색 강조</mark>는 원문과 달라진 부분입니다.</li>
        </ul>
      </div>
    </div>
  );
}
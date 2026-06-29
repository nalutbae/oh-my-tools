"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  simpleHonorific,
  diffSimpleHonorific,
  DEFAULT_SIMPLE_RULES,
  type SimpleRule,
} from "@/lib/honorific-simple";
import { toHonorific, type HonorificLevel } from "@/lib/honorific";

type ConvertMode = "simple" | "haeyo" | "hapsyo";

export default function HonorificPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("simple");
  const [diffResult, setDiffResult] = useState<{ text: string; changed: boolean }[]>([]);
  const [ready, setReady] = useState(false);
  const [customRules, setCustomRules] = useState<SimpleRule[]>(DEFAULT_SIMPLE_RULES);
  const [editingRules, setEditingRules] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  // Garu 초기화 (해요체/합쇼체용)
  useEffect(() => {
    toHonorific("안녕하세요", "haeyo")
      .then(() => setReady(true))
      .catch(() => {});
  }, []);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) {
      setOutput("");
      setDiffResult([]);
      return;
    }
    try {
      let result: string;
      if (mode === "simple") {
        result = simpleHonorific(input, customRules);
        setDiffResult(diffSimpleHonorific(input, customRules));
      } else {
        result = await toHonorific(input, mode as HonorificLevel);
        // diff는 간단 토큰 비교 사용
        const src = tokenize(input);
        const dst = tokenize(result);
        setDiffResult(diffTokensArr(src, dst));
      }
      setOutput(result);
    } catch (e: any) {
      setOutput("변환 오류: " + String(e));
      setDiffResult([]);
    }
  }, [input, mode, customRules]);

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
    setCustomRules(DEFAULT_SIMPLE_RULES);
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">🙇 경어체 변환</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          반말 또는 평문 한글 텍스트를 높임말로 변환합니다
        </p>
      </div>

      {/* 모드 선택 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setMode("simple")}
          className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            mode === "simple"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          ⚡ 단순변환
        </button>
        <button
          onClick={() => setMode("haeyo")}
          className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            mode === "haeyo"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          🙇 해요체
        </button>
        <button
          onClick={() => setMode("hapsyo")}
          className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
            mode === "hapsyo"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          🎩 합쇼체
        </button>
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="ml-auto px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          변환하기 →
        </button>
      </div>

      {/* 단순변환 규칙 편집 패널 */}
      {mode === "simple" && (
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
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition-colors"
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
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="이다\\b"
                  />
                  <input
                    type="text"
                    value={rule.replacement}
                    onChange={(e) => updateRule(i, "replacement", e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="입니다"
                  />
                  <input
                    type="text"
                    value={rule.description}
                    onChange={(e) => updateRule(i, "description", e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-28"
                    placeholder="이다 → 입니다"
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
      )}

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
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">📤 변환 결과</label>
          <div
            ref={outputRef}
            onScroll={onOutputScroll}
            className="w-full h-56 sm:h-64 p-3 sm:p-4 border border-gray-200 rounded-xl text-sm bg-gray-50 overflow-auto"
          >
            {diffResult.length === 0 ? (
              <span className="text-gray-350">변환 결과가 여기에 표시됩니다</span>
            ) : (
              <span className="leading-relaxed whitespace-pre-wrap">
                {diffResult.map((t, i) =>
                  t.changed ? (
                    <mark key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">
                      {t.text}
                    </mark>
                  ) : (
                    <span key={i}>{t.text}</span>
                  )
                )}
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
      <div className="mt-6 lg:mt-8 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-xs sm:text-sm font-semibold text-amber-800 mb-1.5 sm:mb-2">💡 알아두세요</h3>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          {mode === "simple" ? (
            <>
              <li><strong>단순변환</strong>은 정규표현식 기반 치환으로, 빠르고 오프라인에서 동작합니다.</li>
              <li>문맥을 분석하지 않으므로 완벽하지 않을 수 있습니다.</li>
              <li>규칙 편집 버튼으로 치환 규칙을 직접 수정·추가할 수 있습니다.</li>
              <li><mark className="bg-amber-200 px-0.5 rounded">노란색 강조</mark>는 원문과 달라진 부분입니다.</li>
            </>
          ) : (
            <>
              <li>해요체는 일상적인 높임말(해요, 했어요)로 변환합니다.</li>
              <li>합쇼체는 격식 있는 높임말(합니다, 하십시오)로 변환합니다.</li>
              <li><mark className="bg-amber-200 px-0.5 rounded">노란색 강조</mark>는 원문과 달라진 부분입니다.</li>
              <li>AI 기반이 아닌 규칙 기반 변환이므로 100% 완벽하지 않을 수 있습니다.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// ── 토큰 비교 유틸 (해요체/합쇼체 모드용) ──

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (/[가-힣a-zA-Z0-9]/.test(ch)) buf += ch;
    else {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

function diffTokensArr(src: string[], dst: string[]): { text: string; changed: boolean }[] {
  const result: { text: string; changed: boolean }[] = [];
  let si = 0, di = 0;
  while (si < src.length && di < dst.length) {
    if (src[si] === dst[di]) { result.push({ text: dst[di], changed: false }); si++; di++; }
    else {
      let found = false;
      for (let ahead = 1; ahead <= 3 && si + ahead < src.length; ahead++) {
        if (src[si + ahead] === dst[di]) {
          for (let k = 0; k < ahead; k++) result.push({ text: src[si + k], changed: true });
          si += ahead; found = true; break;
        }
      }
      if (!found) {
        for (let ahead = 1; ahead <= 3 && di + ahead < dst.length; ahead++) {
          if (src[si] === dst[di + ahead]) {
            for (let k = 0; k < ahead; k++) result.push({ text: dst[di + k], changed: true });
            di += ahead; found = true; break;
          }
        }
      }
      if (!found) { result.push({ text: dst[di], changed: true }); si++; di++; }
    }
  }
  while (di < dst.length) { result.push({ text: dst[di], changed: true }); di++; }
  return result;
}
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toHonorific, type HonorificLevel } from "@/lib/honorific";

/**
 * 한글·공백·문장부호 경계에서 토큰으로 분리
 */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (/[가-힣a-zA-Z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

/**
 * 단순 diff: 입력 토큰과 출력 토큰을 비교하여
 * 변경된 토큰을 [{text, changed}] 형태로 반환
 */
function diffTokens(src: string[], dst: string[]) {
  const result: { text: string; changed: boolean }[] = [];
  let si = 0, di = 0;
  while (si < src.length && di < dst.length) {
    if (src[si] === dst[di]) {
      result.push({ text: dst[di], changed: false });
      si++; di++;
    } else {
      // Look ahead for sync point (max 3 tokens)
      let found = false;
      for (let ahead = 1; ahead <= 3 && si + ahead < src.length; ahead++) {
        if (src[si + ahead] === dst[di]) {
          // src has extra tokens → mark them as removed
          for (let k = 0; k < ahead; k++) {
            result.push({ text: src[si + k], changed: true });
          }
          si += ahead;
          found = true;
          break;
        }
      }
      if (!found) {
        for (let ahead = 1; ahead <= 3 && di + ahead < dst.length; ahead++) {
          if (src[si] === dst[di + ahead]) {
            // dst has extra tokens → mark them as added
            for (let k = 0; k < ahead; k++) {
              result.push({ text: dst[di + k], changed: true });
            }
            di += ahead;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        result.push({ text: dst[di], changed: true });
        si++; di++;
      }
    }
  }
  // remaining dst tokens
  while (di < dst.length) {
    result.push({ text: dst[di], changed: true });
    di++;
  }
  return result;
}

export default function HonorificPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [level, setLevel] = useState<HonorificLevel>("haeyo");
  const [diffResult, setDiffResult] = useState<{ text: string; changed: boolean }[]>([]);

  // Sync scroll refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const handleConvert = useCallback(() => {
    const out = toHonorific(input, level);
    setOutput(out);
    setDiffResult(diffTokens(tokenize(input), tokenize(out)));
  }, [input, level]);

  // Auto-convert on level change
  useEffect(() => {
    if (input.trim()) handleConvert();
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync scroll: input → output
  const onInputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return;
    syncing.current = true;
    const pct = inputRef.current.scrollTop / (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    outputRef.current.scrollTop = pct * (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  // Sync scroll: output → input
  const onOutputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return;
    syncing.current = true;
    const pct = outputRef.current.scrollTop / (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    inputRef.current.scrollTop = pct * (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">🙇 경어체 변환</h1>
        <p className="text-sm text-gray-500">
          반말 또는 평문 한글 텍스트를 높임말로 변환합니다 — 변경된 부분이 강조 표시됩니다
        </p>
      </div>

      {/* Level selector */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setLevel("haeyo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${level === "haeyo"
            ? "bg-indigo-600 text-white"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          🙇 해요체 (일상 높임말)
        </button>
        <button
          onClick={() => setLevel("hapsyo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${level === "hapsyo"
            ? "bg-indigo-600 text-white"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          🎩 합쇼체 (격식 높임말)
        </button>
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="ml-auto px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          변환하기 →
        </button>
      </div>

      {/* Input/Output grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            📥 입력 텍스트
          </label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={onInputScroll}
            placeholder="변환할 텍스트를 입력하세요."
            className="w-full h-64 p-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <div className="mt-2 text-xs text-gray-400">{input.length}자</div>
        </div>

        {/* Output with highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            📤 변환 결과
          </label>
          <div
            ref={outputRef}
            onScroll={onOutputScroll}
            className="w-full h-64 p-4 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 overflow-auto focus:outline-none"
          >
            {diffResult.length === 0 ? (
              <span className="text-gray-350">변환 결과가 여기에 표시됩니다</span>
            ) : (
              <span className="leading-relaxed whitespace-pre-wrap">
                {diffResult.map((t, i) =>
                  t.changed ? (
                    <mark
                      key={i}
                      className="bg-amber-200 text-amber-900 px-0.5 rounded"
                    >
                      {t.text}
                    </mark>
                  ) : (
                    <span key={i}>{t.text}</span>
                  )
                )}
              </span>
            )}
          </div>
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

      {/* Tips */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 알아두세요</h3>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>해요체는 일상적인 높임말(해요, 했어요)로 변환합니다.</li>
          <li>합쇼체는 격식 있는 높임말(합니다, 하십시오)로 변환합니다.</li>
          <li><mark className="bg-amber-200 px-0.5 rounded">노란색 강조</mark>는 원문과 달라진 부분입니다.</li>
          <li>AI 기반이 아닌 규칙 기반 변환이므로 100% 완벽하지 않을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}

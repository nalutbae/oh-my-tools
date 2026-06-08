"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toHonorific, type HonorificLevel } from "@/lib/honorific";

function tokenize(text: string): string[] {
  const tokens: string[] = []; let buf = "";
  for (const ch of text) { if (/[가-힣a-zA-Z0-9]/.test(ch)) buf += ch; else { if (buf) { tokens.push(buf); buf = ""; } tokens.push(ch); } }
  if (buf) tokens.push(buf); return tokens;
}

function diffTokens(src: string[], dst: string[]) {
  const result: { text: string; changed: boolean }[] = []; let si = 0, di = 0;
  while (si < src.length && di < dst.length) {
    if (src[si] === dst[di]) { result.push({ text: dst[di], changed: false }); si++; di++; }
    else {
      let found = false;
      for (let ahead = 1; ahead <= 3 && si + ahead < src.length; ahead++) {
        if (src[si + ahead] === dst[di]) { for (let k = 0; k < ahead; k++) result.push({ text: src[si + k], changed: true }); si += ahead; found = true; break; }
      }
      if (!found) {
        for (let ahead = 1; ahead <= 3 && di + ahead < dst.length; ahead++) {
          if (src[si] === dst[di + ahead]) { for (let k = 0; k < ahead; k++) result.push({ text: dst[di + k], changed: true }); di += ahead; found = true; break; }
        }
      }
      if (!found) { result.push({ text: dst[di], changed: true }); si++; di++; }
    }
  }
  while (di < dst.length) { result.push({ text: dst[di], changed: true }); di++; }
  return result;
}

export default function HonorificPage() {
  const [input, setInput] = useState(""); const [output, setOutput] = useState("");
  const [level, setLevel] = useState<HonorificLevel>("haeyo");
  const [diffResult, setDiffResult] = useState<{ text: string; changed: boolean }[]>([]);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null); const outputRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  useEffect(() => { toHonorific("안녕하세요", "haeyo").then(() => setReady(true)).catch(() => setOutput("형태소 분석기 초기화 중...")); }, []);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) { setOutput(""); setDiffResult([]); return; }
    try { const out = await toHonorific(input, level); setOutput(out); setDiffResult(diffTokens(tokenize(input), tokenize(out))); }
    catch (e: any) { setOutput("변환 오류: " + String(e)); setDiffResult([]); }
  }, [input, level]);

  useEffect(() => { if (!ready) return; handleConvert(); }, [level, ready]);

  const onInputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return; syncing.current = true;
    const pct = inputRef.current.scrollTop / (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    outputRef.current.scrollTop = pct * (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);
  const onOutputScroll = useCallback(() => {
    if (syncing.current || !inputRef.current || !outputRef.current) return; syncing.current = true;
    const pct = outputRef.current.scrollTop / (outputRef.current.scrollHeight - outputRef.current.clientHeight);
    inputRef.current.scrollTop = pct * (inputRef.current.scrollHeight - inputRef.current.clientHeight);
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">🙇 경어체 변환</h1>
        <p className="text-xs sm:text-sm text-gray-500">반말 또는 평문 한글 텍스트를 높임말로 변환합니다</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setLevel("haeyo")}
          className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${level === "haeyo" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"}`}>🙇 해요체</button>
        <button onClick={() => setLevel("hapsyo")}
          className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${level === "hapsyo" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"}`}>🎩 합쇼체</button>
        <button onClick={handleConvert} disabled={!input.trim()}
          className="ml-auto px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">변환하기 →</button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">📥 입력 텍스트</label>
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onScroll={onInputScroll}
            placeholder="변환할 텍스트를 입력하세요."
            className="w-full h-56 sm:h-64 p-3 sm:p-4 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
          <div className="mt-1.5 sm:mt-2 text-xs text-gray-400">{input.length}자</div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">📤 변환 결과</label>
          <div ref={outputRef} onScroll={onOutputScroll}
            className="w-full h-56 sm:h-64 p-3 sm:p-4 border border-gray-200 rounded-xl text-sm bg-gray-50 overflow-auto">
            {diffResult.length === 0 ? (<span className="text-gray-350">변환 결과가 여기에 표시됩니다</span>) : (
              <span className="leading-relaxed whitespace-pre-wrap">
                {diffResult.map((t, i) => t.changed ? (<mark key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">{t.text}</mark>) : (<span key={i}>{t.text}</span>))}
              </span>
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{output.length}자</span>
            <button onClick={() => { if (output) navigator.clipboard.writeText(output); }} disabled={!output}
              className="px-3 sm:px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition-colors">📋 복사</button>
          </div>
        </div>
      </div>

      <div className="mt-6 lg:mt-8 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-xs sm:text-sm font-semibold text-amber-800 mb-1.5 sm:mb-2">💡 알아두세요</h3>
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

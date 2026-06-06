"use client";

import { useState, useRef } from "react";
import { regexPatterns, type RegexPattern } from "@/lib/regex-patterns";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface DiffOp {
  type: "keep" | "delete" | "insert";
  text: string;
}

function simpleDiff(a: string, b: string): DiffOp[] {
  // LCS 기반 diff — 너무 긴 문자열은 건너뛴다
  if (a.length + b.length > 4000) {
    return [{ type: "delete", text: a }, { type: "insert", text: b }];
  }

  const n = a.length;
  const m = b.length;

  // dp[i][j] = LCS 길이 from (i,j)
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "keep", text: a[i] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "delete", text: a[i] });
      i++;
    } else {
      ops.push({ type: "insert", text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "delete", text: a[i++] });
  while (j < m) ops.push({ type: "insert", text: b[j++] });

  // 연속 같은 타입 병합
  return ops.reduce(
    (acc, op) => {
      const last = acc[acc.length - 1];
      if (last && last.type === op.type) {
        last.text += op.text;
      } else {
        acc.push({ ...op });
      }
      return acc;
    },
    [] as DiffOp[]
  );
}

/**
 * 치환 결과에 하이라이트를 적용:
 *   - 삭제: <del>...</del>
 *   - 추가: <mark>...</mark>
 */
function highlightDiff(original: string, replaced: string): string {
  if (original === replaced) return escapeHtml(original);

  const ops = simpleDiff(original, replaced);
  let html = "";
  for (const op of ops) {
    const esc = escapeHtml(op.text);
    if (op.type === "keep") html += esc;
    else if (op.type === "delete")
      html += `<del style="background:#fecaca;color:#991b1b;text-decoration:line-through">${esc}</del>`;
    else if (op.type === "insert")
      html += `<mark style="background:#bbf7d0;color:#166534">${esc}</mark>`;
  }
  return html;
}

/**
 * 치환된 횟수를 계산 (non-overlapping count)
 */
function countReplacements(text: string, pattern: string, flags: string): number {
  try {
    const re = new RegExp(pattern, flags);
    let count = 0;
    re.lastIndex = 0;
    while (re.exec(text) !== null) {
      count++;
      if (!re.global) break;
    }
    return count;
  } catch {
    return 0;
  }
}

export default function RegexPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState("");
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState("g");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [diffHtml, setDiffHtml] = useState("");

  const outputRef = useRef<HTMLTextAreaElement>(null);
  const diffRef = useRef<HTMLDivElement>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const title = e.target.value;
    setSelectedTitle(title);
    if (!title) return;
    const p = regexPatterns.find((x) => x.title === title);
    if (p) {
      setPattern(p.pattern);
      setReplacement(p.replacement);
      setFlags(p.flags);
      setError("");
    }
  };

  const handleCustomChange = (field: "pattern" | "replacement" | "flags", value: string) => {
    setSelectedTitle("");
    if (field === "pattern") setPattern(value);
    if (field === "replacement") setReplacement(value);
    if (field === "flags") setFlags(value);
    setError("");
  };

  const applyReplacement = () => {
    if (!pattern) {
      setError("패턴을 입력하세요");
      return;
    }
    if (!input) {
      setOutput("");
      setDiffHtml("");
      setMatchCount(0);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const replaced = input.replace(regex, replacement);
      setOutput(replaced);
      setDiffHtml(highlightDiff(input, replaced));
      setMatchCount(countReplacements(input, pattern, flags));
      setError("");
    } catch (err) {
      setError(`정규식 오류: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🔍 정규식 치환</h1>
      <p className="text-sm text-gray-500 mb-6">
        정규표현식 패턴으로 텍스트를 검색·치환합니다
      </p>

      {/* 패턴 선택 + 설정 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* 패턴 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              📋 빠른 선택
            </label>
            <select
              value={selectedTitle}
              onChange={handleSelectChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            >
              <option value="">직접 입력</option>
              {regexPatterns.map((p) => (
                <option key={p.title} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* 패턴 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                🔎 정규식 패턴
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => handleCustomChange("pattern", e.target.value)}
                placeholder="예: \\s+"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                🏳️ 플래그
              </label>
              <input
                type="text"
                value={flags}
                onChange={(e) => handleCustomChange("flags", e.target.value)}
                placeholder="g, i, m..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* 치환 문자열 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              🔄 치환 문자열
            </label>
            <input
              type="text"
              value={replacement}
              onChange={(e) => handleCustomChange("replacement", e.target.value)}
              placeholder="예:  (공백)  또는 $1"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              <code className="bg-gray-100 px-1 rounded">$1</code>{" "}
              <code className="bg-gray-100 px-1 rounded">$2</code> 등으로 캡처 그룹 참조.
              <code className="bg-gray-100 px-1 rounded">\\t</code>{" "}
              <code className="bg-gray-100 px-1 rounded">\\n</code> 지원.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* 실행 버튼 */}
          <button
            onClick={applyReplacement}
            className="self-start px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            🚀 치환 실행
          </button>
        </div>
      </div>

      {/* 입력 / 출력 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 입력 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>📝 입력</span>
            <span className="text-xs font-normal text-gray-400">
              {input.length} 자 ({input.split(/\r?\n/).length} 줄)
            </span>
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="치환할 텍스트를 입력하세요..."
            className="w-full flex-1 min-h-[280px] px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y transition-shadow"
          />
        </div>

        {/* 출력 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>
              ✅ 결과
              {matchCount > 0 && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {matchCount}회 치환
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={copyOutput}
                className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                📋 복사
              </button>
            </div>
          </label>
          <textarea
            ref={outputRef}
            value={output}
            readOnly
            placeholder="결과가 여기에 표시됩니다..."
            className="w-full flex-1 min-h-[280px] px-3.5 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 text-sm focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* Diff 하이라이트 */}
      {diffHtml && input !== output && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">🔍 변경 비교</span>
            <span className="text-xs text-gray-400">
              <span style={{ background: "#fecaca" }} className="inline-block w-3 h-3 rounded-sm mr-1" />
              삭제
              <span style={{ background: "#bbf7d0" }} className="inline-block w-3 h-3 rounded-sm ml-3 mr-1" />
              추가
            </span>
          </div>
          <div
            ref={diffRef}
            className="px-3.5 py-3 text-sm text-gray-800 font-mono whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { encodingMethods, transform, type Direction } from "@/lib/encodings";

export default function EncodingPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [methodId, setMethodId] = useState<string>("url");
  const [direction, setDirection] = useState<Direction>("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedMethod = encodingMethods.find((m) => m.id === methodId)!;

  const handleTransform = () => {
    if (!input) { setOutput(""); setError(""); return; }
    const result = transform(methodId, direction, input);
    if (result.startsWith("❌")) { setError(result); setOutput(""); }
    else { setOutput(result); setError(""); }
  };

  const displayedValue = !input
    ? (direction === "encode" ? selectedMethod.encodeExample : selectedMethod.decodeExample)
    : (error || output);

  const copyOutput = async () => {
    if (!displayedValue) return;
    try { await navigator.clipboard.writeText(displayedValue); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
  };

  const swapDirection = () => {
    setDirection((prev) => {
      const next = prev === "encode" ? "decode" : "encode";
      setInput(output); setOutput(input); return next;
    });
    setError("");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🔐 인코딩 / 디코딩</h1>
        <p className="text-xs sm:text-sm text-gray-500">다양한 인코딩 형식으로 텍스트를 변환합니다</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-5">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">📋 인코딩 방식</label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2">
          {encodingMethods.map((m) => (
            <button key={m.id} onClick={() => { setMethodId(m.id); setError(""); }}
              className={`text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs transition-colors ${
                methodId === m.id ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"}`}>
              <div className="flex items-center gap-1"><span>{m.icon}</span><span className="truncate">{m.label}</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <button onClick={() => setDirection("encode")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
            direction === "encode" ? "text-blue-600 bg-blue-50 border-blue-200" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          🔒 인코딩
        </button>
        <button onClick={swapDirection} className="text-gray-400 hover:text-gray-600 p-1 sm:p-1.5 rounded-lg transition-colors" title="입출력 교환">↔️</button>
        <button onClick={() => setDirection("decode")}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
            direction === "decode" ? "text-green-600 bg-green-50 border-green-200" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          🔓 디코딩
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{direction === "encode" ? "📝 원본" : "🔒 인코딩된 텍스트"}</span>
            <span className="text-[10px] sm:text-xs font-normal text-gray-400">{input.length} 자</span>
          </label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={direction === "encode" ? selectedMethod.encodePlaceholder : selectedMethod.decodePlaceholder}
            className="w-full flex-1 min-h-[200px] sm:min-h-[260px] px-2.5 sm:px-3.5 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y" />
          <button onClick={handleTransform}
            className="mt-2 sm:mt-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            {direction === "encode" ? "🔒 인코딩 실행" : "🔓 디코딩 실행"}
          </button>
        </div>

        <div className="flex flex-col">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
            <span>{!input ? (direction === "encode" ? "💡 예시" : "💡 예시 디코딩") : (direction === "encode" ? "🔒 결과" : "📝 디코딩 결과")}</span>
            <div className="flex items-center gap-1">
              {copied && <span className="text-[10px] sm:text-xs text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded">✅ 복사됨</span>}
              <button onClick={copyOutput} disabled={!displayedValue}
                className="text-[10px] sm:text-xs text-gray-400 hover:text-blue-600 px-1.5 sm:px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-40">📋 복사</button>
            </div>
          </label>
          <textarea value={displayedValue} readOnly placeholder="결과가 여기에 표시됩니다..."
            className={`w-full flex-1 min-h-[200px] sm:min-h-[260px] px-2.5 sm:px-3.5 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm resize-y ${
              error ? "border-red-200 bg-red-50 text-red-700" : !input ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-800"}`} />
          {!!input && !error && output && (
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-400 text-right">
              {output.length} 자 · {new TextEncoder().encode(output).length} 바이트
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 lg:mt-6 bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
          ℹ️ {selectedMethod.label} — {direction === "encode" ? "인코딩" : "디코딩"}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
          {methodId === "url" && "URL 인코딩: 특수문자와 한글을 %XX 형태로 변환합니다."}
          {methodId === "url-all" && "URL 인코딩 (전체): 모든 문자를 %XX 형태로 변환합니다."}
          {methodId === "base64" && "Base64: 바이너리 데이터를 ASCII 문자열로 인코딩합니다."}
          {methodId === "base64url" && "Base64URL: URL에 안전한 Base64 변형입니다."}
          {methodId === "html" && "HTML Entity: 특수문자를 HTML 엔티티로 변환합니다."}
          {methodId === "unicode-escape" && "Unicode Escape: 비ASCII 문자를 \\uXXXX 형태로 표현합니다."}
          {methodId === "hex" && "HEX: 각 문자를 16진수로 표현합니다."}
          {methodId === "binary" && "Binary: 각 문자를 2진수로 표현합니다."}
          {methodId === "rot13" && "ROT13: 알파벳을 13글자씩 회전합니다."}
          {methodId === "md5" && "MD5: 128비트 단방향 해시입니다."}
        </p>
      </div>
    </div>
  );
}
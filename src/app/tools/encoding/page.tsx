"use client";

import { useState } from "react";
import { encodingMethods, transform, type Direction, type EncodingMethod } from "@/lib/encodings";

export default function EncodingPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [methodId, setMethodId] = useState<string>("url");
  const [direction, setDirection] = useState<Direction>("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedMethod = encodingMethods.find((m) => m.id === methodId)!;

  const handleTransform = () => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }
    const result = transform(methodId, direction, input);
    if (result.startsWith("❌")) {
      setError(result);
      setOutput("");
    } else {
      setOutput(result);
      setError("");
    }
  };

  // 현재 출력 영역에 표시될 값 (예시 또는 실제 결과)
  const displayedValue = !input
    ? (direction === "encode" ? selectedMethod.encodeExample : selectedMethod.decodeExample)
    : (error || output);

  const copyOutput = async () => {
    if (!displayedValue) return;
    try {
      await navigator.clipboard.writeText(displayedValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const swapDirection = () => {
    setDirection((prev) => {
      const next = prev === "encode" ? "decode" : "encode";
      // input/output swap
      setInput(output);
      setOutput(input);
      return next;
    });
    setError("");
  };

  const handleMethodChange = (id: string) => {
    setMethodId(id);
    setError("");
  };

  const directionColor = direction === "encode"
    ? "text-blue-600 bg-blue-50 border-blue-200"
    : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🔐 인코딩 / 디코딩</h1>
      <p className="text-sm text-gray-500 mb-6">
        다양한 인코딩 형식으로 텍스트를 변환합니다
      </p>

      {/* 인코딩 방식 선택 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">
          📋 인코딩 방식
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {encodingMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMethodChange(m.id)}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                methodId === m.id
                  ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 방향 토글 */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => setDirection("encode")}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
            direction === "encode"
              ? directionColor
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          🔒 인코딩
        </button>
        <button
          onClick={swapDirection}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          title="입출력 교환"
        >
          ↔️
        </button>
        <button
          onClick={() => setDirection("decode")}
          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
            direction === "decode"
              ? directionColor
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          🔓 디코딩
        </button>
      </div>

      {/* 입력 / 출력 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 입력 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>
              {direction === "encode" ? "📝 원본" : "🔒 인코딩된 텍스트"}
            </span>
            <span className="text-xs font-normal text-gray-400">
              {input.length} 자
            </span>
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "encode"
                ? selectedMethod.encodePlaceholder
                : selectedMethod.decodePlaceholder
            }
            className="w-full flex-1 min-h-[260px] px-3.5 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y transition-shadow"
          />
          <button
            onClick={handleTransform}
            className="mt-3 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {direction === "encode" ? "🔒 인코딩 실행" : "🔓 디코딩 실행"}
          </button>
        </div>

        {/* 출력 */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span>
              {!input
                ? (direction === "encode" ? "💡 예시 결과" : "💡 예시 디코딩")
                : (direction === "encode" ? "🔒 결과" : "📝 디코딩 결과")}
            </span>
            <div className="flex items-center gap-1">
              {copied && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  ✅ 복사됨
                </span>
              )}
              <button
                onClick={copyOutput}
                disabled={!displayedValue}
                className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-40"
              >
                📋 복사
              </button>
            </div>
          </label>
          <textarea
            value={displayedValue}
            readOnly
            placeholder="결과가 여기에 표시됩니다..."
            className={`w-full flex-1 min-h-[260px] px-3.5 py-3 border rounded-xl text-sm resize-y ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : !input
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-50 text-gray-800"
            }`}
          />
          {!!input && !error && output && (
            <div className="mt-2 text-xs text-gray-400 text-right">
              {output.length} 자 · {" "}
              {new TextEncoder().encode(output).length} 바이트
            </div>
          )}
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          ℹ️ {selectedMethod.label} — {direction === "encode" ? "인코딩" : "디코딩"}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {methodId === "url" &&
            "URL 인코딩: 특수문자와 한글을 %XX 형태로 변환. 웹 링크 파라미터에 안전하게 사용할 수 있습니다."}
          {methodId === "url-all" &&
            "URL 인코딩 (전체): 모든 문자를 %XX 형태로 변환. 보안이 필요한 상황이나 완전한 이스케이프가 필요할 때 사용합니다."}
          {methodId === "base64" &&
            "Base64: 바이너리 데이터를 ASCII 문자열로 인코딩. 이미지 Data URI, JWT 토큰, 메일 첨부 등에 사용됩니다."}
          {methodId === "base64url" &&
            "Base64URL: Base64에서 URL에 안전하지 않은 +/= 문자를 대체한 형태. JWT 헤더/페이로드에 사용됩니다."}
          {methodId === "html" &&
            "HTML Entity: HTML에서 특수한 의미를 가지는 문자를 안전하게 표현. XSS 방지나 HTML 코드 내 텍스트 삽입에 사용됩니다."}
          {methodId === "unicode-escape" &&
            "Unicode Escape: JS 문자열에서 비ASCII 문자를 \\uXXXX 형태로 표현. 소스코드에서 한글을 안전하게 포함할 때 사용됩니다."}
          {methodId === "hex" &&
            "HEX: 각 문자를 16진수로 표현. 바이너리 데이터의 가독성 있는 표현이나 디버깅에 사용됩니다."}
          {methodId === "binary" &&
            "Binary: 각 문자를 8비트 2진수로 표현. 낮은 레벨의 데이터 분석이나 교육용으로 사용됩니다."}
          {methodId === "rot13" &&
            "ROT13: 알파벳을 13글자씩 회전. 단순 난독화(스포일러 방지, 퍼즐 힌트)에 사용되며, 두 번 적용하면 원문이 복원됩니다."}
          {methodId === "md5" &&
            "MD5: 128비트 단방향 해시. 파일 무결성 검증이나 간단한 체크섬에 사용. 보안 목적(비밀번호)에는 권장하지 않습니다."}
        </p>
      </div>
    </div>
  );
}

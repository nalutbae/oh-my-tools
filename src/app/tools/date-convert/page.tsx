"use client";

import { useState, useCallback } from "react";
import {
  type CalendarType,
  type DateResult,
  type OutputFormat,
  convertDate,
  formatDate,
} from "@/lib/date-conversion";

type InputMode = CalendarType;

const today = new Date();
const todayY = today.getFullYear();
const todayM = today.getMonth() + 1;
const todayD = today.getDate();

const todayIso = `${todayY}-${String(todayM).padStart(2, "0")}-${String(todayD).padStart(2, "0")}`;

const calendarLabel: Record<CalendarType, string> = {
  gregorian: "양력",
  lunar: "음력",
  persian: "페르시아력",
};

const outputFormats: OutputFormat[] = [
  "yyyy년 mm월 dd일",
  "yyyy-mm-dd",
  "yyyy/mm/dd",
  "dd/mm/yyyy",
  "mm/dd/yyyy",
];

export default function DateConvertPage() {
  const [mode, setMode] = useState<InputMode>("gregorian");
  const [year, setYear] = useState<number>(todayY);
  const [month, setMonth] = useState<number>(todayM);
  const [day, setDay] = useState<number>(todayD);
  const [isoDate, setIsoDate] = useState<string>(todayIso);
  const [format, setFormat] = useState<OutputFormat>("yyyy년 mm월 dd일");
  const [results, setResults] = useState<DateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const syncFromIso = useCallback((iso: string) => {
    setIsoDate(iso);
    const [y, m, d] = iso.split("-").map(Number);
    if (y) setYear(y);
    if (m) setMonth(m);
    if (d) setDay(d);
  }, []);

  const handleConvert = async () => {
    let inputYear = year;
    let inputMonth = month;
    let inputDay = day;

    if (mode === "gregorian") {
      const [y, m, d] = isoDate.split("-").map(Number);
      if (y) inputYear = y;
      if (m) inputMonth = m;
      if (d) inputDay = d;
    }

    if (!inputYear || !inputMonth || !inputDay) return;

    setLoading(true);
    try {
      const res = await convertDate({
        type: mode,
        year: inputYear,
        month: inputMonth,
        day: inputDay,
      });
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const setToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    syncFromIso(iso);
  };

  const copyResult = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          📅 날짜 변환
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          양력, 음력, 페르시아력 날짜를 서로 변환합니다
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-5">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">
          📋 입력 역법
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {(["gregorian", "lunar", "persian"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResults([]);
              }}
              className={`text-left px-2 sm:px-3 py-2.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                mode === m
                  ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="truncate">{calendarLabel[m]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-5">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">
          📝 날짜 입력
        </label>

        {mode === "gregorian" ? (
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <input
              type="date"
              value={isoDate}
              onChange={(e) => syncFromIso(e.target.value)}
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button
              onClick={setToday}
              className="shrink-0 px-3 sm:px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 active:bg-blue-200"
            >
              오늘
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">년</label>
              <input
                type="number"
                min={1}
                max={9999}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">월</label>
              <input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">일</label>
              <input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-5">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">
          📋 출력 포맷
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
          {outputFormats.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`text-left px-2 sm:px-3 py-2.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                format === f
                  ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="truncate">{f}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={loading}
        className="w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors mb-4 sm:mb-5"
      >
        {loading ? "⏳ 변환 중…" : "🔄 변환 실행"}
      </button>

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 sm:mb-5">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">
            💡 변환 결과
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {results.map((res, idx) => {
              const text = formatDate(res.year, res.month, res.day, format, res.label);
              return (
                <div
                  key={res.type}
                  className={`flex items-center gap-2 sm:gap-3 border rounded-xl px-3 sm:px-4 py-2.5 ${
                    res.type === mode
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold ${
                      res.type === mode
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {res.label}
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">
                    {formatDate(res.year, res.month, res.day, format)}
                  </span>
                  <button
                    onClick={() => copyResult(idx, text)}
                    className="shrink-0 text-xs text-gray-400 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                  >
                    {copiedIndex === idx ? "✅ 복사됨" : "📋 복사"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
          ℹ️ 역법 안내
        </h3>
        <div className="text-xs sm:text-sm text-gray-500 leading-relaxed space-y-1">
          <p>
            <strong className="text-gray-700">양력(그레고리력)</strong>: 전 세계 표준 태양력. 1582년 교황 그레고리오 13세가 도입한 역법입니다.
          </p>
          <p>
            <strong className="text-gray-700">음력(중국 음력)</strong>: 달의 주기를 기준으로 한 역법. 중국, 한국, 베트남 등에서 전통 명절(설날, 추석, 중추절)에 사용됩니다.
          </p>
          <p>
            <strong className="text-gray-700">페르시아력(이란 태양력)</strong>: 1925년 이란에서 공식 채택한 태양력. 봄 분점을 새해(노루즈)로 하며, 현재 이란과 아프가니스탄에서 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

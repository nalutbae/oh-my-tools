import LunarLib from "lunar-javascript";

// ─── Types ─────────────────────────────────────────────────
export type CalendarType = "gregorian" | "lunar" | "persian";

export interface DateResult {
  type: CalendarType;
  year: number;
  month: number;
  day: number;
  label: string;
}

export type OutputFormat =
  | "yyyy년 mm월 dd일"
  | "yyyy-mm-dd"
  | "yyyy/mm/dd"
  | "dd/mm/yyyy"
  | "mm/dd/yyyy";

// ─── Format helpers ──────────────────────────────────────────
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(
  year: number,
  month: number,
  day: number,
  fmt: OutputFormat,
  label?: string
): string {
  const y = String(year);
  const m = pad2(month);
  const d = pad2(day);
  let s = "";
  switch (fmt) {
    case "yyyy년 mm월 dd일":
      s = `${y}년 ${m}월 ${d}일`;
      break;
    case "yyyy-mm-dd":
      s = `${y}-${m}-${d}`;
      break;
    case "yyyy/mm/dd":
      s = `${y}/${m}/${d}`;
      break;
    case "dd/mm/yyyy":
      s = `${d}/${m}/${y}`;
      break;
    case "mm/dd/yyyy":
      s = `${m}/${d}/${y}`;
      break;
  }
  return label ? `${label}: ${s}` : s;
}

// ─── Gregorian → Lunar (음력) ────────────────────────────────
export function gregorianToLunar(date: Date): DateResult {
  const lunar = LunarLib.Lunar.fromDate(date);
  return {
    type: "lunar",
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    label: "음력",
  };
}

// ─── Gregorian → Persian (페르시아력 / 태양력) ────────────────
// jalaali-js dynamic import (it is CommonJS)
let jalaaliMod: typeof import("jalaali-js") | null = null;
async function loadJalaali() {
  if (jalaaliMod) return jalaaliMod;
  jalaaliMod = await import("jalaali-js");
  return jalaaliMod;
}

export async function gregorianToPersian(date: Date): Promise<DateResult> {
  const j = await loadJalaali();
  const r = j.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return {
    type: "persian",
    year: r.jy,
    month: r.jm,
    day: r.jd,
    label: "페르시아력",
  };
}

// ─── Lunar → Gregorian ─────────────────────────────────────
export function lunarToGregorian(year: number, month: number, day: number): DateResult {
  const solar = LunarLib.Lunar.fromYmd(year, month, day).getSolar();
  return {
    type: "gregorian",
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    label: "양력",
  };
}

// ─── Persian → Gregorian ────────────────────────────────────
export async function persianToGregorian(
  year: number,
  month: number,
  day: number
): Promise<DateResult> {
  const j = await loadJalaali();
  const r = j.toGregorian(year, month, day);
  return {
    type: "gregorian",
    year: r.gy,
    month: r.gm,
    day: r.gd,
    label: "양력",
  };
}

// ─── Unified convert ─────────────────────────────────────────
export interface ConvertInput {
  type: CalendarType;
  year: number;
  month: number;
  day: number;
}

export async function convertDate(input: ConvertInput): Promise<DateResult[]> {
  const { type, year, month, day } = input;
  const results: DateResult[] = [];

  if (type === "gregorian") {
    const d = new Date(year, month - 1, day);
    results.push({ type: "gregorian", year, month, day, label: "양력" });
    results.push(gregorianToLunar(d));
    results.push(await gregorianToPersian(d));
  } else if (type === "lunar") {
    const g = lunarToGregorian(year, month, day);
    results.push({ type: "lunar", year, month, day, label: "음력" });
    results.push(g);
    results.push(await gregorianToPersian(new Date(g.year, g.month - 1, g.day)));
  } else if (type === "persian") {
    const g = await persianToGregorian(year, month, day);
    results.push({ type: "persian", year, month, day, label: "페르시아력" });
    results.push(g);
    results.push(gregorianToLunar(new Date(g.year, g.month - 1, g.day)));
  }

  return results;
}

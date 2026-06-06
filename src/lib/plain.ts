/**
 * Garu 기반 한국어 평서문 변환 엔진 (존댓말 → 평어/해체)
 *
 * 형태소 분석 → 존댓말 어미(EF) 판별 → 평서문 어미(~다/~는다/~었다) + 저→나 치환
 */

export type PlainLevel = "plain";

// 재사용: honorific.ts 의 공용 함수들 ----
type GToken = { text: string; pos: string; start: number; end: number };

function decompose(ch: string) {
  const c = ch.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3) return null;
  const base = c - 0xac00;
  return { jong: base % 28, jung: Math.floor(base / 28) % 21, cho: Math.floor(base / 588) };
}
function compose(cho: number, jung: number, jong: number) {
  return String.fromCharCode(0xac00 + cho * 588 + jung * 28 + jong);
}
function getJong(ch: string) { return decompose(ch)?.jong ?? -1; }
function getJung(ch: string) { return decompose(ch)?.jung ?? -1; }

function pickAeo(last: string): "아" | "어" {
  return [0, 2, 8, 9, 10, 11, 12].includes(getJung(last)) ? "아" : "어";
}

function contract(stem: string): string {
  if (!stem) return "";
  if (stem.endsWith("하")) return stem.slice(0, -1) + "해";
  const special: Record<string, string> = { 가: "가", 오: "와", 보: "봐", 주: "줘", 되: "돼" };
  if (special[stem]) return special[stem];
  const last = stem[stem.length - 1];
  const ao = pickAeo(last);
  if (getJong(last) > 0) return stem + ao;
  const d = decompose(last);
  if (!d) return stem + ao;
  const sj = d.jung, tj = ao === "아" ? 0 : 4;
  if (sj === tj) return stem;
  if (sj === 8 && tj === 0) return stem.slice(0, -1) + compose(d.cho, 9, 0);
  if (sj === 13 && tj === 4) return stem.slice(0, -1) + compose(d.cho, 14, 0);
  if (sj === 18 && tj === 4) return stem.slice(0, -1) + compose(d.cho, 4, 0);
  if (sj === 20 && tj === 4) return stem.slice(0, -1) + compose(d.cho, 6, 0);
  return stem + ao;
}

// ── 과거형 사전 ──
const PAST: Record<string, string> = {
  하: "했", 보: "봤", 오: "왔", 주: "줬", 되: "됐", 가: "갔",
  고르: "골랐", 다르: "달랐", 모르: "몰랐", 부르: "불렀", 마르: "말랐",
  오르: "올랐", 서두르: "서둘렀",
  걷: "걸었", 듣: "들었", 묻: "물었",
  아름답: "아름다웠", 춥: "추웠", 덥: "더웠", 쉽: "쉬웠", 맵: "매웠", 돕: "도왔", 곱: "고왔",
  낫: "나았", 짓: "지었",
  뛰: "뛰었", 웃: "웃었", 울: "울었", 먹: "먹었", 찾: "찾았", 만지: "만졌",
};

function past(stem: string, ep: string): string {
  if ((ep === "았" || ep === "었") && PAST[stem]) return PAST[stem];
  if ((ep === "았" || ep === "었") && stem.endsWith("하")) return stem.slice(0, -1) + "했";
  return stem + ep;
}

// 어절 분해 (존댓말 → 평서문용)
function splitVerbPlain(ts: GToken[]) {
  // VV(동사), VA(형용사), VX(보조용언), XSV(파생동사), XSA(파생형용사) 검색
  const allowed = new Set(["VV", "VA", "VX", "XSV", "XSA"]);
  const vi = ts.findIndex(t => allowed.has(t.pos));
  if (vi < 0) return null;

  // XSV/XSA: 앞이 체언(NN*, NP, NR)이면 합성하여 하나의 용언으로 취급
  // 예: "촉구/NNG 하/XSV" → stem:"촉구하", prefix: 앞부분
  let stem = ts[vi].text;
  let prefix = ts.slice(0, vi).map(t => t.text).join("");
  if ((ts[vi].pos === "XSV" || ts[vi].pos === "XSA") && vi > 0 && ts[vi - 1].pos.match(/^(NN|NP|NR)/)) {
    stem = ts[vi - 1].text + ts[vi].text;
    prefix = ts.slice(0, vi - 1).map(t => t.text).join("");
  }
  const after = ts.slice(vi + 1);
  const efi = after.findIndex(t => t.pos === "EF");

  if (efi < 0) {
    return {
      prefix,
      stem,
      ep: after.filter(t => !["SF", "EP"].includes(t.pos)).map(t => t.text).join(""),
      ef: "",
      trailing: after.filter(t => t.pos === "SF").map(t => t.text).join(""),
      hasAux: false, auxStem: "", pos: ts[vi].pos,
    };
  }

  // EP 중 과거(았/었), 미래(겠)는 유지. 존칭(시/으시)만 제거
  const epTokens = after.slice(0, efi).filter(t => 
    !t.pos.includes("EP") || ["았", "었", "겠"].includes(t.text)
  );
  const hasAux = epTokens.some(t => t.pos === "VX");
  const auxStem = epTokens.find(t => t.pos === "VX")?.text ?? "";
  
  // 과거형/미래형 판단 (모든 EP 토큰에서, 필터링 전)
  const allEpTokens = after.slice(0, efi);
  const hasPast = allEpTokens.some(t => ["았", "었"].includes(t.text));
  const hasFuture = allEpTokens.some(t => t.text === "겠");

  return {
    prefix,
    stem,
    // 과거/미래 ep는 유지, 시/으시 등은 제거
    ep: epTokens.map(t => t.text).join(""),
    ef: after[efi].text,
    trailing: after.slice(efi + 1).map(t => t.text).join(""),
    hasAux, auxStem, pos: ts[vi].pos,
    hasPast, hasFuture,
  };
}

// 단독 "저" 패턴은 제거 — "철저한" 등 단어 중간 "저" 오침환 방지
// "저"는 조사 붙은 형태만 치환 (저는, 저를, 저에게, 저와, 저의, 저희)
function replaceHonorificPronouns(text: string): string {
  return text
    .replace(/저희는/g, "우리는")
    .replace(/저희를/g, "우리를")
    .replace(/저희에게/g, "우리에게")
    .replace(/저희와/g, "우리와")
    .replace(/저희의/g, "우리의")
    .replace(/저희/g, "우리")
    .replace(/저는/g, "나는")
    .replace(/저를/g, "나를")
    .replace(/저에게/g, "내게")
    .replace(/저와/g, "나와")
    .replace(/저의/g, "나의");
}

// ── 평서문 현재형 ──
function plainPresent(stem: string, pos?: string): string {
  // 형용사: 원형 어근 그대로 + 다
  if (pos === "VA") return stem + "다";

  const last = stem[stem.length - 1];
  const d = decompose(last);

  // 무받침 동사
  if (!d || d.jong === 0) {
    if (stem === "하") return "한다";
    if (d) return stem.slice(0, -1) + compose(d.cho, d.jung, 4) + "다";
    return stem + "ㄴ다";
  }

  // 받침 있음
  if (d.jong === 17) return stem.slice(0, -1) + compose(d.cho, d.jung, 4) + "다";
  if (stem.endsWith("하")) return stem.slice(0, -1) + "한다";
  return stem + "는다";
}

// ── 핵심 평서문 변환 ──
function convertPlain(ts: GToken[]): string | null {
  // 이다 (VCP)
  const vcpI = ts.findIndex(t => t.pos === "VCP");
  if (vcpI >= 0) {
    const after = ts.slice(vcpI + 1);
    const ef = after.find(t => t.pos === "EF");
    if (ef && ["다", "ㅂ니다", "에요"].some(e => ef.text.includes(e))) {
      const b = ts.slice(0, vcpI).map(t => t.text).join("");
      const tr = after.filter(t => t.pos !== "EF").map(t => t.text).join("");
      return b + "이다" + tr;
    }
  }

  // 아니다 (VCN)
  const vcnI = ts.findIndex(t => t.pos === "VCN");
  if (vcnI >= 0) {
    const afterVCN = ts.slice(vcnI + 1);
    const hasEF = afterVCN.some(t => t.pos === "EF");
    if (!hasEF) return null;
    const b = ts.slice(0, vcnI).map(t => t.text).join("");
    const tr = afterVCN.filter(t => !["EF", "EC", "ETM"].includes(t.pos)).map(t => t.text).join("");
    return b + "아니다" + tr;
  }

  const p = splitVerbPlain(ts);
  if (!p || !p.stem || !p.ef) return null;

  const { stem, ep, ef, prefix, trailing, hasAux, auxStem, pos: verbPos, hasPast, hasFuture } = p;

  switch (ef) {
    case "ㅂ니다":
    case "습니다":
    case "아요":
    case "어요":
    case "해요":
    case "세요": {
      if (hasPast) return prefix + past(stem, ep) + "다" + trailing;
      if (hasFuture) return prefix + stem + ep + "다" + trailing; // 주겠, 가겠 → 주겠다, 가겠다
      if (stem === "하") return prefix + "한다" + trailing;
      return prefix + plainPresent(stem, verbPos) + trailing;
    }

    case "시오":
    case "ㅂ시오": {
      return prefix + stem + "어라" + trailing;
    }

    default:
      return null;
  }
}

// ── Garu 관리 ──
let _garu: any = null;
let _garuPromise: Promise<any> | null = null;

async function ensureGaru() {
  if (_garu) return _garu;
  if (!_garuPromise) {
    const { Garu } = await import("garu-ko");
    _garuPromise = Garu.load();
  }
  _garu = await _garuPromise;
  return _garu;
}

export function setGaruInstance(instance: any) { _garu = instance; }

function tok(s: any): GToken[] {
  return s.tokens.map((t: any) => ({
    text: t.text, pos: t.pos, start: t.start ?? 0, end: t.end ?? 0,
  }));
}

function group(ts: GToken[]): GToken[][] {
  const gs: GToken[][] = [];
  let cur: GToken[] = [];
  let cs = -1, ce = -1;
  for (const t of ts) {
    if (cur.length === 0) { cur = [t]; cs = t.start; ce = t.end; }
    else if (t.start === cs && t.end === ce) cur.push(t);
    else { gs.push(cur); cur = [t]; cs = t.start; ce = t.end; }
  }
  if (cur.length) gs.push(cur);
  return gs;
}

function convertSentence(text: string): string {
  // 먼저 대명사 치환
  const replaced = replaceHonorificPronouns(text);

  // 분석
  const ts = tok(_garu.analyze(replaced));
  const ejs = group(ts);

  let result = "";
  let pos = 0;

  for (const ej of ejs) {
    const s = ej[0].start;
    const e = ej[ej.length - 1].end;

    while (pos < s && pos < replaced.length) result += replaced[pos++];

    const c = convertPlain(ej);
    result += c !== null ? c : replaced.substring(s, e);
    pos = e;
  }

  while (pos < replaced.length) result += replaced[pos++];
  return result;
}

export async function toPlainSpoken(text: string): Promise<string> {
  _garu = await ensureGaru();
  return convertSentence(text);
}

export function toPlainSpokenSync(text: string): string {
  if (!_garu) throw new Error("Garu not initialized");
  return convertSentence(text);
}

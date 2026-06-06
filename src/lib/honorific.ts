/**
 * Garu 기반 한국어 경어체 변환 엔진 (v4-final)
 *
 * 형태소 분석 → 어근·어미 추출 → 음운 규칙(축약, 불규칙) → 해요체/합쇼체
 */

export type HonorificLevel = "haeyo" | "hapsyo";

type GToken = { text: string; pos: string; start: number; end: number };

// ── 한글 음원 ──
function decompose(ch: string) {
  const c = ch.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3) return null;
  const base = c - 0xac00;
  return {
    jong: base % 28,
    jung: Math.floor(base / 28) % 21,
    cho: Math.floor(base / 588),
  };
}
function compose(cho: number, jung: number, jong: number) {
  return String.fromCharCode(0xac00 + cho * 588 + jung * 28 + jong);
}
function getJong(ch: string) { return decompose(ch)?.jong ?? -1; }
function getJung(ch: string) { return decompose(ch)?.jung ?? -1; }

// 중성: 0=ㅏ,1=ㅐ,2=ㅑ,3=ㅒ,4=ㅓ,5=ㅔ,6=ㅕ,7=ㅖ,8=ㅗ,9=ㅘ,10=ㅙ,11=ㅚ,
//       12=ㅛ,13=ㅜ,14=ㅝ,15=ㅞ,16=ㅟ,17=ㅠ,18=ㅡ,19=ㅢ,20=ㅣ
function pickAeo(last: string): "아" | "어" {
  return [0, 2, 8, 9, 10, 11, 12].includes(getJung(last)) ? "아" : "어";
}

// ── 축약: 어근 + 아/어 ──
function contract(stem: string): string {
  if (!stem) return "";

  // ── 하다 계열 특수 처리 ──
  if (stem.endsWith("하")) {
    return stem.slice(0, -1) + "해";  // 강하 + 아 → 강해, 잘하 + 아 → 잘해
  }

  const special: Record<string, string> = {
    가: "가", 오: "와", 보: "봐", 주: "줘", 되: "돼",  // 단독 동사
  };
  if (special[stem]) return special[stem];

  const last = stem[stem.length - 1];
  const ao = pickAeo(last);

  // ── ㄷ/ㅂ/ㅅ/ㄹ 불규칙 활용 ──
  const dLast = decompose(last);
  if (dLast) {
    // ㄷ 불규칙: 걷/듣/묻 → 걸/들/물
    if (dLast.jong === 7) { // ㄷ (자모 7번)
      const newLast = compose(dLast.cho, dLast.jung, 0); // 받침 제거
      if (stem === "듣") return "들" + ao;
      if (stem === "걷") return "걸" + ao;
      if (stem === "묻") return "물" + ao;
    }
    // ㅂ 불규칙: 춥/덥/쉽/맵/돕/곱 → 추워/더워/쉬워/매워/도와/고와
    if (dLast.jong === 17) { // ㅂ (자모 17번)
      const base = stem.slice(0, -1) + compose(dLast.cho, dLast.jung, 0); // ㅂ 제거한 어근
      // ㅗ→와, ㅜ→워, 기타→워 (우+어→워 축약)
      if (dLast.jung === 8) return base + "와";   // ㅗ: 돕→도와, 곱→고와
      return base + "워";                          // ㅜ/기타: 춥→추워, 덥→더워, 쉽→쉬워
    }
    // ㅅ 불규칙: 짓/낫 → 지/나
    if (dLast.jong === 19) { // ㅅ (자모 19번)
      if (stem === "짓") return "지" + ao;
      if (stem === "낫") return "나아"; // 낫다→나아
    }
    // ㄹ 불규칙 (받침 있는 ㄹ 동사): 오르/다르/모르/부르/마르/고르
    // 주의: '르' 자체는 jong=0(무받침)이므로 종성 체크가 아닌 어근 매칭으로 처리
    const rIrregular: Record<string, string> = {
      "오르": "올라", "다르": "달라", "모르": "몰라",
      "부르": "불러", "마르": "말라", "고르": "골라",
      "서두르": "서둘러",
    };
    if (rIrregular[stem]) return rIrregular[stem];
  }

  // 무받침만 축약
  if (getJong(last) > 0) return stem + ao;

  const d = decompose(last);
  if (!d) return stem + ao;
  const sj = d.jung;
  const tj = ao === "아" ? 0 : 4;

  if (sj === tj) return stem;                               // 가+아 → 가
  if (sj === 8 && tj === 0) return stem.slice(0,-1)+compose(d.cho,9,0);   // ㅗ+ㅏ→ㅘ
  if (sj === 13 && tj === 4) return stem.slice(0,-1)+compose(d.cho,14,0); // ㅜ+ㅓ→ㅝ
  if (sj === 18 && tj === 4) return stem.slice(0,-1)+compose(d.cho,4,0);  // ㅡ+ㅓ→ㅓ
  if (sj === 20 && tj === 4) return stem.slice(0,-1)+compose(d.cho,6,0);  // ㅣ+ㅓ→ㅕ

  return stem + ao;
}

// ── 합쇼체: 어근 + 습니다 ──
function hapsyo(stem: string): string {
  const irr: Record<string, string> = {
    하: "합", 오: "옵", 보: "봅", 주: "줍", 되: "됩", 가: "갑",
    살: "삽", 알: "압", 만들: "만듭",
  };
  if (irr[stem]) return irr[stem] + "니다";

  // 하다 계열 (강하다 → 강합니다)
  if (stem.endsWith("하")) {
    return stem.slice(0, -1) + "합니다";
  }

  const last = stem[stem.length - 1];
  const j = getJong(last);
  if (j <= 0 || j === 8) { // 무받침 or ㄹ
    const d = decompose(last);
    if (!d) return stem + "습니다";
    return stem.slice(0, -1) + compose(d.cho, d.jung, 17) + "니다";
  }
  return stem + "습니다";
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
  // 하다 계열 합성동사: 변하다→변했, 참하다→참했
  if ((ep === "았" || ep === "었") && stem.endsWith("하")) {
    return stem.slice(0, -1) + "했";
  }
  return stem + ep;
}

// ── 어절 분해 ──
function splitVerb(ts: GToken[]): { prefix: string; stem: string; ep: string; ef: string; trailing: string; hasAux: boolean; auxStem: string } {
  const allowed = new Set(["VV", "VA", "VX"]);
  const vi = ts.findIndex(t => allowed.has(t.pos));
  if (vi < 0) return { prefix: "", stem: "", ep: "", ef: "", trailing: "", hasAux: false, auxStem: "" };

  const stem = ts[vi].text;
  const after = ts.slice(vi + 1);
  const efi = after.findIndex(t => t.pos === "EF");

  if (efi < 0) {
    return {
      prefix: ts.slice(0, vi).map(t =>t.text).join(""),
      stem,
      ep: after.filter(t=> t.pos !== "SF").map(t=>t.text).join(""),
      ef: "",
      trailing: after.filter(t=> t.pos === "SF").map(t=>t.text).join(""),
      hasAux: false, auxStem: "",
    };
  }

  const epTokens = after.slice(0, efi);
  const hasAux = epTokens.some(t=> t.pos === "VX");
  const auxStem = epTokens.find(t=> t.pos === "VX")?.text ?? "";

  return {
    prefix: ts.slice(0, vi).map(t=>t.text).join(""),
    stem,
    ep: epTokens.map(t=>t.text).join(""),
    ef: after[efi].text,
    trailing: after.slice(efi + 1).map(t=>t.text).join(""),
    hasAux, auxStem,
  };
}

// ── 핵심 변환 ──
function convert(ts: GToken[], level: HonorificLevel): string | null {
  const h = level === "hapsyo";

  // 이다
  const vcpI = ts.findIndex(t => t.pos === "VCP");
  if (vcpI >= 0) {
    const after = ts.slice(vcpI + 1);
    const ef = after.find(t => t.pos === "EF");
    if (ef && ["다","야","아"].includes(ef.text)) {
      const b = ts.slice(0, vcpI).map(t=>t.text).join("");
      const lc = b[b.length - 1] || "";
      const body = h ? b + "입니다" : getJong(lc) > 0 ? b + "이에요" : b + "예요";
      return body + after.filter(t=> t.pos !== "EF").map(t=>t.text).join("");
    }
  }

  // 아니다 (VCN)
  const vcnI = ts.findIndex(t => t.pos === "VCN");
  if (vcnI >= 0) {
    const afterVCN = ts.slice(vcnI + 1);
    const hasEF = afterVCN.some(t => t.pos === "EF");
    const hasSP = afterVCN.some(t => t.pos === "SP");
    const nextPos = afterVCN[0]?.pos;

    // VCN 뒤에 EF(종결어미)만 오는 경우에만 변환
    // EC(연결어미), ETM(관형어미) 등이 오면 관형/연결 문법 → 원문 보존
    if (!hasEF) return null;

    const b = ts.slice(0, vcnI).map(t=>t.text).join("");
    const tr = afterVCN.filter(t => !["EF","EC","ETM"].includes(t.pos)).map(t=>t.text).join("");
    return (h ? b + "아닙니다" : b + "아니에요") + tr;
  }

  const p = splitVerb(ts);
  if (!p.stem || !p.ef) return null;

  const { stem, ep, ef, prefix, trailing, hasAux, auxStem } = p;
  const hasPast = ep.includes("았") || ep.includes("었") || ep.includes("겠");

  switch (ef) {
    case "다":
    case "ㄴ다":
    case "는다": {
      if (hasPast) return prefix + past(stem, ep) + (h ? "습니다" : "어요") + trailing;
      return prefix + (h ? hapsyo(stem) : contract(stem) + "요") + trailing;
    }

    case "어":
    case "아": {
      // 해봐(명령) → 해보십시오
      if (stem === "해보" && h) return prefix + stem + "십시오" + trailing;
      if (hasPast) return prefix + past(stem, ep) + (h ? "습니다" : "어요") + trailing;

      if (hasAux) {
        // 보조동사 처리: 해줘, 해봐, 가봐 등
        if (h) {
          if (auxStem === "주") return prefix + contract(stem) + "주십시오" + trailing;
          if (auxStem === "보") return prefix + contract(stem) + "보십시오" + trailing;
          return prefix + contract(stem) + hapsyo(auxStem) + trailing;
        }
        // 해요체: 해줘 → 해줘요
        const cs = contract(stem);
        if (auxStem === "주") return prefix + cs + "줘요" + trailing;
        if (auxStem === "보") {
          // 해보아 → 해봐요
          const merged = cs + "보";
          return prefix + contract(merged) + "요" + trailing;
        }
        return prefix + cs + contract(auxStem) + "요" + trailing;
      }

      return prefix + (h ? hapsyo(stem) : contract(stem) + "요") + trailing;
    }

    case "자": {
      if (h) {
        const special: Record<string, string> = {
          가: "갑시다", 하: "합시다", 오: "옵시다", 보: "봅시다", 주: "줍시다",
        };
        if (special[stem]) return prefix + special[stem] + trailing;
        return prefix + hapsyo(stem).replace(/니다$/, "시다") + trailing;
      }
      return prefix + contract(stem) + "요" + trailing;
    }

    case "아라":
    case "어라": {
      // 명령: 해라 → 하세요, 봐라 → 보세요
      return h ? prefix + stem + "십시오" + trailing : prefix + stem + "세요" + trailing;
    }

    case "니":   return prefix + stem + (h ? "니까" : "나요") + trailing;

    case "ㄹ까": {
      if (stem === "하") return prefix + "할까요" + trailing;
      const l = stem[stem.length - 1];
      const d = decompose(l);
      if (d && d.jong === 0) {
        // 무받침에 ㄹ 붙이기: 가→갈, 오→올
        return prefix + stem.slice(0, -1) + compose(d.cho, d.jung, 8) + "까요" + trailing;
      }
      return prefix + stem + "ㄹ까요" + trailing;
    }

    case "ㄹ게":
    case "을게": {
      if (h) return prefix + stem + "겠습니다" + trailing;
      if (ef === "을게") return prefix + stem + "을게요" + trailing; // 받침 동사
      // 무받침 + ㄹ게: 가→갈, 오→올
      const l = stem.slice(-1);
      const d = decompose(l);
      if (d && d.jong === 0) {
        const combined = compose(d.cho, d.jung, 8); // 8=ㄹ
        return prefix + stem.slice(0, -1) + combined + "게요" + trailing;
      }
      return prefix + stem + "ㄹ게요" + trailing;
    }

    case "군":   return hasPast ? prefix + past(stem, ep) + (h ? "습니다" : "군요") + trailing : prefix + stem + (h ? "습니다" : "군요") + trailing;
    case "네":   return hasPast ? prefix + past(stem, ep) + (h ? "습니다" : "네요") + trailing : prefix + stem + (h ? "습니다" : "네요") + trailing;
    case "지":   return hasPast ? prefix + past(stem, ep) + (h ? "지 않습니다" : "지요") + trailing : prefix + stem + (h ? "지 않습니다" : "지요") + trailing;

    // 이미 해요체인 입력: 아요 → 해요체 유지 or 합쇼체로 변경
    case "아요":
    case "어요": {
      if (h) {
        // 해요체 → 합쇼체: 가요 → 갑니다
        return prefix + hapsyo(stem) + trailing;
      }
      return prefix + contract(stem) + "요" + trailing; // 그대로 해요체
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

function convertSentence(text: string, level: HonorificLevel): string {
  const ts = tok(_garu.analyze(text));
  const ejs = group(ts);

  let result = "";
  let pos = 0;

  for (const ej of ejs) {
    const s = ej[0].start;
    const e = ej[ej.length - 1].end;

    while (pos < s && pos < text.length) result += text[pos++];

    const c = convert(ej, level);
    result += c !== null ? c : text.substring(s, e);
    pos = e;
  }

  while (pos < text.length) result += text[pos++];
  return result;
}

export async function toHonorific(text: string, level: HonorificLevel): Promise<string> {
  _garu = await ensureGaru();
  return convertSentence(text, level);
}

export function toHonorificSync(text: string, level: HonorificLevel): string {
  if (!_garu) throw new Error("Garu not initialized");
  return convertSentence(text, level);
}

export type HonorificLevel = "haeyo" | "hapsyo";

function hasJong(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7af && (c - 0xac00) % 28 !== 0;
}

/**
 * 해라체/해체 텍스트를 경어체로 변환합니다.
 *
 * 각 어미(ending)마다 2단계 규칙 적용:
 *   1. 어간+어미 패턴: `([가-힣]+)한다` → stem + 변환
 *   2. 단독 어미 패턴: `(^|[\s.!?])한다` → 경계 + 변환
 * (1)은 greedy backtrack 으로 stem 캡처, (2)는 standalone 처리
 */
export function toHonorific(text: string, level: HonorificLevel): string {
  let r = text;
  const h = level === "hapsyo";

  // ── 해라체 어미별 규칙 (stem+ending → 변환) ──
  const endings: [string, string, string][] = [
    ["했다", "했어요", "했습니다"],
    ["였다", "였어요", "였습니다"],
    ["았다", "았어요", "았습니다"],
    ["었다", "었어요", "었습니다"],
    ["는다", "어요",   "습니다"],
    ["한다", "해요",   "합니다"],
    ["된다", "돼요",   "됩니다"],
  ];

  for (const [end, haeyo, hapsyo] of endings) {
    const re1 = new RegExp(`([가-힣]+)${end}(?=[\\s.!?]|$)`, "g");
    const re2 = new RegExp(`(^|[\\s.!?])${end}(?=[\\s.!?]|$)`, "g");
    r = r.replace(re1, (_, stem: string) => stem + (h ? hapsyo : haeyo));
    r = r.replace(re2, (_m, pre: string) => pre + (h ? hapsyo : haeyo));
  }

  // ~ㄴ다 (무받침 동사: 간다, 본다 → 갑니다/가요, 봅니다/봐요)
  r = r.replace(/([가-힣]+)ㄴ다(?=[\s.!?]|$)/g, (_m, stem: string) => {
    if (h) {
      const last = stem[stem.length - 1];
      if (last.endsWith("ㄹ")) return stem.slice(0, -1) + "ㅂ니다";
      return hasJong(last) ? stem + "습니다" : stem.slice(0, -1) + "ㅂ니다";
    }
    return stem + "요";
  });
  r = r.replace(/(^|[\s.!?])([가-힣])ㄴ다(?=[\s.!?]|$)/g, (_m, pre: string, ch: string) => {
    if (h) {
      if (ch.endsWith("ㄹ")) return pre + ch.slice(0, -1) + "ㅂ니다";
      return hasJong(ch) ? pre + ch + "습니다" : pre + ch.slice(0, -1) + "ㅂ니다";
    }
    return pre + ch + "요";
  });

  // ~이다 (명사) → 입니다 / 예요 / 이에요
  r = r.replace(/([가-힣]+)이다(?=[\s.!?]|$)/g, (_m, stem: string) => {
    if (h) return stem + "입니다";
    return hasJong(stem[stem.length - 1]) ? stem + "이에요" : stem + "예요";
  });
  r = r.replace(/(^|[\s.!?])이다(?=[\s.!?]|$)/g, (_m, pre: string) => pre + (h ? "입니다" : "예요"));

  // ── 해체 → 변환 ──

  r = r.replace(/갔어(?=[\s.!?]|$)/g, () => h ? "갔습니다" : "갔어요");
  r = r.replace(/했어(?=[\s.!?]|$)/g, () => h ? "했습니다" : "했어요");
  r = r.replace(/였어(?=[\s.!?]|$)/g, () => h ? "였습니다" : "였어요");
  r = r.replace(/해줘(?=[\s.!?]|$)/g, () => h ? "해주십시오" : "해줘요");
  r = r.replace(/해봐(?=[\s.!?]|$)/g, () => h ? "해보십시오" : "해봐요");
  r = r.replace(/([가-힣]+ㄹ게)(?=[\s.!?]|$)/g, (_, w: string) => w + "요");
  r = r.replace(/([가-힣]+ㄹ까)\?/g, (_, w: string) => w + "요?");
  r = r.replace(/([가-힣]+)니\?/g, (_, w: string) => h ? w + "니까?" : w + "나요?");
  r = r.replace(/(^|[\s.!?])([가-힣]+)야(?=[\s.!?]|$)/g, (_m, pre: string, w: string) => {
    if (h) return pre + w + "입니다";
    return pre + (hasJong(w[w.length - 1]) ? w + "이에요" : w + "예요");
  });
  r = r.replace(/([가-힣]+)(지)(?=[\s.!?]|$)(?!\s*않)/g, (_, w: string) => h ? w + "지 않습니다" : w + "지요");
  r = r.replace(/([가-힣]+)(네)(?=[\s.!?]|$)/g, (_, w: string) => h ? w + "습니다" : w + "네요");
  r = r.replace(/([가-힣]+)(군)(?=[\s.!?]|$)/g, (_, w: string) => h ? w + "습니다" : w + "군요");
  r = r.replace(/([가-힣]+[ㄴ])대(?=[\s.!?]|$)/g, (_, w: string) => h ? w + "답니다" : w + "대요");
  r = r.replace(/([가-힣]*)하자(?=[\s.!?]|$)/g, (_, w: string) => h ? w + "합시다" : w + "해요");

  return r;
}

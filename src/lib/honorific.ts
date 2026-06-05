export type HonorificLevel = "haeyo" | "hapsyo";

function hasJong(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7af && (c - 0xac00) % 28 !== 0;
}

export function toHonorific(text: string, level: HonorificLevel): string {
  let r = text;
  const h = level === "hapsyo";

  // ── 해라체 → 변환 (specific endings first, broader later) ──

  // ~했다 → 했습니다 / 했어요
  r = r.replace(/([가-힣]+)했다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "했습니다" : "했어요"));
  // ~였다 → 였습니다 / 였어요
  r = r.replace(/([가-힣]+)였다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "였습니다" : "였어요"));
  // ~았다 → 았습니다 / 았어요
  r = r.replace(/([가-힣]+)았다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "았습니다" : "았어요"));
  // ~었다 → 었습니다 / 었어요
  r = r.replace(/([가-힣]+)었다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "었습니다" : "었어요"));
  // ~는다 → 습니다 / 어요
  r = r.replace(/([가-힣]+)는다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "습니다" : "어요"));
  // ~는다 is a subset of ~다, but we handle it first
  // ~한다 → 합니다 / 해요 (하-stem verbs)
  r = r.replace(/([가-힣]+)한다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "합니다" : "해요"));
  // ~된다 → 됩니다 / 돼요
  r = r.replace(/([가-힣]+)된다(?=[\s.!?]|$)/g, (_, s) => s + (h ? "됩니다" : "돼요"));
  // ~ㄴ다 (무받침 stem + ㄴ다 = 간다, 본다, 산다, 온다 ...)
  r = r.replace(/([가-힣]+)ㄴ다(?=[\s.!?]|$)/g, (_m: string, s: string) => {
    if (s.endsWith("하")) return s.slice(0, -1) + (h ? "합니다" : "해요"); // already handled
    if (h) {
      const last = s[s.length - 1];
      if (last.endsWith("ㄹ")) return s.slice(0, -1) + "ㅂ니다";
      return hasJong(last) ? s + "습니다" : s.slice(0, -1) + "ㅂ니다";
    }
    return s + "요";
  });
  // ~이다 (명사) → 입니다 / 예요 / 이에요
  r = r.replace(/([가-힣]+)이다(?=[\s.!?]|$)/g, (_, s) => {
    if (h) return s + "입니다";
    return hasJong(s[s.length - 1]) ? s + "이에요" : s + "예요";
  });

  // ── 해체 → 변환 ──

  // 갔어/했어/였어/았어/었어 → ~~요 / ~~습니다
  r = r.replace(/([가-힣]+[았었였])(어)(?=[\s.!?]|$)/g, (_, s) => s + (h ? "습니다" : "어요"));
  // 해줘 → 해줘요 / 해주십시오
  r = r.replace(/(해줘)(?=[\s.!?]|$)/g, () => h ? "해주십시오" : "해줘요");
  // 해봐 → 해봐요 / 해보십시오
  r = r.replace(/(해봐)(?=[\s.!?]|$)/g, () => h ? "해보십시오" : "해봐요");
  // ~할게 → 할게요
  r = r.replace(/([가-힣]+ㄹ게)(?=[\s.!?]|$)/g, (_, s) => s + "요");
  // ~할까? → 할까요?
  r = r.replace(/([가-힣]+ㄹ까)\?/g, (_, s) => s + "요?");
  // ~하니? → 하나요? / 합니까?
  r = r.replace(/([가-힣]+)니\?/g, (_, s) => h ? s + "니까?" : s + "나요?");
  // ~야 (명사) → 예요 / 이에요 / 입니다
  r = r.replace(/([가-힣]+)야(?=[\s.!?]|$)/g, (_, s) => {
    if (h) return s + "입니다";
    return hasJong(s[s.length - 1]) ? s + "이에요" : s + "예요";
  });
  // ~지 → 지요 / 지 않습니다
  r = r.replace(/([가-힣]+)(지)(?=[\s.!?]|$)(?!\s*않)/g, (_, s) => h ? s + "지 않습니다" : s + "지요");
  // ~네 → 네요 / 습니다
  r = r.replace(/([가-힣]+)(네)(?=[\s.!?]|$)/g, (_, s) => h ? s + "습니다" : s + "네요");
  // ~군 → 군요 / 습니다
  r = r.replace(/([가-힣]+)(군)(?=[\s.!?]|$)/g, (_, s) => h ? s + "습니다" : s + "군요");
  // ~대 → 대요 / 답니다
  r = r.replace(/([가-힣]+[ㄴ])대(?=[\s.!?]|$)/g, (_, s) => h ? s + "답니다" : s + "대요");
  // ~하자 → 해요 / 합시다
  r = r.replace(/([가-힣]*)하자(?=[\s.!?]|$)/g, (_, s) => h ? s + "합시다" : s + "해요");
  // 공부하자 → 공부해요 / 공부합시다
  // 갔어/했어 → 갔어요/했어요 / 갔습니다/했습니다  (해체)
  r = r.replace(/갔어(?=[\s.!?]|$)/g, () => h ? "갔습니다" : "갔어요");
  r = r.replace(/했어(?=[\s.!?]|$)/g, () => h ? "했습니다" : "했어요");
  r = r.replace(/였어(?=[\s.!?]|$)/g, () => h ? "였습니다" : "였어요");

  return r;
}

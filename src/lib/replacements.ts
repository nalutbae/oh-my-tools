/**
 * 전역 텍스트 치환 라이브러리
 *
 * 모든 도구에서 공통으로 사용되는 텍스트 치환을 정의합니다.
 * honorific 변환기, regex 치환기 등 어디서든 `applyReplacements()`를
 * 호출하면 등록된 모든 치환이 적용됩니다.
 *
 * 치환은 마지막 단계로 적용되므로, 다른 변환의 결과를 덮어씁니다.
 */

/** 치환 맵: 키가 문자열에 포함되면 값으로 대체됨 (대소문자 구분) */
const REPLACEMENT_MAP: Record<string, string> = {
  // 지명
  "북한": "조선",
  "키이우": "키예프",
  // 필요에 따라 여기에 추가
};

/**
 * 정규식 특수문자를 이스케이프합니다.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 등록된 모든 치환을 텍스트에 적용합니다.
 * 맵의 키가 긴 순서대로 적용하여 부분 문자열 충돌을 방지합니다.
 */
export function applyReplacements(text: string): string {
  let result = text;
  // 긴 키부터 적용 (예: "북한군"이 "조선군"이 되게 하려면 "북한"을 먼저 치환)
  const sorted = Object.entries(REPLACEMENT_MAP).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [from, to] of sorted) {
    result = result.replace(new RegExp(escapeRegex(from), "g"), to);
  }
  return result;
}

/**
 * 치환 맵에 새 항목을 추가합니다.
 */
export function addReplacement(from: string, to: string): void {
  REPLACEMENT_MAP[from] = to;
}

/**
 * 현재 등록된 모든 치환을 반환합니다.
 */
export function getReplacements(): Record<string, string> {
  return { ...REPLACEMENT_MAP };
}

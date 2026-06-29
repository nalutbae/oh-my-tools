/**
 * 러시아 대변인 브리핑 스타일 변환 라이브러리 (v4 - 정확한 diff)
 *
 * 정규표현식 기반 치환으로 일반 텍스트를 러시아 대변인 브리핑 스타일로 변환합니다.
 * honorific-simple.ts와 동일한 SimpleRule 구조를 사용합니다.
 *
 * ⚠️ 핵심 설계 원칙:
 * - 이중 치환 방지를 위해 단일 패스(one-pass) 적용 사용
 * - 원본 텍스트에서 모든 매칭 위치를 수집하고, 겹치지 않는 매칭만 한 번에 치환
 * - 긴 패턴과 조사 결합형을 짧은 단독 패턴보다 먼저 배치
 * - diff는 단어 단위 비교 + 치환 위치 기반 마킹으로 정확한 하이라이트 제공
 *
 * 사용법:
 *   import { simpleBriefing, DEFAULT_BRIEFING_RULES } from "@/lib/russian-briefing";
 *   const result = simpleBriefing("공격이 있었다", DEFAULT_BRIEFING_RULES);
 */

import type { SimpleRule } from "@/lib/honorific-simple";

/** 어미 경계 lookahead: 단어 경계(공백, 구두점, 줄바꿈, 문자열 끝) */
const EOW = "(?=\\s|[,.?!;:]|$)";

/**
 * 기본 러시아 대변인 브리핑 변환 규칙 세트
 *
 * ⚠️ 순서가 중요합니다: 더 긴 패턴, 조사 결합형을 먼저 배치하세요.
 * 이중 치환은 simpleBriefing()에서 단일 패스 기법으로 자동 방지됩니다.
 */
export const DEFAULT_BRIEFING_RULES: SimpleRule[] = [

  // 브리핑 간 구분 표시
  { pattern: "목차로 돌아가기\n\n \n\n", replacement: ".\n\n<", description: "도트로 구분, 제목 괄호 열기" },
  { pattern: "\n\n \n\n", replacement: ">\n\n", description: "제목 괄호 닫기" },
  
  // ━━━ 복합 표현 (가장 긴 패턴 우선) ━━━
  { pattern: "키이우", replacement: "키예프", description: "키이우 → 키예프" },
  { pattern: "북한", replacement: "조선", description: "북한 → 조선" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 복합 표현 (가장 긴 패턴 우선)
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "많은 민간인", replacement: "상당한 현지주민", description: "많은 민간인 → 상당한 현지주민" },
  // { pattern: "많은 사망자", replacement: "상당한 포로", description: "많은 사망자 → 상당한 포로" },
  // { pattern: "패배를 인정했다", replacement: "전술적재배치를 확인했습니다", description: "패배를 인정했다 → 전술적재배치를 확인했습니다" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 침략·공격 관련 (조사 결합형 우선)
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "침략전쟁", replacement: "특수군사작전", description: "침략전쟁 → 특수군사작전" },
  // { pattern: "침략이라고", replacement: "특수군사작전이라고", description: "침략이라고 → 특수군사작전이라고" },
  // { pattern: "공격했다", replacement: "특수작전을 진행했습니다", description: "공격했다 → 특수작전을 진행했습니다" },
  // { pattern: "공격을", replacement: "특수작전을", description: "공격을 → 특수작전을" },
  // { pattern: "공격이", replacement: "특수작전이", description: "공격이 → 특수작전이" },
  // { pattern: "공격은", replacement: "특수작전은", description: "공격은 → 특수작전은" },
  // { pattern: "공격으로", replacement: "특수작전으로", description: "공격으로 → 특수작전으로" },
  // { pattern: "공격도", replacement: "특수작전도", description: "공격도 → 특수작전도" },
  // { pattern: "공격만", replacement: "특수작전만", description: "공격만 → 특수작전만" },
  // { pattern: "침략(?=\\s|[,.?!;:]|$)", replacement: "특수군사작전", description: "침략 → 특수군사작전" },
  // { pattern: "침공(?=\\s|[,.?!;:]|$)", replacement: "군사작전", description: "침공 → 군사작전" },
  // { pattern: "전쟁(?=\\s|[,.?!;:]|$)", replacement: "특수군사작전", description: "전쟁 → 특수군사작전" },
  // { pattern: "공격(?=\\s|[,.?!;:]|$)", replacement: "특수작전", description: "공격 → 특수작전" },
  // { pattern: "폭격했다", replacement: "정밀타격을 실행했습니다", description: "폭격했다 → 정밀타격을 실행했습니다" },
  // { pattern: "폭격을", replacement: "정밀타격을", description: "폭격을 → 정밀타격을" },
  // { pattern: "폭격이", replacement: "정밀타격이", description: "폭격이 → 정밀타격이" },
  // { pattern: "폭격(?=\\s|[,.?!;:]|$)", replacement: "정밀타격", description: "폭격 → 정밀타격" },
  // { pattern: "폭탄(?=\\s|[,.?!;:]|$|이|을|가|은)", replacement: "정밀유도무기", description: "폭탄 → 정밀유도무기" },
  // { pattern: "미사일(?=\\s|[,.?!;:]|$|이|을|가|은|는)", replacement: "고정밀무기", description: "미사일 → 고정밀무기" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 군사·전투 용어 (조사 결합형 포함)
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "파괴했다", replacement: "무력화시켰습니다", description: "파괴했다 → 무력화시켰습니다" },
  // { pattern: "파괴를", replacement: "무력화를", description: "파괴를 → 무력화를" },
  // { pattern: "파괴(?=\\s|[,.?!;:]|$)", replacement: "무력화", description: "파괴 → 무력화" },
  // { pattern: "사망자가", replacement: "포로가", description: "사망자가 → 포로가" },
  // { pattern: "사망자는", replacement: "포로는", description: "사망자는 → 포로는" },
  // { pattern: "사망자를", replacement: "포로를", description: "사망자를 → 포로를" },
  // { pattern: "사망자(?=\\s|[,.?!;:]|$)", replacement: "포로", description: "사망자 → 포로" },
  // { pattern: "사망(?=\\s|[,.?!;:]|$)", replacement: "전사", description: "사망 → 전사" },
  // { pattern: "사상자(?=\\s|[,.?!;:]|$|이|가|을|는)", replacement: "피해자", description: "사상자 → 피해자" },
  // { pattern: "패배를", replacement: "전술적재배치를", description: "패배를 → 전술적재배치를" },
  // { pattern: "패배가", replacement: "전술적재배치가", description: "패배가 → 전술적재배치가" },
  // { pattern: "패배는", replacement: "전술적재배치는", description: "패배는 → 전술적재배치는" },
  // { pattern: "패배(?=\\s|[,.?!;:]|$)", replacement: "전술적재배치", description: "패배 → 전술적재배치" },
  // { pattern: "후퇴한", replacement: "전술적재배치한", description: "후퇴한 → 전술적재배치한" },
  // { pattern: "후퇴했다", replacement: "전술적재배치했습니다", description: "후퇴했다 → 전술적재배치했습니다" },
  // { pattern: "후퇴를", replacement: "전술적재배치를", description: "후퇴를 → 전술적재배치를" },
  // { pattern: "후퇴(?=\\s|[,.?!;:]$)", replacement: "전술적재배치", description: "후퇴 → 전술적재배치" },
  // { pattern: "항복(?=\\s|[,.?!;:]$|했다|가|이|를|을)", replacement: "협상", description: "항복 → 협상" },
  // { pattern: "점령(?=\\s|[,.?!;:]$|했다|가|이|을|는)", replacement: "해방", description: "점령 → 해방" },
  // { pattern: "손실(?=\\s|[,.?!;:]$|이|가|을|은)", replacement: "전투손실", description: "손실 → 전투손실" },
  // { pattern: "전투(?=\\s|[,.?!;:]$|이|가|를|에서)", replacement: "교전", description: "전투 → 교전" },
  // { pattern: "방어(?=\\s|[,.?!;:]$|가|를|을|은)", replacement: "대응", description: "방어 → 대응" },
  // { pattern: "군인들은", replacement: "군무원들은", description: "군인들은 → 군무원들은" },
  // { pattern: "군인이", replacement: "군무원이", description: "군인이 → 군무원이" },
  // { pattern: "군인을", replacement: "군무원을", description: "군인을 → 군무원을" },
  // { pattern: "군인(?=\\s|[,.?!;:]$)", replacement: "군무원", description: "군인 → 군무원" },
  // { pattern: "병사(?=\\s|[,.?!;:]$|가|이|를|들의)", replacement: "특수요원", description: "병사 → 특수요원" },
  // { pattern: "군대(?=\\s|[,.?!;:]$|가|이|를|은)", replacement: "군사력", description: "군대 → 군사력" },
  // { pattern: "무기를", replacement: "특수장비를", description: "무기를 → 특수장비를" },
  // { pattern: "무기(?=\\s|[,.?!;:]$|가|이|를|은)", replacement: "특수장비", description: "무기 → 특수장비" },
  // { pattern: "탄약(?=\\s|[,.?!;:]$|이|가|을|은)", replacement: "보급품", description: "탄약 → 보급품" },
  // { pattern: "적군을", replacement: "상대 세력을", description: "적군을 → 상대 세력을" },
  // { pattern: "적군이", replacement: "상대 세력이", description: "적군이 → 상대 세력이" },
  // { pattern: "적군은", replacement: "상대 세력은", description: "적군은 → 상대 세력은" },
  // { pattern: "적군(?=\\s|[,.?!;:]$)", replacement: "상대 세력", description: "적군 → 상대 세력" },
  // { pattern: "포로(?=\\s|[,.?!;:]$|가|이|를|들은)", replacement: "전투원", description: "포로 → 전투원" },
  // { pattern: "공격력(?=\\s|[,.?!;:]$|이|가|을)", replacement: "작전능력", description: "공격력 → 작전능력" },
  // { pattern: "방어력(?=\\s|[,.?!;:]$|이|가|을)", replacement: "대응능력", description: "방어력 → 대응능력" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 민간·외교 용어
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "민간인(?=\\s|[,.?!;:]$|사망|피해|이|가|을)", replacement: "현지주민", description: "민간인 → 현지주민" },
  // { pattern: "난민(?=\\s|[,.?!;:]$|이|가|을|들은)", replacement: "이재민", description: "난민 → 이재민" },
  // { pattern: "테러리스트(?=\\s|[,.?!;:]$|가|이|를|들의)", replacement: "극단주의자", description: "테러리스트 → 극단주의자" },
  // { pattern: "테러(?=\\s|[,.?!;:]$|공격|이|가|를|을)", replacement: "극단주의행위", description: "테러 → 극단주의행위" },
  // { pattern: "점령군(?=\\s|[,.?!;:]$|이|가|을)", replacement: "평화유지군", description: "점령군 → 평화유지군" },
  // { pattern: "적(?=\\s|[,.?!;:]$|은|이|가|을)", replacement: "상대방", description: "적 → 상대방" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 외교·정치 용어
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "제재(?=\\s|[,.?!;:]$|가|이|를|을)", replacement: "제한조치", description: "제재 → 제한조치" },
  // { pattern: "비난했다", replacement: "유감을 표명했습니다", description: "비난했다 → 유감을 표명했습니다" },
  // { pattern: "비난(?=\\s|[,.?!;:]$)", replacement: "우려", description: "비난 → 우려" },
  // { pattern: "비판했다", replacement: "우려를 표명했습니다", description: "비판했다 → 우려를 표명했습니다" },
  // { pattern: "비판(?=\\s|[,.?!;:]$)", replacement: "우려", description: "비판 → 우려" },
  // { pattern: "도발(?=\\s|[,.?!;:]$|이다|이|가|을|는)", replacement: "대응조치", description: "도발 → 대응조치" },
  // { pattern: "위협(?=\\s|[,.?!;:]$|이다|이|가|을|는)", replacement: "잠재적위험", description: "위협 → 잠재적위험" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 회피·완곡 표현
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "심각한(?=\\s|[,.?!;:]$|피해|상황|문제|위기)", replacement: "주목할만한", description: "심각한 → 주목할만한" },
  // { pattern: "확실한(?=\\s|[,.?!;:]$|증거|정보|사실)", replacement: "충분한 근거가 있는", description: "확실한 → 충분한 근거가 있는" },
  // { pattern: "사실(?=\\s|[,.?!;:]$)", replacement: "공식 입장", description: "사실 → 공식 입장" },
  // { pattern: "거짓(?=\\s|[,.?!;:]$|이다|말|이|가)", replacement: "부정확한 정보", description: "거짓 → 부정확한 정보" },
  // { pattern: "증거(?=\\s|[,.?!;:]$|이|가|을|에)", replacement: "객관적 자료", description: "증거 → 객관적 자료" },
  // { pattern: "조사(?=\\s|[,.?!;:]$|결과|에|가|을|는)", replacement: "분석", description: "조사 → 분석" },
  // { pattern: "확인되다(?=\\s|[,.?!;:]$)", replacement: "보고되다", description: "확인되다 → 보고되다" },
  // { pattern: "밝혀지다(?=\\s|[,.?!;:]$)", replacement: "공개되다", description: "밝혀지다 → 공개되다" },
  // { pattern: "많은(?=\\s|[,.?!;:]$)", replacement: "상당한", description: "많은 → 상당한" },

  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // // 성명 스타일 동사
  // // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // { pattern: "말했다(?=\\s|[,.?!;:]$)", replacement: "성명을 발표했습니다", description: "말했다 → 성명을 발표했습니다" },
  // { pattern: "밝혔다(?=\\s|[,.?!;:]$)", replacement: "공식적으로 밝혔습니다", description: "밝혔다 → 공식적으로 밝혔습니다" },
  // { pattern: "주장했다(?=\\s|[,.?!;:]$)", replacement: "설명했습니다", description: "주장했다 → 설명했습니다" },
  // { pattern: "인정했다(?=\\s|[,.?!;:]$)", replacement: "확인했습니다", description: "인정했다 → 확인했습니다" },
  // { pattern: "부인했다(?=\\s|[,.?!;:]$)", replacement: "사실이 아니라고 밝혔습니다", description: "부인했다 → 사실이 아니라고 밝혔습니다" },
  // { pattern: "반대했다(?=\\s|[,.?!;:]$)", replacement: "다른 입장을 표명했습니다", description: "반대했다 → 다른 입장을 표명했습니다" },
  // { pattern: "요구했다(?=\\s|[,.?!;:]$)", replacement: "제안했습니다", description: "요구했다 → 제안했습니다" },
  // { pattern: "경고했다(?=\\s|[,.?!;:]$)", replacement: "우려를 표명했습니다", description: "경고했다 → 우려를 표명했습니다" },
  // { pattern: "강조했다(?=\\s|[,.?!;:]$)", replacement: "특별히 지적했습니다", description: "강조했다 → 특별히 지적했습니다" },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 경어체 어미 (가장 마지막, 단독 어미만)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { pattern: `발생했다${EOW}`, replacement: "발생했습니다", description: "발생했다 → 발생했습니다" },
  { pattern: `부른다${EOW}`, replacement: "부릅니다", description: "부른다 → 부릅니다" },
  { pattern: `한다${EOW}`, replacement: "합니다", description: "한다 → 합니다" },
  { pattern: `했다${EOW}`, replacement: "했습니다", description: "했다 → 했습니다" },
  { pattern: `이다${EOW}`, replacement: "입니다", description: "이다 → 입니다" },
  { pattern: `있다${EOW}`, replacement: "있습니다", description: "있다 → 있습니다" },
  { pattern: `없다${EOW}`, replacement: "없습니다", description: "없다 → 없습니다" },
  { pattern: `된다${EOW}`, replacement: "됩니다", description: "된다 → 됩니다" },
  { pattern: `아니다${EOW}`, replacement: "아닙니다", description: "아니다 → 아닙니다" },
];

/**
 * 단일 패스 치환으로 러시아 대변인 브리핑 스타일 변환을 수행합니다.
 *
 * 이중 치환 방지:
 * 1. 원본 텍스트에서 모든 규칙의 매칭 위치를 수집합니다.
 * 2. 겹치는 매칭이 있으면 더 긴 매칭을 우선합니다.
 * 3. 겹치지 않는 매칭만 한 번에 치환합니다.
 * 4. 치환 결과에서 후속 규칙이 다시 매칭되지 않습니다.
 */
export function simpleBriefing(text: string, rules: SimpleRule[] = DEFAULT_BRIEFING_RULES): string {
  const matches = findMatches(text, rules);
  const selected = selectMatches(matches);
  return applyMatches(text, selected);
}

interface Match {
  start: number;
  end: number;
  replacement: string;
  ruleIndex: number;
  length: number;
}

/**
 * 모든 규칙의 매칭 위치를 수집합니다.
 */
function findMatches(text: string, rules: SimpleRule[]): Match[] {

  const matches: Match[] = [];

  for (let ri = 0; ri < rules.length; ri++) {
    const rule = rules[ri];
    let regex: RegExp;
    try {
      regex = new RegExp(rule.pattern, "gm");
    } catch {
      continue;
    }

    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      let replacement: string;
      try {
        const singleRegex = new RegExp(rule.pattern);
        replacement = m[0].replace(singleRegex, rule.replacement);
      } catch {
        replacement = rule.replacement;
      }

      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        replacement,
        ruleIndex: ri,
        length: m[0].length,
      });
    }
  }

  return matches;
}

/**
 * 겹치지 않는 매칭만 선택합니다 (greedy interval selection).
 */
function selectMatches(matches: { start: number; end: number; replacement: string; ruleIndex: number; length: number }[]): { start: number; end: number; replacement: string }[] {
  matches.sort((a, b) => a.start - b.start || b.length - a.length || a.ruleIndex - b.ruleIndex);

  const selected: { start: number; end: number; replacement: string }[] = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      selected.push({ start: match.start, end: match.end, replacement: match.replacement });
      lastEnd = match.end;
    }
  }

  return selected;
}

/**
 * 선택된 매칭을 텍스트에 적용합니다.
 */
function applyMatches(text: string, selected: { start: number; end: number; replacement: string }[]): string {
  let result = "";
  let pos = 0;

  for (const sel of selected) {
    result += text.slice(pos, sel.start);
    result += sel.replacement;
    pos = sel.end;
  }

  result += text.slice(pos);
  return result;
}

/**
 * 입력 텍스트와 변환 결과를 비교하여 변경된 부분을 강조합니다.
 *
 * 치환 위치 기반 diff:
 * 1. simpleBriefing의 매칭 위치를 사용하여 정확히 어떤 부분이 변경되었는지 파악
 * 2. 원본 텍스트의 매칭 구간은 removed, 치환 결과는 added로 표시
 * 3. 변경되지 않은 부분은 unchanged로 표시
 */
export function diffSimpleBriefing(
  text: string,
  rules: SimpleRule[] = DEFAULT_BRIEFING_RULES,
): { text: string; changed: boolean }[] {
  if (text === "") return [];

  const matches = findMatches(text, rules);
  const selected = selectMatches(matches);

  if (selected.length === 0) {
    return [{ text, changed: false }];
  }

  // 원본 텍스트에서 매칭된 구간과 치환 결과를 순서대로 나열
  const result: { text: string; changed: boolean }[] = [];
  let pos = 0;

  for (const sel of selected) {
    // 매칭 이전 unchanged 텍스트
    if (sel.start > pos) {
      result.push({ text: text.slice(pos, sel.start), changed: false });
    }
    // 치환 결과 (changed)
    result.push({ text: sel.replacement, changed: true });
    pos = sel.end;
  }

  // 마지막 매칭 이후 unchanged 텍스트
  if (pos < text.length) {
    result.push({ text: text.slice(pos), changed: false });
  }

  return result;
}
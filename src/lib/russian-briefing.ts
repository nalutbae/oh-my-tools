/**
 * 러시아 대변인 브리핑 스타일 변환 라이브러리 (v7 - 구조적 전처리 정확화)
 *
 * 정규표현식 기반 치환으로 일반 텍스트를 러시아 대변인 브리핑 스타일로 변환합니다.
 * honorific-simple.ts와 동일한 SimpleRule 구조를 사용합니다.
 *
 * 변환 파이프라인:
 * 1. injectQuestionTitles: 상단 질문 제목을 하단 질문 앞에 <제목> 형태로 삽입
 * 2. 정규식 치환: DEFAULT_BRIEFING_RULES + DEFAULT_SIMPLE_RULES 적용
 *
 * 사용법:
 *   import { simpleBriefing, DEFAULT_BRIEFING_RULES } from "@/lib/russian-briefing";
 *   const result = simpleBriefing("공격이 있었다", DEFAULT_BRIEFING_RULES);
 */

import { DEFAULT_SIMPLE_RULES, type SimpleRule } from "@/lib/honorific-simple";

/** 어미 경계 lookahead */
const EOW = "(?=\\s|[,.?!;:]|$)";

export const DEFAULT_BRIEFING_RULES: SimpleRule[] = [
  // ━━━ 브리핑 간 구분 표시 ━━━
  { pattern: "목차로 돌아가기\n\n \n\n", replacement: ".\n\n<", description: "도트 구분 + 제목 괄호 열기" },
  { pattern: "\n\n \n\n", replacement: ">\n\n", description: "제목 괄호 닫기" },

  // ━━━ 복합 표현 ━━━
  { pattern: "키이우", replacement: "키예프", description: "키이우 → 키예프" },
  { pattern: "북한", replacement: "조선", description: "북한 → 조선" },

  // ━━━ 브리핑 특화 어미 ━━━
  { pattern: `발생했다${EOW}`, replacement: "발생했습니다", description: "발생했다 → 발생했습니다" },
  { pattern: `부른다${EOW}`, replacement: "부릅니다", description: "부른다 → 부릅니다" },
];

/**
 * 텍스트 구조:
 *   (헤더)
 *   콘텐츠
 *   본문제목1
 *   본문제목2
 *   질문에 대한 답변에서:       ← 첫 번째 마커
 *   질문제목1                   ← 질문 제목 (하단 질문 앞에 삽입)
 *   질문제목2                   ← 질문 제목
 *   (빈 줄)
 *   (본문들 — "목차로 돌아가기"로 구분)
 *   질문에 대한 답변에서:       ← 마지막 마커
 *   질문: (질문내용1)
 *   질문: (질문내용2)
 *
 * 변환:
 *   - 첫 번째 마커 이후 ~ 두 번째 마커(또는 본문 시작) 이전의 질문 제목을 추출
 *   - 마지막 마커 이후의 각 "질문:" 앞에 <제목>\n\n 삽입
 *   - 상단의 질문 제목 목록은 제거
 */
function injectQuestionTitles(text: string): string {
  // "질문에 대한 답변에서:"의 모든 위치를 찾습니다
  const markerRegex = /질문에 대한 답변에서\s*:/g;
  const markers: { index: number; endIndex: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = markerRegex.exec(text)) !== null) {
    markers.push({ index: m.index, endIndex: m.index + m[0].length });
  }

  // 마커가 2개 미만이면 변환 없이 반환
  if (markers.length < 2) return text;

  const firstMarker = markers[0];
  const lastMarker = markers[markers.length - 1];

  // ━━━ 1. 질문 제목 추출 ━━━
  // 첫 번째 마커 직후의 비어있지 않은 줄들이 질문 제목입니다.
  // 빈 줄(또는 공백만 있는 줄)이 나오면 수집을 중단합니다.
  const betweenMarkers = text.slice(firstMarker.endIndex, lastMarker.index);
  const lines = betweenMarkers.split('\n');
  
  let questionTitles: string[] = [];
  let collecting = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (collecting) {
      if (trimmed.length === 0) {
        // 빈 줄이면 제목 수집 종료
        break;
      }
      questionTitles.push(trimmed);
    } else if (trimmed.length > 0) {
      collecting = true;
      questionTitles.push(trimmed);
    }
  }

  if (questionTitles.length === 0) return text;

  // ━━━ 2. 하단 질문 앞에 <제목> 삽입 ━━━
  const afterLastMarker = text.slice(lastMarker.endIndex);
  const questionRegex = /질문\s*:/g;
  const questionPositions: number[] = [];
  let qm: RegExpExecArray | null;
  while ((qm = questionRegex.exec(afterLastMarker)) !== null) {
    questionPositions.push(qm.index);
  }

  let processedAfter = afterLastMarker;
  for (let i = questionPositions.length - 1; i >= 0; i--) {
    const pos = questionPositions[i];
    if (i < questionTitles.length) {
      const title = questionTitles[i];
      processedAfter = processedAfter.slice(0, pos) + `<${title}>\n\n` + processedAfter.slice(pos);
    }
  }

  // ━━━ 3. 상단 질문 제목 줄 제거 ━━━
  // 첫 번째 마커 직후 ~ 두 번째 마커(또는 본문 시작) 이전의
  // 질문 제목 줄들을 제거합니다.
  // 
  // 전략: 첫 번째 마커 이후 텍스트에서 질문 제목 줄을 빈 줄로 대체
  let betweenCleaned = betweenMarkers;
  for (const title of questionTitles) {
    // 정확한 제목 줄만 제거 (줄 전체가 제목과 일치해야 함)
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\\$&');
    betweenCleaned = betweenCleaned.replace(new RegExp(`^${escaped}$`, 'm'), '');
  }
  // 연속 빈 줄 정리
  betweenCleaned = betweenCleaned.replace(/\n{3,}/g, '\n\n');

  // ━━━ 4. 최종 텍스트 정리 ━━━
  // 정규식 치환 후 실행되므로 "목차로 돌아가기"가 ".\n\n<"로 변환되어 있음.
  // 이로 인해 <제목> 앞에 <가 붙어 <<가 되는 것을 방지합니다.
  // ".\n\n<" + "<제목>" → ".\n\n<제목>" (정상)
  // ".\n\n<" + "\n\n<제목>" → ".\n\n<\n\n<제목>" (비정상)
  // 해결: 삽입된 <제목> 앞에 오는 불필요한 <를 제거합니다.

  // 먼저 최종 텍스트를 조합합니다
  const finalText = text.slice(0, firstMarker.index) +
    '질문에 대한 답변에서:' +
    betweenCleaned.trimStart() +
    '질문에 대한 답변에서:' +
    processedAfter;

  // 정리: 마지막 "목차로 돌아가기" 변환 결과인 ".\n\n<질문에 대한 답변에서:" 패턴을
  // ".\n\n\n질문에 대한 답변에서:"로 수정 (< 제거)
  // 또는 ".\n\n<<제목>" → ".\n\n<제목>" (< 하나 제거)
  let cleaned = finalText;
  // "<질문에 대한 답변에서:" → "질문에 대한 답변에서:" (< 제거)
  cleaned = cleaned.replace(/<질문에 대한 답변에서:/g, '질문에 대한 답변에서:');
  // "<<" → "<" (이중 괄호 수정)
  cleaned = cleaned.replace(/<</g, '<');

  return cleaned;
}

export function simpleBriefing(
  text: string,
  rules: SimpleRule[] = DEFAULT_BRIEFING_RULES,
): string {
  // 1. 정규식 치환 먼저 적용 (목차→구분표시, 경어체 등)
  const allRules = [...rules, ...DEFAULT_SIMPLE_RULES];
  const matches = findMatches(text, allRules);
  const selected = selectMatches(matches);
  const replaced = applyMatches(text, selected);
  // 2. 구조적 전처리: 제목을 질문 섹션에 삽입 (정규식 치환 후)
  return injectQuestionTitles(replaced);
}

export function diffSimpleBriefing(
  text: string,
  rules: SimpleRule[] = DEFAULT_BRIEFING_RULES,
): { text: string; changed: boolean }[] {
  if (text === "") return [];

  // 정규식 치환 diff를 원본 텍스트 기준으로 생성
  const allRules = [...rules, ...DEFAULT_SIMPLE_RULES];
  const matches = findMatches(text, allRules);
  const selected = selectMatches(matches);

  if (selected.length === 0) {
    return [{ text, changed: false }];
  }

  const result: { text: string; changed: boolean }[] = [];
  let pos = 0;

  for (const sel of selected) {
    if (sel.start > pos) {
      result.push({ text: text.slice(pos, sel.start), changed: false });
    }
    result.push({ text: sel.replacement, changed: true });
    pos = sel.end;
  }

  if (pos < text.length) {
    result.push({ text: text.slice(pos), changed: false });
  }

  return result;
}

interface Match {
  start: number;
  end: number;
  replacement: string;
  ruleIndex: number;
  length: number;
}

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

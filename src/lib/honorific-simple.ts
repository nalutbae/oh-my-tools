/**
 * 단순 경어체 변환 라이브러리
 *
 * 정규표현식 기반 치환으로 평어를 경어체로 변환합니다.
 * Garu 형태소 분석기 없이 동작하며, 다른 메뉴에서도 import하여 사용할 수 있습니다.
 *
 * ⚠️ 핵심 설계 원칙:
 * - JavaScript의 \b는 한글에서 작동하지 않으므로, lookahead 패턴 사용
 * - 이미 경어체인 텍스트(습니다, 입니다 등)가 이중 변환되지 않도록
 *   (?<!니) 네거티브 룩비하인드로 "니다" 끝의 "다" 매칭을 차단
 * - 캐치올 규칙([가-힣]+다)을 사용하지 않고 구체적인 패턴만 등록
 *
 * 사용법:
 *   import { simpleHonorific, DEFAULT_SIMPLE_RULES } from "@/lib/honorific-simple";
 *   const result = simpleHonorific("이다", DEFAULT_SIMPLE_RULES);
 */

export interface SimpleRule {
  /** 검색 패턴 (정규표현식 문자열) */
  pattern: string;
  /** 치환 문자열 ($1, $2 등 그룹 참조 가능) */
  replacement: string;
  /** 규칙 설명 (UI 표시용) */
  description: string;
}

/**
 * 기본 단순 변환 규칙 세트
 *
 * ⚠️ 이중 변환 방지 원칙:
 * - 모든 "다" 끝 패턴에 (?<!니) 룩비하인드를 적용하여
 *   이미 경어체인 "~니다" 형태의 "다"가 매칭되지 않도록 차단
 * - 캐치올([가-힣]+다) 규칙을 사용하지 않고 구체적인 패턴만 등록
 *
 * 패턴 구조: 단어(?<!니)다(?=공백|구두점|문장끝)
 */
export const DEFAULT_SIMPLE_RULES: SimpleRule[] = [
  // ── 이다 계열 ──
  { pattern: "이다(?=\\s|[,.?!;:]|$)", replacement: "입니다", description: "이다 → 입니다" },

  // ── 하다 계열 ──
  { pattern: "한다(?=\\s|[,.?!;:]|$)", replacement: "합니다", description: "한다 → 합니다" },
  { pattern: "했다(?=\\s|[,.?!;:]|$)", replacement: "했습니다", description: "했다 → 했습니다" },
  { pattern: "하였다(?=\\s|[,.?!;:]|$)", replacement: "하였습니다", description: "하였다 → 하였습니다" },
  { pattern: "해라(?=\\s|[,.?!;:]|$)", replacement: "하십시오", description: "해라 → 하십시오" },

  // ── 있다/없다 ──
  { pattern: "있다(?=\\s|[,.?!;:]|$)", replacement: "있습니다", description: "있다 → 있습니다" },
  { pattern: "없다(?=\\s|[,.?!;:]|$)", replacement: "없습니다", description: "없다 → 없습니다" },
  { pattern: "계시다(?=\\s|[,.?!;:]|$)", replacement: "계십니다", description: "계시다 → 계십니다" },

  // ── 과거형 ──
  { pattern: "었다(?=\\s|[,.?!;:]|$)", replacement: "었습니다", description: "었다 → 었습니다" },
  { pattern: "았다(?=\\s|[,.?!;:]|$)", replacement: "았습니다", description: "았다 → 았습니다" },

  // ── 형용사 ──
  { pattern: "좋다(?=\\s|[,.?!;:]|$)", replacement: "좋습니다", description: "좋다 → 좋습니다" },
  { pattern: "많다(?=\\s|[,.?!;:]|$)", replacement: "많습니다", description: "많다 → 많습니다" },
  { pattern: "크다(?=\\s|[,.?!;:]|$)", replacement: "큽니다", description: "크다 → 큽니다" },
  { pattern: "작다(?=\\s|[,.?!;:]|$)", replacement: "작습니다", description: "작다 → 작습니다" },
  { pattern: "새롭다(?=\\s|[,.?!;:]|$)", replacement: "새롭습니다", description: "새롭다 → 새롭습니다" },
  { pattern: "어렵다(?=\\s|[,.?!;:]|$)", replacement: "어렵습니다", description: "어렵다 → 어렵습니다" },
  { pattern: "쉽다(?=\\s|[,.?!;:]|$)", replacement: "쉽습니다", description: "쉽다 → 쉽습니다" },
  { pattern: "길다(?=\\s|[,.?!;:]|$)", replacement: "깁니다", description: "길다 → 깁니다" },
  { pattern: "짧다(?=\\s|[,.?!;:]|$)", replacement: "짧습니다", description: "짧다 → 짧습니다" },
  { pattern: "높다(?=\\s|[,.?!;:]|$)", replacement: "높습니다", description: "높다 → 높습니다" },
  { pattern: "낮다(?=\\s|[,.?!;:]|$)", replacement: "낮습니다", description: "낮다 → 낮습니다" },
  { pattern: "빠르다(?=\\s|[,.?!;:]|$)", replacement: "빠릅니다", description: "빠르다 → 빠릅니다" },
  { pattern: "느리다(?=\\s|[,.?!;:]|$)", replacement: "느립니다", description: "느리다 → 느립니다" },
  { pattern: "아름답다(?=\\s|[,.?!;:]|$)", replacement: "아름답습니다", description: "아름답다 → 아름답습니다" },
  { pattern: "위대하다(?=\\s|[,.?!;:]|$)", replacement: "위대합니다", description: "위대하다 → 위대합니다" },
  { pattern: "행복하다(?=\\s|[,.?!;:]|$)", replacement: "행복합니다", description: "행복하다 → 행복합니다" },
  { pattern: "건강하다(?=\\s|[,.?!;:]|$)", replacement: "건강합니다", description: "건강하다 → 건강합니다" },

  // ── 동사 ──
  { pattern: "간다(?=\\s|[,.?!;:]|$)", replacement: "갑니다", description: "간다 → 갑니다" },
  { pattern: "온다(?=\\s|[,.?!;:]|$)", replacement: "옵니다", description: "온다 → 옵니다" },
  { pattern: "먹는다(?=\\s|[,.?!;:]|$)", replacement: "먹습니다", description: "먹는다 → 먹습니다" },
  { pattern: "만든다(?=\\s|[,.?!;:]|$)", replacement: "만듭니다", description: "만든다 → 만듭니다" },
  { pattern: "알겠다(?=\\s|[,.?!;:]|$)", replacement: "알겠습니다", description: "알겠다 → 알겠습니다" },
  { pattern: "모르겠다(?=\\s|[,.?!;:]|$)", replacement: "모르겠습니다", description: "모르겠다 → 모르겠습니다" },
  { pattern: "배운다(?=\\s|[,.?!;:]|$)", replacement: "배웁니다", description: "배운다 → 배웁니다" },
  { pattern: "읽는다(?=\\s|[,.?!;:]|$)", replacement: "읽습니다", description: "읽는다 → 읽습니다" },
  { pattern: "쓴다(?=\\s|[,.?!;:]|$)", replacement: "씁니다", description: "쓴다 → 씁니다" },
  { pattern: "본다(?=\\s|[,.?!;:]|$)", replacement: "봅니다", description: "본다 → 봅니다" },
  { pattern: "듣는다(?=\\s|[,.?!;:]|$)", replacement: "듣습니다", description: "듣는다 → 듣습니다" },
  { pattern: "생각한다(?=\\s|[,.?!;:]|$)", replacement: "생각합니다", description: "생각한다 → 생각합니다" },
  { pattern: "노력한다(?=\\s|[,.?!;:]|$)", replacement: "노력합니다", description: "노력한다 → 노력합니다" },

  // 
  { pattern: "혔다(?=\\s|[,.?!;:]|$)", replacement: "혔습니다", description: "밝혔다 → 밝혔습니다" },
  { pattern: "졌다(?=\\s|[,.?!;:]|$)", replacement: "졌습니다", description: "이어졌다 → 이어졌습니다" },

  // ── 해요체 종결 ──
  // ⚠️ "야→요" 규칙은 오변환 위험이 높아 제외 (예: "시야"→"시요")
  // 문장 끝 "야"만 매칭하려면 더 정교한 문맥 분석이 필요함

  // ── 의문형 ──
  { pattern: "니\\?", replacement: "나요?", description: "~니? → ~나요?" },

  // ── 청유/명령 ──
  // ⚠️ "자→시다", "아라→세요", "어라→세요" 규칙은 오변환 위험이 높아 제외
  // "자"는 명사 어미에 빈번 (사망자, 참가자, 이용자 등)
  // "아라/어라"도 감정어 등과 충돌 가능
  // 이들 패턴은 문맥 구분 없이는 안전하게 변환 불가

  // ── 안전 캐치올: 일반 동사/형용사 어미 (니다 제외) ──
  // (?<!니)다 → "습니다/입니다/합니" 뒤의 "다"는 매칭 안 함
  // (?<=는|른|운|른|분) → 받침 있는 어간 + 다 패턴만 매칭
  // ⚠️ 이 규칙은 가장 마지막에 실행되어야 함 (위 구체적 규칙이 우선)
  { pattern: "([가-힣]{1,3}(?:는|른|운|심|감|적|성|력|도|적|법|책|일|말|것|수|게|데|고|면|지만))(?<!니)다(?=\\s|[,.?!;:]|$)",
    replacement: "$1습니다",
    description: "~N다 → ~N습니다 (받침명사+다)" },
];

/**
 * 단순 정규표현식 치환으로 경어체 변환을 수행합니다.
 *
 * @param text 변환할 텍스트
 * @param rules 치환 규칙 배열 (기본값: DEFAULT_SIMPLE_RULES)
 * @returns 변환된 텍스트
 */
export function simpleHonorific(text: string, rules: SimpleRule[] = DEFAULT_SIMPLE_RULES): string {
  let result = text;
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, "gm");
      result = result.replace(regex, rule.replacement);
    } catch {
      // 잘못된 정규표현식은 스킵
    }
  }
  return result;
}

/**
 * 입력 텍스트와 변환 결과를 비교하여 변경된 부분을 강조합니다.
 *
 * @returns 토큰 배열 (각 토큰은 text + changed 여부)
 */
export function diffSimpleHonorific(
  text: string,
  rules: SimpleRule[] = DEFAULT_SIMPLE_RULES,
): { text: string; changed: boolean }[] {
  const result = simpleHonorific(text, rules);
  return diffTokens(tokenize(text), tokenize(result));
}

// ── 내부 유틸리티 ──

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (/[가-힣a-zA-Z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

function diffTokens(
  src: string[],
  dst: string[],
): { text: string; changed: boolean }[] {
  const result: { text: string; changed: boolean }[] = [];
  let si = 0;
  let di = 0;
  while (si < src.length && di < dst.length) {
    if (src[si] === dst[di]) {
      result.push({ text: dst[di], changed: false });
      si++;
      di++;
    } else {
      let found = false;
      for (let ahead = 1; ahead <= 3 && si + ahead < src.length; ahead++) {
        if (src[si + ahead] === dst[di]) {
          for (let k = 0; k < ahead; k++) result.push({ text: src[si + k], changed: true });
          si += ahead;
          found = true;
          break;
        }
      }
      if (!found) {
        for (let ahead = 1; ahead <= 3 && di + ahead < dst.length; ahead++) {
          if (src[si] === dst[di + ahead]) {
            for (let k = 0; k < ahead; k++) result.push({ text: dst[di + k], changed: true });
            di += ahead;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        result.push({ text: dst[di], changed: true });
        si++;
        di++;
      }
    }
  }
  while (di < dst.length) {
    result.push({ text: dst[di], changed: true });
    di++;
  }
  return result;
}
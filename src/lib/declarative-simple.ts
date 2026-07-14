/**
 * 단순 평서문 변환 라이브러리
 *
 * 정규표현식 기반 치환으로 경어체를 평서문으로 변환합니다.
 * honorific-simple.ts의 역방향 변환입니다.
 * 다른 메뉴에서도 import하여 사용할 수 있습니다.
 *
 * ⚠️ 핵심 설계 원칙:
 * - 이미 평서문인 텍스트(~다, ~는다 등)가 이중 변환되지 않도록
 *   구체적인 경어체 어미만 매칭
 * - 캐치올 규칙 대신 구체적인 패턴만 등록
 *
 * 사용법:
 *   import { simpleDeclarative, DEFAULT_DECLARATIVE_RULES } from "@/lib/declarative-simple";
 *   const result = simpleDeclarative("있습니다", DEFAULT_DECLARATIVE_RULES);
 */

export interface DeclarativeRule {
  /** 검색 패턴 (정규표현식 문자열) */
  pattern: string;
  /** 치환 문자열 ($1, $2 등 그룹 참조 가능) */
  replacement: string;
  /** 규칙 설명 (UI 표시용) */
  description: string;
}

/**
 * 기본 평서문 변환 규칙 세트 (경어체 → 평어체)
 *
 * 경어체 어미를 평서문 어미로, 경어체 대명사를 평어체 대명사로 치환합니다.
 */
export const DEFAULT_DECLARATIVE_RULES: DeclarativeRule[] = [
  // ── 대명사 ──
  { pattern: "저희", replacement: "우리", description: "저희 → 우리" },
  { pattern: "저는", replacement: "나는", description: "저는 → 나는" },
  { pattern: "저가", replacement: "내가", description: "저가 → 내가" },
  { pattern: "저의", replacement: "나의", description: "저의 → 나의" },
  { pattern: "저를", replacement: "나를", description: "저를 → 나를" },
  { pattern: "저에게", replacement: "나에게", description: "저에게 → 나에게" },
  { pattern: "저와", replacement: "나와", description: "저와 → 나와" },
  { pattern: "저과", replacement: "나과", description: "저과 → 나과" },
  { pattern: "저도", replacement: "나도", description: "저도 → 나도" },
  { pattern: "저부터", replacement: "나부터", description: "저부터 → 나부터" },
  { pattern: "저까지", replacement: "나까지", description: "저까지 → 나까지" },
  { pattern: "저밖에", replacement: "나밖에", description: "저밖에 → 나밖에" },
  { pattern: "저처럼", replacement: "나처럼", description: "저처럼 → 나처럼" },
  { pattern: "저같이", replacement: "나같이", description: "저같이 → 나같이" },

  // ── 합쇼체 → 평서문 ──
  { pattern: "하였습니다(?=\\s|[,.?!;:]|$)", replacement: "하였다", description: "하였습니다 → 하였다" },
  { pattern: "했습니다(?=\\s|[,.?!;:]|$)", replacement: "했다", description: "했습니다 → 했다" },
  { pattern: "합니다(?=\\s|[,.?!;:]|$)", replacement: "한다", description: "합니다 → 한다" },
  { pattern: "갑니다(?=\\s|[,.?!;:]|$)", replacement: "간다", description: "갑니다 → 간다" },
  { pattern: "옵니다(?=\\s|[,.?!;:]|$)", replacement: "온다", description: "옵니다 → 온다" },
  { pattern: "먹습니다(?=\\s|[,.?!;:]|$)", replacement: "먹는다", description: "먹습니다 → 먹는다" },
  { pattern: "만듭니다(?=\\s|[,.?!;:]|$)", replacement: "만든다", description: "만듭니다 → 만든다" },
  { pattern: "알겠습니다(?=\\s|[,.?!;:]|$)", replacement: "알겠다", description: "알겠습니다 → 알겠다" },
  { pattern: "모르겠습니다(?=\\s|[,.?!;:]|$)", replacement: "모르겠다", description: "모르겠습니다 → 모르겠다" },
  { pattern: "배웁니다(?=\\s|[,.?!;:]|$)", replacement: "배운다", description: "배웁니다 → 배운다" },
  { pattern: "읽습니다(?=\\s|[,.?!;:]|$)", replacement: "읽는다", description: "읽습니다 → 읽는다" },
  { pattern: "씁니다(?=\\s|[,.?!;:]|$)", replacement: "쓴다", description: "씁니다 → 쓴다" },
  { pattern: "봅니다(?=\\s|[,.?!;:]|$)", replacement: "본다", description: "봅니다 → 본다" },
  { pattern: "듣습니다(?=\\s|[,.?!;:]|$)", replacement: "듣는다", description: "듣습니다 → 듣는다" },
  { pattern: "생각합니다(?=\\s|[,.?!;:]|$)", replacement: "생각한다", description: "생각합니다 → 생각한다" },
  { pattern: "노력합니다(?=\\s|[,.?!;:]|$)", replacement: "노력한다", description: "노력합니다 → 노력한다" },
  { pattern: "계십니다(?=\\s|[,.?!;:]|$)", replacement: "계시다", description: "계십니다 → 계시다" },

  // ── 형용사 ──
  { pattern: "좋습니다(?=\\s|[,.?!;:]|$)", replacement: "좋다", description: "좋습니다 → 좋다" },
  { pattern: "많습니다(?=\\s|[,.?!;:]|$)", replacement: "많다", description: "많습니다 → 많다" },
  { pattern: "큽니다(?=\\s|[,.?!;:]|$)", replacement: "크다", description: "큽니다 → 크다" },
  { pattern: "작습니다(?=\\s|[,.?!;:]|$)", replacement: "작다", description: "작습니다 → 작다" },
  { pattern: "새롭습니다(?=\\s|[,.?!;:]|$)", replacement: "새롭다", description: "새롭습니다 → 새롭다" },
  { pattern: "어렵습니다(?=\\s|[,.?!;:]|$)", replacement: "어렵다", description: "어렵습니다 → 어렵다" },
  { pattern: "쉽습니다(?=\\s|[,.?!;:]|$)", replacement: "쉽다", description: "쉽습니다 → 쉽다" },
  { pattern: "깁니다(?=\\s|[,.?!;:]|$)", replacement: "길다", description: "깁니다 → 길다" },
  { pattern: "짧습니다(?=\\s|[,.?!;:]|$)", replacement: "짧다", description: "짧습니다 → 짧다" },
  { pattern: "높습니다(?=\\s|[,.?!;:]|$)", replacement: "높다", description: "높습니다 → 높다" },
  { pattern: "낮습니다(?=\\s|[,.?!;:]|$)", replacement: "낮다", description: "낮습니다 → 낮다" },
  { pattern: "빠릅니다(?=\\s|[,.?!;:]|$)", replacement: "빠르다", description: "빠릅니다 → 빠르다" },
  { pattern: "느립니다(?=\\s|[,.?!;:]|$)", replacement: "느리다", description: "느립니다 → 느리다" },
  { pattern: "아닙니다(?=\\s|[,.?!;:]|$)", replacement: "아니다", description: "아닙니다 → 아니다" },
  { pattern: "아름답습니다(?=\\s|[,.?!;:]|$)", replacement: "아름답다", description: "아름답습니다 → 아름답다" },
  { pattern: "위대합니다(?=\\s|[,.?!;:]|$)", replacement: "위대하다", description: "위대합니다 → 위대하다" },
  { pattern: "행복합니다(?=\\s|[,.?!;:]|$)", replacement: "행복하다", description: "행복합니다 → 행복하다" },
  { pattern: "건강합니다(?=\\s|[,.?!;:]|$)", replacement: "건강하다", description: "건강합니다 → 건강하다" },

  // ── 있다/없다/이다 ──
  { pattern: "있습니다(?=\\s|[,.?!;:]|$)", replacement: "있다", description: "있습니다 → 있다" },
  { pattern: "없습니다(?=\\s|[,.?!;:]|$)", replacement: "없다", description: "없습니다 → 없다" },
  { pattern: "입니다(?=\\s|[,.?!;:]|$)", replacement: "이다", description: "입니다 → 이다" },

  // ── 과거형 ──
  { pattern: "었습니다(?=\\s|[,.?!;:]|$)", replacement: "었다", description: "었습니다 → 었다" },
  { pattern: "았습니다(?=\\s|[,.?!;:]|$)", replacement: "았다", description: "았습니다 → 았다" },

  // ── 해요체 → 평서문 ──
  { pattern: "해요(?=\\s|[,.?!;:]|$)", replacement: "해", description: "해요 → 해" },
  { pattern: "세요(?=\\s|[,.?!;:]|$)", replacement: "어", description: "세요 → 어" },
  { pattern: "나요\\?", replacement: "니?", description: "~나요? → ~니?" },

  // 기타
  { pattern: "습니다(?=\\s|[,.?!;:]|$)", replacement: "다", description: "~습니다 → ~다" },
  { pattern: "집니다(?=\\s|[,.?!;:]|$)", replacement: "진다", description: "~집니다 → ~진다" },
  { pattern: "됩니다(?=\\s|[,.?!;:]|$)", replacement: "된다", description: "~됩니다 → ~된다" },
  { pattern: "일까요(?=\\s|[,.?!;:]|$)", replacement: "까", description: "~일까요 → ~일까" },
];

/**
 * 단순 정규표현식 치환으로 평서문 변환을 수행합니다.
 *
 * @param text 변환할 텍스트
 * @param rules 치환 규칙 배열 (기본값: DEFAULT_DECLARATIVE_RULES)
 * @returns 변환된 텍스트
 */
export function simpleDeclarative(text: string, rules: DeclarativeRule[] = DEFAULT_DECLARATIVE_RULES): string {
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
 */
export function diffSimpleDeclarative(
  text: string,
  rules: DeclarativeRule[] = DEFAULT_DECLARATIVE_RULES,
): { text: string; changed: boolean }[] {
  const result = simpleDeclarative(text, rules);
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
  let si = 0, di = 0;
  while (si < src.length && di < dst.length) {
    if (src[si] === dst[di]) { result.push({ text: dst[di], changed: false }); si++; di++; }
    else {
      let found = false;
      for (let ahead = 1; ahead <= 3 && si + ahead < src.length; ahead++) {
        if (src[si + ahead] === dst[di]) {
          for (let k = 0; k < ahead; k++) result.push({ text: src[si + k], changed: true });
          si += ahead; found = true; break;
        }
      }
      if (!found) {
        for (let ahead = 1; ahead <= 3 && di + ahead < dst.length; ahead++) {
          if (src[si] === dst[di + ahead]) {
            for (let k = 0; k < ahead; k++) result.push({ text: dst[di + k], changed: true });
            di += ahead; found = true; break;
          }
        }
      }
      if (!found) { result.push({ text: dst[di], changed: true }); si++; di++; }
    }
  }
  while (di < dst.length) { result.push({ text: dst[di], changed: true }); di++; }
  return result;
}
export interface RegexPattern {
  title: string;
  /** 정규식 패턴 문자열 (JavaScript RegExp 생성자용) */
  pattern: string;
  /** 치환할 문자열. $1, $2 등 그룹 참조 가능 */
  replacement: string;
  /** RegExp flags: g, gi, gm, ... */
  flags: string;
  /** 간단한 설명 (선택) */
  description?: string;
}

export const regexPatterns: RegexPattern[] = [
  {
    title: "🔀 연속 공백 → 단일 공백",
    pattern: "\\s+",
    replacement: " ",
    flags: "g",
  },
  {
    title: "✂️ 앞뒤 공백 제거 (trim)",
    pattern: "^\\s+|\\s+$",
    replacement: "",
    flags: "gm",
  },
  {
    title: "🗑️ 빈 줄 제거",
    pattern: "^\\s*\\n",
    replacement: "",
    flags: "gm",
  },
  {
    title: "🗑️ 마침표로 끝나지 않은 줄바꿈을 제거",
    pattern: "(?<![.!?])\\n(?!\\n)",
    replacement: "",
    flags: "gm",
  },
  {
    title: "🗑️ 마침표로 끝나지 않은 줄바꿈을 제거(빈줄 제외)",
    pattern: "(?<![.!?,;\\n])\\n(?!\\n)",
    replacement: "",
    flags: "gm",
  },
  {
    title: "🗑️ 특수문자 제거",
    pattern: "[^\\w\\sㄱ-ㅎㅏ-ㅣ가-힣.]",
    replacement: "",
    flags: "g",
  },
  {
    title: "🔢 숫자만 추출",
    pattern: "[^0-9]",
    replacement: "",
    flags: "g",
  },
  {
    title: "🔠 영문 제거",
    pattern: "[a-zA-Z]",
    replacement: "",
    flags: "g",
  },
  {
    title: "🏷️ HTML 태그 제거",
    pattern: "<[^>]*>",
    replacement: "",
    flags: "g",
  },
  {
    title: "🔗 URL 제거",
    pattern: "https?://[^\\s]+",
    replacement: "",
    flags: "g",
  },
  {
    title: "📧 이메일 제거",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    replacement: "",
    flags: "g",
  },
  {
    title: "📊 CSV → 탭 변환",
    pattern: ",",
    replacement: "\\t",
    flags: "g",
  },
  {
    title: "📐 전각 스페이스 → 반각",
    pattern: "\\u3000",
    replacement: " ",
    flags: "g",
  },
  {
    title: "⏎ 줄바꿈 → 공백",
    pattern: "\\n",
    replacement: " ",
    flags: "g",
  },
  {
    title: "— 대시 정규화",
    pattern: "[—–―]",
    replacement: "-",
    flags: "g",
  },
  {
    title: '" 따옴표 정규화',
    pattern: "[\\u201C\\u201D\\u2018\\u2019]",
    replacement: '"',
    flags: "g",
  },
  {
    title: "📝 마크다운 링크 → 텍스트",
    pattern: "\\[([^\\]]+)\\]\\([^\\)]+\\)",
    replacement: "$1",
    flags: "g",
  },
  {
    title: "일본어가 포함된 <문장 전체>",
    pattern: "^.*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF].*$",
    replacement: "",
    flags: "gm",
  },
  {
    title: "한글이 포함된 <문단>",
    pattern: "^.*[가-힣].*$\\n?",
    replacement: "",
    flags: "gm",
  },
];

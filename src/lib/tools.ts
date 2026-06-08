export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
}

export const tools: Tool[] = [
  {
    id: "honorific",
    name: "경어체 변환",
    description: "한글 텍스트를 높임말로",
    icon: "🙇",
    href: "/tools/honorific",
  },
  {
    id: "declarative",
    name: "평서문 변환",
    description: "한글 텍스트를 평서문으로",
    icon: "📝",
    href: "/tools/declarative",
  },
  {
    id: "counter",
    name: "글자수 체크",
    description: "텍스트 길이·단어·바이트",
    icon: "🔢",
    href: "/tools/counter",
  },
  {
    id: "regex",
    name: "정규식 치환",
    description: "패턴 매칭 & 텍스트 변환",
    icon: "🔍",
    href: "/tools/regex",
  },
  {
    id: "encoding",
    name: "인코딩 / 디코딩",
    description: "URL, Base64, HTML 등 변환",
    icon: "🔐",
    href: "/tools/encoding",
  },
  {
    id: "image",
    name: "이미지 리사이즈",
    description: "크기·포맷 변환",
    icon: "🖼️",
    href: "/tools/image",
  },
  {
    id: "date-convert",
    name: "날짜 변환",
    description: "양력·음력·페르시아력 변환",
    icon: "📅",
    href: "/tools/date-convert",
  },
];

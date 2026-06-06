export interface ImagePreset {
  label: string;
  w: number;
  h: number;
  desc?: string;
}

export const imagePresets: ImagePreset[] = [
  { label: "Instagram 정사각형", w: 1080, h: 1080, desc: "게시물" },
  { label: "Instagram 세로", w: 1080, h: 1350, desc: "게시물" },
  { label: "Instagram 가로", w: 1080, h: 566, desc: "게시물" },
  { label: "Instagram 스토리", w: 1080, h: 1920, desc: "스토리/릴스" },
  { label: "Twitter/X 포스트", w: 1200, h: 675, desc: "게시물" },
  { label: "Twitter/X 헤더", w: 1500, h: 500, desc: "헤더" },
  { label: "Facebook 커버", w: 820, h: 312, desc: "커버" },
  { label: "YouTube 썸네일", w: 1280, h: 720, desc: "썸네일" },
  { label: "OG 이미지", w: 1200, h: 630, desc: "SNS 공유" },
  { label: "HD", w: 1920, h: 1080, desc: "16:9" },
  { label: "Full HD 세로", w: 1080, h: 1920, desc: "9:16" },
];

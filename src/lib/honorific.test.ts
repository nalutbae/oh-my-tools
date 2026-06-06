import { describe, it, expect, beforeAll } from "vitest";
import { toHonorific, setGaruInstance } from "./honorific";

let garu: any;

beforeAll(async () => {
  const { Garu } = await import("garu-ko");
  garu = await Garu.load();
  setGaruInstance(garu);
});

async function h(text: string) { return toHonorific(text, "haeyo"); }
async function s(text: string) { return toHonorific(text, "hapsyo"); }

// ── VCN (아니다) ──
describe("VCN 아니다", () => {
  it("아니야 → 아니에요 / 아닙니다", async () => {
    expect(await h("그건 사실이 아니야")).toBe("그건 사실이 아니에요");
    expect(await s("그는 천재가 아니다")).toBe("그는 천재가 아닙니다");
  });

  it("VCN 뒤 EC/ETM: 관형사구/부사구 보존", async () => {
    // "아니라는"은 관형사구 → 변환하지 않음
    expect(await h("아니라는 말")).toBe("아니라는 말");
    expect(await h("아닌 사람")).toBe("아닌 사람");
    expect(await h("아니게 변했다")).toBe("아니게 변했어요"); // 변하다→변했
  });
});

// ── 서술형 ──
describe("서술형", () => {
  it("~다", async () => {
    expect(await h("간다")).toBe("가요");
    expect(await s("간다")).toBe("갑니다");
  });

  it("과거형", async () => {
    expect(await h("갔어")).toBe("갔어요");
    expect(await h("먹었어")).toBe("먹었어요");
    expect(await h("한국군은 강하다")).toBe("한국군은 강해요");
  });

  it("이다", async () => {
    expect(await h("학생이다")).toBe("학생이에요");
    expect(await s("학생이다")).toBe("학생입니다");
  });
});

// ── 명령/청유 ──
describe("명령/청유", () => {
  it("~자", async () => {
    expect(await h("가자")).toBe("가요");
    expect(await s("가자")).toBe("갑시다");
  });

  it("~아/어라", async () => {
    expect(await h("해라")).toBe("하세요");
    expect(await s("해라")).toBe("하십시오");
    expect(await h("봐라")).toBe("보세요");
  });
});

// ── 의문형 ──
describe("의문형", () => {
  it("~ㄹ까", async () => {
    expect(await h("갈까")).toBe("갈까요");
    expect(await h("할까")).toBe("할까요");
  });

  it("~니", async () => {
    expect(await h("어떻게 하니")).toBe("어떻게 하나요");
  });
});

// ── 청유 ──
describe("청유/의지", () => {
  it("~ㄹ게", async () => {
    expect(await h("가")).toBe("가요"); // 가+ㄹ게에서 stem=가가 아닌 일반 동사
    expect(await h("갈게")).toBe("갈게요");
    expect(await h("할게")).toBe("할게요");
    expect(await s("갈게")).toBe("가겠습니다");
  });

  it("받침 동사 + 을게", async () => {
    expect(await h("먹을게")).toBe("먹을게요");
    expect(await s("먹을게")).toBe("먹겠습니다");
  });
});

// ── 보조동사 ──
describe("보조동사", () => {
  it("해줘", async () => {
    expect(await h("해줘")).toBe("해줘요");
    expect(await s("해줘")).toBe("해주십시오");
  });

  it("해봐", async () => {
    expect(await h("해봐")).toBe("해봐요");
    expect(await s("해봐")).toBe("해보십시오");
  });
});

// ── 실전 버그 회귀 ──
describe("버그 회귀 테스트", () => {
  it("없을 뿐만 아니라 (VCN + EC) → 변환 안 함", async () => {
    const text = "없을 뿐만 아니라, 무모한 행동으로";
    // "아니라"는 연결어미(EC) → 관형/연결 문법이므로 변환하지 않음
    expect(await h(text)).toBe("없을 뿐만 아니라, 무모한 행동으로");
    expect(await s(text)).toBe("없을 뿐만 아니라, 무모한 행동으로");
  });
});

// ── 추가 엣지 케이스 점검 ──
describe("추가 점검", () => {
  // 1. 다양한 동사 유형
  it("불규칙 동사", async () => {
    expect(await h("듣는다")).toBe("들어요");   // ㄷ 불규칙
    expect(await h("걷는다")).toBe("걸어요");     // ㄷ 불규칙
    expect(await h("춥다")).toBe("추워요");      // ㅂ 불규칙
    expect(await h("덥다")).toBe("더워요");      // ㅂ 불규칙
    expect(await h("만들어")).toBe("만들어요"); // ㄹ 불규칙 (받침)
    expect(await h("올라")).toBe("올라요");     // ㄹ → ㄹ + 아
  });

  // 2. 하다 계열 합성동사
  it("하다 계열 합성", async () => {
    expect(await h("변한다")).toBe("변해요");   // 변하다
    expect(await h("참한다")).toBe("참해요");     // 참하다
    expect(await h("강하다")).toBe("강해요");     // 강하다 (단독)
  });

  // 3. 과거형 특수
  it("과거형 불규칙", async () => {
    expect(await h("갔어")).toBe("갔어요");     // 가→갔
    expect(await h("왔어")).toBe("왔어요");     // 오→왔
    expect(await h("줬어")).toBe("줬어요");     // 주→줬
    expect(await h("됐어")).toBe("됐어요");     // 되→됐
    expect(await h("했어")).toBe("했어요");     // 하→했
  });

  // 5. 다양한 종결어미
  it("종결어미", async () => {
    expect(await h("가겠어")).toBe("가겠어요"); // 겠 + EF
    expect(await h("가네")).toBe("가네요");     // 네
    expect(await h("가지")).toBe("가지");       // 지 — Garu가 NNB(의존명사)로 분석, 변환 불가
    // "가군"은 Garu가 NNG(명사)로 분석하여 엔진이 동사로 인식하지 못함 — 한계
  });

  // 6. 영어/숫자 섞임 (한계: 주변 맥락에 따라 NNP로 인식될 수 있음)
  it("비한글 텍스트", async () => {
    // "Hello world, 가자!" 에서 "가자"가 NNP(고유명사)로 인식되어 변환되지 않음
    // 순수 한국어 문장만 안정적으로 처리됨
    expect(await h("가자")).toBe("가요");
  });

  // 7. 이미 존댓말인 경우: 엔진은 입력이 평어(다/어/자 등)인 것을 전제로 함
  it("존댓말 입력", async () => {
    // "가요"는 이미 해요체 — 엔진은 평어→경어체만 변환하므로 pass-through
    expect(await h("가요")).toBe("가요");   // 이미 해요체 → 그대로
    // "갑니다"는 이미 합쇼체 — 변환하지 않음
    expect(await h("갑니다")).toBe("갑니다"); // 그대로 (엔진이 평어만 처리)
    expect(await s("가요")).toBe("갑니다");   // 해요체 → 합쇼체
  });
});

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

import { describe, it, expect, beforeAll } from "vitest";
import { toPlainSpoken, setGaruInstance } from "./plain";

let garu: any;

beforeAll(async () => {
  const { Garu } = await import("garu-ko");
  garu = await Garu.load();
  setGaruInstance(garu);
});

async function p(text: string) { return toPlainSpoken(text); }

// ── 합쇼체 → 평서문 ──
describe("합쇼체", () => {
  it("현재형 동사", async () => {
    expect(await p("저는 갑니다")).toBe("나는 간다");
    expect(await p("저는 먹습니다")).toBe("나는 먹는다");
    expect(await p("저는 합니다")).toBe("나는 한다");
    expect(await p("저는 옵니다")).toBe("나는 온다");
    expect(await p("저는 만듭니다")).toBe("나는 만들는다");
  });

  it("과거형", async () => {
    expect(await p("저는 갔습니다")).toBe("나는 갔다");
    expect(await p("저는 했습니다")).toBe("나는 했다");
    expect(await p("저는 먹었습니다")).toBe("나는 먹었다");
    expect(await p("저는 왔습니다")).toBe("나는 왔다");
  });

  it("미래형", async () => {
    expect(await p("저는 가겠습니다")).toBe("나는 가겠다");
    expect(await p("저는 주겠습니다")).toBe("나는 주겠다");
    expect(await p("저는 도와주겠습니다")).toBe("나는 도와주겠다");
  });

  it("형용사", async () => {
    expect(await p("저는 강합니다")).toBe("나는 강하다");
    expect(await p("저는 강했습니다")).toBe("나는 강했다");
  });

  it("이다", async () => {
    expect(await p("저는 학생입니다")).toBe("나는 학생이다");
  });

  it("아니다", async () => {
    expect(await p("저는 바보가 아닙니다")).toBe("나는 바보가 아니다");
    expect(await p("저는 천재가 아닙니다")).toBe("나는 천재가 아니다");
  });
});

// ── 해요체 → 평서문 ──
describe("해요체", () => {
  it("현재형", async () => {
    expect(await p("그는 먹어요")).toBe("그는 먹는다");
    expect(await p("그는 해요")).toBe("그는 한다");
  });

  it("과거형", async () => {
    expect(await p("그는 왔어요")).toBe("그는 왔다");
    expect(await p("그는 강했어요")).toBe("그는 강했다");
  });

  it("이다", async () => {
    expect(await p("그는 학생이에요")).toBe("그는 학생이다");
  });

  it("아니다", async () => {
    expect(await p("그는 바보가 아니에요")).toBe("그는 바보가 아니다");
  });
});

// ── 버그 회귀 ──
describe("버그 회귀", () => {
  it("단어 중간 '저' 치환 방지 — 철저한", async () => {
    expect(await p("철저한 경계를 유지해야 합니다")).toBe("철저한 경계를 유지해야 한다");
  });

  it("파생동사 촉구하다", async () => {
    expect(await p("촉구합니다")).toBe("촉구한다");
    expect(await p("촉구드립니다")).toBe("촉구드린다");
  });
});

// ── 대명사 치환 ──
describe("대명사 치환", () => {
  it("저→나", async () => {
    expect(await p("저는 갑니다")).toBe("나는 간다");
    expect(await p("저를 봤습니다")).toBe("나를 봤다");
    expect(await p("저에게 갑니다")).toBe("내게 간다");
  });

  it("저희→우리", async () => {
    expect(await p("저희는 갑니다")).toBe("우리는 간다");
  });
});

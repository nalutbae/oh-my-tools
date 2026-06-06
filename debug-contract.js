// contract 함수의 로직을 인라인으로 재현하여 디버깅
function decompose(ch) {
  const c = ch.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3) return null;
  const base = c - 0xac00;
  return { jong: base % 28, jung: Math.floor(base / 28) % 21, cho: Math.floor(base / 588) };
}
function compose(cho, jung, jong) {
  return String.fromCharCode(0xac00 + cho * 588 + jung * 28 + jong);
}
function getJong(ch) { return decompose(ch)?.jong ?? -1; }
function getJung(ch) { return decompose(ch)?.jung ?? -1; }
function pickAeo(last) {
  return [0, 2, 8, 9, 10, 11, 12].includes(getJung(last)) ? "아" : "어";
}

function contract(stem) {
  if (!stem) return "";
  if (stem.endsWith("하")) return stem.slice(0, -1) + "해";
  const special = { 가: "가", 오: "와", 보: "봐", 주: "줘", 되: "돼" };
  if (special[stem]) return special[stem];

  const last = stem[stem.length - 1];
  const ao = pickAeo(last);

  console.log(`stem="${stem}", last="${last}", ao="${ao}", jong=${getJong(last)}`);

  const dLast = decompose(last);
  console.log(`dLast=`, dLast);

  if (dLast) {
    console.log(` checking jong=${dLast.jong}`);
    if (dLast.jong === 8) {
      console.log(`  ㄹ 불규칙 matched! stem="${stem}"`);
      if (stem === "오르") return "올라";
    }
  }

  if (getJong(last) > 0) {
    console.log(`  무받침 아님 → stem+ao = "${stem}"+"${ao}"`);
    return stem + ao;
  }

  return stem + ao;
}

console.log("=== contract('오르') ===");
console.log("result:", contract("오르"));
console.log("\n=== contract('듣') ===");
console.log("result:", contract("듣"));

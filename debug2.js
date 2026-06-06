async function main() {
  const { Garu } = await import("garu-ko");
  const garu = await Garu.load();
  const tests = ["만들어", "춥다", "낫다", "짓다", "오르다", "가자", "갑니다", "가요"];
  for (const text of tests) {
    const s = garu.analyze(text);
    console.log(`${text}: ${JSON.stringify(s.tokens.map(t => t.text + '/' + t.pos))}`);
  }
}
main();

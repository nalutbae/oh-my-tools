async function main() {
  const { Garu } = await import("garu-ko");
  const garu = await Garu.load();
  const tests = ["춥다", "가지", "갑니다", "가요", "걷는다", "듣는다", "올라"];
  for (const text of tests) {
    const s = garu.analyze(text);
    console.log(`${text}: ${JSON.stringify(s.tokens.map(t => t.text + '/' + t.pos))}`);
  }
}
main();

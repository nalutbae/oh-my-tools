async function main() {
  const { Garu } = await import("garu-ko");
  const garu = await Garu.load();
  
  const tests = ["듣는다", "가군", "Hello world, 가자!", "갑니다", "가요"];
  
  for (const text of tests) {
    console.log(`\n=== "${text}" ===`);
    const s = garu.analyze(text);
    console.log("tokens:", JSON.stringify(s.tokens.map(t => ({text: t.text, pos: t.pos})), null, 2));
  }
}
main();

// Tokenizes Pelago source with the shipped grammar, the way VS Code does (vscode-textmate + Oniguruma).
// With no arguments it checks a few built-in lines; with paths it tokenizes those `.pel` files or folders.
// Fails when the grammar does not load, a line does not tokenize, or a rule in package.json names a scope the grammar never produces.
const fs = require("fs");
const path = require("path");
const vt = require("vscode-textmate");
const onig = require("vscode-oniguruma");

const root = path.join(__dirname, "..");
const wasm = fs.readFileSync(require.resolve("vscode-oniguruma/release/onig.wasm")).buffer;
const onigLib = onig.loadWASM(wasm).then(() => ({
  createOnigScanner: (p) => new onig.OnigScanner(p),
  createOnigString: (s) => new onig.OnigString(s),
}));
const registry = new vt.Registry({
  onigLib,
  loadGrammar: async () => vt.parseRawGrammar(fs.readFileSync(path.join(root, "syntaxes/pelago.tmLanguage.json"), "utf8"), "pelago.tmLanguage.json"),
});

const sample = `// a comment
/// a doc comment
@inline
pub fn add(inout a: int, sink b: int) -> int {
    let s = "sum #a and #(a + b)\\n"
    var n = 0x1F + 1_000
    for i in lo..hi step 2 { n += i }
    print(s)
    a.bump!()
    return a + b ?? none
}
obj point { x: int }
impl point { fn len(self) -> int { return self.x } }
unsafe async fn go() { await work() }
`;

function files(p) {
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  return fs.readdirSync(p).flatMap((n) => (n === "target" || n === ".git" || n === "node_modules" ? [] : files(path.join(p, n)))).filter((f) => f.endsWith(".pel"));
}

(async () => {
  const grammar = await registry.loadGrammar("source.pelago");
  if (!grammar) throw new Error("the grammar did not load");
  const seen = new Set();
  let lines = 0;
  const run = (text) => {
    let stack = vt.INITIAL;
    for (const line of text.split("\n")) {
      const r = grammar.tokenizeLine(line, stack);
      stack = r.ruleStack;
      lines++;
      for (const t of r.tokens) t.scopes.forEach((s) => seen.add(s));
    }
  };
  const args = process.argv.slice(2);
  if (args.length === 0) run(sample);
  else for (const f of args.flatMap(files)) run(fs.readFileSync(f, "utf8"));

  if (args.length === 0) {
    const rules = require("../package.json").contributes.configurationDefaults["editor.tokenColorCustomizations"].textMateRules;
    const used = [...seen];
    for (const r of rules) for (const sel of r.scope) {
      const scope = sel.replace(/^source\.pelago /, "");
      if (!used.some((s) => s === scope || s.startsWith(scope + "."))) {
        console.error("FAIL: no token gets the scope `" + scope + "` (is the rule dead?)");
        process.exitCode = 1;
      }
    }
  }
  if (args.length === 0) {
    // `step` and `it` are soft keywords: only the word itself may carry the soft scope, never the text before it.
    for (const [line, word] of [["for i in lo..hi step 2 { }", "step"], ["xs.map(~> f(a) + it)", "it"]]) {
      for (const t of grammar.tokenizeLine(line, vt.INITIAL).tokens) {
        const text = line.slice(t.startIndex, t.endIndex);
        if (t.scopes.includes("keyword.other.soft.pelago") && text !== word) {
          console.error("FAIL: `" + text + "` in `" + line + "` is scoped as a soft keyword");
          process.exitCode = 1;
        }
      }
    }
  }
  console.log("ok: " + lines + " lines tokenized, " + seen.size + " distinct scopes");
})().catch((e) => { console.error("FAIL: " + e.message); process.exit(1); });

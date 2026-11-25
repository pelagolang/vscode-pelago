// Guard: the extension must never restyle anything outside .pel files.
// No themes, only editor.tokenColorCustomizations defaults, and every rule scoped to source.pelago.
const pkg = require("../package.json");
const c = pkg.contributes;
const fail = (m) => { console.error("FAIL: " + m); process.exit(1); };
if (c.themes || c.iconThemes || c.productIconThemes) fail("the extension must not contribute themes");
const d = c.configurationDefaults || {};
for (const k of Object.keys(d)) if (k !== "editor.tokenColorCustomizations") fail("unexpected default " + k);
const rules = (d["editor.tokenColorCustomizations"] || {}).textMateRules || [];
if (!rules.length) fail("no colour rules");
for (const r of rules) for (const s of r.scope) if (!s.startsWith("source.pelago ")) fail("unscoped rule " + s);
console.log("ok: " + rules.length + " rules, all scoped to source.pelago");

// Every file the manifest points at must exist, so a renamed icon or grammar fails here and not in the editor.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const paths = [];
for (const l of c.languages || []) {
  if (l.configuration) paths.push(l.configuration);
  if (l.icon) paths.push(l.icon.light, l.icon.dark);
}
for (const g of c.grammars || []) paths.push(g.path);
for (const s of c.snippets || []) paths.push(s.path);
for (const f of paths) if (!fs.existsSync(path.join(root, f))) fail("missing file " + f);
console.log("ok: " + paths.length + " contributed files exist");

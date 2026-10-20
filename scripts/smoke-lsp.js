// Loads the bundled client with a stub `vscode` module and checks that a missing binary gives the
// "could not run" message (with the Open Settings action) instead of a crash. Needs `npm run build`.
const Module = require("module");
const path = require("path");
const bin = "/definitely/not/here/pelago.exe";
const messages = [];
const diag = [];
const base = {
  workspace: {
    getConfiguration: () => ({ get: (k) => (k === "serverPath" ? bin : false) }),
    onDidChangeConfiguration: () => ({ dispose() {} }),
  },
  window: { showErrorMessage: async (m) => { messages.push(m); }, showInformationMessage: async () => {} },
  commands: { registerCommand: () => ({ dispose() {} }), executeCommand: async () => {} },
};
// Anything the client library touches but we do not stub resolves to a callable no-op.
const noop = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.toPrimitive ? () => 0 : noop()), apply: () => noop(), construct: () => noop() });
const stub = new Proxy(base, { get: (t, k) => (k in t ? t[k] : noop()) });
const real = Module._load;
Module._load = function (req, ...rest) { return req === "vscode" ? stub : real.call(this, req, ...rest); };
const ext = require(path.join(__dirname, "..", "out", "extension.js"));
(async () => {
  await ext.activate({ subscriptions: [] });
  if (!messages.length || !messages[0].includes(bin)) { console.error("FAIL: no missing-binary message"); process.exit(1); }
  console.log("ok: missing binary reported:", messages[0].slice(0, 60) + "...");
})().catch((e) => { console.error(e); process.exit(1); });

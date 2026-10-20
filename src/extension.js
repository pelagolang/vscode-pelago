// Starts `pelago lsp` and connects VS Code to it, so syntax and type errors show up as squiggles.
const { spawnSync } = require("child_process");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

function serverPath() {
  const configured = vscode.workspace.getConfiguration("pelago").get("serverPath");
  return (configured || "").trim() || "pelago";
}

// True when the binary can be started at all (it prints its keyword list and exits).
function binaryRuns(path) {
  const probe = spawnSync(path, ["keywords"], { timeout: 10000, windowsHide: true });
  return !probe.error;
}

async function reportMissing(path) {
  const open = "Open Settings";
  const choice = await vscode.window.showErrorMessage(
    `Pelago: could not run "${path}". Put pelago on your PATH or set "pelago.serverPath" to the full path of pelago.exe, then reload the window.`,
    open
  );
  if (choice === open) {
    await vscode.commands.executeCommand("workbench.action.openSettings", "pelago.serverPath");
  }
}

async function start() {
  const command = serverPath();
  if (!binaryRuns(command)) {
    await reportMissing(command);
    return;
  }
  const semantic = vscode.workspace.getConfiguration("pelago").get("semanticHighlighting");
  client = new LanguageClient(
    "pelago",
    "Pelago Language Server",
    { command, args: ["lsp"], transport: TransportKind.stdio, options: { shell: false } },
    {
      documentSelector: [{ scheme: "file", language: "pelago" }, { scheme: "untitled", language: "pelago" }],
      middleware: semantic
        ? {}
        : {
            // The TextMate colours are the look of Pelago; semantic tokens stay opt-in.
            provideDocumentSemanticTokens: async () => null,
            provideDocumentSemanticTokensEdits: async () => null,
            provideDocumentRangeSemanticTokens: async () => null,
          },
    }
  );
  await client.start();
}

async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("pelago.restartServer", async () => {
      if (client) {
        await client.stop();
        client = undefined;
      }
      await start();
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("pelago.serverPath") || e.affectsConfiguration("pelago.semanticHighlighting")) {
        vscode.window
          .showInformationMessage("Pelago: restart the language server to apply the new setting.", "Restart")
          .then((c) => c && vscode.commands.executeCommand("pelago.restartServer"));
      }
    })
  );
  await start();
}

async function deactivate() {
  if (client) await client.stop();
}

module.exports = { activate, deactivate };

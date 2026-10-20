# Pelago for VS Code

Syntax highlighting, bracket and comment settings and snippets for [Pelago](https://github.com/pelagolang/pelago) (`.pel`) files.

## Install

From a `.vsix` (until the extension is on the Marketplace): `npm ci` then `npm run package` (Node 22 or later; works the same in PowerShell) writes
`dist/pelago-<version>.vsix`. In VS Code: Extensions view, `...` menu, "Install from VSIX...". CI builds the same file on every push (the `vsix` artifact), and the `release` workflow attaches it to a GitHub release when a tag `v<version>` is pushed (or when run by hand from the Actions tab).

## Colours

The grammar in `syntaxes/` names the *kind* of each word with scopes that all end in `.pelago`. The extension ships **no colour theme** and
never touches your theme or workbench colours. To make `.pel` files look different from Rust or TypeScript under any theme, `package.json`
contributes `configurationDefaults` for `editor.tokenColorCustomizations`: every rule is anchored to `source.pelago`, so it applies to `.pel`
files only. The colours are mid-tones (about 3.5:1 or better on both white and `#1e1e1e`) so they read on dark and light themes. To change
them, copy a rule into your own `editor.tokenColorCustomizations` in settings; yours win.

`npm run check` (run by CI) fails if a theme, a non-token setting or an unscoped rule is ever added, and tokenizes sample code with the real
grammar engine (`vscode-textmate`) to catch a rule that no longer matches anything. `node scripts/tokenize.js <files or folders>` tokenizes your own `.pel` files.

## The grammar is generated

`syntaxes/pelago.tmLanguage.json` is a copy of `editors/textmate/pelago.tmLanguage.json` in
[pelagolang/pelago](https://github.com/pelagolang/pelago), which is generated from the compiler's keyword tables. Do not edit it by hand.
When that file changes on pelago's `main`, a workflow there (`sync-vscode-grammar`) opens a PR here with the new copy and a patch version bump.

## Language server (errors as you type)

The extension starts `pelago lsp` for every `.pel` file, so syntax and type errors appear as squiggles and in the Problems panel, with hover, go to definition, find references, completion and outline.

1. Install the `pelago` executable and make sure `pelago --help` works in a terminal (on Windows, add the folder holding `pelago.exe` to your PATH, then restart VS Code). Or skip PATH and set **Pelago: Server Path** (`pelago.serverPath`) to the full path of `pelago.exe`.
2. Open a `.pel` file. If the binary cannot be started you get an error message with an **Open Settings** button.
3. After changing the setting, run **Pelago: Restart Language Server** from the Command Palette.

`pelago.semanticHighlighting` (off by default) lets the server's semantic tokens recolour code; leave it off to keep the TextMate colours.

## Licence

MIT OR Apache-2.0, at your option: see `LICENSE-MIT` and `LICENSE-APACHE`.

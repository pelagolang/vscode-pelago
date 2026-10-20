# Pelago for VS Code

Syntax highlighting, bracket and comment settings and snippets for [Pelago](https://github.com/pelagolang/pelago) (`.pel`) files.

## Install

Run `sh scripts/build-vsix.sh` (needs only `zip`); it writes `dist/pelago-<version>.vsix`. In VS Code: Extensions view, `...` menu,
"Install from VSIX...".

## Colours

The grammar in `syntaxes/` names the *kind* of each word with scopes that all end in `.pelago`. The extension ships **no colour theme** and
never touches your theme or workbench colours. To make `.pel` files look different from Rust or TypeScript under any theme, `package.json`
contributes `configurationDefaults` for `editor.tokenColorCustomizations`: every rule is anchored to `source.pelago`, so it applies to `.pel`
files only. The colours are mid-tones (about 3.5:1 or better on both white and `#1e1e1e`) so they read on dark and light themes. To change
them, copy a rule into your own `editor.tokenColorCustomizations` in settings; yours win.

`node scripts/check.js` (run by CI) fails if a theme, a non-token setting or an unscoped rule is ever added.

## The grammar is generated

`syntaxes/pelago.tmLanguage.json` is a copy of `editors/textmate/pelago.tmLanguage.json` in
[pelagolang/pelago](https://github.com/pelagolang/pelago), which is generated from the compiler's keyword tables. Do not edit it by hand:
after a keyword change there, copy the new file here and bump the version.

The language server (`pelago lsp`) is not wired into this extension yet; it would need a small client using `vscode-languageclient`.

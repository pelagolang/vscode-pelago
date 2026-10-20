# Changelog

## 0.1.0

- Language server: the extension starts `pelago lsp` (diagnostics, hover, definition, references, completion, outline). Settings `pelago.serverPath` and `pelago.semanticHighlighting`, command `Pelago: Restart Language Server`, and a clear message with an Open Settings button when the binary is missing. Needs VS Code 1.82 or newer.
- New comment syntax: `/// line`, `///* block *///` (nests), `//~ doc line`, `//~* doc block *~//`. Toggle Line Comment now inserts `///`, and a doc line is no longer half-stripped. `//` and `/* */` are marked as errors.

## 0.0.2

- Pelago-only colours through `configurationDefaults` token rules anchored to `source.pelago` (no theme is shipped or changed).
- Icon, gallery banner and repository metadata for the Marketplace and Open VSX.

## 0.0.1

- First TextMate grammar, language configuration and snippets for `.pel` files.

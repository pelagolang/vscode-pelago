# Publishing

Not published yet. Nothing here is automatic: the owner publishes by hand. This file is left out of the `.vsix` (see `.vscodeignore`).

## Before the first publish

- [ ] **Make the repository public** (it is private today): the Marketplace page links to it and rewrites the README's relative links against it.
- [ ] **Licence.** Add a `LICENSE` file and a `"license"` field to `package.json` (the Pelago compiler's `Cargo.toml` says `MIT OR Apache-2.0`, but `ROADMAP.md` still lists "Choose a license" as open). The Marketplace shows "no licence" without one.
- [ ] **Publisher.** Create the publisher `pelagolang` on <https://marketplace.visualstudio.com/manage> (the id is permanent) and the namespace `pelagolang` on <https://open-vsx.org> (Open VSX needs an Eclipse account, a signed publisher agreement and a token). The extension id will be `pelagolang.pelago`. Searches on 2026-10-20 found no existing `pelago` extension on Open VSX; the Marketplace could not be searched from the build sandbox, so check it when creating the publisher.
- [ ] **Icon.** `images/icon.png` (256 x 256, three waves in the Pelago colours, source `images/icon.svg`) is a placeholder; replace both files if you want another logo.
- [ ] **Version.** `package.json` says `0.0.2`. Bump (for example to `0.1.0`) and add a line to `CHANGELOG.md`. The `sync-vscode-grammar` workflow in the pelago repo bumps the patch number itself.
- [ ] Install `dist/pelago-<version>.vsix` in VS Code by hand and go through the checklist in the pelago repository (`docs/plans/cards/S-05-zed-and-tree-sitter.md`).

## Publish

```
npm ci
npm run package
npx vsce login pelagolang          # asks for the Azure DevOps token (scope: Marketplace, Manage)
npx vsce publish --packagePath dist/pelago-<version>.vsix
npx ovsx publish dist/pelago-<version>.vsix -p <open-vsx-token>
```

Microsoft retires global Azure DevOps tokens on 2026-12-01; after that use `vsce publish --azure-credential` (Entra ID).

## Rules that must keep holding

- The extension never ships or changes a theme or workbench colours. `scripts/check.js` (in CI) enforces it.
- `syntaxes/pelago.tmLanguage.json` is generated in the pelago repository; never edit it here.

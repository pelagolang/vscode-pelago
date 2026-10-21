# Publishing

Not published yet. Nothing here is automatic: the owner publishes by hand. This file is left out of the `.vsix` (see `.vscodeignore`).

## Before the first publish

- [ ] **Make the repository public** (it is private today): the Marketplace page links to it and rewrites the README's relative links against it.
- [x] **Licence.** `MIT OR Apache-2.0` (`LICENSE-MIT`, `LICENSE-APACHE`), chosen by the owner on 2026-10-20.
- [ ] **Publisher.** Create the publisher `pelagolang` on <https://marketplace.visualstudio.com/manage> (the id is permanent) and the namespace `pelagolang` on <https://open-vsx.org> (Open VSX needs an Eclipse account, a signed publisher agreement and a token). The extension id will be `pelagolang.pelago`. Searches on 2026-10-20 found no existing `pelago` extension on Open VSX; the Marketplace could not be searched from the build sandbox, so check it when creating the publisher.
- [x] **Icon.** `images/icon.png` (256 x 256) is the Pelago mark, copied from the brand kit in `pelagolang/pelago` (`assets/brand/`); `images/README.md` names the source of each file.
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

## Automated publishing (release workflow)

Pushing a tag `v<version>` (it must equal `version` in `package.json`) builds the `.vsix`, attaches it to the GitHub release and publishes it.

1. In this repository: Settings, Secrets and variables, Actions, New repository secret, name `VSCE_PAT`, value the Azure DevOps token (scope Marketplace, Manage; organisation "All accessible organizations"). The publisher `pelagolang` must exist and match `publisher` in `package.json`.
2. Optional: a secret `OVSX_PAT` with the Open VSX token. Without it the Open VSX step is skipped.
3. `git tag v<version> && git push origin v<version>`.

Without `VSCE_PAT` the workflow only builds and creates a GitHub pre-release. With it, the release is marked as a full release after the Marketplace publish succeeds. Running the workflow by hand never publishes.

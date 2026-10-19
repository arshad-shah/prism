# Release runbook

The public source repository and extension-store publication are separate. Repository availability does not imply Chrome Web Store, Edge Add-ons or AMO approval.

1. Use the pinned Node/pnpm tools. Install from the frozen lockfile in a clean directory. Install Pillow from requirements-assets.txt and the necessary local browser binaries.
2. Run lint, types, unit/story tests, layer checks, component workbench build, brand generation, extension builds, real browser tests and performance checks. Review docs/verification.md and docs/parity.md; unresolved release gates block a store release.
3. Generate the five production UI screenshots and both promo tiles. Inspect light/dark/contrast, narrow desktop, keyboard focus, error recovery and text clipping.
4. Create a Changeset for a release-worthy change, then run `pnpm changeset:version`. Every manifest/archive derives from package.json. Commit the reviewed release source.
5. Run `pnpm release:prepare`. It fails on dirty source or missing browser evidence. `pnpm package` is available for explicitly labeled local candidates while external gates remain open. Build twice in isolated copies and compare SHA-256 manifests.
6. Prepare listing copy, permissions rationale, source bundle, privacy policy URL and reviewer notes. Store accounts, signing and final submission require separate authorization. Keep credentials out of the repository.
7. Record each browser as prepared, uploaded, submitted or approved. Never infer a store outcome from a ZIP being generated.

The initial package version is 1.0.0. This new extension does not inherit legacy extension IDs, reviews, installed users or settings automatically. No automated paid CI or store upload workflow is configured.

Chrome image requirements were checked against [official listing guidance](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) and [image guidance](https://developer.chrome.com/docs/webstore/images): five 1280×800 screenshots, a 440×280 small tile and a 1400×560 marquee are generated. Recheck the dashboard at submission. Firefox declares no collection using its [built-in consent manifest](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/). Edge submission should follow its current dashboard requirements; a Chrome package alone is not Edge approval.

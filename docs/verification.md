# Verification status

This file distinguishes source/candidate readiness from store release readiness. Evidence is updated as checks finish. No store submission or approval has occurred.

## Current evidence

Source gates, rerun 2026-10-19 with Node 24.15.0 and pnpm 10.4.1:

- `pnpm test`: 32 tests passed in 16 files.
- `pnpm test:stories`: 4 Viewer accessibility states passed (jsdom/axe; color contrast is excluded there).
- `pnpm typecheck`, `pnpm layers` and `pnpm brand:check` passed.
- `pnpm lint`: no errors or warnings (4 informational notes).
- `pnpm build`: Chrome, Edge and Firefox outputs built with separate detector/viewer/worker entries.
- `pnpm check:source`: run against the staged initial commit (credential patterns, workstation paths, symlinks, working-tree drift).

Clean frozen-lockfile installation with the pinned toolchain completed in an isolated directory without dependency symlinks (2026-10-06).

Real-browser evidence, recorded 2026-10-06 on macOS arm64 (Apple M2 Pro) and not rerun since:

- Chromium 153.0.8010.12 and Edge 154.0.4258.53 (`docs/reports/chromium-integration.json`, `docs/reports/edge-integration.json`): ordinary HTML untouched; native JSON with worker search, inspector, exact raw recovery and teardown; native XML namespaces with reconstructed-fidelity labelling; scalar JSON and plain text; SVG artwork untouched; malformed-source recovery; hostile text and unsafe links; large-document virtualization with keyboard focus recycling; narrow desktop layout.
- Firefox 157.0 (local report, not committed): ordinary HTML untouched; native XML acquisition, worker tree, raw recovery and teardown; standalone JSON workspace with worker parsing. Firefox's protected native JSON viewer cannot be replaced, so JSON on Firefox uses the paste/file workspace.
- Browser quality on Edge 154 (`docs/reports/browser-quality.json`): no axe violations in light, dark or high-contrast themes; opening a 1 MiB pasted document to tree paint took p50 34.9 ms / p95 36.6 ms over seven runs with no long tasks. Timing includes worker startup and model transfer but excludes native-page acquisition, and all runs share one browser session.

## Limitations

- Browser runs are from one machine and one session each; they are not cross-platform or cold-start measurements.
- The browser reports predate this document refresh. Rebuilt outputs should be rechecked in real browsers before a release candidate is tagged.
- Firefox JSON takeover is deliberately unsupported; parity with Chromium-family browsers is not claimed for native JSON pages.
- Review screenshots exist locally but no final human visual sign-off is recorded.

## Release gates still open

Final screenshot/visual review, reproducible candidate archives with checksums, dependency audit and an independent review must be recorded before claiming release readiness. Node benchmarks do not prove interactive browser latency. DOM axe checks do not prove color contrast. Store submission requires separate authorization.

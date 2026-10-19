# Prism development

Use Node 24.15.0 and pnpm 10.4.1. Preserve the pure document core, format adapters, central session, worker isolation, and existing tests. Reusable UI uses props/callbacks, semantic tokens and the SVG icon registry. Desktop only; preserve narrow desktop usability.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm layers`, `pnpm build` and relevant browser checks. Never claim Firefox/Edge or release readiness from a Chromium/DOM test. Record verification limitations in docs/verification.md. Do not weaken gates to publish.

Do not commit local handoff/companion files, secrets, absolute workstation paths, or real user documents. Store assets must use synthetic fixtures. Repository publication and extension-store submission are separate actions requiring their respective user authorization.

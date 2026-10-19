# Store reviewer notes

Build with the pinned toolchain and `pnpm install --frozen-lockfile && pnpm build`. JavaScript is bundled from the included TypeScript/Preact source with esbuild. Saxes parses XML in a worker. No remote code is downloaded or executed.

Load the browser-specific dist directory. Visit a synthetic JSON endpoint or open the extension popup and choose Paste or open file. Search, select a row, copy a path, inspect analysis, switch to Raw and download. Close the injected viewer to restore the underlying document.

Use the fixtures in store/fixtures and tests. Do not use private documents. Firefox's manifest declares no data collection. Preferences use local extension storage. Source contents stay in session memory.

Candidate archives and source bundles are local outputs. See docs/verification.md for exactly which browser and performance gates have been exercised before submission.

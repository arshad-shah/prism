# Architecture

Prism combines JSON and XML in one desktop workspace.

`contracts` defines the flat document model. `formats/json` and `formats/xml` adapt source into it. `core` provides indexing, paths, visibility, search, limits and analysis. `core/parse.ts` is the explicit composition dispatcher and is the only core module allowed to import the adapters. `state/session` owns document generations, selection, expansion and search results. `platform` owns worker lifetimes, browser APIs, acquisition, storage, clipboard and download.

The tiny content detector conservatively recognizes raw documents and mounts an extension-owned iframe within a removable shadow host. The original page remains underneath. The iframe handshake checks window source, extension origin and a random mount token. Failure on protected/unsupported pages can be recovered through the standalone workspace.

Each processing job uses an extension-owned worker with a ten-second deadline. New searches terminate preceding search workers; document replacement cancels all work. Generation checks prevent late responses from overwriting newer state. Model transfer has a cost and remains part of performance verification.

The Viewer composes props-only tree, search controls, inspector, open-document, and primitive components. Pure calculations are memoized by model. UI-only state (raw/tree, inspector mode and input controls) does not duplicate document rules. The virtual tree keeps a bounded row window and an active descendant. Themes and SVG paths come from shared tokens. Production, stories and store captures use the same components.

Explicit esbuild entries produce detector, viewer, worker and popup bundles. Production and Storybook share the same Preact aliases. Brand geometry generates SVG/PNG assets; the package version generates every manifest and archive name. Source bundles contain only Git-indexed files, with unsafe local files rejected by the publication scan.

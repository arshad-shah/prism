# Contributing

Use the pinned Node/pnpm toolchain and a branch. Keep document fixtures synthetic. Add a regression test for changed behavior, preserve the module boundaries, and run lint, types, tests, layers, build, and relevant browser checks.

Reusable UI accepts props/callbacks. Document rules belong in the pure core and session; platform effects belong in adapters. Use shared SVG icons and semantic tokens. Every reusable component has a Storybook example. Store screenshots render the production Viewer.

Open a pull request with the problem, resulting behavior, and verification evidence. Avoid committing generated browser profiles, local notes, `.env` files, or dependency directories. Version user-visible changes through `pnpm changeset`. Read SECURITY.md for private vulnerability reports.

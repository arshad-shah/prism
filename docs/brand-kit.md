# Prism identity

The identity uses a faceted triangular prism, graphite/chalk surfaces and signal-orange accents. `src/brand/mark.ts` is the geometry/palette source. `src/tokens` provides semantic light, dark and high-contrast UI colors; `src/tokens/icons.ts` supplies all symbolic controls.

Use system UI fonts for controls and a system monospace stack for structured data. The mark should retain clear space of one quarter of its width. The 16px icon is the smallest generated use; use larger variants when space allows. Do not stretch or add shadows to the mark. Monochrome ink/light SVGs serve single-color backgrounds.

Run `pnpm brand:assets` for color/ink/light SVGs and 16/32/48/128 PNGs. Raster generation uses supersampled central polygons through Pillow. `pnpm brand:check` verifies vectors and PNG dimensions. `pnpm store:promos` generates the two tiles. `pnpm store:assets` captures the actual Viewer with synthetic fixtures; these are not independently redrawn screens.

import { ALIASES } from "../build/shared";
import { build } from "esbuild";
import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { createManifest } from "../build/manifest";
import { verifyIcons } from "../build/icons";
verifyIcons("icons");
const pkg = JSON.parse(await readFile("package.json", "utf8"));
await rm("dist", { recursive: true, force: true });
for (const browser of ["chrome", "edge", "firefox"]) {
  const out = `dist/${browser}`;
  await mkdir(out, { recursive: true });
  for (const [entry, outfile, format] of [
    ["src/content/detector.ts", "detector.js", "iife"],
    ["src/viewer/entry.tsx", "viewer.js", "esm"],
    ["src/workers/document.ts", "document-worker.js", "esm"],
    ["src/ui/popup/index.tsx", "popup.js", "esm"],
  ] as const) {
    await build({
      entryPoints: [entry],
      outfile: `${out}/${outfile}`,
      bundle: true,
      alias: ALIASES,
      minify: true,
      format,
      platform: "browser",
      target: "es2022",
      jsx: "automatic",
      jsxImportSource: "preact",
    });
  }
  await writeFile(
    `${out}/manifest.json`,
    JSON.stringify(createManifest(browser, pkg.version), null, 2),
  );
  for (const page of ["viewer", "popup"])
    await writeFile(
      `${out}/${page}.html`,
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prism</title><body${page === "popup" ? ' style="width:420px;min-height:220px"' : ""}><div id="app"></div><script type="module" src="${page}.js"></script></body></html>`,
    );
  await cp("icons", `${out}/icons`, { recursive: true });
}
console.log(
  "Built Chrome, Edge and Firefox with separate detector/viewer/worker entries.",
);

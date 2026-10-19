import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { verifyIcons } from "../build/icons";
import { createManifest } from "../build/manifest";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
for (const browser of ["chrome", "edge", "firefox"]) {
  const base = `dist/${browser}`;
  const manifest = JSON.parse(await readFile(`${base}/manifest.json`, "utf8"));
  if (
    JSON.stringify(manifest) !==
    JSON.stringify(createManifest(browser, pkg.version))
  )
    throw new Error(`Manifest drift: ${browser}`);
  verifyIcons(`${base}/icons`);
  for (const name of [
    "detector.js",
    "viewer.js",
    "document-worker.js",
    "popup.js",
    "viewer.html",
    "popup.html",
  ]) {
    const path = `${base}/${name}`;
    if (!(await stat(path)).size) throw new Error(`Empty artifact: ${path}`);
    const source = await readFile(path, "utf8");
    if (/localhost:|127\.0\.0\.1:|@vite\/client|eval\(/.test(source))
      throw new Error(`Development/unsafe code: ${path}`);
  }
  for (const [file, limit] of [
    ["detector.js", 5 * 1024],
    ["viewer.js", 100 * 1024],
  ] as const) {
    const size = gzipSync(await readFile(`${base}/${file}`)).length;
    if (size > limit)
      throw new Error(`Bundle budget exceeded ${browser}/${file}: ${size}`);
    console.log(`${browser}/${file}: ${size} bytes gzip`);
  }
}
console.log(
  "Versions, icons, entries, manifests, CSP and size budgets verified. Browser execution remains a separate required check.",
);

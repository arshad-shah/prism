import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { prismMarkSvg, BRAND, MARK } from "../src/brand/mark";
const check = process.argv.includes("--check");
const sizes = [16, 32, 48, 128];
const vectors = {
  "icons/icon.svg": prismMarkSvg(),
  "icons/brand/prism-color.svg": prismMarkSvg(),
  "icons/brand/prism-ink.svg": prismMarkSvg("ink"),
  "icons/brand/prism-light.svg": prismMarkSvg("light"),
};
if (!check) await mkdir("icons/brand", { recursive: true });
for (const [file, content] of Object.entries(vectors)) {
  if (check) {
    if ((await readFile(file, "utf8")) !== content)
      throw new Error(`Stale brand asset: ${file}`);
  } else await writeFile(file, content);
}
if (check) {
  for (const size of sizes) {
    const png = await readFile(`icons/icon-${size}.png`);
    if (png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size)
      throw new Error(`Wrong icon dimensions: ${size}`);
  }
  console.log("Prism vectors and PNG dimensions verified.");
} else {
  const result = spawnSync("python3", ["tools/render-icons.py"], {
    input: JSON.stringify({
      shapes: MARK.polygons,
      seams: MARK.seams,
      viewBox: MARK.viewBox,
      strokeWidth: MARK.strokeWidth,
      sizes,
      stroke: BRAND.light,
    }),
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr);
  console.log(result.stdout.trim());
}

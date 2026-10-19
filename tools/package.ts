import { execFileSync } from "node:child_process";
import { lstat } from "node:fs/promises";
import "./check-source";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { deterministicZip } from "../build/archive";
import "./verify-package";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
async function collect(
  root: string,
  prefix = "",
  exclude = new Set<string>(),
): Promise<{ path: string; data: Buffer }[]> {
  const files: { path: string; data: Buffer }[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (exclude.has(entry.name) || entry.name.endsWith(".log")) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(root, entry.name);
    if (entry.isDirectory())
      files.push(...(await collect(full, relative, exclude)));
    else if (entry.isFile())
      files.push({ path: relative, data: await readFile(full) });
  }
  return files;
}
await mkdir("artifacts", { recursive: true });
const sums: string[] = [];
for (const browser of ["chrome", "edge", "firefox"]) {
  const name = `prism-${pkg.version}-${browser}.zip`;
  const data = deterministicZip(await collect(`dist/${browser}`));
  await writeFile(`artifacts/${name}`, data);
  sums.push(`${createHash("sha256").update(data).digest("hex")}  ${name}`);
}
const sourcePaths = execFileSync("git", ["ls-files", "--cached", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
if (!sourcePaths.length)
  throw new Error(
    "Stage reviewed source files before creating a source archive.",
  );
const sourceFiles = [];
for (const path of sourcePaths) {
  if (!(await lstat(path)).isFile())
    throw new Error(`Source must be regular files: ${path}`);
  sourceFiles.push({ path, data: execFileSync("git", ["show", `:${path}`]) });
}
const source = deterministicZip(sourceFiles);
const name = `prism-${pkg.version}-source.zip`;
await writeFile(`artifacts/${name}`, source);
sums.push(`${createHash("sha256").update(source).digest("hex")}  ${name}`);
await writeFile("artifacts/SHA256SUMS", sums.join("\n") + "\n");
await writeFile(
  `artifacts/prism-${pkg.version}-release-notes.md`,
  await readFile("CHANGELOG.md"),
);
await writeFile(
  "artifacts/STATUS.md",
  "# Local candidate artifacts\n\nPackage structure and size checks passed. These archives are not approved for publication until actual browser tests, visual review, store screenshots, and clean-checkout verification pass.\n",
);
console.log(
  "Deterministic local candidate archives and checksums generated; see artifacts/STATUS.md.",
);

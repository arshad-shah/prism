import { execFileSync } from "node:child_process";
import { readFile, lstat } from "node:fs/promises";
const entries = execFileSync("git", ["ls-files", "--stage", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
if (!entries.length) throw new Error("No staged/tracked source to inspect.");
const forbidden =
  /(^|\/)(?:\.env(?:\..*)?|node_modules|\.superpowers|artifacts|dist|storybook-static|HANDOFF\.md|progress\.md)(?:\/|$)|^docs\/superpowers\/|\.(?:pem|key|p12)$/i;
const rules = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{30,}/,
  /AKIA[0-9A-Z]{16}/,
  /sk-[A-Za-z0-9]{32,}/,
  /\/Users\/[A-Za-z][^\s"']*/,
];
for (const entry of entries) {
  const tab = entry.indexOf("\t");
  const [mode, hash, stage] = entry.slice(0, tab).split(" ");
  const path = entry.slice(tab + 1);
  if (forbidden.test(path))
    throw new Error(`Private/local path in source index: ${path}`);
  if (
    !["100644", "100755"].includes(mode) ||
    stage !== "0" ||
    !(await lstat(path)).isFile()
  )
    throw new Error(`Unsafe source entry: ${path}`);
  const staged = execFileSync("git", ["cat-file", "blob", hash]);
  const working = await readFile(path);
  if (!staged.equals(working))
    throw new Error(`Restage reviewed changes before packaging: ${path}`);
  if (/\.(png|jpg|jpeg|ico|woff2?)$/.test(path)) continue;
  if (rules.some((rule) => rule.test(staged.toString("utf8"))))
    throw new Error(`Potential secret or workstation path: ${path}`);
}
console.log(
  `Reviewed ${entries.length} indexed blobs for local paths, credential patterns, symlinks and working-tree drift. Manual review remains required.`,
);

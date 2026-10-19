import { it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
const checker = resolve("tools/check-source.ts");
it("rejects staged secrets hidden by a clean working copy and private plan files", () => {
  const root = mkdtempSync(join(tmpdir(), "prism-source-safety-"));
  try {
    execFileSync("git", ["init", "--quiet"], { cwd: root });
    writeFileSync(join(root, "sample.ts"), "ghp" + "_" + "x".repeat(32));
    execFileSync("git", ["add", "sample.ts"], { cwd: root });
    writeFileSync(join(root, "sample.ts"), "export const safe = true;\n");
    let result = spawnSync(process.execPath, [checker], {
      cwd: root,
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Restage reviewed changes");
    execFileSync("git", ["add", "sample.ts"], { cwd: root });
    result = spawnSync(process.execPath, [checker], {
      cwd: root,
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    mkdirSync(join(root, "docs/superpowers"), { recursive: true });
    writeFileSync(join(root, "docs/superpowers/local.md"), "Local review");
    execFileSync("git", ["add", "docs"], { cwd: root });
    result = spawnSync(process.execPath, [checker], {
      cwd: root,
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Private/local path");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

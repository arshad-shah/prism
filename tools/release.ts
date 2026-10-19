import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { buildFingerprint } from "../build/fingerprint";
const runner = process.env.npm_execpath;
if (!runner || !process.env.npm_config_user_agent?.startsWith("pnpm/10.4.1 "))
  throw new Error("Run release:prepare with pinned pnpm 10.4.1.");
function command(task: string, env: NodeJS.ProcessEnv = process.env) {
  const result = spawnSync(process.execPath, [runner!, task], {
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) throw new Error(`Release stopped: ${task}`);
}
const status = spawnSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
});
if (status.status !== 0 || status.stdout.trim())
  throw new Error(
    "Release requires a reviewed, committed clean source tree. Use pnpm package for local candidates.",
  );
for (const task of [
  "check:source",
  "lint",
  "typecheck",
  "test",
  "test:stories",
  "layers",
  "brand:check",
  "build",
  "test:build",
  "bench",
  "test:browser",
  "test:firefox",
  "check:browser",
  "verify-package",
])
  command(task);
command("test:browser", { ...process.env, PRISM_BROWSER: "msedge" });
const fingerprint = await buildFingerprint();
for (const browser of ["chromium", "edge", "firefox"]) {
  const report = JSON.parse(
    await readFile(`artifacts/reports/${browser}-integration.json`, "utf8"),
  );
  if (
    report.fingerprint !== fingerprint ||
    !Array.isArray(report.checks) ||
    !report.checks.length
  )
    throw new Error(`Missing/stale ${browser} integration evidence`);
}
const quality = JSON.parse(
  await readFile("artifacts/reports/browser-quality.json", "utf8"),
);
if (
  quality.fingerprint !== fingerprint ||
  quality.performance.interactiveGate !== true ||
  quality.performance.longTaskGate !== true ||
  quality.accessibility.some(
    (theme: { violations: unknown[] }) => theme.violations.length,
  )
)
  throw new Error("Browser quality gates failed or are stale");
const manual = JSON.parse(
  await readFile("artifacts/reports/manual-release-review.json", "utf8"),
);
if (manual.fingerprint !== fingerprint)
  throw new Error(
    "Manual release evidence must match current build fingerprint",
  );
for (const field of [
  "nativeXsltAndCsp",
  "clipboardAndDownload",
  "screenReader",
  "detectorP95",
  "idleProfile",
  "largeFixtures",
  "visualReview",
]) {
  if (manual[field] !== true)
    throw new Error(`Manual release gate incomplete: ${field}`);
}
for (const name of [
  "01-json",
  "02-xml",
  "03-search",
  "04-analysis",
  "05-recovery",
])
  await stat(`store/screenshots/out/${name}.png`);
command("package");
console.log(
  "Local release gates passed. Store submission is a separate authorized action.",
);

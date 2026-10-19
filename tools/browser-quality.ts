import { buildFingerprint } from "../build/fingerprint";
import { chromium } from "playwright";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { cpus, platform, arch } from "node:os";
import { createRequire } from "node:module";
import { documents } from "../store/fixtures/documents";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const axe = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const files: Record<string, string> = {};
for (const name of ["viewer.html", "viewer.js", "document-worker.js"])
  files[name] = await readFile(`dist/chrome/${name}`, "utf8");
const browser = await chromium.launch({ headless: true });
const browserErrors: string[] = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  page.on("pageerror", (e) => browserErrors.push(e.message));
  await page.route("https://prism.test/**", (route) => {
    const name = new URL(route.request().url()).pathname.slice(1);
    return route.fulfill({
      status: 200,
      contentType: name.endsWith(".js")
        ? "application/javascript"
        : "text/html",
      body: files[name] ?? "",
    });
  });
  await page.goto("https://prism.test/viewer.html");
  await page.getByLabel("Document source").fill(documents.json);
  await page
    .getByRole("button", { name: "Open document", exact: true })
    .click();
  await page.getByRole("tree").waitFor();
  await page.getByRole("treeitem").nth(1).click();
  const themes = [];
  await page.evaluate(axe);
  for (const theme of ["light", "dark", "contrast"]) {
    const violations = await page.evaluate(async () => {
      const w = window as unknown as {
        axe: {
          run: (context: HTMLElement) => Promise<{
            violations: {
              id: string;
              nodes: { target: string[]; failureSummary: string }[];
            }[];
          }>;
        };
      };
      return (await w.axe.run(document.body)).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      }));
    });
    themes.push({ theme, violations });
    await mkdir("artifacts/review", { recursive: true });
    await page.screenshot({ path: `artifacts/review/${theme}.png` });
    await page.getByRole("button", { name: "Change theme" }).click();
  }
  await page.setViewportSize({ width: 900, height: 700 });
  await page.screenshot({ path: "artifacts/review/narrow.png" });
  const times: number[] = [];
  const longTasks: number[][] = [];
  const source = JSON.stringify({
    items: Array.from({ length: 6000 }, (_, i) => ({
      id: i,
      name: `item-${i}`,
      value: "x".repeat(130),
    })),
  });
  for (let repeat = 0; repeat < 7; repeat++) {
    await page.goto("https://prism.test/viewer.html");
    await page.getByLabel("Document source").fill(source);
    await page.evaluate(() => {
      const w = window as unknown as {
        prismTiming: { start: number; duration: number; tasks: number[] };
      };
      w.prismTiming = { start: 0, duration: 0, tasks: [] };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (entry.startTime >= w.prismTiming.start)
            w.prismTiming.tasks.push(entry.duration);
      }).observe({ type: "longtask" });
      document.querySelector(".empty .primary")!.addEventListener(
        "click",
        () => {
          w.prismTiming.start = performance.now();
          const observer = new MutationObserver(() => {
            if (document.querySelector("[role=tree]")) {
              requestAnimationFrame(() => {
                w.prismTiming.duration =
                  performance.now() - w.prismTiming.start;
              });
              observer.disconnect();
            }
          });
          observer.observe(document.getElementById("app")!, {
            subtree: true,
            childList: true,
          });
        },
        { once: true },
      );
    });
    await page
      .getByRole("button", { name: "Open document", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        (window as unknown as { prismTiming: { duration: number } }).prismTiming
          .duration > 0,
    );
    const result = await page.evaluate(
      () =>
        (
          window as unknown as {
            prismTiming: { duration: number; tasks: number[] };
          }
        ).prismTiming,
    );
    times.push(result.duration);
    longTasks.push(result.tasks);
  }
  const sorted = [...times].sort((a, b) => a - b);
  const report = {
    fingerprint: await buildFingerprint(),
    browser: browser.version(),
    checkedAt: new Date().toISOString(),
    environment: { platform: platform(), arch: arch(), cpu: cpus()[0].model },
    accessibility: themes,
    performance: {
      fixtureBytes: Buffer.byteLength(source),
      runs: times,
      p50: sorted[3],
      p95: sorted[6],
      longTasks,
      interactiveGate: sorted[6] <= 500,
      longTaskGate: longTasks.flat().every((ms) => ms <= 50),
      scope:
        "Production viewer and real workers; timing starts after paste at Open document and ends at tree paint. Includes worker startup/model transfer; excludes native-page acquisition. Seven runs in one browser session.",
    },
  };
  await mkdir("artifacts/reports", { recursive: true });
  await writeFile(
    "artifacts/reports/browser-quality.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  assert.equal(
    themes.flatMap((t) => t.violations).length,
    0,
    "Browser accessibility violations",
  );
  assert.equal(
    report.performance.interactiveGate,
    true,
    "Browser interactive p95 exceeded 500ms",
  );
  assert.equal(
    report.performance.longTaskGate,
    true,
    "Browser processing long task exceeded 50ms",
  );
  assert.equal(browserErrors.length, 0, browserErrors.join("\n"));
} finally {
  await browser.close();
}

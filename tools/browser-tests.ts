import { buildFingerprint } from "../build/fingerprint";
import { chromium, type Page, type Frame } from "playwright";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
const channel = process.env.PRISM_BROWSER || "chromium";
const browserName = channel === "msedge" ? "edge" : "chromium";
const packageName = channel === "msedge" ? "edge" : "chrome";
const large = JSON.stringify({
  items: Array.from({ length: 6000 }, (_, i) => ({
    id: i,
    name: `item-${i}`,
    value: "x".repeat(120),
  })),
});
const server = createServer((req, res) => {
  const fixtures: Record<string, [string, string]> = {
    "/data.json": [
      "application/json",
      '{"project":"Prism","nested":{"ready":true},"items":[1,2,3]}',
    ],
    "/scalar.json": ["application/json", "42"],
    "/data.xml": [
      "application/xml",
      '<project xmlns:x="urn:test" name="Prism"><x:ready>true</x:ready><![CDATA[plain <text>]]></project>',
    ],
    "/art.svg": [
      "image/svg+xml",
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="30"/></svg>',
    ],
    "/malformed.json": ["application/json", "{"],
    "/large.json": ["application/json", large],
    "/plain.txt": ["text/plain", '{"plain":true}'],
    "/hostile.json": [
      "application/json",
      JSON.stringify({
        payload: "<img src=x onerror=alert(1)>",
        url: "javascript:alert(1)",
      }),
    ],
  };
  const [mime, body] = fixtures[req.url || ""] || [
    "text/html",
    "<main>Ordinary application</main>",
  ];
  res.setHeader("Content-Type", mime);
  res.end(body);
});
await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const profile = await mkdtemp(resolve(tmpdir(), "prism-browser-"));
let context: import("playwright").BrowserContext | undefined;
const checks: string[] = [];
async function viewer(page: Page): Promise<Frame> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const frame = page
      .frames()
      .find(
        (f) =>
          f.url().includes("-extension://") && f.url().includes("viewer.html"),
      );
    if (frame) return frame;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Extension viewer frame did not attach");
}
try {
  context = await chromium.launchPersistentContext(profile, {
    channel,
    headless: true,
    args: [
      `--disable-extensions-except=${resolve(`dist/${packageName}`)}`,
      `--load-extension=${resolve(`dist/${packageName}`)}`,
    ],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  assert.equal(await page.locator("#prism-host").count(), 0);
  checks.push("ordinary HTML untouched");
  await page.goto(`${origin}/data.json`);
  let frame = await viewer(page);
  await frame.getByRole("tree").waitFor();
  assert.equal(await frame.getByRole("treeitem").count(), 8);
  await frame.getByRole("searchbox").fill("ready");
  await frame.getByRole("button", { name: "Next match", exact: true }).click();
  assert.match(
    await frame
      .getByRole("region", { name: "Selected full value" })
      .innerText(),
    /true/,
  );
  await frame.getByRole("button", { name: "Raw", exact: true }).click();
  assert.equal(
    await frame.locator("textarea").inputValue(),
    '{"project":"Prism","nested":{"ready":true},"items":[1,2,3]}',
  );
  await frame.getByRole("button", { name: "Close viewer" }).click();
  assert.equal(await page.locator("#prism-host").count(), 0);
  checks.push(
    "native JSON, worker search, inspector, exact raw recovery, teardown",
  );
  await page.goto(`${origin}/data.xml`);
  frame = await viewer(page);
  await frame.getByRole("tree").waitFor();
  assert.match(await frame.locator("footer").innerText(), /Reconstructed XML/);
  checks.push("native XML namespaces and reconstructed fidelity");
  for (const name of ["scalar.json", "plain.txt"]) {
    await page.goto(`${origin}/${name}`);
    await (await viewer(page)).getByRole("tree").waitFor();
  }
  checks.push("scalar JSON and plain-text data");
  await page.goto(`${origin}/art.svg`);
  assert.equal(await page.locator("#prism-host").count(), 0);
  checks.push("SVG artwork untouched");
  await page.goto(`${origin}/malformed.json`);
  frame = await viewer(page);
  await frame.getByRole("alert").waitFor();
  assert.equal(await frame.locator("textarea").inputValue(), "{");
  checks.push("malformed-source recovery");
  await page.goto(`${origin}/hostile.json`);
  frame = await viewer(page);
  await frame.getByRole("tree").waitFor();
  assert.equal(
    await frame.locator("img[onerror],a[href^='javascript:']").count(),
    0,
  );
  checks.push("hostile text and unsafe links");
  await page.goto(`${origin}/large.json`);
  frame = await viewer(page);
  await frame.getByRole("tree").waitFor();
  await frame.getByRole("button", { name: "Expand all", exact: true }).click();
  assert.ok((await frame.getByRole("treeitem").count()) < 100);
  await frame.getByRole("tree").focus();
  await page.keyboard.press("End");
  await frame.locator('[role="treeitem"][aria-selected="true"]').waitFor();
  assert.equal(
    await frame
      .getByRole("tree")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  assert.ok((await frame.getByRole("treeitem").count()) < 100);
  checks.push("large document virtualization and keyboard focus recycling");
  await page.setViewportSize({ width: 900, height: 700 });
  assert.equal(
    await frame
      .locator(".shell")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
    true,
  );
  checks.push("narrow desktop layout");
  assert.equal(errors.length, 0, errors.join("\n"));
  await mkdir("artifacts/reports", { recursive: true });
  await writeFile(
    `artifacts/reports/${browserName}-integration.json`,
    JSON.stringify(
      {
        fingerprint: await buildFingerprint(),
        browser: browserName,
        version: context.browser()?.version(),
        checkedAt: new Date().toISOString(),
        checks,
      },
      null,
      2,
    ),
  );
  console.log(`${browserName}: ${checks.length} integration checks passed.`);
} finally {
  await context?.close();
  server.close();
  await rm(profile, { recursive: true, force: true });
}

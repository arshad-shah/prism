import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { SCREENSHOTS, ASSET_SIZES } from "../store/recipes";
import { documents } from "../store/fixtures/documents";
await mkdir("store/screenshots/out", { recursive: true });
const files: Record<string, string> = {};
for (const name of ["viewer.html", "viewer.js", "document-worker.js"])
  files[name] = await readFile(`dist/chrome/${name}`, "utf8");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: ASSET_SIZES.screenshot,
    deviceScaleFactor: 1,
  });
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
  for (const recipe of SCREENSHOTS) {
    await page.goto("https://prism.test/viewer.html");
    await page
      .getByRole("textbox", { name: "Document source" })
      .fill(documents[recipe.fixture]);
    await page.getByLabel("Document format").selectOption(recipe.format);
    await page
      .getByRole("button", { name: "Open document", exact: true })
      .click();
    if (recipe.action === "error") await page.getByRole("alert").waitFor();
    else await page.getByRole("tree").waitFor();
    if (recipe.action !== "error")
      await page.getByRole("treeitem").nth(1).click();
    if (recipe.action === "search") {
      await page.getByRole("searchbox").fill("enabled");
      await page
        .getByRole("button", { name: "Next match", exact: true })
        .waitFor({ state: "visible" });

      await page
        .getByRole("button", { name: "Next match", exact: true })
        .click();
    }
    if (recipe.action === "analysis")
      await page.getByRole("button", { name: "Analysis", exact: true }).click();
    await page.screenshot({ path: `store/screenshots/out/${recipe.name}.png` });
  }
  console.log(
    "Captured five production Viewer screenshots at 1280×800 using synthetic fixtures.",
  );
} finally {
  await browser.close();
}

import { it, expect } from "vitest";
import { createManifest } from "../../build/manifest";
it("declares only required resources and one version", () => {
  const chrome = createManifest("chrome", "1.2.3");
  const firefox = createManifest("firefox", "1.2.3");
  expect(chrome.version).toBe("1.2.3");
  expect(firefox.version).toBe("1.2.3");
  expect(chrome.content_scripts[0].js).toEqual(["detector.js"]);
  expect(chrome.permissions).toEqual(["storage"]);
  expect(chrome.web_accessible_resources[0].resources).toEqual([
    "viewer.html",
    "viewer.js",
    "document-worker.js",
  ]);
  expect(chrome.content_security_policy.extension_pages).not.toContain(
    "unsafe-eval",
  );
  expect(
    firefox.browser_specific_settings?.gecko.data_collection_permissions
      .required,
  ).toEqual(["none"]);
});

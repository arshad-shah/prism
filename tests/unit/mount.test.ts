import { it, expect, vi } from "vitest";
import { JSDOM } from "jsdom";
import { build } from "esbuild";
it("mounts over native XML without assuming HTML style APIs", async () => {
  const output = await build({
    entryPoints: ["src/content/detector.ts"],
    bundle: true,
    write: false,
    format: "iife",
  });
  const dom = new JSDOM("<r><a/></r>", {
    contentType: "application/xml",
    url: "https://example.test/data.xml",
    runScripts: "outside-only",
  });
  const win = dom.window;
  const child = { postMessage: vi.fn() };
  Object.defineProperty(win.HTMLIFrameElement.prototype, "contentWindow", {
    get: () => child,
  });
  Object.defineProperty(win, "chrome", {
    value: {
      runtime: {
        getURL: () => "chrome-extension://testid/viewer.html",
        onMessage: { addListener: () => {} },
      },
    },
  });
  expect(() => win.eval(output.outputFiles[0].text)).not.toThrow();
  const host = win.document.querySelector("#prism-host")!;
  expect(host).not.toBeNull();
  expect((host as HTMLElement).style.display).toBe("none");
  const frame = host.shadowRoot!.querySelector("iframe")!;
  const send = vi.spyOn(frame.contentWindow!, "postMessage");
  const token = frame.src.split("#")[1];
  win.dispatchEvent(
    new win.MessageEvent("message", {
      source: frame.contentWindow,
      origin: "chrome-extension://testid",
      data: { type: "ready", token },
    }),
  );
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({ type: "source", format: "xml" }),
    "chrome-extension://testid",
  );
  win.dispatchEvent(
    new win.MessageEvent("message", {
      source: frame.contentWindow,
      origin: "chrome-extension://testid",
      data: { type: "close", token },
    }),
  );
  expect(win.document.querySelector("#prism-host")).toBeNull();
  expect(win.document.documentElement.tagName).toBe("r");
  dom.window.close();
});

it("removes an unready iframe mount so the native source remains usable", async () => {
  const output = await build({
    entryPoints: ["src/content/detector.ts"],
    bundle: true,
    write: false,
    format: "iife",
  });
  const dom = new JSDOM("<r/>", {
    contentType: "application/xml",
    url: "https://example.test/data.xml",
    runScripts: "outside-only",
  });
  const win = dom.window;
  Object.defineProperty(win, "chrome", {
    value: {
      runtime: {
        getURL: () => "chrome-extension://testid/viewer.html",
        onMessage: { addListener: () => {} },
      },
    },
  });
  vi.useFakeTimers();
  try {
    win.eval(output.outputFiles[0].text);
    expect(win.document.querySelector("#prism-host")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(10001);
    expect(win.document.querySelector("#prism-host")).toBeNull();
    expect(win.document.documentElement.tagName).toBe("r");
  } finally {
    dom.window.close();
    vi.useRealTimers();
  }
});

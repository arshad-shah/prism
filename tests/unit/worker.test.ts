import { afterEach, expect, it, vi } from "vitest";
import { createProcessor } from "../../src/platform/worker-client";
import { parseDocument } from "../../src/core/parse";
afterEach(() => vi.unstubAllGlobals());
it("terminates superseded searches while retaining a concurrent parse", async () => {
  const workers: FakeWorker[] = [];
  class FakeWorker {
    terminated = false;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() {
      workers.push(this);
    }
    postMessage() {}
    terminate() {
      this.terminated = true;
    }
  }
  vi.stubGlobal("Worker", FakeWorker);
  vi.stubGlobal("location", { href: "https://example.test/viewer.html" });
  const processor = createProcessor();
  const parse = processor.parse("{}", "json").catch((e) => e.code);
  const model = parseDocument('{"name":"Prism"}', "json");
  const options = {
    query: "one",
    field: "all" as const,
    regex: false,
    caseSensitive: false,
  };
  const first = processor.search(model, options).catch((e) => e.code);
  const second = processor
    .search(model, { ...options, query: "two" })
    .catch((e) => e.code);
  expect(workers[1].terminated).toBe(true);
  expect(workers[0].terminated).toBe(false);
  processor.cancel();
  expect(await first).toBe("CANCELLED");
  expect(await second).toBe("CANCELLED");
  expect(await parse).toBe("CANCELLED");
});

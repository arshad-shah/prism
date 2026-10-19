import { expect, it } from "vitest";
import { parseDocument } from "../../src/core/parse";
it("indexes wide sibling lists within a linear-time budget", () => {
  const source = `[${Array.from({ length: 25000 }, () => "1").join(",")}]`;
  const start = performance.now();
  const model = parseDocument(source, "json");
  expect(model.nodes).toHaveLength(25001);
  expect(performance.now() - start).toBeLessThan(500);
}, 10000);

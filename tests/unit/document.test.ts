import { expect, it } from "vitest";
import { parseDocument } from "../../src/core/parse";
import { pathFor } from "../../src/core/path";
import { visibleNodes } from "../../src/core/visibility";
import { searchModel } from "../../src/core/search";
it("handles primitives and escaped key paths", () => {
  expect(parseDocument("null", "json").nodes[0].kind).toBe("null");
  const m = parseDocument('{"a.b":[true]}', "json");
  expect(pathFor(m, 2)).toBe('$["a.b"][0]');
  expect(visibleNodes(m, new Set([0]))).toEqual([0]);
  expect(
    searchModel(m, {
      query: "true",
      field: "value",
      caseSensitive: false,
      regex: false,
    }),
  ).toEqual([2]);
});
it("rejects malformed, deep and oversized documents", () => {
  expect(() => parseDocument("{", "json")).toThrow();
  expect(() =>
    parseDocument(`${"[".repeat(514)}0${"]".repeat(514)}`, "json"),
  ).toThrow(/depth/i);
  expect(() => parseDocument(" ".repeat(20 * 1024 * 1024 + 1), "json")).toThrow(
    /size/i,
  );
});
it("preserves XML mixed content and namespaces", () => {
  const m = parseDocument(
    '<r xmlns:x="urn:x">a<x:b/>c<![CDATA[<d>]]></r>',
    "xml",
  );
  expect(m.nodes.filter((n) => n.kind === "text").map((n) => n.value)).toEqual([
    "a",
    "c",
  ]);
  expect(m.nodes.some((n) => n.kind === "cdata" && n.value === "<d>")).toBe(
    true,
  );
  expect(pathFor(m, m.nodes.find((n) => n.name === "x:b")!.id)).toBe(
    "/r[1]/x:b[1]",
  );
});
it("rejects XML DTDs and invalid syntax", () => {
  expect(() =>
    parseDocument('<!DOCTYPE r SYSTEM "https://invalid.test/a"><r/>', "xml"),
  ).toThrow(/DTD/i);
  expect(() => parseDocument("<r>", "xml")).toThrow();
});
it("retains normalization warnings and safely searches invalid regex", () => {
  expect(
    parseDocument('{"n":9007199254740993,"n":1}', "json").warnings.length,
  ).toBeGreaterThan(0);
  expect(() =>
    searchModel(parseDocument("{}", "json"), {
      query: "[",
      field: "all",
      caseSensitive: false,
      regex: true,
    }),
  ).toThrow();
});

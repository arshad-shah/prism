import { it, expect } from "vitest";
import { normalizePreferences } from "../../src/state/preferences";
it("migrates preferences and discards document data", () => {
  expect(normalizePreferences({ theme: "dark", document: "secret" })).toEqual({
    schema: 1,
    theme: "dark",
  });
  expect(normalizePreferences({ schema: 99, theme: "unsafe" })).toEqual({
    schema: 1,
    theme: "light",
  });
  expect(normalizePreferences(null)).toEqual({ schema: 1, theme: "light" });
});

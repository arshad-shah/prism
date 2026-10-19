import { it, expect } from "vitest";
import { safeUrl } from "../../src/core/url";
it("links only explicit HTTP and HTTPS values", () => {
  expect(safeUrl("https://example.test/a?b=1")).toBe(
    "https://example.test/a?b=1",
  );
  for (const input of [
    "javascript:alert(1)",
    "data:text/html,<script>x</script>",
    "file:///secret",
    "//example.test",
    "https://bad host",
  ])
    expect(safeUrl(input)).toBeNull();
});

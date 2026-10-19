// @vitest-environment jsdom
import { it, expect } from "vitest";
import { render } from "preact";
import { Icon, type IconName } from "../../src/ui/Icon";
it("renders shared scalable vector controls without text glyphs", () => {
  const root = document.createElement("div");
  for (const name of [
    "close",
    "next",
    "previous",
    "theme",
    "chevronDown",
    "chevronRight",
    "leaf",
    "copy",
    "download",
    "tree",
    "code",
    "analysis",
    "expand",
    "collapse",
    "folder",
    "case",
    "regex",
    "retry",
    "search",
  ] as IconName[]) {
    render(<Icon name={name} />, root);
    expect(root.querySelector("svg")?.getAttribute("viewBox")).toBe(
      "0 0 24 24",
    );
    expect(
      root.querySelectorAll("path,circle,rect,line,polyline").length,
    ).toBeGreaterThan(0);
    expect(root.textContent).toBe("");
    expect(root.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  }
  render(null, root);
});

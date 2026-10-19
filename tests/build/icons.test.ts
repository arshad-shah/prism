import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { verifyIcons } from "../../build/icons";
it("refuses packaging without every manifest icon", () => {
  expect(() => verifyIcons("/missing-icons")).toThrow(/icon/);
  for (const size of [16, 32, 48, 128]) {
    const png = readFileSync(`icons/icon-${size}.png`);
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
  }
  expect(() => verifyIcons("icons")).not.toThrow();
});

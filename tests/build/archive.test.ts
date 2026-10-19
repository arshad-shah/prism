import { it, expect } from "vitest";
import { deterministicZip } from "../../build/archive";
it("normalizes ZIP order and metadata for reproducible packages", () => {
  const first = deterministicZip([
    { path: "b.txt", data: Buffer.from("b") },
    { path: "a.txt", data: Buffer.from("a") },
  ]);
  const second = deterministicZip([
    { path: "a.txt", data: Buffer.from("a") },
    { path: "b.txt", data: Buffer.from("b") },
  ]);
  expect(first.equals(second)).toBe(true);
  expect(first.readUInt32LE(0)).toBe(0x04034b50);
  expect(() =>
    deterministicZip([{ path: "../bad", data: Buffer.alloc(0) }]),
  ).toThrow();
});

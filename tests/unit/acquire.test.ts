import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { detectDocument, acquireSource } from "../../src/platform/acquire";
describe("conservative source acquisition", () => {
  it("detects raw JSON without parsing it", () => {
    const d = new JSDOM('<pre>{"a":1}</pre>', { contentType: "text/html" })
      .window.document;
    Object.defineProperty(d, "contentType", { value: "application/json" });
    expect(detectDocument(d)).toBe("json");
    expect(acquireSource(d)?.text).toBe('{"a":1}');
  });
  it("ignores application HTML and SVG artwork", () => {
    expect(
      detectDocument(new JSDOM('<main>{"a":1}</main>').window.document),
    ).toBeNull();
    expect(
      detectDocument(
        new JSDOM('<svg xmlns="http://www.w3.org/2000/svg"/>', {
          contentType: "image/svg+xml",
        }).window.document,
      ),
    ).toBeNull();
  });
  it("serializes native XML with honest fidelity", () => {
    const d = new JSDOM("<r><a/></r>", { contentType: "application/xml" })
      .window.document;
    expect(detectDocument(d)).toBe("xml");
    expect(acquireSource(d)?.fidelity).toBe("reconstructed");
  });
});

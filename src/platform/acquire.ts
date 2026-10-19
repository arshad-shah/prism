/** Detection is bounded: ordinary application DOM is never scanned. */
export function detectDocument(document: Document): "json" | "xml" | null {
  const mime = document.contentType.split(";")[0].toLowerCase();
  if (mime === "application/json" || mime.endsWith("+json")) return "json";
  if (mime === "image/svg+xml" || mime === "application/xhtml+xml") return null;
  if (
    mime === "text/xml" ||
    mime === "application/xml" ||
    mime.endsWith("+xml")
  )
    return "xml";
  if (mime === "text/plain") {
    const prefix = document.body?.textContent?.slice(0, 256).trimStart() ?? "";
    if (/^[[{]/.test(prefix)) return "json";
    if (prefix.startsWith("<?xml")) return "xml";
  }
  return null;
}
export function acquireSource(document: Document): {
  text: string;
  fidelity: "exact" | "reconstructed";
  format: "json" | "xml";
} | null {
  const format = detectDocument(document);
  if (!format) return null;
  if (format === "json" || document.contentType === "text/plain") {
    return {
      text: document.body?.textContent ?? "",
      fidelity: "exact",
      format,
    };
  }
  const nativeSource = document.querySelector("#webkit-xml-viewer-source-xml");
  const root = nativeSource?.firstElementChild ?? document.documentElement;
  if (!root || root.namespaceURI === "http://www.w3.org/1999/xhtml")
    return null;
  const Serializer = document.defaultView?.XMLSerializer ?? XMLSerializer;
  return {
    text: new Serializer().serializeToString(root),
    fidelity: "reconstructed",
    format,
  };
}

import type { Format } from "../contracts/document";
import { PrismError } from "../contracts/error";
import { parseJson } from "../formats/json/parse";
import { parseXml } from "../formats/xml/parse";
export function parseDocument(source: string, format: Format) {
  if (
    source.length > 20 * 1024 * 1024 ||
    new TextEncoder().encode(source).byteLength > 20 * 1024 * 1024
  )
    throw new PrismError("SIZE_LIMIT", "Source size exceeds 20 MiB.");
  try {
    return format === "json" ? parseJson(source) : parseXml(source);
  } catch (error) {
    if (error instanceof PrismError) throw error;
    throw new PrismError(
      "INVALID_SOURCE",
      error instanceof Error ? error.message : "Unable to parse source.",
    );
  }
}

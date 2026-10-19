import { SaxesParser } from "saxes";
import { createModel, addNode } from "../../core/indexer";
import { PrismError } from "../../contracts/error";
/** SAX events preserve mixed-content order without a recursive DOM walk. */
export function parseXml(source: string) {
  const model = createModel("xml");
  const stack: number[] = [];
  const parser = new SaxesParser({ xmlns: true });
  const add = (kind: string, name: string, value: string, namespace?: string) =>
    addNode(model, stack.at(-1) ?? null, kind, name, value, namespace);
  parser.on("doctype", () => {
    throw new PrismError(
      "DTD_UNSUPPORTED",
      "DTD declarations are unsupported; external entities are never resolved.",
    );
  });
  parser.on("error", (error) => {
    throw error;
  });
  parser.on("opentag", (tag) => {
    const id = add("element", tag.name, "", tag.uri);
    stack.push(id);
    for (const attr of Object.values(tag.attributes))
      add("attribute", attr.name, attr.value, attr.uri);
  });
  parser.on("closetag", () => {
    stack.pop();
  });
  parser.on("text", (value) => {
    if (stack.length && value) add("text", "#text", value);
  });
  parser.on("cdata", (value) => add("cdata", "#cdata", value));
  parser.on("comment", (value) => add("comment", "#comment", value));
  parser.on("processinginstruction", (pi) =>
    add("instruction", pi.target, pi.body),
  );
  parser.write(source).close();
  return model;
}

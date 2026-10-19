import { createModel, addNode } from "../../core/indexer";
/** Raw source stays separate: the normalized tree does not claim lexical fidelity. */
export function parseJson(source: string) {
  const data: unknown = JSON.parse(source);
  const model = createModel("json");
  model.warnings.push(
    "Tree values are normalized: numeric precision and duplicate keys may differ. Raw view and download preserve source.",
  );
  const stack: { value: unknown; name: string; parent: number | null }[] = [
    { value: data, name: "$", parent: null },
  ];
  while (stack.length) {
    const item = stack.pop()!;
    const value = item.value;
    const kind =
      value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    const shown =
      kind === "object"
        ? "{}"
        : kind === "array"
          ? "[]"
          : typeof value === "string"
            ? value
            : String(value);
    const id = addNode(model, item.parent, kind, item.name, shown);
    if (value !== null && typeof value === "object") {
      const entries = Object.entries(value);
      for (let i = entries.length - 1; i >= 0; i--)
        stack.push({ value: entries[i][1], name: entries[i][0], parent: id });
    }
  }
  return model;
}

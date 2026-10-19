import type { DocumentModel } from "../contracts/document";
export function pathFor(model: DocumentModel, id: number): string {
  const parts: string[] = [];
  let node = model.nodes[id];
  while (node) {
    if (model.format === "xml")
      parts.push(
        node.kind === "attribute"
          ? `/@${node.name}`
          : `/${node.name}[${node.ordinal}]`,
      );
    else if (node.parentId !== null)
      parts.push(
        model.nodes[node.parentId].kind === "array"
          ? `[${node.name}]`
          : `[${JSON.stringify(node.name)}]`,
      );
    if (node.parentId === null) break;
    node = model.nodes[node.parentId];
  }
  return (model.format === "json" ? "$" : "") + parts.reverse().join("");
}

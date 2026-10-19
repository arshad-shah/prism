import type { DocumentModel } from "../contracts/document";
export function analyze(model: DocumentModel) {
  const kinds: Record<string, number> = {};
  let depth = 0;
  for (const node of model.nodes) {
    kinds[node.kind] = (kinds[node.kind] ?? 0) + 1;
    depth = Math.max(depth, node.depth);
  }
  return { nodes: model.nodes.length, depth, kinds };
}

export type Analysis = ReturnType<typeof analyze>;

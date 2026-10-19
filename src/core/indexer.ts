import type {
  DocumentModel,
  DocumentNode,
  Format,
} from "../contracts/document";
import { PrismError } from "../contracts/error";
const counters = new WeakMap<
  DocumentModel,
  Map<number | null, Map<string, number>>
>();
export function createModel(format: Format): DocumentModel {
  return { format, nodes: [], roots: [], warnings: [] };
}
export function addNode(
  model: DocumentModel,
  parentId: number | null,
  kind: string,
  name: string,
  value: string,
  namespace?: string,
): number {
  const depth = parentId === null ? 0 : model.nodes[parentId].depth + 1;
  if (depth > 512)
    throw new PrismError("DEPTH_LIMIT", "Document depth exceeds 512.");
  if (model.nodes.length >= 250_000)
    throw new PrismError("NODE_LIMIT", "Document exceeds 250,000 nodes.");
  const siblings =
    parentId === null ? model.roots : model.nodes[parentId].children;
  let parents = counters.get(model);
  if (!parents) {
    parents = new Map();
    counters.set(model, parents);
  }
  let names = parents.get(parentId);
  if (!names) {
    names = new Map();
    parents.set(parentId, names);
  }
  const ordinal = (names.get(name) ?? 0) + 1;
  names.set(name, ordinal);
  const node: DocumentNode = {
    id: model.nodes.length,
    parentId,
    children: [],
    depth,
    kind,
    name,
    value,
    namespace,
    ordinal,
  };
  model.nodes.push(node);
  siblings.push(node.id);
  return node.id;
}

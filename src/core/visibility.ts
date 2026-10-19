import type { DocumentModel } from "../contracts/document";
export function visibleNodes(
  model: DocumentModel,
  collapsed: ReadonlySet<number>,
): number[] {
  const output: number[] = [];
  const stack = [...model.roots].reverse();
  while (stack.length) {
    const id = stack.pop()!;
    output.push(id);
    if (!collapsed.has(id)) {
      const children = model.nodes[id].children;
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }
  }
  return output;
}

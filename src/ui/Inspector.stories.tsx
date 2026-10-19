import { Inspector } from "./Inspector";
export default { title: "Prism/Inspector", component: Inspector };
export const Selected = {
  args: {
    node: {
      id: 1,
      parentId: 0,
      children: [],
      depth: 1,
      kind: "string",
      name: "name",
      value: "Signal lamp",
      ordinal: 1,
    },
    path: '$["name"]',
    stats: { nodes: 2, depth: 1, kinds: { object: 1, string: 1 } },
    analysis: false,
    onAnalysis: () => {},
    onCopy: () => {},
  },
};
export const Empty = { args: { ...Selected.args, node: null } };
export const Analysis = { args: { ...Selected.args, analysis: true } };
export const LongValue = {
  args: {
    ...Selected.args,
    node: { ...Selected.args.node, value: "Long value ".repeat(500) },
  },
};

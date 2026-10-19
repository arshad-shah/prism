import { TreeRow } from "./TreeRow";
export default { title: "Prism/TreeRow", component: TreeRow };
export const Default = {
  args: {
    node: {
      id: 0,
      parentId: null,
      children: [],
      depth: 0,
      kind: "string",
      name: "project",
      value: "Prism",
      ordinal: 1,
    },
    index: 0,
    expanded: false,
    selected: false,
    onToggle: () => {},
    onSelect: () => {},
    onCopyPath: () => {},
  },
};
export const Selected = { args: { ...Default.args, selected: true } };
export const LongValue = {
  args: {
    ...Default.args,
    node: { ...Default.args.node, value: "Very long value ".repeat(100) },
  },
};

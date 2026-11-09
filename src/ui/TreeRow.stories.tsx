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
const row = (
  kind: string,
  name: string,
  value: string,
  extra: Record<string, unknown> = {},
) => ({
  args: {
    ...Default.args,
    node: { ...Default.args.node, kind, name, value, ...extra },
  },
});
export const ObjectExpanded = {
  args: {
    ...row("object", "filter", "{}", { children: [1, 2, 3], depth: 2 }).args,
    expanded: true,
  },
};
export const ArrayCollapsed = row("array", "districtPids", "[]", {
  children: [1, 2],
  depth: 3,
});
export const EmptyArray = row("array", "tags", "[]", { depth: 1 });
export const NumberValue = row("number", "count", "460", { depth: 1 });
export const BooleanValue = row("boolean", "toggle", "true", { depth: 4 });
export const NullValue = row("null", "owner", "null", { depth: 1 });
export const LinkValue = row("string", "docs", "https://example.com/guide", {
  depth: 1,
});
export const XmlElement = {
  args: {
    ...row("element", "catalog", "", { children: [1], depth: 0 }).args,
    expanded: true,
  },
};
export const XmlAttribute = row("attribute", "lang", "en", { depth: 1 });
export const XmlText = row("text", "#text", "Signal lamp", { depth: 2 });
export const DeeplyNested = row("string", "leaf", "deep value", { depth: 12 });

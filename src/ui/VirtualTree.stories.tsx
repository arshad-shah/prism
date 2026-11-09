import { VirtualTree } from "./VirtualTree";
import { parseDocument } from "../core/parse";
const tree = (source: string, format: "json" | "xml") => {
  const model = parseDocument(source, format);
  return {
    args: {
      model,
      ids: model.nodes.map((n) => n.id),
      collapsed: new Set(),
      selected: null,
      onSelect: () => {},
      onToggle: () => {},
      onCopyPath: () => {},
    },
  };
};
const env = { toggle: true, districtPids: [] };
const flags = Array.from({ length: 6 }, (_, i) => ({
  key: `feature-${i}`,
  flag: `featureFlag${i}`,
  count: i * 7,
  owner: i % 2 ? null : "platform",
  filter: {
    type: "cohort",
    target: "sampleFilter",
    value: { local: env, dev: env, int: env, cert: env, prod: env },
  },
}));
export default { title: "Prism/VirtualTree", component: VirtualTree };
export const Default = tree('{"project":"Prism","list":[1,2,3]}', "json");
export const NestedJson = tree(JSON.stringify(flags), "json");
export const Selected = {
  args: { ...NestedJson.args, selected: 9 },
};
export const Collapsed = {
  args: { ...NestedJson.args, collapsed: new Set([1, 18]) },
};
export const Xml = tree(
  '<catalog xmlns:p="urn:prism" lang="en"><p:item id="1" status="ready"><name>Signal lamp</name><price currency="EUR">12.50</price></p:item><p:item id="2"><name>Relay</name><link>https://example.com/relay</link></p:item></catalog>',
  "xml",
);

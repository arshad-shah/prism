import { VirtualTree } from "./VirtualTree";
import { parseDocument } from "../core/parse";
const model = parseDocument('{"project":"Prism","list":[1,2,3]}', "json");
export default { title: "Prism/VirtualTree", component: VirtualTree };
export const Default = {
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

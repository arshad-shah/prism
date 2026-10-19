import { SearchControls } from "./SearchControls";
export default { title: "Prism/SearchControls", component: SearchControls };
export const Default = {
  args: {
    format: "json",
    options: {
      query: "name",
      field: "all",
      regex: false,
      caseSensitive: false,
    },
    index: 0,
    total: 24,
    onChange: () => {},
    onNavigate: () => {},
  },
};
export const Xml = { args: { ...Default.args, format: "xml" } };
export const Empty = { args: { ...Default.args, total: 0, index: -1 } };

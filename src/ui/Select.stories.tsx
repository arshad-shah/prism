import { Select } from "./Select";
export default { title: "Prism/Select", component: Select };
export const Default = {
  args: {
    label: "Search field",
    value: "all",
    options: [
      { value: "all", label: "All fields" },
      { value: "name", label: "Keys" },
      { value: "value", label: "Values" },
      { value: "path", label: "Paths" },
    ],
    onChange: () => {},
  },
};

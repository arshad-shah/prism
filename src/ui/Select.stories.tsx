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
export const XmlFields = {
  args: {
    ...Default.args,
    value: "attribute-name",
    options: [
      { value: "all", label: "All fields" },
      { value: "name", label: "Tags / attributes" },
      { value: "tag", label: "Tags" },
      { value: "attribute-name", label: "Attribute names" },
      { value: "attribute-value", label: "Attribute values" },
      { value: "value", label: "Values" },
      { value: "path", label: "Paths" },
    ],
  },
};
export const Format = {
  args: {
    label: "Document format",
    value: "json",
    options: [
      { value: "json", label: "JSON" },
      { value: "xml", label: "XML" },
    ],
    onChange: () => {},
  },
};

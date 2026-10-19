import { SearchField } from "./SearchField";
export default { title: "Prism/SearchField", component: SearchField };
export const Empty = {
  args: { value: "", onChange: () => {}, onNext: () => {} },
};
export const Query = { args: { ...Empty.args, value: "namespace" } };

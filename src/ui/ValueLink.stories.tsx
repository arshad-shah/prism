import { ValueLink } from "./ValueLink";
export default { title: "Prism/ValueLink", component: ValueLink };
export const Safe = { args: { value: "https://example.com/api" } };
export const UnsafeText = { args: { value: "javascript:alert(1)" } };

import { Disclosure } from "./Disclosure";
export default { title: "Prism/Disclosure", component: Disclosure };
export const Closed = {
  args: {
    summary: "About the normalized tree",
    children: "Comments and processing instructions are not shown in the tree.",
  },
};
export const Open = { args: { ...Closed.args, initiallyOpen: true } };

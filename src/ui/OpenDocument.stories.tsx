import { OpenDocument } from "./OpenDocument";
export default { title: "Prism/OpenDocument", component: OpenDocument };
export const Empty = { args: { onOpen: async () => {}, onError: () => {} } };
export const Pasted = {
  args: { ...Empty.args, initialSource: '{"name":"Prism"}' },
};

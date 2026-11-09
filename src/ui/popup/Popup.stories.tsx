import { Popup } from "./Popup";
export default {
  title: "Prism/Popup",
  component: Popup,
  decorators: [
    (Story: () => preact.JSX.Element) => (
      <div style={{ width: "420px", minHeight: "220px" }}>
        <Story />
      </div>
    ),
  ],
};
export const Default = {
  args: { onOpenPage: async () => {}, onOpenWorkspace: () => {} },
};
export const UnsupportedPage = {
  args: {
    ...Default.args,
    initialError:
      "This browser page cannot host Prism. Open a document in the workspace.",
  },
};

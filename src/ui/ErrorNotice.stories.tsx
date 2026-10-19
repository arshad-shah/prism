import { ErrorNotice } from "./ErrorNotice";
export default { title: "Prism/ErrorNotice", component: ErrorNotice };
export const Malformed = {
  args: { message: "Invalid JSON. Check the source or switch to raw view." },
};
export const Timeout = {
  args: {
    message:
      "Processing exceeded 10 seconds. Use raw view or a smaller source.",
  },
};
export const Clipboard = {
  args: {
    message:
      "Clipboard access failed. Select the raw text and copy it manually.",
  },
};

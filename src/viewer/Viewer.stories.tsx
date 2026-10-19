import { Viewer } from "./Viewer";
import { createSession } from "../state/session";
import { parseDocument } from "../core/parse";
const props = {
  onCopy: async () => {},
  onDownload: async () => {},
  onClose: () => {},
  onTheme: () => {},
};
const empty = createSession(async (s, f) => parseDocument(s, f));
const ready = createSession(async (s, f) => parseDocument(s, f));
await ready.load('{"project":"Prism","ready":true}', "json");
const error = createSession(async (s, f) => parseDocument(s, f));
await error.load("{", "json");
const loading = createSession(() => new Promise(() => {}));
void loading.load('{"project":"Prism"}', "json");
export default { title: "Prism/Viewer", component: Viewer };
export const Empty = { args: { ...props, session: empty } };
export const Ready = { args: { ...props, session: ready } };
export const Malformed = { args: { ...props, session: error } };
export const Loading = { args: { ...props, session: loading } };

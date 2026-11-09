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
const nested = createSession(async (s, f) => parseDocument(s, f));
await nested.load(
  JSON.stringify(
    Array.from({ length: 8 }, (_, i) => ({
      key: `feature-${i}`,
      flag: `featureFlag${i}`,
      filter: {
        type: "cohort",
        value: { local: { toggle: true, districtPids: [] } },
      },
    })),
  ),
  "json",
);
nested.select(4);
const xml = createSession(async (s, f) => parseDocument(s, f));
await xml.load(
  '<catalog xmlns:p="urn:prism"><p:item id="1"><name>Signal lamp</name><!-- note --></p:item></catalog>',
  "xml",
);
export default { title: "Prism/Viewer", component: Viewer };
export const Empty = { args: { ...props, session: empty } };
export const Ready = { args: { ...props, session: ready } };
export const Malformed = { args: { ...props, session: error } };
export const Loading = { args: { ...props, session: loading } };
export const NestedJson = { args: { ...props, session: nested } };
export const Xml = { args: { ...props, session: xml } };

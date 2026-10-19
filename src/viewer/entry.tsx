import { readPreferences, writePreferences } from "../platform/storage";
import { render } from "preact";
import { Viewer } from "./Viewer";
import { createSession } from "../state/session";
import { createProcessor } from "../platform/worker-client";
import { copyText } from "../platform/clipboard";
import { downloadSource } from "../platform/download";
import { cssVars } from "../tokens";
import { styles } from "../ui/styles";
const processor = createProcessor();
const session = createSession(
  processor.parse,
  processor.search,
  processor.cancel,
);
const style = document.createElement("style");
style.textContent = styles;
document.head.append(style);
let theme: "light" | "dark" | "contrast" = "light";
const apply = () => (document.documentElement.style.cssText = cssVars(theme));
apply();
void readPreferences().then((preferences) => {
  theme = preferences.theme;
  apply();
});
const token = location.hash.slice(1);
const notify = (type: string) => {
  if (parent !== window) parent.postMessage({ type, token }, "*");
};
render(
  <Viewer
    session={session}
    onCopy={copyText}
    onDownload={downloadSource}
    onClose={() => {
      session.dispose();
      notify("close");
      if (parent === window) window.close();
    }}
    onTheme={() => {
      theme =
        theme === "light" ? "dark" : theme === "dark" ? "contrast" : "light";
      apply();
      void writePreferences({ schema: 1, theme });
    }}
  />,
  document.getElementById("app")!,
);
window.addEventListener("message", (event) => {
  const data = event.data;
  if (
    event.source !== parent ||
    data?.token !== token ||
    data.type !== "source" ||
    typeof data.text !== "string" ||
    !["json", "xml"].includes(data.format)
  )
    return;
  void session.load(
    data.text,
    data.format,
    data.fidelity === "reconstructed" ? "reconstructed" : "exact",
  );
});
window.addEventListener("pagehide", () => session.dispose(), { once: true });
notify("ready");

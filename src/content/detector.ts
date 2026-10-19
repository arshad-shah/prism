import { acquireSource } from "../platform/acquire";
/** The original document remains under one removable, isolated surface. */
const runtime =
  typeof browser !== "undefined" ? browser.runtime : chrome.runtime;
let dispose: (() => void) | null = null;
function open(manual = false) {
  if (dispose) return;
  const source = acquireSource(document);
  if (!source && !manual) return;
  if (source && source.text.length > 20 * 1024 * 1024) {
    if (!manual) return;
    source.text = "";
  }
  const host = document.createElementNS(
    "http://www.w3.org/1999/xhtml",
    "div",
  ) as HTMLDivElement;
  host.id = "prism-host";
  host.style.cssText =
    "position:fixed!important;inset:0!important;z-index:2147483647!important;display:none!important;width:100vw!important;height:100vh!important;";
  const root = host.attachShadow({ mode: "open" });
  const iframe = document.createElementNS(
    "http://www.w3.org/1999/xhtml",
    "iframe",
  ) as HTMLIFrameElement;
  const token = crypto.randomUUID();
  const viewer = runtime.getURL("viewer.html");
  const url = new URL(viewer);
  const target = `${url.protocol}//${url.host}`;
  iframe.src = `${viewer}#${token}`;
  iframe.title = "Prism document viewer";
  iframe.style.cssText =
    "border:0;width:100%;height:100%;display:block;color-scheme:normal";
  const handler = (event: MessageEvent) => {
    if (
      event.source !== iframe.contentWindow ||
      event.origin !== target ||
      event.data?.token !== token
    )
      return;
    if (event.data.type === "ready") {
      clearTimeout(startupTimer);
      host.style.setProperty("display", "block", "important");
      iframe.contentWindow?.postMessage(
        {
          type: "source",
          token,
          ...(source ?? { text: "", format: "json", fidelity: "exact" }),
        },
        target,
      );
    }
    if (event.data.type === "close") dispose?.();
  };
  const startupTimer = setTimeout(() => dispose?.(), 10_000);
  iframe.addEventListener("error", () => dispose?.(), { once: true });
  window.addEventListener("message", handler);
  root.append(iframe);
  document.documentElement.append(host);
  dispose = () => {
    clearTimeout(startupTimer);
    window.removeEventListener("message", handler);
    host.remove();
    dispose = null;
  };
}
runtime.onMessage.addListener((message: { type: string }) => {
  if (message.type === "prism:open") open(true);
});
open();

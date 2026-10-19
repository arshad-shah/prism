// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { render } from "preact";
import { act } from "preact/test-utils";
import axe from "axe-core";
import { Viewer } from "../../src/viewer/Viewer";
import { createSession } from "../../src/state/session";
import { parseDocument } from "../../src/core/parse";
it.each(["empty", "ready", "error", "loading"])(
  "viewer %s preserves landmarks and accessible controls",
  async (state) => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    const root = document.createElement("div");
    document.body.append(root);
    const session = createSession(
      state === "loading"
        ? () => new Promise(() => {})
        : async (s, f) => parseDocument(s, f),
    );
    if (state === "ready") await session.load('{"project":"Prism"}', "json");
    if (state === "error") await session.load("{", "json");
    if (state === "loading") void session.load("{}", "json");
    await act(async () => {
      render(
        <Viewer
          session={session}
          onCopy={async () => {}}
          onDownload={async () => {}}
          onClose={() => {}}
          onTheme={() => {}}
        />,
        root,
      );
      await new Promise((r) => setTimeout(r, 0));
    });
    const report = await axe.run(root, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(report.violations.map((v) => `${v.id}: ${v.description}`)).toEqual(
      [],
    );
    render(null, root);
    session.dispose();
    root.remove();
    vi.unstubAllGlobals();
  },
);

// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { render } from "preact";
import { act } from "preact/test-utils";
import { Viewer } from "../../src/viewer/Viewer";
import { createSession } from "../../src/state/session";
import { parseDocument } from "../../src/core/parse";
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
it("renders one safe virtual tree, exposes raw text and recovers malformed input", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const root = document.createElement("div");
  document.body.append(root);
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load(
    '{"danger":"<img src=x onerror=alert(1)>","list":[' +
      Array(1000).fill("1").join(",") +
      "]}",
    "json",
  );
  await act(async () => {
    render(
      <Viewer
        session={session}
        onCopy={async () => {
          throw new Error("Clipboard failed");
        }}
        onDownload={async () => {}}
        onClose={() => {}}
        onTheme={() => {}}
      />,
      root,
    );
    await tick();
  });
  expect(root.querySelector('[role="tree"]')).not.toBeNull();
  expect(root.querySelectorAll('[role="treeitem"]').length).toBeLessThan(100);
  expect(root.querySelector("img[onerror]")).toBeNull();
  const raw = [...root.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === "Raw",
  )!;
  await act(async () => {
    raw.click();
    await tick();
  });
  expect(
    (root.querySelector("textarea") as HTMLTextAreaElement).value,
  ).toContain("<img src=x");
  await act(async () => {
    await session.load("{", "json");
    await tick();
  });
  expect(root.querySelector('[role="alert"]')).not.toBeNull();
  expect((root.querySelector("textarea") as HTMLTextAreaElement).value).toBe(
    "{",
  );
  render(null, root);
  session.dispose();
  root.remove();
  vi.unstubAllGlobals();
});

it("inspects and copies the selected full value and path through the shared session", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const root = document.createElement("div");
  document.body.append(root);
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load('{"name":"Signal lamp"}', "json");
  const copied: string[] = [];
  await act(async () => {
    render(
      <Viewer
        session={session}
        onCopy={async (text) => {
          copied.push(text);
        }}
        onDownload={async () => {}}
        onClose={() => {}}
        onTheme={() => {}}
      />,
      root,
    );
    await tick();
  });
  await act(async () => {
    session.select(1);
    await tick();
  });
  const inspector = root.querySelector('[aria-label="Document inspector"]');
  expect(inspector).not.toBeNull();
  expect(inspector?.textContent).toContain("Signal lamp");
  const click = async (label: string) => {
    const button = [...root.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === label,
    )!;
    await act(async () => {
      button.click();
      await tick();
    });
  };
  await click("Copy value");
  await click("Copy path");
  expect(copied).toEqual(["Signal lamp", '$["name"]']);
  await click("Analysis");
  expect(root.querySelector('[aria-label="Document analysis"]')).not.toBeNull();
  await click("Selected value");
  expect(
    root.querySelector('[aria-label="Selected full value"]')?.textContent,
  ).toContain("Signal lamp");
  render(null, root);
  session.dispose();
  root.remove();
  vi.unstubAllGlobals();
});

it("does not miss a document result arriving immediately after mount", async () => {
  const root = document.createElement("div");
  document.body.append(root);
  const session = createSession(async (s, f) => parseDocument(s, f));
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
  await session.load("{", "json");
  await act(async () => {
    await tick();
  });
  expect(root.querySelector('[role="alert"]')?.textContent).toContain("JSON");
  render(null, root);
  session.dispose();
  root.remove();
});

it("keeps recycled row links out of the tab order and offers the selected link in the inspector", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const root = document.createElement("div");
  document.body.append(root);
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load('{"url":"https://example.test"}', "json");
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
    await tick();
  });
  expect(
    (root.querySelector('[role="tree"] a') as HTMLAnchorElement).tabIndex,
  ).toBe(-1);
  await act(async () => {
    session.select(1);
    await tick();
  });
  const link = root.querySelector(
    '[aria-label="Document inspector"] a',
  ) as HTMLAnchorElement;
  expect(link.href).toBe("https://example.test/");
  expect(link.tabIndex).toBe(0);
  render(null, root);
  session.dispose();
  root.remove();
  vi.unstubAllGlobals();
});

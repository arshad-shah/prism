// @vitest-environment jsdom
import { it, expect } from "vitest";
import { render } from "preact";
import { act } from "preact/test-utils";
import { OpenDocument } from "../../src/ui/OpenDocument";
it("ignores an old file read after a newer pasted document is opened", async () => {
  const root = document.createElement("div");
  document.body.append(root);
  let resolveFile!: (text: string) => void;
  const opened: string[] = [];
  await act(async () => {
    render(
      <OpenDocument
        initialSource='{"new":true}'
        onOpen={async (source) => {
          opened.push(source);
        }}
        onError={() => {}}
      />,
      root,
    );
  });
  const file = root.querySelector('input[type="file"]')!;
  Object.defineProperty(file, "files", {
    value: [
      {
        name: "old.json",
        size: 12,
        text: () =>
          new Promise<string>((resolve) => {
            resolveFile = resolve;
          }),
      },
    ],
  });
  await act(async () => {
    file.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => {
    (root.querySelector("button.primary") as HTMLButtonElement).click();
  });
  await act(async () => {
    resolveFile('{"old":true}');
    await Promise.resolve();
  });
  expect(opened).toEqual(['{"new":true}']);
  render(null, root);
  root.remove();
});

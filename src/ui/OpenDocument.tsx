import { useLayoutEffect, useRef, useState } from "preact/hooks";
import type { Format } from "../contracts/document";
import { Button } from "./Button";
export function OpenDocument({
  onOpen,
  onError,
  initialSource = "",
}: {
  onOpen: (source: string, format: Format) => Promise<void>;
  onError: (message: string) => void;
  initialSource?: string;
}) {
  const [input, setInput] = useState(initialSource);
  const [format, setFormat] = useState<Format>("json");
  const file = useRef<HTMLInputElement>(null);
  const acquisition = useRef(0);
  useLayoutEffect(
    () => () => {
      acquisition.current++;
    },
    [],
  );
  return (
    <section class="empty">
      <h1>A clearer view of your data.</h1>
      <p class="muted">
        Open JSON or XML. Explore its structure, find a value, and copy its
        path. Everything stays in your browser.
      </p>
      <textarea
        aria-label="Document source"
        placeholder="Paste your document here…"
        value={input}
        onInput={(e) => setInput(e.currentTarget.value)}
      />
      <div class="actions">
        <select
          aria-label="Document format"
          value={format}
          onChange={(e) => setFormat(e.currentTarget.value as Format)}
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
        <Button
          primary
          icon="folder"
          disabled={!input}
          onClick={() => {
            acquisition.current++;
            void onOpen(input, format);
          }}
        >
          Open document
        </Button>
        <Button icon="folder" onClick={() => file.current?.click()}>
          Choose file
        </Button>
        <input
          class="file"
          aria-label="Choose document file"
          type="file"
          ref={file}
          accept=".json,.xml,.rss,.svg,.txt"
          onChange={async (e) => {
            const f = e.currentTarget.files?.[0];
            if (!f) return;
            const own = ++acquisition.current;
            if (f.size > 20 * 1024 * 1024) {
              onError("Source size exceeds 20 MiB.");
              return;
            }
            try {
              const source = await f.text();
              if (own !== acquisition.current) return;
              await onOpen(
                source,
                f.name.endsWith(".json") ||
                  source.trimStart().startsWith("{") ||
                  source.trimStart().startsWith("[")
                  ? "json"
                  : "xml",
              );
            } catch (error) {
              if (own === acquisition.current)
                onError((error as Error).message);
            }
          }}
        />
      </div>
    </section>
  );
}

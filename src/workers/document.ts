import { parseDocument } from "../core/parse";
import { searchModel } from "../core/search";
const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent) => void;
  postMessage: (value: unknown) => void;
};
scope.onmessage = (event) => {
  try {
    const d = event.data;
    const result =
      d.command === "parse"
        ? parseDocument(d.source, d.format)
        : searchModel(d.model, d.options);
    scope.postMessage({ result });
  } catch (error) {
    scope.postMessage({
      error: {
        code: (error as { code?: string }).code ?? "PROCESSING_ERROR",
        message: error instanceof Error ? error.message : "Processing failed.",
      },
    });
  }
};

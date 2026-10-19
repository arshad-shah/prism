import type {
  DocumentModel,
  Format,
  SearchOptions,
} from "../contracts/document";
import { PrismError } from "../contracts/error";
/** Each job owns a worker so terminating pathological regex cannot lose a parse. */
export function createProcessor() {
  const jobs = new Map<Worker, () => void>();
  let searchWorker: Worker | undefined;
  function run<T>(payload: object, searching = false): Promise<T> {
    if (searching && searchWorker) jobs.get(searchWorker)?.();
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("document-worker.js", location.href), {
        type: "module",
      });
      if (searching) searchWorker = worker;
      const finish = (error?: Error, result?: T) => {
        if (searchWorker === worker) searchWorker = undefined;
        clearTimeout(timer);
        jobs.delete(worker);
        worker.terminate();
        if (error) reject(error);
        else resolve(result as T);
      };
      const timer = setTimeout(
        () =>
          finish(
            new PrismError(
              "TIMEOUT",
              "Processing exceeded 10 seconds. Use raw view or a smaller source.",
              "processing",
            ),
          ),
        10_000,
      );
      jobs.set(worker, () =>
        finish(
          new PrismError("CANCELLED", "Processing cancelled.", "processing"),
        ),
      );
      worker.onmessage = (e) =>
        e.data.error
          ? finish(new PrismError(e.data.error.code, e.data.error.message))
          : finish(undefined, e.data.result);
      worker.onerror = () =>
        finish(
          new PrismError(
            "WORKER_FAILED",
            "The document worker failed. Retry or use raw view.",
            "processing",
          ),
        );
      worker.postMessage(payload);
    });
  }
  return {
    parse: (source: string, format: Format) =>
      run<DocumentModel>({ command: "parse", source, format }),
    search: (model: DocumentModel, options: SearchOptions) =>
      run<number[]>({ command: "search", model, options }, true),
    cancel: () => {
      for (const stop of [...jobs.values()]) stop();
    },
  };
}

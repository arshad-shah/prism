import { performance } from "node:perf_hooks";
import { platform, arch, cpus } from "node:os";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { parseDocument } from "../src/core/parse";
import type { Format } from "../src/contracts/document";
const runs: unknown[] = [];
for (const format of ["json", "xml"] as Format[])
  for (const mib of [1, 5, 20]) {
    const target = mib * 1024 * 1024;
    const header = format === "json" ? '[{"value":"' : "<root><value>";
    const tail = format === "json" ? '"}]' : "</value></root>";
    const source =
      header + "x".repeat(target - header.length - tail.length) + tail;
    const times: number[] = [];
    let nodes = 0;
    for (let repeat = 0; repeat < 7; repeat++) {
      const start = performance.now();
      const model = parseDocument(source, format);
      nodes = model.nodes.length;
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    const p95 = times.at(-1)!;
    if (mib === 1 && p95 > 500)
      throw new Error(
        `${format}: 1 MiB parse/index p95 exceeded 500ms: ${p95}`,
      );
    runs.push({ format, mib, nodes, p50: times[3], p95 });
  }
const sizes: Record<string, number> = {};
for (const file of ["detector.js", "viewer.js", "document-worker.js"])
  sizes[file] = gzipSync(await readFile(`dist/chrome/${file}`)).length;
await mkdir("artifacts/reports", { recursive: true });
await writeFile(
  "artifacts/reports/core-benchmark.json",
  JSON.stringify(
    {
      date: "2026-10-06",
      node: process.version,
      platform: platform(),
      arch: arch(),
      cpu: cpus()[0].model,
      runs,
      gzipBytes: sizes,
      limitations:
        "Node parse/index benchmark only. Browser acquisition, detector p95, transfer, interactive latency, scroll, idle CPU and long tasks remain unverified.",
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ runs, gzipBytes: sizes }, null, 2));

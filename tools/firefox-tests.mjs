import { buildFingerprint } from "../build/fingerprint.ts";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const server = createServer((req, res) => {
  const xml = req.url === "/data.xml";
  res.setHeader(
    "Content-Type",
    xml
      ? "application/xml"
      : req.url === "/data.json"
        ? "application/json"
        : "text/html",
  );
  res.end(
    xml
      ? '<root xmlns:x="urn:prism"><x:item name="Prism">ready</x:item></root>'
      : req.url === "/data.json"
        ? '{"name":"Prism","ready":true}'
        : "<main>Ordinary page</main>",
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const reserve = createServer();
await new Promise((r) => reserve.listen(0, "127.0.0.1", r));
const port = reserve.address().port;
await new Promise((r) => reserve.close(r));
const profile = await mkdtemp(resolve(tmpdir(), "prism-firefox-"));
const executable =
  process.env.PRISM_FIREFOX ||
  (process.platform === "darwin"
    ? "/Applications/Firefox.app/Contents/MacOS/firefox"
    : "firefox");
const firefox = spawn(
  executable,
  [
    "--headless",
    "--no-remote",
    "--profile",
    profile,
    `--remote-debugging-port=${port}`,
  ],
  {
    env: { ...process.env, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: "1" },
    stdio: ["ignore", "ignore", "pipe"],
  },
);
let log = "";
firefox.stderr.on("data", (chunk) => {
  log += chunk.toString();
});
let ws;
let serial = 0;
const pending = new Map();
async function connect() {
  for (let i = 0; i < 100; i++) {
    try {
      const socket = new WebSocket(`ws://127.0.0.1:${port}/session`);
      await new Promise((r, j) => {
        socket.onopen = r;
        socket.onerror = j;
      });
      return socket;
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Firefox BiDi did not start: ${log.slice(-1500)}`);
}
function command(method, params = {}) {
  const id = ++serial;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`BiDi timeout: ${method}`));
    }, 15000);
    pending.set(id, {
      resolve: (r) => {
        clearTimeout(timer);
        resolve(r);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(context, expression) {
  const result = await command("script.evaluate", {
    expression,
    target: { context },
    awaitPromise: true,
  });
  if (result.type === "exception")
    throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function poll(fn, label) {
  for (let i = 0; i < 100; i++) {
    const result = await fn();
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Firefox timeout: ${label}`);
}
try {
  ws = await connect();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const job = pending.get(data.id);
    if (!job) return;
    pending.delete(data.id);
    if (data.type === "error")
      job.reject(new Error(`${data.error}: ${data.message}`));
    else job.resolve(data.result);
  };
  const session = await command("session.new", { capabilities: {} });
  await command("webExtension.install", {
    extensionData: { type: "path", path: resolve("dist/firefox") },
  });
  const { context } = await command("browsingContext.create", { type: "tab" });
  const checks = [];
  await command("browsingContext.navigate", {
    context,
    url: origin,
    wait: "complete",
  });
  assert.equal(
    await evaluate(context, '!!document.querySelector("#prism-host")'),
    false,
  );
  checks.push("ordinary HTML untouched");
  await command("browsingContext.navigate", {
    context,
    url: `${origin}/data.json`,
    wait: "complete",
  });
  assert.equal(
    await evaluate(context, '!!document.querySelector("#prism-host")'),
    false,
  );
  checks.push(
    "Firefox protected native JSON viewer remains untouched; use paste/file workspace",
  );
  let workspace;
  for (const file of ["data.xml"]) {
    await command("browsingContext.navigate", {
      context,
      url: `${origin}/${file}`,
      wait: "complete",
    });
    const child = await poll(async () => {
      const { contexts } = await command("browsingContext.getTree", {
        root: context,
      });
      return contexts[0].children?.find((c) =>
        c.url.startsWith("moz-extension://"),
      );
    }, `viewer frame for ${file}`);
    await poll(
      () => evaluate(child.context, '!!document.querySelector("[role=tree]")'),
      `tree for ${file}`,
    );
    workspace = child.url.split("#")[0];
    const content = await evaluate(child.context, "document.body.innerText");
    assert.match(content, /Prism/);
    if (file.endsWith("xml")) assert.match(content, /Reconstructed XML source/);
    await evaluate(
      child.context,
      '[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Raw").click()',
    );
    const raw = await poll(
      () =>
        evaluate(child.context, 'document.querySelector("textarea")?.value'),
      "raw view",
    );
    assert.match(raw, file.endsWith("xml") ? /<root/ : /"ready":true/);
    await evaluate(
      child.context,
      `document.querySelector('button[aria-label="Close viewer"]').click()`,
    );
    await poll(
      async () =>
        !(await evaluate(context, '!!document.querySelector("#prism-host")')),
      "teardown",
    );
    checks.push(
      `${file}: native acquisition, extension worker/tree, raw recovery, teardown`,
    );
  }
  await command("browsingContext.navigate", {
    context,
    url: workspace,
    wait: "complete",
  });
  await poll(
    () => evaluate(context, '!!document.querySelector("textarea")'),
    "standalone workspace",
  );
  await evaluate(
    context,
    `(()=>{const input=document.querySelector('textarea');input.value='{"name":"Prism","ready":true}';input.dispatchEvent(new Event('input',{bubbles:true}));})()`,
  );
  await evaluate(context, `document.querySelector('button.primary').click()`);
  await poll(
    () => evaluate(context, '!!document.querySelector("[role=tree]")'),
    "standalone JSON worker",
  );
  assert.match(await evaluate(context, "document.body.innerText"), /ready/);
  checks.push("Standalone JSON workspace and worker parsing");
  await mkdir("artifacts/reports", { recursive: true });
  await writeFile(
    "artifacts/reports/firefox-integration.json",
    JSON.stringify(
      {
        fingerprint: await buildFingerprint(),
        browser: "firefox",
        version: session.capabilities.browserVersion,
        checkedAt: new Date().toISOString(),
        checks,
      },
      null,
      2,
    ),
  );
  console.log(`Firefox: ${checks.length} integration checks passed.`);
} finally {
  try {
    if (ws?.readyState === 1) await command("session.end");
  } catch {}
  ws?.close();
  firefox.kill("SIGTERM");
  await Promise.race([
    new Promise((r) => firefox.once("exit", r)),
    delay(3000),
  ]);
  server.close();
  await rm(profile, { recursive: true, force: true });
}

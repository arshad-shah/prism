import { useEffect, useLayoutEffect, useMemo, useState } from "preact/hooks";
import type { Format, SearchOptions } from "../contracts/document";
import type { Session } from "../state/session";
import { PRODUCT } from "../brand/product";
import { prismMarkSvg } from "../brand/mark";
import { analyze } from "../core/analysis";
import { pathFor } from "../core/path";
import { visibleNodes } from "../core/visibility";
import { Toolbar } from "../ui/Toolbar";
import { Button } from "../ui/Button";
import { SearchControls } from "../ui/SearchControls";
import { VirtualTree } from "../ui/VirtualTree";
import { Inspector } from "../ui/Inspector";
import { OpenDocument } from "../ui/OpenDocument";
import { ErrorNotice } from "../ui/ErrorNotice";
import { RawView } from "../ui/RawView";
export function Viewer({
  session,
  onCopy,
  onDownload,
  onClose,
  onTheme,
}: {
  session: Session;
  onCopy: (text: string) => Promise<void>;
  onDownload: (source: string, format: Format) => Promise<void>;
  onClose: () => void;
  onTheme: () => void;
}) {
  const [, update] = useState(0);
  useLayoutEffect(
    () => session.subscribe(() => update((n) => n + 1)),
    [session],
  );
  const state = session.getSnapshot();
  const [raw, setRaw] = useState(false),
    [analysis, setAnalysis] = useState(false),
    [initialSource, setInitialSource] = useState(""),
    [notice, setNotice] = useState("");
  const [options, setOptions] = useState<SearchOptions>({
    query: "",
    field: "all",
    caseSensitive: false,
    regex: false,
  });
  useEffect(() => {
    if (!options.query && !state.matches.length) return;
    const timer = setTimeout(() => void session.search(options), 150);
    return () => clearTimeout(timer);
  }, [options, state.model, session]);
  const stats = useMemo(
    () => (state.model ? analyze(state.model) : null),
    [state.model],
  );
  const ids = useMemo(
    () => (state.model ? visibleNodes(state.model, state.collapsed) : []),
    [state.model, state.collapsed],
  );
  const selected =
    state.model && state.selected !== null
      ? state.model.nodes[state.selected]
      : null;
  const path = state.model && selected ? pathFor(state.model, selected.id) : "";
  const bytes = useMemo(
    () => new TextEncoder().encode(state.source).byteLength,
    [state.source],
  );
  const copy = async (text: string) => {
    try {
      await onCopy(text);
      setNotice("Copied to clipboard.");
    } catch (error) {
      setNotice(`${(error as Error).message} Select and copy from raw view.`);
      setRaw(true);
    }
  };
  const download = async () => {
    try {
      await onDownload(state.source, state.format);
    } catch (error) {
      setNotice((error as Error).message);
    }
  };
  return (
    <main
      class="shell"
      onKeyDown={(e) => {
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key.toLowerCase() === "f" &&
          state.source
        ) {
          e.preventDefault();
          e.currentTarget
            .querySelector<HTMLInputElement>('input[type="search"]')
            ?.focus();
        }
      }}
    >
      <Toolbar>
        <div class="brand">
          <img
            alt=""
            src={`data:image/svg+xml,${encodeURIComponent(prismMarkSvg())}`}
          />
          <strong>{PRODUCT.name}</strong>
          <span class="badge">
            {state.source ? state.format.toUpperCase() : "JSON + XML"}
          </span>
        </div>
        <span class="document-title">
          {state.source ? "Document workspace" : "JSON & XML Viewer"}
        </span>
        <div class="header-actions">
          {state.source && (
            <Button
              icon="folder"
              onClick={() => {
                setInitialSource(state.source);
                setRaw(false);
                setOptions({ ...options, query: "" });
                session.reset();
              }}
            >
              Open document
            </Button>
          )}
          <Button icon="theme" label="Change theme" onClick={onTheme} />
          <Button icon="close" label="Close viewer" onClick={onClose} />
        </div>
      </Toolbar>
      {state.source && (
        <div class="command-bar">
          <div class="view-switch">
            <Button icon="tree" pressed={!raw} onClick={() => setRaw(false)}>
              Tree
            </Button>
            <Button icon="code" pressed={raw} onClick={() => setRaw(true)}>
              Raw
            </Button>
          </div>
          <SearchControls
            format={state.format}
            options={options}
            onChange={setOptions}
            index={state.matchIndex}
            total={state.matches.length}
            onNavigate={session.navigate}
          />
          <div class="document-actions">
            <Button
              icon="copy"
              label="Copy document"
              onClick={() => void copy(state.source)}
            />
            <Button
              icon="download"
              label="Download document"
              onClick={() => void download()}
            />
          </div>
        </div>
      )}
      {state.error && (
        <div class="error-bar">
          <ErrorNotice message={state.error} />
          {state.status === "error" && (
            <Button
              icon="retry"
              onClick={() =>
                void session.load(state.source, state.format, state.fidelity)
              }
            >
              Retry document
            </Button>
          )}
        </div>
      )}
      {notice && (
        <div class="notice" role="status">
          {notice}
          <Button
            icon="close"
            label="Dismiss notification"
            onClick={() => setNotice("")}
          />
        </div>
      )}
      {state.model && state.model.warnings.length > 0 && (
        <details class="source-note">
          <summary>About the normalized tree</summary>
          <p>{state.model.warnings.join(" ")}</p>
        </details>
      )}
      {state.status === "loading" && (
        <div class="notice" role="status">
          Reading document…
          <Button onClick={() => setRaw(true)}>View raw</Button>
        </div>
      )}
      {!state.source ? (
        <OpenDocument
          initialSource={initialSource}
          onOpen={session.load}
          onError={setNotice}
        />
      ) : (
        <div class="main">
          <section class="document" aria-label="Document canvas">
            {!raw && state.model && (
              <div class="document-navigation">
                <code title={path}>{path || "Select a value to inspect"}</code>
                <div>
                  <Button
                    icon="collapse"
                    label="Collapse all"
                    onClick={() => session.collapseAll(true)}
                  />
                  <Button
                    icon="expand"
                    label="Expand all"
                    onClick={() => session.collapseAll(false)}
                  />
                </div>
              </div>
            )}
            {raw || state.status === "error" ? (
              <RawView source={state.source} />
            ) : state.model ? (
              <VirtualTree
                model={state.model}
                ids={ids}
                collapsed={state.collapsed}
                selected={state.selected}
                onSelect={session.select}
                onToggle={session.toggle}
                onCopyPath={(id) => void copy(pathFor(state.model!, id))}
              />
            ) : null}
          </section>
          {stats && (
            <Inspector
              node={selected}
              path={path}
              stats={stats}
              analysis={analysis}
              onAnalysis={setAnalysis}
              onCopy={(text) => void copy(text)}
            />
          )}
        </div>
      )}
      <footer class="footer">
        <span>
          {state.model
            ? `${state.model.nodes.length.toLocaleString()} nodes`
            : "Local processing"}
        </span>
        {state.source && <span>{bytes.toLocaleString()} bytes</span>}
        <span>
          {state.fidelity === "reconstructed"
            ? "Reconstructed XML source"
            : "Source preserved"}
        </span>
        <span>No uploads. No tracking.</span>
      </footer>
    </main>
  );
}

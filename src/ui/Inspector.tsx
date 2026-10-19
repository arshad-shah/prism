import { ValueLink } from "./ValueLink";
import type { DocumentNode } from "../contracts/document";
import { Button } from "./Button";
import { AnalysisDrawer } from "./AnalysisDrawer";
import type { Analysis } from "../core/analysis";
export function Inspector({
  node,
  path,
  stats,
  analysis,
  onAnalysis,
  onCopy,
}: {
  node: DocumentNode | null;
  path: string;
  stats: Analysis;
  analysis: boolean;
  onAnalysis: (value: boolean) => void;
  onCopy: (text: string) => void;
}) {
  return (
    <aside class="inspector" aria-label="Document inspector">
      <div class="inspector-tabs">
        <Button pressed={!analysis} onClick={() => onAnalysis(false)}>
          Selected value
        </Button>
        <Button pressed={analysis} onClick={() => onAnalysis(true)}>
          Analysis
        </Button>
      </div>
      {analysis ? (
        <AnalysisDrawer stats={stats} />
      ) : node ? (
        <div class="inspector-content">
          <span class="badge">{node.kind}</span>
          <h2>{node.name || "Root"}</h2>
          <h3>Full value</h3>
          <section aria-label="Selected full value">
            <pre class="value-detail">
              {node.value ? (
                <ValueLink value={node.value} truncate={false} />
              ) : node.children.length ? (
                `${node.children.length} children`
              ) : (
                "(empty)"
              )}
            </pre>
          </section>
          <Button icon="copy" onClick={() => onCopy(node.value)}>
            Copy value
          </Button>
          <h3>Document path</h3>
          <code class="document-path">{path}</code>
          <Button icon="copy" onClick={() => onCopy(path)}>
            Copy path
          </Button>
          {node.namespace && (
            <>
              <h3>Namespace</h3>
              <code class="document-path">{node.namespace}</code>
            </>
          )}
          <p class="hint">
            Use the arrow keys to explore the tree. Press Enter to copy the
            selected path.
          </p>
        </div>
      ) : (
        <div class="inspector-content">
          <h2>Explore your document</h2>
          <p class="muted">
            Select a row to inspect its full value and copy its path.
          </p>
        </div>
      )}
    </aside>
  );
}

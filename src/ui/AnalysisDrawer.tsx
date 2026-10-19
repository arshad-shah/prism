import type { Analysis } from "../core/analysis";
export function AnalysisDrawer({ stats }: { stats: Analysis }) {
  return (
    <section class="drawer" aria-label="Document analysis">
      <h2>Document analysis</h2>
      <div class="stat">
        <span>Nodes</span>
        <strong>{stats.nodes.toLocaleString()}</strong>
      </div>
      <div class="stat">
        <span>Maximum depth</span>
        <strong>{stats.depth}</strong>
      </div>
      {Object.entries(stats.kinds).map(([kind, count]) => (
        <div class="stat" key={kind}>
          <span>{kind}</span>
          <strong>{count.toLocaleString()}</strong>
        </div>
      ))}
    </section>
  );
}

import { cssVars } from "../tokens";
const tokens = Object.fromEntries(
  cssVars("light")
    .split(";")
    .map((pair) => pair.split(":") as [string, string]),
);
const colors = [
  "bg",
  "surface",
  "ink",
  "muted",
  "line",
  "selected",
  "accent",
  "onAccent",
  "string",
  "number",
  "error",
];
const sizes = ["space", "row", "radius", "small", "body", "title", "iconSize"];
export default { title: "Prism/Foundations" };
export const Colors = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
      }}
    >
      {colors.map((name) => (
        <div
          key={name}
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
            background: "var(--surface)",
          }}
        >
          <div style={{ height: "56px", background: `var(--${name})` }} />
          <div style={{ padding: "8px" }}>
            <strong>--{name}</strong>
            <div class="muted">theme-dependent</div>
          </div>
        </div>
      ))}
    </div>
  ),
};
export const Scale = {
  render: () => (
    <div>
      {sizes.map((name) => (
        <div class="stat" key={name}>
          <code>--{name}</code>
          <span class="muted">{tokens[`--${name}`]}</span>
        </div>
      ))}
    </div>
  ),
};
export const Typography = {
  render: () => (
    <div>
      <p style={{ fontSize: "var(--title)" }}>
        Title: A clearer view of your data.
      </p>
      <p style={{ fontSize: "var(--body)" }}>
        Body: Explore structure and copy a path.
      </p>
      <p class="muted">Small / muted: 265 nodes, 3,605 bytes</p>
      <code style={{ fontFamily: "ui-monospace, monospace" }}>
        Mono: $[0]["filter"]["value"]
      </code>
    </div>
  ),
};

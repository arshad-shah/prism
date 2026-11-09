import { Icon } from "./Icon";
import { ICON_PATHS, type IconName } from "../tokens/icons";
export default { title: "Prism/Icon", component: Icon };
export const All = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "8px",
      }}
    >
      {(Object.keys(ICON_PATHS) as IconName[]).map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
          }}
        >
          <Icon name={name} />
          <span class="muted">{name}</span>
        </div>
      ))}
    </div>
  ),
};

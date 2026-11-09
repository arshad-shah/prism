import type { DocumentNode } from "../contracts/document";
import { Icon, type IconName } from "./Icon";
import { ValueLink } from "./ValueLink";
import { geometry } from "../tokens";
/** SVG markers replace ASCII syntax ({} [] <> @) in the tree. */
const KIND_ICONS: Partial<Record<string, IconName>> = {
  object: "object",
  array: "array",
  element: "element",
  attribute: "attribute",
};
export function TreeRow({
  node,
  index,
  expanded,
  selected,
  onToggle,
  onSelect,
  onCopyPath,
}: {
  node: DocumentNode;
  index: number;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onCopyPath: () => void;
}) {
  const container = node.kind === "object" || node.kind === "array";
  const kindIcon = KIND_ICONS[node.kind];
  return (
    <div
      id={`node-${node.id}`}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          onSelect();
        }
      }}
      role="treeitem"
      aria-level={node.depth + 1}
      aria-expanded={node.children.length ? expanded : undefined}
      aria-selected={selected}
      aria-label={`${node.name} ${container ? `${node.children.length} ${node.children.length === 1 ? "item" : "items"}` : node.value}`}
      class={`tree-row kind-${node.kind}`}
      style={{ top: index * geometry.row }}
      onClick={onSelect}
    >
      <span class="line-number" aria-hidden="true">
        {index + 1}
      </span>
      <span
        class="indent"
        aria-hidden="true"
        style={{ width: node.depth * geometry.indent }}
      />
      {node.children.length ? (
        <button
          type="button"
          class="toggle"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${node.name}`}
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Icon name={expanded ? "chevronDown" : "chevronRight"} />
        </button>
      ) : (
        <span class="toggle" aria-hidden="true" />
      )}
      {kindIcon && (
        <span class="kind-icon" aria-hidden="true">
          <Icon name={kindIcon} />
        </span>
      )}
      <span class="node-name">{node.name}</span>
      {container ? (
        <span class="muted">
          {node.children.length} {node.children.length === 1 ? "item" : "items"}
        </span>
      ) : (
        node.value !== "" && (
          <span class="node-value">
            <ValueLink value={node.value} tabIndex={-1} />
          </span>
        )
      )}
      <button
        type="button"
        class="copy-path"
        tabIndex={-1}
        aria-label={`Copy path for ${node.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onCopyPath();
        }}
      >
        <Icon name="copy" />
      </button>
    </div>
  );
}

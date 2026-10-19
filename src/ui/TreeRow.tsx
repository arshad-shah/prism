import type { DocumentNode } from "../contracts/document";
import { Icon } from "./Icon";
import { ValueLink } from "./ValueLink";
import { geometry } from "../tokens";
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
      aria-label={`${node.name} ${node.value}`}
      class={`tree-row kind-${node.kind}`}
      style={{
        top: index * geometry.row,
        paddingLeft: node.depth * geometry.indent,
      }}
      onClick={onSelect}
    >
      <span class="line-number" aria-hidden="true">
        {index + 1}
      </span>
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
        <Icon
          name={
            node.children.length
              ? expanded
                ? "chevronDown"
                : "chevronRight"
              : "leaf"
          }
        />
      </button>
      <span class="node-name">
        {node.kind === "element"
          ? `<${node.name}>`
          : node.kind === "attribute"
            ? `@${node.name}`
            : node.name}
      </span>
      <span class="muted">
        {node.kind === "object" || node.kind === "array"
          ? `${node.children.length} items`
          : node.kind === "element"
            ? ""
            : ":"}
      </span>
      <span class="node-value" title={node.value}>
        <ValueLink value={node.value} tabIndex={-1} />
      </span>
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

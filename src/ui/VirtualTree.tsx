import { useEffect, useRef, useState } from "preact/hooks";
import type { DocumentModel } from "../contracts/document";
import { geometry } from "../tokens";
import { TreeRow } from "./TreeRow";
export function VirtualTree({
  model,
  ids,
  collapsed,
  selected,
  onSelect,
  onToggle,
  onCopyPath,
}: {
  model: DocumentModel;
  ids: number[];
  collapsed: Set<number>;
  selected: number | null;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
  onCopyPath: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(600);
  useEffect(() => {
    const el = ref.current!;
    const observer = new ResizeObserver(() => setHeight(el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (selected === null) return;
    const index = ids.indexOf(selected);
    const el = ref.current!;
    const top = index * geometry.row;
    if (
      top < el.scrollTop ||
      top + geometry.row > el.scrollTop + el.clientHeight
    )
      el.scrollTop = Math.max(0, top - el.clientHeight / 2);
  }, [selected, ids]);
  const start = Math.max(
    0,
    Math.floor(scroll / geometry.row) - geometry.overscan,
  );
  const end = Math.min(
    ids.length,
    Math.ceil((scroll + height) / geometry.row) + geometry.overscan,
  );
  return (
    <div
      ref={ref}
      class="tree"
      role="tree"
      aria-label={`${model.format.toUpperCase()} document`}
      tabIndex={0}
      aria-activedescendant={
        selected !== null && ids.slice(start, end).includes(selected)
          ? `node-${selected}`
          : undefined
      }
      onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
      onKeyDown={(e) => {
        const index = ids.indexOf(selected ?? ids[0]);
        const id = ids[Math.max(0, index)];
        if (id === undefined) return;
        if (
          [
            "ArrowDown",
            "ArrowUp",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ].includes(e.key)
        )
          e.preventDefault();
        if (e.key === "ArrowDown" || e.key === "ArrowUp")
          onSelect(
            ids[
              Math.max(
                0,
                Math.min(
                  ids.length - 1,
                  index + (e.key === "ArrowDown" ? 1 : -1),
                ),
              )
            ],
          );
        if (e.key === "Home") onSelect(ids[0]);
        if (e.key === "End") onSelect(ids.at(-1)!);
        if (e.key === "ArrowRight" && model.nodes[id].children.length) {
          if (collapsed.has(id)) onToggle(id);
          else onSelect(model.nodes[id].children[0]);
        }
        if (e.key === "ArrowLeft") {
          const node = model.nodes[id];
          if (node.children.length && !collapsed.has(id)) onToggle(id);
          else if (node.parentId !== null) onSelect(node.parentId);
        }
        if (e.key === "Enter") onCopyPath(id);
      }}
    >
      <div class="tree-space" style={{ height: ids.length * geometry.row }}>
        {ids.slice(start, end).map((id, offset) => (
          <TreeRow
            key={id}
            node={model.nodes[id]}
            index={start + offset}
            expanded={!collapsed.has(id)}
            selected={id === selected}
            onToggle={() => onToggle(id)}
            onSelect={() => {
              onSelect(id);
              ref.current?.focus();
            }}
            onCopyPath={() => onCopyPath(id)}
          />
        ))}
      </div>
    </div>
  );
}

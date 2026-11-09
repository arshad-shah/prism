import { useEffect, useId, useRef, useState } from "preact/hooks";
import { Icon } from "./Icon";
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}
/** Hand-made listbox select; no native <select> or OS popup. */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [active, setActive] = useState(selectedIndex);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const show = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <div class="select-control" ref={root}>
      <button
        ref={trigger}
        type="button"
        class="select-trigger"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onBlur={(e) => {
          if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        onKeyDown={(e) => {
          const last = options.length - 1;
          if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
              e.preventDefault();
              show();
            }
            return;
          }
          const moves: Record<string, number> = {
            ArrowDown: Math.min(last, active + 1),
            ArrowUp: Math.max(0, active - 1),
            Home: 0,
            End: last,
          };
          if (e.key in moves) {
            e.preventDefault();
            setActive(moves[e.key]!);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            choose(active);
          } else if (e.key === "Escape" || e.key === "Tab") {
            if (e.key === "Escape") e.preventDefault();
            setOpen(false);
          }
        }}
      >
        <span>{options[selectedIndex]?.label}</span>
        <Icon name="chevronDown" />
      </button>
      {open && (
        <div
          class="select-list"
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-${index}`}
              role="option"
              aria-selected={option.value === value}
              class={index === active ? "active" : ""}
              onPointerEnter={() => setActive(index)}
              onPointerDown={(e) => e.preventDefault()}
              tabIndex={-1}
              onClick={() => choose(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter") choose(index);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

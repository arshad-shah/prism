import type { ComponentChildren } from "preact";
import { useId, useState } from "preact/hooks";
import { Icon } from "./Icon";
/** Hand-made disclosure; replaces native <details>/<summary>. */
export function Disclosure({
  summary,
  children,
  initiallyOpen = false,
}: {
  summary: string;
  children: ComponentChildren;
  initiallyOpen?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <div class="disclosure">
      <button
        type="button"
        class="disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "chevronDown" : "chevronRight"} />
        {summary}
      </button>
      {open && (
        <div id={id} class="disclosure-body">
          {children}
        </div>
      )}
    </div>
  );
}

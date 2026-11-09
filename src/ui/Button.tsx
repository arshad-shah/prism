import type { ComponentChildren } from "preact";
import { useRef, useState } from "preact/hooks";
import { Icon, type IconName } from "./Icon";
/** Button with a hand-made tooltip for its label; never uses native title. */
export function Button({
  children,
  onClick,
  disabled = false,
  pressed,
  label,
  primary = false,
  icon,
}: {
  children?: ComponentChildren;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  label?: string;
  primary?: boolean;
  icon?: IconName;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (label && !children && rect)
      setTip({ x: rect.left + rect.width / 2, y: rect.bottom });
  };
  const hide = () => setTip(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        hide();
        onClick();
      }}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      class={primary ? "primary" : ""}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={(e) => {
        if (e.currentTarget.matches?.(":focus-visible")) show();
      }}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
    >
      {icon && <Icon name={icon} />} {children}
      {tip && (
        <span
          class="tooltip"
          aria-hidden="true"
          style={{ left: tip.x, top: tip.y }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

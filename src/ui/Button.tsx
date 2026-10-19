import type { ComponentChildren } from "preact";
import { Icon, type IconName } from "./Icon";
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      class={primary ? "primary" : ""}
    >
      {icon && <Icon name={icon} />} {children}
    </button>
  );
}

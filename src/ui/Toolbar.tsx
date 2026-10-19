import type { ComponentChildren } from "preact";
export function Toolbar({ children }: { children: ComponentChildren }) {
  return <header class="toolbar">{children}</header>;
}

import type { ComponentChildren } from "preact";
import { styles } from "../src/ui/styles";
import { cssVars } from "../src/tokens";
type Theme = "light" | "dark" | "contrast";
const vars = (theme: Theme) =>
  Object.fromEntries(cssVars(theme).split(";").map((pair) => pair.split(":")));
export default {
  parameters: { a11y: { test: "error" }, layout: "fullscreen" },
  globalTypes: {
    theme: {
      description: "Prism theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "contrast", title: "High contrast" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (
      Story: () => ComponentChildren,
      context: { globals: { theme?: Theme } },
    ) => (
      <div
        style={{
          minHeight: "100vh",
          height: "100vh",
          padding: "16px",
          boxSizing: "border-box",
          background: "var(--bg)",
          color: "var(--ink)",
          ...vars(context.globals.theme ?? "light"),
        }}
      >
        <style>{styles}</style>
        <Story />
      </div>
    ),
  ],
};

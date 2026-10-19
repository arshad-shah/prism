import { BRAND } from "../brand/mark";
export const geometry = {
  row: 30,
  overscan: 8,
  space: 8,
  toolbar: 64,
  drawer: 278,
  indent: 20,
  narrow: 1000,
} as const;
const themes = {
  light: {
    bg: "#f3f3f1",
    surface: "#fcfcfb",
    ink: "#26282b",
    muted: "#606366",
    line: "#d6d7d4",
    selected: "#f8e7db",
    string: "#245c68",
    number: "#805623",
    error: "#a63728",
  },
  dark: {
    bg: "#181a1c",
    surface: "#202326",
    ink: "#eeefeb",
    muted: "#a8acae",
    line: "#383d40",
    selected: "#453025",
    string: "#9ec8c9",
    number: "#e5b983",
    error: "#ffa28d",
  },
  contrast: {
    bg: "#000000",
    surface: "#000000",
    ink: "#fcfcfb",
    muted: "#fcfcfb",
    line: "#fcfcfb",
    selected: "#663513",
    string: "#b5e9ea",
    number: "#ffd4a0",
    error: "#ffc2ab",
  },
};
export function cssVars(theme: keyof typeof themes) {
  return Object.entries({
    ...themes[theme],
    accent: theme === "light" ? BRAND.accent : "#f2a16c",
    onAccent: theme === "light" ? BRAND.light : "#26282b",
    space: `${geometry.space}px`,
    row: `${geometry.row}px`,
    radius: "6px",
    small: "12px",
    body: "13px",
    title: "22px",
    mark: "30px",
    iconSize: "16px",
    iconStroke: "1.6",
    hair: "1px",
    toolbar: "64px",
    drawer: `${geometry.drawer}px`,
    indent: "20px",
    duration: "120ms",
  })
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
}

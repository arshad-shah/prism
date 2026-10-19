export interface Preferences {
  schema: 1;
  theme: "light" | "dark" | "contrast";
}
/** Only known preference fields survive migration; source documents never persist. */
export function normalizePreferences(value: unknown): Preferences {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    schema: 1,
    theme:
      data.theme === "dark" || data.theme === "contrast" ? data.theme : "light",
  };
}

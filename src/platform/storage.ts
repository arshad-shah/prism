import { normalizePreferences, type Preferences } from "../state/preferences";
function api() {
  return typeof browser !== "undefined"
    ? browser
    : typeof chrome !== "undefined"
      ? chrome
      : null;
}
export async function readPreferences(): Promise<Preferences> {
  const runtime = api();
  if (!runtime?.storage) return normalizePreferences(null);
  try {
    const saved = await runtime.storage.local.get(["preferences", "theme"]);
    return normalizePreferences(saved.preferences ?? saved);
  } catch {
    return normalizePreferences(null);
  }
}
export async function writePreferences(value: Preferences): Promise<void> {
  const runtime = api();
  if (runtime?.storage)
    await runtime.storage.local.set({
      preferences: normalizePreferences(value),
    });
}

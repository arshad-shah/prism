export function safeUrl(value: string): string | null {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: reject control characters before URL normalization.
  if (!/^https?:\/\//i.test(value) || /[\s\u0000-\u001f]/.test(value))
    return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

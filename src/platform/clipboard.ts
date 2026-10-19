export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error(
      "Clipboard access failed. Select the raw text and copy it manually.",
    );
  }
}

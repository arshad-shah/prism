import type { Format } from "../contracts/document";
export async function downloadSource(source: string, format: Format) {
  const url = URL.createObjectURL(
    new Blob([source], {
      type: format === "json" ? "application/json" : "application/xml",
    }),
  );
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `document.${format}`;
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

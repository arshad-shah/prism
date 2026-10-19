export function RawView({ source }: { source: string }) {
  return (
    <textarea
      class="raw"
      aria-label="Raw document"
      readOnly
      value={source}
      spellcheck={false}
    />
  );
}

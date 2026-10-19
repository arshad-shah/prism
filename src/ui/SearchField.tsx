export function SearchField({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: (direction: number) => void;
}) {
  return (
    <input
      type="search"
      aria-label="Search document"
      placeholder="Search keys, values, or paths…"
      value={value}
      onInput={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onNext(e.shiftKey ? -1 : 1);
        }
      }}
    />
  );
}

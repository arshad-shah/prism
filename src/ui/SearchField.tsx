import { Icon } from "./Icon";
/** Text field with a hand-made clear control (no native search cancel glyph). */
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
    <>
      <input
        type="search"
        aria-label="Search document"
        placeholder="Search keys, values, or paths…"
        autocomplete="off"
        spellcheck={false}
        value={value}
        onInput={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onNext(e.shiftKey ? -1 : 1);
          }
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
      />
      {value && (
        <button
          type="button"
          class="clear-search"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <Icon name="clear" />
        </button>
      )}
    </>
  );
}

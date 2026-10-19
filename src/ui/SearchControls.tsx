import type { Format, SearchOptions } from "../contracts/document";
import { SearchField } from "./SearchField";
import { Button } from "./Button";
import { Icon } from "./Icon";
export function SearchControls({
  format,
  options,
  onChange,
  index,
  total,
  onNavigate,
}: {
  format: Format;
  options: SearchOptions;
  onChange: (options: SearchOptions) => void;
  index: number;
  total: number;
  onNavigate: (direction: number) => void;
}) {
  return (
    <div class="search-controls">
      <div class="search">
        <Icon name="search" />
        <SearchField
          value={options.query}
          onChange={(query) => onChange({ ...options, query })}
          onNext={onNavigate}
        />
        <span class="match-count" role="status">
          {index + 1} of {total}
        </span>
        <Button
          icon="previous"
          label="Previous match"
          disabled={!total}
          onClick={() => onNavigate(-1)}
        />
        <Button
          icon="next"
          label="Next match"
          disabled={!total}
          onClick={() => onNavigate(1)}
        />
      </div>
      <div class="search-options">
        <label class="select-control">
          <select
            aria-label="Search field"
            value={options.field}
            onChange={(e) =>
              onChange({
                ...options,
                field: e.currentTarget.value as SearchOptions["field"],
              })
            }
          >
            <option value="all">All fields</option>
            <option value="name">
              {format === "json" ? "Keys" : "Tags / attributes"}
            </option>
            {format === "xml" && (
              <>
                <option value="tag">Tags</option>
                <option value="attribute-name">Attribute names</option>
                <option value="attribute-value">Attribute values</option>
              </>
            )}
            <option value="value">Values</option>
            <option value="path">Paths</option>
          </select>
          <Icon name="chevronDown" />
        </label>
        <Button
          icon="case"
          label="Case sensitive search"
          pressed={options.caseSensitive}
          onClick={() =>
            onChange({ ...options, caseSensitive: !options.caseSensitive })
          }
        />
        <Button
          icon="regex"
          label="Regular expression search"
          pressed={options.regex}
          onClick={() => onChange({ ...options, regex: !options.regex })}
        />
      </div>
    </div>
  );
}

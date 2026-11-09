import type { Format, SearchOptions } from "../contracts/document";
import { SearchField } from "./SearchField";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Select } from "./Select";
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
        <Select
          label="Search field"
          value={options.field}
          options={[
            { value: "all", label: "All fields" },
            {
              value: "name",
              label: format === "json" ? "Keys" : "Tags / attributes",
            },
            ...(format === "xml"
              ? ([
                  { value: "tag", label: "Tags" },
                  { value: "attribute-name", label: "Attribute names" },
                  { value: "attribute-value", label: "Attribute values" },
                ] as const)
              : []),
            { value: "value", label: "Values" },
            { value: "path", label: "Paths" },
          ]}
          onChange={(field) => onChange({ ...options, field })}
        />
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

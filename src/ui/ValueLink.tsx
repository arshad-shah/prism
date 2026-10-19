import { safeUrl } from "../core/url";
export function ValueLink({
  value,
  tabIndex,
  truncate = true,
}: {
  value: string;
  tabIndex?: number;
  truncate?: boolean;
}) {
  const url = safeUrl(value);
  return url ? (
    <a
      href={url}
      tabIndex={tabIndex}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {truncate ? value.slice(0, 500) : value}
    </a>
  ) : (
    <>{truncate ? value.slice(0, 500) : value}</>
  );
}

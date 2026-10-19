import type { DocumentModel, SearchOptions } from "../contracts/document";
import { pathFor } from "./path";
export function searchModel(
  model: DocumentModel,
  options: SearchOptions,
): number[] {
  if (!options.query) return [];
  const flags = options.caseSensitive ? "" : "i";
  const expression = new RegExp(
    options.regex
      ? options.query
      : options.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    flags,
  );
  return model.nodes
    .filter((n) =>
      options.field === "tag"
        ? n.kind === "element"
        : options.field === "attribute-name" ||
            options.field === "attribute-value"
          ? n.kind === "attribute"
          : true,
    )
    .filter((n) =>
      expression.test(
        options.field === "name" ||
          options.field === "tag" ||
          options.field === "attribute-name"
          ? n.name
          : options.field === "value" || options.field === "attribute-value"
            ? n.value
            : options.field === "path"
              ? pathFor(model, n.id)
              : `${n.name} ${n.value}`,
      ),
    )
    .map((n) => n.id);
}

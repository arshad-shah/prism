export type Format = "json" | "xml";
export type NodeId = number;
export interface DocumentNode {
  id: number;
  parentId: number | null;
  children: number[];
  depth: number;
  kind: string;
  name: string;
  value: string;
  namespace?: string;
  ordinal: number;
}
export interface DocumentModel {
  format: Format;
  nodes: DocumentNode[];
  roots: number[];
  warnings: string[];
}
export interface SearchOptions {
  query: string;
  field:
    | "all"
    | "name"
    | "value"
    | "path"
    | "tag"
    | "attribute-name"
    | "attribute-value";
  caseSensitive: boolean;
  regex: boolean;
}

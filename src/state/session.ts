import type {
  DocumentModel,
  Format,
  SearchOptions,
} from "../contracts/document";
import { searchModel } from "../core/search";
export interface SessionSnapshot {
  status: "idle" | "loading" | "ready" | "error";
  source: string;
  format: Format;
  fidelity: "exact" | "reconstructed";
  model: DocumentModel | null;
  collapsed: Set<number>;
  matches: number[];
  selected: number | null;
  matchIndex: number;
  error: string | null;
}
export function createSession(
  parse: (source: string, format: Format) => Promise<DocumentModel>,
  searcher = (model: DocumentModel, options: SearchOptions) =>
    Promise.resolve(searchModel(model, options)),
  cancel = () => {},
) {
  let state: SessionSnapshot = {
    status: "idle",
    source: "",
    format: "json",
    fidelity: "exact",
    model: null,
    collapsed: new Set(),
    matches: [],
    selected: null,
    matchIndex: -1,
    error: null,
  };
  let generation = 0,
    searchGeneration = 0,
    disposed = false;
  const listeners = new Set<() => void>();
  const emit = () => {
    if (!disposed) for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async load(
      source: string,
      format: Format,
      fidelity: "exact" | "reconstructed" = "exact",
    ) {
      cancel();
      const own = ++generation;
      searchGeneration++;
      state = {
        ...state,
        status: "loading",
        source,
        format,
        fidelity,
        model: null,
        matches: [],
        selected: null,
        matchIndex: -1,
        error: null,
        collapsed: new Set(),
      };
      emit();
      try {
        const model = await parse(source, format);
        if (disposed || own !== generation) return;
        state = {
          ...state,
          status: "ready",
          model,
          collapsed: new Set(
            model.nodes.filter((n) => n.children.length > 100).map((n) => n.id),
          ),
        };
      } catch (error) {
        if (disposed || own !== generation) return;
        state = {
          ...state,
          status: "error",
          error: error instanceof Error ? error.message : "Processing failed.",
        };
      }
      emit();
    },
    reset() {
      cancel();
      generation++;
      searchGeneration++;
      state = {
        ...state,
        status: "idle",
        source: "",
        model: null,
        error: null,
        matches: [],
        selected: null,
        matchIndex: -1,
        collapsed: new Set(),
      };
      emit();
    },
    toggle(id: number) {
      const collapsed = new Set(state.collapsed);
      collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
      let selected = state.selected;
      if (collapsed.has(id) && selected !== null && state.model) {
        let node = state.model.nodes[selected];
        while (node.parentId !== null) {
          if (node.parentId === id) {
            selected = id;
            break;
          }
          node = state.model.nodes[node.parentId];
        }
      }
      state = { ...state, collapsed, selected };
      emit();
    },
    collapseAll(collapse: boolean) {
      let selected = state.selected;
      if (collapse && selected !== null && state.model) {
        let node = state.model.nodes[selected];
        while (node.parentId !== null) node = state.model.nodes[node.parentId];
        selected = node.id;
      }
      state = {
        ...state,
        selected,
        collapsed: new Set(
          collapse
            ? state.model?.nodes
                .filter((n) => n.children.length)
                .map((n) => n.id)
            : [],
        ),
      };
      emit();
    },
    async search(options: SearchOptions) {
      const model = state.model;
      if (!model) return;
      const own = ++searchGeneration;
      const doc = generation;
      try {
        const matches = await searcher(model, options);
        if (disposed || own !== searchGeneration || doc !== generation) return;
        state = {
          ...state,
          matches,
          matchIndex: -1,
          selected: null,
          error: null,
        };
      } catch (error) {
        if (disposed || own !== searchGeneration || doc !== generation) return;
        state = {
          ...state,
          matches: [],
          matchIndex: -1,
          error: error instanceof Error ? error.message : "Search failed.",
        };
      }
      emit();
    },
    navigate(direction: number) {
      if (!state.matches.length || !state.model) return;
      const matchIndex =
        ((state.matchIndex === -1 && direction < 0 ? 0 : state.matchIndex) +
          direction +
          state.matches.length) %
        state.matches.length;
      const selected = state.matches[matchIndex];
      const collapsed = new Set(state.collapsed);
      let node = state.model.nodes[selected];
      while (node.parentId !== null) {
        collapsed.delete(node.parentId);
        node = state.model.nodes[node.parentId];
      }
      state = { ...state, matchIndex, selected, collapsed };
      emit();
    },
    select(id: number) {
      state = { ...state, selected: id };
      emit();
    },
    dispose() {
      disposed = true;
      generation++;
      cancel();
      listeners.clear();
    },
  };
}
export type Session = ReturnType<typeof createSession>;

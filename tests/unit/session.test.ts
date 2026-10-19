import { it, expect } from "vitest";
import { createSession } from "../../src/state/session";
import { parseDocument } from "../../src/core/parse";
it("ignores stale parses and retains raw input on failure", async () => {
  const resolvers: ((
    value: import("../../src/contracts/document").DocumentModel,
  ) => void)[] = [];
  const session = createSession(
    () => new Promise((resolve) => resolvers.push(resolve)),
  );
  const first = session.load('{"old":1}', "json");
  const second = session.load('{"new":2}', "json");
  resolvers[1](parseDocument('{"new":2}', "json"));
  await second;
  resolvers[0](parseDocument('{"old":1}', "json"));
  await first;
  expect(session.getSnapshot().source).toBe('{"new":2}');
  expect(session.getSnapshot().model?.nodes[1].name).toBe("new");
  session.dispose();
});
it("reveals ancestors when navigating search matches", async () => {
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load('{"a":{"b":true}}', "json");
  session.toggle(0);
  await session.search({
    query: "true",
    field: "value",
    caseSensitive: false,
    regex: false,
  });
  session.navigate(1);
  expect(session.getSnapshot().collapsed.has(0)).toBe(false);
  expect(session.getSnapshot().selected).toBe(2);
});

it("previous starts at the last match and a failed search clears stale results", async () => {
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load('{"one":"same","two":"same","three":"same"}', "json");
  await session.search({
    query: "same",
    field: "value",
    caseSensitive: false,
    regex: false,
  });
  session.navigate(-1);
  expect(session.getSnapshot().matchIndex).toBe(2);
  await session.search({
    query: "[",
    field: "value",
    caseSensitive: false,
    regex: true,
  });
  expect(session.getSnapshot().matches).toEqual([]);
  expect(session.getSnapshot().matchIndex).toBe(-1);
});
it("collapsing an ancestor keeps selection on a visible row", async () => {
  const session = createSession(async (s, f) => parseDocument(s, f));
  await session.load('{"a":{"b":true}}', "json");
  session.select(2);
  session.toggle(1);
  expect(session.getSnapshot().selected).toBe(1);
  session.collapseAll(true);
  expect(session.getSnapshot().selected).toBe(0);
});

function api() {
  return typeof browser !== "undefined" ? browser : chrome;
}
export async function openCurrentPage() {
  const [tab] = await api().tabs.query({ active: true, currentWindow: true });
  if (tab.id) await api().tabs.sendMessage(tab.id, { type: "prism:open" });
  else throw new Error("No active tab.");
}
export async function openWorkspace() {
  await api().tabs.create({ url: api().runtime.getURL("viewer.html") });
}

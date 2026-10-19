/** One stroke vocabulary; every product surface uses these same SVG paths. */
export const ICON_PATHS = {
  close: "M6 6 18 18M18 6 6 18",
  next: "M12 4v16M5 13l7 7 7-7",
  previous: "M12 20V4M5 11l7-7 7 7",
  theme: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 3v18M12 5a7 7 0 0 1 0 14",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  leaf: "M9 5h6v14H9z",
  copy: "M9 9h11v11H9zM15 9V4H4v11h5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  tree: "M4 4h5v5H4zM15 15h5v5h-5zM6 9v9h9M15 4h5v5h-5zM9 6h6",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18",
  analysis: "M4 20h16M6 16v-5m6 5V4m6 12V8",
  expand: "M12 10V3m-4 4 4-4 4 4M12 14v7m-4-4 4 4 4-4M4 12h16",
  collapse: "M12 3v7m-4-4 4 4 4-4M12 21v-7m-4 4 4-4 4 4M4 12h16",
  folder: "M3 6h7l2 3h9v11H3z",
  case: "M3 18 8 5l5 13M5 13h6M20 12v6m0-3a3 3 0 1 0-3 3h3",
  regex: "M16 4v10m-5-8 10 6m-10 0 10-6M5 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
  retry: "M20 8a8 8 0 1 0 0 8M20 3v5h-5",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6",
} as const;
export type IconName = keyof typeof ICON_PATHS;

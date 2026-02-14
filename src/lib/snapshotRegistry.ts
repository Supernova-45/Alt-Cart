export type SnapshotId = "search" | "adidas" | "adokoo" | "puma" | "on";

export const SNAPSHOTS: Record<SnapshotId, { label: string; path: string }> = {
  search: {
    label: "White sneakers search",
    path: "/webpages/amazon_white_sneakers.html",
  },
  adidas: {
    label: "adidas VL Court 3.0",
    path: "/webpages/adidas.html",
  },
  adokoo: {
    label: "Adokoo Fashion Sneakers",
    path: "/webpages/adokoo.html",
  },
  puma: {
    label: "Puma Carina L",
    path: "/webpages/puma.html",
  },
  on: {
    label: "On Cloud 6",
    path: "/webpages/on.html",
  },
};

export const PRODUCT_IDS: SnapshotId[] = ["adidas", "adokoo", "puma", "on"];

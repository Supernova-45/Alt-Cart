export type SnapshotId = "search" | "adidas" | "adokoo" | "puma" | "on";

export const SNAPSHOTS: Record<SnapshotId, { label: string; path: string }> = {
  search: {
    label: "White sneakers search",
    path: "/webpages/amazon_white_sneakers.html",
  },
  adidas: {
    label: "adidas VL Court 3.0",
    path: "/webpages/amazon_adidas.html",
  },
  adokoo: {
    label: "Adokoo Fashion Sneakers",
    path: "/webpages/amazon_adokoo.html",
  },
  puma: {
    label: "Puma Carina L",
    path: "/webpages/amazon_puma.html",
  },
  on: {
    label: "On Cloud 6",
    path: "/webpages/amazon_on.html",
  },
};

export const PRODUCT_IDS: SnapshotId[] = ["adidas", "adokoo", "puma", "on"];

export type SnapshotId =
  | "a_search"
  | "w_search"
  | "adidas"
  | "adokoo"
  | "puma"
  | "on"
  | "w_ozark"
  | "w_dakimoe"
  | "w_eastsport"
  | "w_madden"
  | "w_honglong"
  | "w_reebok";

export const SNAPSHOTS: Record<SnapshotId, { label: string; path: string }> = {
  a_search: {
    label: "White sneakers search",
    path: "/webpages/amazon_white_sneakers.html",
  },
  w_search: {
    label: "Backpack search",
    path: "/webpages/walmart_backpack.html",
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
  w_ozark: {
    label: "Ozark Trail Backpack",
    path: "/webpages/walmart_ozark.html",
  },
  w_dakimoe: {
    label: "Dakimoe Backpack",
    path: "/webpages/walmart_dakimoe.html",
  },
  w_eastsport: {
    label: "EastSport Backpack",
    path: "/webpages/walmart_eastsport.html",
  },
  w_madden: {
    label: "Madden Backpack",
    path: "/webpages/walmart_madden.html",
  },
  w_honglong: {
    label: "Honglong Backpack",
    path: "/webpages/walmart_honglong.html",
  },
  w_reebok: {
    label: "Reebok Backpack",
    path: "/webpages/walmart_reebok.html",
  },
};

export type ProductSnapshotId = Exclude<SnapshotId, "a_search" | "w_search">;

export const PRODUCT_IDS: ProductSnapshotId[] = [
  "adidas",
  "adokoo",
  "puma",
  "on",
  "w_ozark",
  "w_dakimoe",
  "w_eastsport",
  "w_madden",
  "w_honglong",
  "w_reebok",
];

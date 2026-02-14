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

/** Main product image URLs for search results and fallbacks. Amazon uses CDN URLs (local _files may not be served); Walmart uses local paths. */
export const PRODUCT_IMAGE_URLS: Record<ProductSnapshotId, string> = {
  adidas: "https://m.media-amazon.com/images/I/613wTu5YLOL._AC_SL1500_.jpg",
  adokoo: "https://m.media-amazon.com/images/I/619aUX88NiL._AC_SL1500_.jpg",
  puma: "https://m.media-amazon.com/images/I/61jTh6sovUL._AC_SL1500_.jpg",
  on: "https://m.media-amazon.com/images/I/51Y-v706JqL._AC_SL1500_.jpg",
  w_ozark: "https://i5.walmartimages.com/seo/Ozark-Trail-Hiker-Backpack-25-Liter-Black-Polyester-Adult-Teen_4dc82491-e6a1-41b7-91db-84485d7231e1.db56d94109d8e1633ad3b47163a0d01d.jpeg",
  w_dakimoe: "https://i5.walmartimages.com/seo/DAKIMOE-Large-capacity-Backpack-Aesthetic-Student-Schoolbag-Middle-School-Backpack-Pink_9f2cdf40-86dd-4aea-b3e8-b02da0b8d6e3.7446e666d8f771faf9dded2bd1b3b90a.jpeg",
  w_eastsport: "https://i5.walmartimages.com/seo/Ozark-Trail-Hiker-Backpack-25-Liter-Black-Polyester-Adult-Teen_4dc82491-e6a1-41b7-91db-84485d7231e1.db56d94109d8e1633ad3b47163a0d01d.jpeg",
  w_madden: "https://i5.walmartimages.com/seo/Madden-NYC-Women-s-Dome-Backpack-with-Front-Pockets-and-Removeable-Pouch-Tan-Daisy_a820b6ef-eb49-4fa7-a498-8fbe606ad824.4b886f632d68d0c8cd674321a03931ec.jpeg",
  w_honglong: "https://i5.walmartimages.com/seo/HONGLONG-PU-Leather-Backpack-Purse-for-Women-Casual-Handbag-Ladies-Shoulder-Bags-Black_4ce85e1e-13cf-4807-b357-da52850266a7.a17a910e791a7a9f6b3a6a7fccc22cec.jpeg",
  w_reebok: "https://i5.walmartimages.com/seo/Reebok-Unisex-Adult-Bobbie-Top-Loader-18-5-Laptop-Backpack-Light-Heather-Grey_c33442e3-8104-433d-bef5-065e3369d33c.1ca2f74ecc50f1ac565bf62d209f6a66.jpeg",
};

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

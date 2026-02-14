import { ProductCard } from "./ProductCard";
import { PRODUCT_IDS } from "../lib/snapshotRegistry";
import { getFallbackPassport } from "../lib/demoFallbacks";

export function ProductList() {
  return (
    <ul className="product-list">
      {PRODUCT_IDS.map((id) => {
        const passport = getFallbackPassport(id);
        if (!passport || passport.id === "search") return null;
        return (
          <li key={id}>
            <ProductCard
              id={passport.id}
              name={passport.name}
              priceText={passport.priceText}
              ratingText={passport.ratingText}
              reviewCountText={passport.reviewCountText}
            />
          </li>
        );
      })}
    </ul>
  );
}

import { useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { getFallbackPassport } from "../lib/demoFallbacks";

const AMAZON_SEARCH_ITEMS = ["adidas", "adokoo", "puma", "on"] as const;
const WALMART_SEARCH_ITEMS = ["w_ozark", "w_dakimoe", "w_eastsport", "w_madden", "w_honglong", "w_reebok"] as const;

export function SearchReader() {
  const { id } = useParams<{ id: string }>();

  if (id === "a_search") {
    return (
      <>
        <h1>Search results: White sneakers</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
          Supported products from this search. Open a passport for accessible details.
        </p>
        <ul className="product-list">
          {AMAZON_SEARCH_ITEMS.map((itemId) => {
            const passport = getFallbackPassport(itemId);
            if (!passport) return null;
            return (
              <li key={itemId}>
                <ProductCard
                  id={passport.id}
                  name={passport.name}
                  priceText={passport.priceText}
                  ratingText={passport.ratingText}
                  reviewCountText={passport.reviewCountText}
                  imageUrl={passport.imageUrl}
                  imageAlt={passport.images.altShort}
                />
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  if (id === "w_search") {
    return (
      <>
        <h1>Search results: Backpack</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
          Supported products from this search. Open a passport for accessible details.
        </p>
        <ul className="product-list">
          {WALMART_SEARCH_ITEMS.map((itemId) => {
            const passport = getFallbackPassport(itemId);
            if (!passport) return null;
            return (
              <li key={itemId}>
                <ProductCard
                  id={passport.id}
                  name={passport.name}
                  priceText={passport.priceText}
                  ratingText={passport.ratingText}
                  reviewCountText={passport.reviewCountText}
                  imageUrl={passport.imageUrl}
                  imageAlt={passport.images.altShort}
                />
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="error-card">
      <h1>Search not found</h1>
      <p>Unknown search ID: {id}</p>
    </div>
  );
}

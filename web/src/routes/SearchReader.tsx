import { useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { getFallbackPassport } from "../lib/demoFallbacks";
import { getSortPreference, setSortPreference } from "../lib/preferences";
import { sortSearchResults, hasSustainabilityData } from "../lib/sortSearchResults";
import { passportToSearchItem } from "../lib/passportToSearchItem";
import type { SortOption } from "../lib/api";

const AMAZON_SEARCH_ITEMS = ["adidas", "adokoo", "puma", "on"] as const;
const WALMART_SEARCH_ITEMS = ["w_ozark", "w_dakimoe", "w_eastsport", "w_madden", "w_honglong", "w_reebok"] as const;

function DemoSearchResults({
  title,
  itemIds,
}: {
  title: string;
  itemIds: readonly string[];
}) {
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortPreference());

  const items = useMemo(() => {
    return itemIds
      .map((id) => {
        const passport = getFallbackPassport(id);
        if (!passport) return null;
        return { passport, searchItem: passportToSearchItem(passport) };
      })
      .filter((x): x is { passport: NonNullable<ReturnType<typeof getFallbackPassport>>; searchItem: ReturnType<typeof passportToSearchItem> } => x !== null);
  }, [itemIds]);

  const showSustainabilitySort = useMemo(() => hasSustainabilityData(items.map((i) => i.searchItem)), [items]);
  const effectiveSortBy =
    sortBy === "sustainability" && !showSustainabilitySort ? "relevance" : sortBy;

  useEffect(() => {
    if (effectiveSortBy !== sortBy) {
      setSortPreference("relevance");
      setSortBy("relevance");
    }
  }, [effectiveSortBy, sortBy]);

  const sortedItems = useMemo(
    () => sortSearchResults(items.map((i) => i.searchItem), effectiveSortBy),
    [items, effectiveSortBy]
  );

  const passportMap = useMemo(() => {
    const m = new Map<string, (typeof items)[0]["passport"]>();
    for (const { passport, searchItem } of items) {
      m.set(searchItem.productUrl, passport);
    }
    return m;
  }, [items]);

  const sortedPassports = useMemo(
    () => sortedItems.map((si) => passportMap.get(si.productUrl)!).filter(Boolean),
    [sortedItems, passportMap]
  );

  const sortLabel =
    effectiveSortBy === "relevance"
      ? "Relevance (default)"
      : effectiveSortBy === "price_asc"
        ? "price, low to high"
        : effectiveSortBy === "price_desc"
          ? "price, high to low"
          : effectiveSortBy === "rating"
            ? "rating, highest first"
            : "sustainability, highest first";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOption;
    setSortBy(value);
    setSortPreference(value);
  };

  return (
    <>
      <h1>Search results: {title}</h1>
      <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
        Supported products from this search. Open a passport for accessible details.
      </p>
      <p style={{ marginBottom: "1rem", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Fit and sizing info available after opening a product.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <select
          id="sort-results"
          value={effectiveSortBy}
          onChange={handleSortChange}
          aria-label="Sort results by"
        >
          <option value="relevance">Relevance (default)</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Rating: highest first</option>
          {showSustainabilitySort && (
            <option value="sustainability">Sustainability: highest first</option>
          )}
        </select>
        <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
          {items.length} results sorted by {sortLabel}
        </div>
      </div>

      <ul className="product-list">
        {sortedPassports.map((passport) => (
          <li key={passport.id}>
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
        ))}
      </ul>
    </>
  );
}

export function SearchReader() {
  const { id } = useParams<{ id: string }>();

  if (id === "a_search") {
    return (
      <DemoSearchResults title="White sneakers" itemIds={AMAZON_SEARCH_ITEMS} />
    );
  }

  if (id === "w_search") {
    return (
      <DemoSearchResults title="Backpack" itemIds={WALMART_SEARCH_ITEMS} />
    );
  }

  return (
    <div className="error-card">
      <h1>Search not found</h1>
      <p>Unknown search ID: {id}</p>
    </div>
  );
}

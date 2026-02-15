import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { extractSearch, type SearchResultItem, type SortOption } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { getSortPreference, setSortPreference } from "../lib/preferences";
import { sortSearchResults, hasSustainabilityData } from "../lib/sortSearchResults";

const CLOTHING_KEYWORDS = /sneakers?|shoes?|boots?|shirt|blouse|dress|jacket|coat|pants?|jeans|sweater|hoodie|bra|underwear|socks?|hat|caps?|shorts?|skirt|leggings?|joggers?|sweatshirt|tank|tee|t-shirt|blazer|vest|cardigan|romper|jumpsuit/i;

const DOMAIN_LABELS: Record<string, string> = {
  amazon: "Amazon",
  walmart: "Walmart",
  ebay: "eBay",
  etsy: "Etsy",
  lowes: "Lowe's",
  target: "Target",
  macys: "Macy's",
  homedepot: "Home Depot",
  generic: "This site",
};

function getDomainLabel(domain: string, url?: string): string {
  if (DOMAIN_LABELS[domain]) return DOMAIN_LABELS[domain];
  if (domain === "generic" && url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const parts = host.split(".");
      if (parts.length >= 2) {
        const name = parts[parts.length - 2];
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    } catch {
      /* ignore */
    }
  }
  return domain;
}

export function ExtractSearch() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const url = searchParams.get("url");
  const returnTo = `${location.pathname}${location.search}`;
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(() => getSortPreference());

  useEffect(() => {
    if (!url) {
      setStatus("error");
      setErrorMessage("No search URL provided");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    extractSearch(url)
      .then((result) => {
        setQuery(result.data.query);
        setDomain(result.data.domain);
        setItems(result.data.items);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Search extraction failed");
      });
  }, [url]);

  const showSustainabilitySort = useMemo(() => hasSustainabilityData(items), [items]);
  const effectiveSortBy =
    sortBy === "sustainability" && !showSustainabilitySort ? "relevance" : sortBy;

  useEffect(() => {
    if (effectiveSortBy !== sortBy) {
      setSortPreference("relevance");
      setSortBy("relevance");
    }
  }, [effectiveSortBy, sortBy]);

  const sortedItems = useMemo(
    () => sortSearchResults(items, effectiveSortBy),
    [items, effectiveSortBy]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOption;
    setSortBy(value);
    setSortPreference(value);
  };

  if (!url) {
    return (
      <div className="section-card">
        <h1>Search extraction</h1>
        <p>No search URL provided. Use the extension on an Amazon or Walmart search page.</p>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="section-card" style={{ maxWidth: "var(--max-width)" }}>
        <h1>Extracting search results</h1>
        <p>Loading the search page and extracting product listings. This may take a moment.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="section-card">
        <h1>Search extraction failed</h1>
        <p style={{ marginBottom: "1rem" }}>{errorMessage}</p>
        <Link to={`/extract-search?url=${encodeURIComponent(url)}`} className="product-card__link">
          Retry
        </Link>
      </div>
    );
  }

  const domainLabel = getDomainLabel(domain, url ?? undefined);
  const isClothingQuery = CLOTHING_KEYWORDS.test(query);

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

  return (
    <>
      <h1>Search results: {query}</h1>
      <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
        {items.length} products from {domainLabel}. Click a product to extract its full passport.
        {domain === "generic" && (
          <span style={{ display: "block", marginTop: "0.5rem", fontSize: "var(--text-sm)" }}>
            Best-effort extraction; results may vary by site.
          </span>
        )}
      </p>
      {isClothingQuery && items.length > 0 && (
        <p style={{ marginBottom: "1rem", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Fit and sizing info available after opening a product.
        </p>
      )}

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
        {sortedItems.map((item, idx) => (
          <li key={item.productUrl + idx}>
            <ProductCard
              name={item.name}
              priceText={item.price}
              ratingText={item.ratingText}
              reviewCountText={item.reviewCountText}
              imageUrl={item.imageUrl}
              imageAlt={item.name}
              productUrl={item.productUrl}
              returnTo={returnTo}
            />
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>
          No products found. The search page structure may have changed.
        </p>
      )}
    </>
  );
}

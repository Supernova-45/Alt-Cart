import { useEffect, useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { extractSearch, type SearchResultItem } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

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

  const domainLabel = domain === "amazon" ? "Amazon" : "Walmart";

  return (
    <>
      <h1>Search results: {query}</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
        {items.length} products from {domainLabel}. Click a product to extract its full passport.
      </p>
      <ul className="product-list">
        {items.map((item, idx) => (
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

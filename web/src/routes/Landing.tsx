import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SkipLink } from "../components/SkipLink";
import { extractProduct } from "../lib/api";
import { urlToDemo } from "../lib/urlToDemo";

const SEARCH_SITES = [
  { value: "amazon", label: "Amazon", baseUrl: "https://www.amazon.com/s?k=" },
  { value: "walmart", label: "Walmart", baseUrl: "https://www.walmart.com/search?q=" },
] as const;

function buildSearchUrl(query: string, site: (typeof SEARCH_SITES)[number]["value"]): string {
  const entry = SEARCH_SITES.find((s) => s.value === site);
  if (!entry) return "";
  return entry.baseUrl + encodeURIComponent(query.trim());
}

export function Landing() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSite, setSearchSite] = useState<(typeof SEARCH_SITES)[number]["value"]>("amazon");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchLoading(true);
    setError(null);
    const searchUrl = buildSearchUrl(trimmed, searchSite);
    navigate(`/extract-search?url=${encodeURIComponent(searchUrl)}`);
    setSearchLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const target = urlToDemo(url);

    if (target.kind === "search") {
      navigate(`/s/${target.id}`);
      setLoading(false);
      return;
    }
    if (target.kind === "search_extract") {
      navigate(`/extract-search?url=${encodeURIComponent(url)}`);
      setLoading(false);
      return;
    }
    if (target.kind === "product") {
      navigate(`/p/${target.id}`);
      setLoading(false);
      return;
    }

    try {
      const response = await extractProduct(url);

      if (response.status === "success") {
        navigate(`/p/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract product. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SkipLink targetId="main-content" />
      <main id="main-content" className="container">
        <header className="landing-header">
          <h1>Alt-Cart</h1>
          <p className="tagline">Shopping Made Accessible</p>
        </header>

        <section className="search-section url-input-section">
          <h2>Search for Products</h2>
          <p>
            Tell us what you want to buy and where. We&apos;ll show you product listings from that store.
          </p>

          <form onSubmit={handleSearchSubmit} className="url-form">
            <div className="form-row">
              <div className="form-group form-group--flex">
                <label htmlFor="search-query">What do you want to buy?</label>
                <input
                  id="search-query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. sneakers, backpacks, monitors"
                  disabled={searchLoading}
                  autoComplete="off"
                />
              </div>
              <div className="form-group form-group--flex">
                <label htmlFor="search-site">Where?</label>
                <select
                  id="search-site"
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value as (typeof SEARCH_SITES)[number]["value"])}
                  disabled={searchLoading}
                  aria-label="Select store"
                >
                  {SEARCH_SITES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={searchLoading || !searchQuery.trim()} className="btn-primary">
              {searchLoading ? "Searching..." : `Search ${SEARCH_SITES.find((s) => s.value === searchSite)?.label ?? ""}`}
            </button>
          </form>
        </section>

        <section className="url-input-section">
          <h2>Or Enter a Product URL</h2>
          <p>
            Enter any online product URL to get an accessible &quot;should I buy?&quot; summary with detailed information, review insights, and text-to-speech support.
          </p>

          <form onSubmit={handleSubmit} className="url-form">
            <div className="form-group">
              <label htmlFor="product-url">Product URL</label>
              <input
                id="product-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/... or search URL"
                required
                disabled={loading}
                aria-describedby={error ? "url-error" : undefined}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Extracting Product..." : "Get Product"}
            </button>
          </form>

          {error && (
            <div id="url-error" role="alert" className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div role="status" aria-live="polite" className="loading-message">
              Extracting product information... This may take 15-30 seconds.
            </div>
          )}
        </section>

        <p style={{ textAlign: "center", marginTop: "var(--space-lg)" }}>
          <Link to="/demo" className="product-card__link">
            Try demo
          </Link>
        </p>
      </main>
    </>
  );
}

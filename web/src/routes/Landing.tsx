import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SkipLink } from "../components/SkipLink";
import { extractProduct } from "../lib/api";
import { urlToDemo } from "../lib/urlToDemo";

const SEARCH_SITES = [
  { value: "amazon", label: "Amazon", baseUrl: "https://www.amazon.com/s?k=" },
  { value: "walmart", label: "Walmart", baseUrl: "https://www.walmart.com/search?q=" },
  { value: "ebay", label: "eBay", baseUrl: "https://www.ebay.com/sch/i.html?_nkw=" },
  { value: "etsy", label: "Etsy", baseUrl: "https://www.etsy.com/search?q=" },
  { value: "target", label: "Target", baseUrl: "https://www.target.com/s?searchTerm=" },
  { value: "lowes", label: "Lowe's", baseUrl: "https://www.lowes.com/search?searchTerm=" },
  { value: "homedepot", label: "Home Depot", baseUrl: "https://www.homedepot.com/s/" },
  { value: "macys", label: "Macy's", baseUrl: "https://www.macys.com/shop/search?keyword=" },
  { value: "other", label: "Other (paste URL)", baseUrl: null },
] as const;

type SearchSiteValue = (typeof SEARCH_SITES)[number]["value"];

function buildSearchUrl(
  query: string,
  site: SearchSiteValue,
  customUrl?: string
): string {
  if (site === "other" && customUrl?.trim()) {
    return customUrl.trim();
  }
  const entry = SEARCH_SITES.find((s) => s.value === site);
  if (!entry || !entry.baseUrl) return "";
  return entry.baseUrl + encodeURIComponent(query.trim());
}

export function Landing() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSite, setSearchSite] = useState<SearchSiteValue>("amazon");
  const [customSearchUrl, setCustomSearchUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isOther = searchSite === "other";
  const canSearch =
    isOther ? customSearchUrl.trim().length > 0 : searchQuery.trim().length > 0;
  const canGetProduct = url.trim().length > 0;

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSearch) return;
    setSearchLoading(true);
    setError(null);
    const searchUrl = buildSearchUrl(searchQuery, searchSite, customSearchUrl);
    if (searchUrl) {
      navigate(`/extract-search?url=${encodeURIComponent(searchUrl)}`);
    }
    setSearchLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canGetProduct) return;
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
          <h1>alt+cart</h1>
          <p className="tagline">shopping made accessible</p>
        </header>

        <section className="search-section url-input-section">
          <h2>Search for Products</h2>

          <form onSubmit={handleSearchSubmit} className="url-form">
            <div className="form-row">
              <div className="form-group form-group--flex">
                <label htmlFor="search-site">Where?</label>
                <select
                  id="search-site"
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value as SearchSiteValue)}
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
              {isOther ? (
                <div className="form-group form-group--flex" style={{ flex: 1 }}>
                  <label htmlFor="custom-search-url">Search URL</label>
                  <input
                    id="custom-search-url"
                    type="text"
                    inputMode="url"
                    value={customSearchUrl}
                    onChange={(e) => setCustomSearchUrl(e.target.value)}
                    placeholder="e.g. temu.com, aliexpress.us, uniqlo.com search or product URL"
                    disabled={searchLoading}
                    autoComplete="off"
                    aria-label="Paste search results page URL"
                  />
                </div>
              ) : (
                <div className="form-group form-group--flex" style={{ flex: 1 }}>
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
              )}
            </div>
            <button type="submit" disabled={searchLoading || !canSearch} className="btn-primary">
              {searchLoading
                ? "Searching..."
                : isOther
                  ? "Search this page"
                  : `Search ${SEARCH_SITES.find((s) => s.value === searchSite)?.label ?? ""}`}
            </button>
          </form>
        </section>

        <section className="url-input-section">
          <h2>Enter a Product URL</h2>

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

            <button type="submit" disabled={loading || !canGetProduct} className="btn-primary">
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
              <div className="loading-spinner" aria-hidden="true" />
              <span>Extracting product information... This may take 15-30 seconds.</span>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

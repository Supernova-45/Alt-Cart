import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductList } from "../components/ProductList";
import { SkipLink } from "../components/SkipLink";
import { extractProduct } from "../lib/api";
import { urlToDemo } from "../lib/urlToDemo";

export function Landing() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

        <section className="url-input-section">
          <h2>Get Product Passport</h2>
          <p>
            Enter any online product URL to get an accessible "should I buy?" summary with detailed information, review insights, and text-to-speech support.
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
              {loading ? "Extracting Product..." : "Get Product Passport"}
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

        <section className="demo-section">
          <h2>Or Try Demo Products</h2>
          <p>Explore our pre-loaded demo products to see how Alt-Cart works:</p>
          <ProductList />
        </section>

        <section className="about-section">
          <h2>About Alt-Cart</h2>
          <p>
            Alt-Cart helps visually impaired shoppers make informed purchasing decisions by
            providing accessible product information extracted from e-commerce websites.
          </p>
          <ul>
            <li>Detailed image descriptions for screen readers</li>
            <li>Review insights including fit analysis and common themes</li>
            <li>Return risk assessment based on customer feedback</li>
            <li>Full text-to-speech support with adjustable speed</li>
            <li>Keyboard-first navigation and WCAG-compliant design</li>
          </ul>
        </section>
      </main>
    </>
  );
}

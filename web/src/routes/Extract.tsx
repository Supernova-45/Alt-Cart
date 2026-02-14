import { useEffect, useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { extractProduct } from "../lib/api";
import { isExtractableProductUrl } from "../lib/urlToDemo";

export function Extract() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const returnTo = searchParams.get("returnTo");
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectId, setRedirectId] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setStatus("error");
      setErrorMessage("No URL provided");
      return;
    }

    if (!isExtractableProductUrl(url)) {
      setStatus("error");
      setErrorMessage("URL is not a supported product page");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    extractProduct(url)
      .then((result) => {
        setRedirectId(result.data.id);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Extraction failed");
      });
  }, [url]);

  if (!url) {
    return <Navigate to="/unsupported?reason=missing_url" replace />;
  }

  if (status === "success" && redirectId) {
    const passportUrl = returnTo ? `/p/${redirectId}?returnTo=${encodeURIComponent(returnTo)}` : `/p/${redirectId}`;
    return <Navigate to={passportUrl} replace />;
  }

  if (status === "loading") {
    return (
      <div className="section-card" style={{ maxWidth: "var(--max-width)" }}>
        <h1>Extracting product data</h1>
        <p>This may take a moment while we load the page and extract the product information.</p>
      </div>
    );
  }

  return (
    <div className="section-card" style={{ maxWidth: "var(--max-width)" }}>
      <h1>Extraction failed</h1>
      <p style={{ marginBottom: "var(--space-md)" }}>
        {errorMessage}
      </p>
      <p style={{ marginBottom: "var(--space-md)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Live extraction supports Amazon, Walmart, eBay, Target, and Macy's product pages.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        <Link
          to={`/extract?url=${encodeURIComponent(url)}`}
          className="product-card__link"
          style={{ display: "inline-block", width: "fit-content" }}
        >
          Retry extraction
        </Link>
        <Link to="/s/a_search" className="product-card__link" style={{ display: "inline-block", width: "fit-content" }}>
          Open Amazon sneakers demo
        </Link>
        <Link to="/s/w_search" className="product-card__link" style={{ display: "inline-block", width: "fit-content" }}>
          Open Walmart backpack demo
        </Link>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getProduct } from "../lib/api";
import { getFallbackPassport } from "../lib/demoFallbacks";
import { speak, setPlayableText, clearPlayableText } from "../lib/tts";
import { TTSControls } from "../components/TTSControls";
import { SectionCard } from "../components/SectionCard";
import { buildComparisonNarrative, buildAttributeSections } from "../lib/buildComparison";
import { getCompareIds, removeFromCompare, clearCompare, MAX_COMPARE } from "../lib/compare";
import type { ProductPassport } from "../lib/productModel";

export function Compare() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean).slice(0, MAX_COMPARE) : getCompareIds();

  const navigate = useNavigate();
  const [passports, setPassports] = useState<ProductPassport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setPassports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all(
      ids.map(async (id) => {
        const res = await getProduct(id);
        if (res) return res.passport;
        return getFallbackPassport(id) ?? null;
      })
    )
      .then((results) => {
        const loaded = results.filter((p): p is ProductPassport => p != null);
        setPassports(loaded);
        if (loaded.length === 0) setError("No products could be loaded.");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load products");
        setPassports([]);
      })
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  const narrative = buildComparisonNarrative(passports);
  const attributeSections = buildAttributeSections(passports);

  useEffect(() => {
    if (passports.length > 0) {
      setPlayableText(narrative);
    }
    return () => clearPlayableText();
  }, [narrative, passports.length]);

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    const next = ids.filter((x) => x !== id);
    if (next.length > 0) {
      navigate(`/compare?ids=${next.join(",")}`);
    } else {
      navigate("/compare");
    }
  };

  const handleClear = () => {
    clearCompare();
    navigate("/compare");
  };

  if (ids.length === 0 && !loading) {
    return (
      <div className="section-card">
        <h1>Compare products</h1>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
          Add 2 or 3 products to compare them side by side with a spoken comparison.
        </p>
        <p>
          Use &quot;Add to compare&quot; on a product card (search results or passport) to add it here.
        </p>
        <Link to="/s/a_search" className="product-card__link" style={{ display: "inline-block", marginTop: "1rem" }}>
          Try demo search
        </Link>
      </div>
    );
  }

  if (loading && passports.length === 0) {
    return (
      <div className="section-card">
        <h1>Compare products</h1>
        <p>Loading products…</p>
      </div>
    );
  }

  if (error && passports.length === 0) {
    return (
      <div className="section-card">
        <h1>Compare products</h1>
        <p role="alert" style={{ color: "var(--color-error, #c00)" }}>
          {error}
        </p>
        <Link to="/compare" className="product-card__link">
          Start over
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="passport-header" style={{ marginBottom: "var(--space-lg)" }}>
        <Link to="/" className="passport-header__back">
          ← Back
        </Link>
        <h1 className="passport-header__title">Compare {passports.length} product{passports.length !== 1 ? "s" : ""}</h1>
        <TTSControls summaryText={narrative} disabled={loading} />
      </header>

      {passports.length === 1 && (
        <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
          Add another product to compare. Use &quot;Add to compare&quot; on a product from search results or a passport.
        </p>
      )}

      {passports.length >= 2 && (
        <>
          <SectionCard
            id="compare-narrative"
            title="Spoken comparison"
            readText={narrative}
            onReadSection={() => speak(narrative)}
          >
            <p style={{ margin: 0 }}>{narrative}</p>
          </SectionCard>

          {attributeSections.map((section) => (
            <SectionCard
              key={section.title}
              id={`compare-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
              title={section.title}
              readText={section.readText}
              onReadSection={() => speak(section.readText)}
            >
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {section.items.map((item) => (
                  <li key={item.label} style={{ marginBottom: "var(--space-sm)" }}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </>
      )}

      <div className="compare-product-chips">
        {passports.map((p) => (
          <div key={p.id} className="compare-product-chip">
            <Link to={`/p/${p.id}`} className="compare-product-chip__name" style={{ textDecoration: "none", color: "inherit" }}>
              {p.name}
            </Link>
            <button
              type="button"
              onClick={() => handleRemove(p.id)}
              className="compare-remove-btn"
              aria-label={`Remove ${p.name} from comparison`}
            >
              Remove
            </button>
          </div>
        ))}
        {passports.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="compare-clear-btn"
            aria-label="Clear comparison"
          >
            Clear all
          </button>
        )}
      </div>
    </>
  );
}

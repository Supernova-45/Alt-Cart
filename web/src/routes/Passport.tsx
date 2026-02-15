import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchSnapshot } from "../lib/fetchSnapshot";
import { parseProductSnapshot } from "../lib/parseProductSnapshot";
import { mergePassport } from "../lib/mergePassport";
import { getFallbackPassport } from "../lib/demoFallbacks";
import { SNAPSHOTS } from "../lib/snapshotRegistry";
import { getProduct } from "../lib/api";
import { speak, setPlayableText, clearPlayableText } from "../lib/tts";
import type { ProductPassport } from "../lib/productModel";
import { TTSControls } from "../components/TTSControls";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import { useCompareModeOptional } from "../components/CompareModeContext";

export function Passport() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [passport, setPassport] = useState<ProductPassport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setPassport(null);
      setError("No product ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fallback = getFallbackPassport(id);
    const snapshotPath = SNAPSHOTS[id as keyof typeof SNAPSHOTS]?.path;
    const isDemoProduct = !!fallback && !!snapshotPath;

    // For known demo products, skip API and load from snapshot directly (avoids blank screen while API times out)
    if (isDemoProduct) {
      fetchSnapshot(snapshotPath!)
        .then((doc) => {
          const parsed = parseProductSnapshot(doc, snapshotPath!);
          const merged = mergePassport(fallback!, parsed);
          setPassport(merged);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load snapshot");
          setPassport(fallback);
        })
        .finally(() => setLoading(false));
      return;
    }

    // For non-demo products, try API first
    getProduct(id)
      .then((response) => {
        if (response) {
          setPassport(response.passport);
          setLoading(false);
          return;
        }

        if (!fallback) {
          setPassport(null);
          setLoading(false);
          return;
        }

        if (!snapshotPath) {
          setPassport(fallback);
          setLoading(false);
          return;
        }

        return fetchSnapshot(snapshotPath)
          .then((doc) => {
            const parsed = parseProductSnapshot(doc, snapshotPath);
            const merged = mergePassport(fallback, parsed);
            setPassport(merged);
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to load snapshot");
            setPassport(fallback);
          });
      })
      .catch((err) => {
        if (fallback) setPassport(fallback);
        setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="error-card">
        <h1>Invalid product</h1>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  if (loading && !passport) {
    return (
      <div className="passport-loading" role="status" aria-live="polite">
        <p>Loading passport…</p>
      </div>
    );
  }

  // If we don't have a passport yet (still loading or failed), show error
  if (!passport && !loading) {
    return (
      <div className="error-card">
        <h1>Product not found</h1>
        <p className="error-card__message">Unable to load product. Please try again.</p>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="passport-loading" role="status" aria-live="polite">
        <p>Loading…</p>
      </div>
    );
  }

  const p = passport;
  const fallback = getFallbackPassport(id);
  const compareMode = useCompareModeOptional();
  const inCompareMode = compareMode?.compareMode ?? false;
  const selected = (compareMode?.selectedIds ?? []).includes(id);
  const selectionFull =
    inCompareMode &&
    (compareMode?.selectedIds ?? []).length >= 3 &&
    !(compareMode?.selectedIds ?? []).includes(id);

  const handleSelectForCompare = () => {
    if (selectionFull) return;
    compareMode?.toggleProduct(id);
  };

  const backTo = returnTo
    ? { path: returnTo, label: "Back to search results" }
    : fallback
      ? (id?.startsWith("w_")
          ? { path: "/s/w_search", label: "Back to backpacks" }
          : { path: "/s/a_search", label: "Back to sneakers" })
      : { path: "/", label: "Back to home" };

  const summaryText = [
    p.brand && `${p.brand}.`,
    p.priceText && p.priceText,
    p.fitSummary && `Fit: ${p.fitSummary.verdict}, ${Math.round(p.fitSummary.confidence * 100)}% confidence.`,
    p.shortDescription,
    p.demoDisclosure,
  ]
    .filter(Boolean)
    .join(" ");

  const sizingText = p.fitSummary
    ? [
        `Sizing: ${p.fitSummary.verdict}.`,
        `Confidence: ${Math.round(p.fitSummary.confidence * 100)}% based on customer reviews.`,
        ...p.fitSummary.evidence,
      ].join(" ")
    : "";

  const imageDescText = [p.images.altShort, p.images.altLong].filter(Boolean).join(" ");

  const sustainabilityText = p.sustainability
    ? [
        `Sustainability rating: ${p.sustainability.rating}. Overall score: ${p.sustainability.overallScore} out of 100.`,
        `Materials: ${p.sustainability.categories.materials.label}.`,
        `Manufacturing: ${p.sustainability.categories.manufacturing.label}.`,
        `Certifications: ${p.sustainability.categories.certifications.label}.`,
        `Shipping: ${p.sustainability.categories.shipping.label}.`,
        p.sustainability.origin ? `Made in: ${p.sustainability.origin}.` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "No sustainability data available.";

  const reviewerWarningsText = [
    ...p.themes.map(
      (t) => `${t.label}: ${t.severity} severity. ${t.evidence.join(" ")}`
    ),
  ]
    .filter(Boolean)
    .join(" ");

  const returnRiskText = [
    "Fewer returns mean less waste and lower carbon footprint.",
    `Return risk: ${p.returnRisk.label}.`,
    p.returnRisk.drivers.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setPlayableText(p.narration.medium);
    return () => clearPlayableText();
  }, [p.narration.medium]);

  return (
    <>
      <header className="passport-header">
        <Link to={backTo.path} className="passport-header__back">
          ← {backTo.label}
        </Link>
        <h1 className="passport-header__title">{p.name}</h1>
        <div className="passport-header__stats">
          <StatPill label="Price" value={p.priceText} />
          <StatPill label="Rating" value={p.ratingText} />
          <StatPill label="Reviews" value={p.reviewCountText} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", alignItems: "center" }}>
          {inCompareMode && (
            <button
              type="button"
              className="compare-select-btn"
              onClick={handleSelectForCompare}
              disabled={selectionFull}
              aria-pressed={selected}
              aria-label={selectionFull ? "Compare list is full" : selected ? "Remove from compare" : "Select for compare"}
            >
              {selected ? "Selected" : selectionFull ? "Compare full" : "Select for compare"}
            </button>
          )}
          <TTSControls summaryText={p.narration.medium} disabled={loading} />
        </div>
      </header>

      {error && (
        <div className="tts-banner" role="alert">
          {error} Using fallback data.
        </div>
      )}

      <SectionCard
        id="summary"
        title="Summary"
        readText={summaryText}
        onReadSection={() => speak(summaryText)}
      >
        {p.brand && <p><strong>Brand:</strong> {p.brand}</p>}
        {p.priceText && <p><strong>Price:</strong> {p.priceText}</p>}
        {p.fitSummary && (
          <p>
            <strong>Fit:</strong> {p.fitSummary.verdict} (confidence:{" "}
            {Math.round(p.fitSummary.confidence * 100)}%)
          </p>
        )}
        <p>{p.shortDescription}</p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          {p.demoDisclosure}
        </p>
      </SectionCard>

      {p.fitSummary && (
        <SectionCard
          id="sizing"
          title="Sizing"
          readText={sizingText}
          onReadSection={() => speak(sizingText)}
        >
          <p>
            <strong>Fit:</strong> {p.fitSummary.verdict} (confidence:{" "}
            {Math.round(p.fitSummary.confidence * 100)}%)
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-md)" }}>
            Based on customer review analysis.
          </p>
          {p.fitSummary.evidence.length > 0 && (
            <>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-sm)" }}>Review insights</h3>
              <ul>
                {p.fitSummary.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      )}

      <SectionCard
        id="image-description"
        title="Image description"
        readText={imageDescText}
        onReadSection={() => speak(imageDescText)}
      >
        <div style={{ display: "flex", gap: "var(--space-lg)", alignItems: "flex-start", flexWrap: "wrap" }}>
          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt={p.images.altLong}
              width={160}
              height={160}
              style={{ objectFit: "contain", borderRadius: "var(--radius-sm)", background: "transparent" }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p><strong>Short:</strong> {p.images.altShort}</p>
            <p>{p.images.altLong}</p>
          </div>
        </div>
      </SectionCard>

      {p.sustainability && (
        <SectionCard
          id="sustainability"
          title="Sustainability"
          readText={sustainabilityText}
          onReadSection={() => speak(sustainabilityText)}
        >
          <div className="sustainability-overview">
            <span className="sustainability-overview__rating">{p.sustainability.rating}</span>
            <span className="sustainability-overview__score">{p.sustainability.overallScore}/100</span>
          </div>

          <div className="sustainability-category">
            <div className="sustainability-category__header">
              <h3 className="sustainability-category__title">Materials</h3>
              <span className="sustainability-category__score">{p.sustainability.categories.materials.score}/100</span>
            </div>
            {p.sustainability.categories.materials.details.length > 0 && (
              <ul className="sustainability-category__details">
                {p.sustainability.categories.materials.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="sustainability-category">
            <div className="sustainability-category__header">
              <h3 className="sustainability-category__title">Manufacturing</h3>
              <span className="sustainability-category__score">{p.sustainability.categories.manufacturing.score}/100</span>
            </div>
            {p.sustainability.categories.manufacturing.details.length > 0 && (
              <ul className="sustainability-category__details">
                {p.sustainability.categories.manufacturing.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="sustainability-category">
            <div className="sustainability-category__header">
              <h3 className="sustainability-category__title">Certifications</h3>
              <span className="sustainability-category__score">{p.sustainability.categories.certifications.score}/100</span>
            </div>
            {p.sustainability.categories.certifications.details.length > 0 && (
              <ul className="sustainability-category__details">
                {p.sustainability.categories.certifications.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="sustainability-category">
            <div className="sustainability-category__header">
              <h3 className="sustainability-category__title">Shipping</h3>
              <span className="sustainability-category__score">{p.sustainability.categories.shipping.score}/100</span>
            </div>
            {p.sustainability.categories.shipping.details.length > 0 && (
              <ul className="sustainability-category__details">
                {p.sustainability.categories.shipping.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>

          {p.sustainability.sustainabilityBadges && p.sustainability.sustainabilityBadges.length > 0 && (
            <div className="sustainability-badges">
              <h3 className="sustainability-badges__title">Notable features</h3>
              <ul className="sustainability-category__details">
                {p.sustainability.sustainabilityBadges.map((badge, idx) => (
                  <li key={idx}>{badge}</li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard
        id="reviewer-warnings"
        title="Reviewer warnings"
        readText={reviewerWarningsText}
        onReadSection={() => speak(reviewerWarningsText)}
      >
        {p.themes.length > 0 && (
          <div>
            <h3>Themes</h3>
            {p.themes.map((t, i) => (
              <div key={i} style={{ marginBottom: "var(--space-sm)" }}>
                <p>
                  <strong>{t.label}</strong> — {t.severity} ({Math.round(t.share * 100)}% of reviews)
                </p>
                <ul>
                  {t.evidence.map((e, j) => (
                    <li key={j}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="return-risk"
        title="Return risk"
        readText={returnRiskText}
        onReadSection={() => speak(returnRiskText)}
      >
        <p style={{ marginBottom: "var(--space-md)" }}>
          Fewer returns mean less waste and lower carbon footprint.
        </p>
        <p>
          <strong>Risk:</strong> {p.returnRisk.label} (
          {Math.round(p.returnRisk.score * 100)}%)
        </p>
        <ul>
          {p.returnRisk.drivers.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSnapshot } from "../lib/fetchSnapshot";
import { parseProductSnapshot } from "../lib/parseProductSnapshot";
import { mergePassport } from "../lib/mergePassport";
import { getFallbackPassport } from "../lib/demoFallbacks";
import { SNAPSHOTS } from "../lib/snapshotRegistry";
import { speak } from "../lib/tts";
import type { ProductPassport } from "../lib/productModel";
import { TTSControls } from "../components/TTSControls";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

export function Passport() {
  const { id } = useParams<{ id: string }>();
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

    const fallback = getFallbackPassport(id);
    if (!fallback) {
      setPassport(null);
      setError(null);
      setLoading(false);
      return;
    }

    const snapshotPath = SNAPSHOTS[id as keyof typeof SNAPSHOTS]?.path;
    if (!snapshotPath) {
      setPassport(fallback);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchSnapshot(snapshotPath)
      .then((doc) => {
        const parsed = parseProductSnapshot(doc, snapshotPath);
        const merged = mergePassport(fallback, parsed);
        setPassport(merged);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load snapshot");
        setPassport(fallback);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (!id) {
    return (
      <div className="error-card">
        <h1>Invalid product</h1>
        <Link to="/">Return to products</Link>
      </div>
    );
  }

  const fallback = getFallbackPassport(id);
  if (!fallback) {
    return (
      <div className="error-card">
        <h1>Product not found</h1>
        <p className="error-card__message">Unknown product ID: {id}</p>
        <Link to="/">Return to products</Link>
      </div>
    );
  }

  if (loading && !passport) {
    return <p>Loading passport…</p>;
  }

  const p = passport ?? fallback;

  const summaryText = [
    p.brand && `${p.brand}.`,
    p.priceText && p.priceText,
    p.fitSummary && `Fit: ${p.fitSummary.verdict}.`,
    p.shortDescription,
    p.demoDisclosure,
  ]
    .filter(Boolean)
    .join(" ");

  const imageDescText = [p.images.altShort, p.images.altLong].filter(Boolean).join(" ");

  const sustainabilityText = p.sustainability
    ? [
        `Sustainability score: ${p.sustainability.label}.`,
        p.sustainability.materials?.length
          ? `Materials: ${p.sustainability.materials.join(", ")}.`
          : "",
        p.sustainability.badges?.length
          ? `Badges: ${p.sustainability.badges.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "No sustainability data available.";

  const reviewerWarningsText = [
    p.fitSummary && `Fit: ${p.fitSummary.verdict}. ${p.fitSummary.evidence.join(" ")}`,
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

  return (
    <>
      <header className="passport-header">
        <Link to="/" className="passport-header__back">
          ← Back to products
        </Link>
        <h1 className="passport-header__title">{p.name}</h1>
        <div className="passport-header__stats">
          <StatPill label="Price" value={p.priceText} />
          <StatPill label="Rating" value={p.ratingText} />
          <StatPill label="Reviews" value={p.reviewCountText} />
          {p.returnRisk.label === "Low" && (
            <span className="sustainable-badge">Sustainable choice</span>
          )}
        </div>
        <TTSControls summaryText={p.narration.medium} disabled={loading} />
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
          <p>
            <strong>Eco score:</strong> {p.sustainability.label} (
            {Math.round(p.sustainability.score * 100)}%)
          </p>
          {p.sustainability.materials && p.sustainability.materials.length > 0 && (
            <p>
              <strong>Materials:</strong> {p.sustainability.materials.join(", ")}
            </p>
          )}
          {p.sustainability.badges && p.sustainability.badges.length > 0 && (
            <p>
              <strong>Badges:</strong> {p.sustainability.badges.join(", ")}
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard
        id="reviewer-warnings"
        title="Reviewer warnings"
        readText={reviewerWarningsText}
        onReadSection={() => speak(reviewerWarningsText)}
      >
        {p.fitSummary && (
          <div style={{ marginBottom: "var(--space-md)" }}>
            <h3>Fit</h3>
            <p>
              {p.fitSummary.verdict} (confidence:{" "}
              {Math.round(p.fitSummary.confidence * 100)}%)
            </p>
            <ul>
              {p.fitSummary.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
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

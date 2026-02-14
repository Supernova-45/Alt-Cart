import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchSnapshot } from "../lib/fetchSnapshot";
import { parseProductSnapshot } from "../lib/parseProductSnapshot";
import { mergePassport } from "../lib/mergePassport";
import { getFallbackPassport } from "../lib/demoFallbacks";
import { SNAPSHOTS } from "../lib/snapshotRegistry";
import { getProduct } from "../lib/api";
import { speak } from "../lib/tts";
import type { ProductPassport } from "../lib/productModel";
import { TTSControls } from "../components/TTSControls";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";

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

    // Try to fetch from API first
    getProduct(id)
      .then((response) => {
        if (response) {
          setPassport(response.passport);
          setLoading(false);
          return;
        }

        // API fetch failed or returned null, try fallback demo data
        const fallback = getFallbackPassport(id);
        if (!fallback) {
          setPassport(null);
          setLoading(false);
          return;
        }

        const snapshotPath = SNAPSHOTS[id as keyof typeof SNAPSHOTS]?.path;
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
        // API error, try fallback
        const fallback = getFallbackPassport(id);
        if (fallback) {
          setPassport(fallback);
        }
        setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => {
        setLoading(false);
      });
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
    return <p>Loading passport…</p>;
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

  // Use the passport we loaded (from API or fallback)
  if (!passport) {
    return <p>Loading…</p>;
  }

  const p = passport;
  const fallback = getFallbackPassport(id);

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
    p.fitSummary && `Fit: ${p.fitSummary.verdict}.`,
    p.shortDescription,
    p.demoDisclosure,
  ]
    .filter(Boolean)
    .join(" ");

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
        <Link to={backTo.path} className="passport-header__back">
          ← {backTo.label}
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
          title="Sustainability Analysis"
          readText={sustainabilityText}
          onReadSection={() => speak(sustainabilityText)}
        >
          <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            This product has been analyzed across four key sustainability categories. Each category is weighted based on its environmental impact.
          </p>

          {/* Materials Section */}
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>
                🌿 Materials & Composition
              </h3>
              <span style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                padding: "0.25rem 0.75rem",
                backgroundColor: p.sustainability.categories.materials.score >= 70 ? "#d1fae5" :
                                 p.sustainability.categories.materials.score >= 50 ? "#dbeafe" :
                                 p.sustainability.categories.materials.score >= 30 ? "#fed7aa" : "#fee2e2",
                color: p.sustainability.categories.materials.score >= 70 ? "#065f46" :
                       p.sustainability.categories.materials.score >= 50 ? "#1e3a8a" :
                       p.sustainability.categories.materials.score >= 30 ? "#92400e" : "#991b1b",
                borderRadius: "12px"
              }}>
                {p.sustainability.categories.materials.score}/100
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Weight: 35% of overall score
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem", fontSize: "0.95rem" }}>
              {p.sustainability.categories.materials.details.map((detail, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Manufacturing Section */}
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px", borderLeft: "4px solid #8b5cf6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>
                🏭 Manufacturing & Labor
              </h3>
              <span style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                padding: "0.25rem 0.75rem",
                backgroundColor: p.sustainability.categories.manufacturing.score >= 70 ? "#d1fae5" :
                                 p.sustainability.categories.manufacturing.score >= 50 ? "#dbeafe" :
                                 p.sustainability.categories.manufacturing.score >= 30 ? "#fed7aa" : "#fee2e2",
                color: p.sustainability.categories.manufacturing.score >= 70 ? "#065f46" :
                       p.sustainability.categories.manufacturing.score >= 50 ? "#1e3a8a" :
                       p.sustainability.categories.manufacturing.score >= 30 ? "#92400e" : "#991b1b",
                borderRadius: "12px"
              }}>
                {p.sustainability.categories.manufacturing.score}/100
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Weight: 25% of overall score
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem", fontSize: "0.95rem" }}>
              {p.sustainability.categories.manufacturing.details.map((detail, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Certifications Section */}
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>
                ✓ Certifications & Standards
              </h3>
              <span style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                padding: "0.25rem 0.75rem",
                backgroundColor: p.sustainability.categories.certifications.score >= 70 ? "#d1fae5" :
                                 p.sustainability.categories.certifications.score >= 50 ? "#dbeafe" :
                                 p.sustainability.categories.certifications.score >= 30 ? "#fed7aa" : "#fee2e2",
                color: p.sustainability.categories.certifications.score >= 70 ? "#065f46" :
                       p.sustainability.categories.certifications.score >= 50 ? "#1e3a8a" :
                       p.sustainability.categories.certifications.score >= 30 ? "#92400e" : "#991b1b",
                borderRadius: "12px"
              }}>
                {p.sustainability.categories.certifications.score}/100
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Weight: 30% of overall score
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem", fontSize: "0.95rem" }}>
              {p.sustainability.categories.certifications.details.map((detail, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Shipping Section */}
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>
                📦 Shipping & Packaging
              </h3>
              <span style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                padding: "0.25rem 0.75rem",
                backgroundColor: p.sustainability.categories.shipping.score >= 70 ? "#d1fae5" :
                                 p.sustainability.categories.shipping.score >= 50 ? "#dbeafe" :
                                 p.sustainability.categories.shipping.score >= 30 ? "#fed7aa" : "#fee2e2",
                color: p.sustainability.categories.shipping.score >= 70 ? "#065f46" :
                       p.sustainability.categories.shipping.score >= 50 ? "#1e3a8a" :
                       p.sustainability.categories.shipping.score >= 30 ? "#92400e" : "#991b1b",
                borderRadius: "12px"
              }}>
                {p.sustainability.categories.shipping.score}/100
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
              Weight: 10% of overall score
            </p>
            <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem", fontSize: "0.95rem" }}>
              {p.sustainability.categories.shipping.details.map((detail, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Sustainability Features */}
          {p.sustainability.sustainabilityBadges && p.sustainability.sustainabilityBadges.length > 0 && (
            <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#ecfdf5", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                🌱 Additional Sustainability Features
              </h3>
              <ul style={{ marginLeft: "1.5rem", fontSize: "0.95rem" }}>
                {p.sustainability.sustainabilityBadges.map((badge, idx) => (
                  <li key={idx} style={{ marginBottom: "0.25rem" }}>{badge}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Rating Summary */}
          <div style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: p.sustainability.rating === "Excellent" ? "#d1fae5" :
                             p.sustainability.rating === "Good" ? "#dbeafe" :
                             p.sustainability.rating === "Fair" ? "#fef3c7" :
                             p.sustainability.rating === "Poor" ? "#fee2e2" : "#fecaca",
            borderRadius: "12px",
            border: "2px solid " + (
              p.sustainability.rating === "Excellent" ? "#10b981" :
              p.sustainability.rating === "Good" ? "#3b82f6" :
              p.sustainability.rating === "Fair" ? "#f59e0b" :
              p.sustainability.rating === "Poor" ? "#ef4444" : "#991b1b"
            )
          }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem", textAlign: "center" }}>
              Overall Sustainability Rating
            </h3>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                color: p.sustainability.rating === "Excellent" ? "#065f46" :
                       p.sustainability.rating === "Good" ? "#1e3a8a" :
                       p.sustainability.rating === "Fair" ? "#92400e" :
                       p.sustainability.rating === "Poor" ? "#991b1b" : "#7f1d1d"
              }}>
                {p.sustainability.rating}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#666" }}>
                {p.sustainability.overallScore}/100
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.95rem", color: "#666", margin: 0 }}>
              {p.sustainability.rating === "Excellent" ? "This product demonstrates exceptional sustainability practices across materials, manufacturing, certifications, and shipping." :
               p.sustainability.rating === "Good" ? "This product shows strong sustainability practices with room for improvement in some areas." :
               p.sustainability.rating === "Fair" ? "This product has moderate sustainability practices. Consider looking for better alternatives if sustainability is important to you." :
               p.sustainability.rating === "Poor" ? "This product has limited sustainability practices. Consider more eco-friendly alternatives." :
               "This product shows minimal sustainability efforts. Strongly consider more sustainable alternatives."}
            </p>
          </div>
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

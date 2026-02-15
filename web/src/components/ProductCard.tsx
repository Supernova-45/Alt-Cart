import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { speak } from "../lib/tts";
import { formatReviewCount } from "../lib/formatReviewCount";
import { useCompareModeOptional } from "./CompareModeContext";

interface ProductCardProps {
  /** Passport ID for demo products - links to /p/:id */
  id?: string;
  /** Product URL for live extraction - links to /open?url=... */
  productUrl?: string;
  /** Where to go when user clicks back from the product passport */
  returnTo?: string;
  name: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function ProductCard({
  id,
  productUrl,
  returnTo,
  name,
  priceText,
  ratingText,
  reviewCountText,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  const formatRating = (text: string | undefined): string | undefined => {
    if (!text) return undefined;
    const match = text.match(/(\d+\.?\d*)\s*(?:out of\s*)?5/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num >= 0 && num <= 5) return `${match[1]}/5 stars`;
    }
    const fallback = text.match(/(\d\.\d)/g);
    if (fallback) {
      for (const m of fallback) {
        const n = parseFloat(m);
        if (!isNaN(n) && n >= 0 && n <= 5) return `${m}/5 stars`;
      }
    }
    return undefined;
  };

  let formattedReviews: string | undefined;
  if (reviewCountText && !/capacit|color|size|option|storage/i.test(reviewCountText)) {
    const formatted = formatReviewCount(reviewCountText);
    if (formatted) formattedReviews = `${formatted} reviews`;
  }

  const meta = [priceText, formatRating(ratingText), formattedReviews].filter(Boolean).join(", ");
  const description = [name, meta, "See details"].filter(Boolean).join(". ");

  const speakDescription = useCallback(() => {
    if (description) speak(description);
  }, [description]);

  const hoveredSpeakRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleAltKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt" && hoveredSpeakRef.current) {
        hoveredSpeakRef.current();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleAltKeyDown);
    return () => window.removeEventListener("keydown", handleAltKeyDown);
  }, []);

  const lastSpokeAt = useRef<number>(0);
  const MIN_SPEAK_INTERVAL_MS = 900;

  const handleMouseEnter = useCallback(() => {
    hoveredSpeakRef.current = speakDescription;
  }, [speakDescription]);

  const handleMouseLeave = useCallback(() => {
    hoveredSpeakRef.current = null;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.altKey && description) {
        const now = Date.now();
        if (now - lastSpokeAt.current >= MIN_SPEAK_INTERVAL_MS) {
          lastSpokeAt.current = now;
          speak(description);
        }
      }
    },
    [description]
  );

  const compareMode = useCompareModeOptional();
  const linkTo = productUrl
    ? returnTo
      ? `/open?url=${encodeURIComponent(productUrl)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/open?url=${encodeURIComponent(productUrl)}`
    : id
      ? `/p/${id}`
      : "#";

  const inCompareMode = compareMode?.compareMode ?? false;
  const selectedById = id != null && (compareMode?.selectedIds ?? []).includes(id);
  const selectedByUrl = productUrl != null && (compareMode?.selectedUrls ?? []).includes(productUrl);
  const selected = selectedById || selectedByUrl;
  const canSelect = inCompareMode && (id != null || productUrl != null);
  const totalSelected = (compareMode?.selectedIds ?? []).length + (compareMode?.selectedUrls ?? []).length;
  const selectionFull =
    inCompareMode &&
    totalSelected >= 3 &&
    !selectedById &&
    !selectedByUrl;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " && e.target === e.currentTarget) {
        e.preventDefault();
        if (canSelect && !selectionFull) {
          if (id) compareMode?.toggleProduct(id);
          else if (productUrl) compareMode?.toggleProductByUrl(productUrl);
        } else {
          speakDescription();
        }
      }
    },
    [speakDescription, canSelect, selectionFull, id, productUrl, compareMode]
  );

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canSelect || selectionFull) return;
      if ((e.target as HTMLElement).closest("a")) return;
      e.preventDefault();
      if (id) compareMode!.toggleProduct(id);
      else if (productUrl) compareMode!.toggleProductByUrl(productUrl);
    },
    [canSelect, selectionFull, id, productUrl, compareMode]
  );

  return (
    <article
      className={`product-card ${canSelect ? "product-card--compare-mode" : ""} ${selected ? "product-card--selected" : ""}`}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      onClick={handleCardClick}
      aria-label={description}
      aria-selected={canSelect ? selected : undefined}
    >
      <div className="product-card__row">
        {imageUrl && (
          <div className="product-card__thumb">
            <img
              src={imageUrl}
              alt={imageAlt ?? name}
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
        <div className="product-card__content">
          <h2 className="product-card__title">{name}</h2>
          {meta && <p className="product-card__meta">{meta}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", alignItems: "center" }}>
            <Link to={linkTo} className="product-card__link" onClick={(e) => e.stopPropagation()}>
              See details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

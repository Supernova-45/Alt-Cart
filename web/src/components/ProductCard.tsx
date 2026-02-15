import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { speak } from "../lib/tts";
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
  let sanitizedReviewCount: string | undefined;
  if (reviewCountText) {
    const trimmed = reviewCountText.trim();
    const numMatch = trimmed.replace(/,/g, "").match(/\d+/);
    const isVariantText =
      /capacit|color|size|option|storage/i.test(trimmed) || (numMatch && numMatch[0].length < 2 && trimmed.length > 4);
    if (numMatch && !isVariantText) {
      sanitizedReviewCount = `(${numMatch[0]})`;
    }
  }
  const meta = [priceText, ratingText, sanitizedReviewCount].filter(Boolean).join(" · ");
  const description = [name, meta, "See details"].filter(Boolean).join(". ");

  const speakDescription = useCallback(() => {
    if (description) speak(description);
  }, [description]);

  const hoveredSpeakRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleAltKey = (e: KeyboardEvent) => {
      if (e.key === "Alt" && hoveredSpeakRef.current) {
        hoveredSpeakRef.current();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleAltKey);
    return () => window.removeEventListener("keydown", handleAltKey);
  }, []);

  const handleMouseEnter = useCallback(() => {
    hoveredSpeakRef.current = speakDescription;
  }, [speakDescription]);

  const handleMouseLeave = useCallback(() => {
    hoveredSpeakRef.current = null;
  }, []);

  const compareMode = useCompareModeOptional();
  const linkTo = productUrl
    ? returnTo
      ? `/open?url=${encodeURIComponent(productUrl)}&returnTo=${encodeURIComponent(returnTo)}`
      : `/open?url=${encodeURIComponent(productUrl)}`
    : id
      ? `/p/${id}`
      : "#";

  const inCompareMode = compareMode?.compareMode ?? false;
  const selected = id != null && (compareMode?.selectedIds ?? []).includes(id);
  const canSelect = id != null && inCompareMode;
  const selectionFull =
    inCompareMode &&
    (compareMode?.selectedIds ?? []).length >= 3 &&
    !(compareMode?.selectedIds ?? []).includes(id ?? "");

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " && e.target === e.currentTarget) {
        e.preventDefault();
        if (canSelect && !selectionFull && id) {
          compareMode?.toggleProduct(id);
        } else {
          speakDescription();
        }
      }
    },
    [speakDescription, canSelect, selectionFull, id, compareMode]
  );

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canSelect || selectionFull) return;
      if ((e.target as HTMLElement).closest("a")) return;
      e.preventDefault();
      compareMode!.toggleProduct(id!);
    },
    [canSelect, selectionFull, id, compareMode]
  );

  return (
    <article
      className={`product-card ${canSelect ? "product-card--compare-mode" : ""} ${selected ? "product-card--selected" : ""}`}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            {canSelect && (
              <span className="product-card__select-label" aria-hidden>
                {selected ? "Selected" : selectionFull ? "Compare full" : "Select"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

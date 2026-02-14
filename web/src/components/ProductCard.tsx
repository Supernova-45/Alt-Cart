import { Link } from "react-router-dom";

interface ProductCardProps {
  /** Passport ID for demo products - links to /p/:id */
  id?: string;
  /** Product URL for live extraction - links to /open?url=... */
  productUrl?: string;
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
  const linkTo = productUrl
    ? `/open?url=${encodeURIComponent(productUrl)}`
    : id
      ? `/p/${id}`
      : "#";

  return (
    <article className="product-card">
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
          <Link to={linkTo} className="product-card__link">
            See details
          </Link>
        </div>
      </div>
    </article>
  );
}

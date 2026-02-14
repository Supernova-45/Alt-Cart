import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function ProductCard({
  id,
  name,
  priceText,
  ratingText,
  reviewCountText,
  imageUrl,
  imageAlt,
}: ProductCardProps) {
  const meta = [priceText, ratingText, reviewCountText].filter(Boolean).join(" · ");

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
          <Link to={`/p/${id}`} className="product-card__link">
            See details
          </Link>
        </div>
      </div>
    </article>
  );
}

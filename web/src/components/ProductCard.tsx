import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
}

export function ProductCard({
  id,
  name,
  priceText,
  ratingText,
  reviewCountText,
}: ProductCardProps) {
  const meta = [priceText, ratingText, reviewCountText].filter(Boolean).join(" · ");

  return (
    <article className="product-card">
      <h2 className="product-card__title">{name}</h2>
      {meta && <p className="product-card__meta">{meta}</p>}
      <Link to={`/p/${id}`} className="product-card__link">
        Open Passport
      </Link>
    </article>
  );
}

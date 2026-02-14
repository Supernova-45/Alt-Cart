import { Link } from "react-router-dom";
import { ProductList } from "../components/ProductList";

export function Home() {
  return (
    <>
      <h1>EchoCart</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
        Accessible product passports for Amazon white sneakers and Walmart backpacks. Use the browser extension on a product or search page, or browse below.
      </p>
      <p style={{ marginBottom: "1rem", fontSize: "var(--text-sm)" }}>
        <Link to="/s/a_search" className="product-card__link">
          Amazon white sneakers search
        </Link>
        {" · "}
        <Link to="/s/w_search" className="product-card__link">
          Walmart backpack search
        </Link>
      </p>
      <h2 style={{ marginTop: "var(--space-xl)", marginBottom: "var(--space-md)" }}>All products</h2>
      <ProductList />
    </>
  );
}

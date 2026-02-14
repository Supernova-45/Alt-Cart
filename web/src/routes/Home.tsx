import { Link } from "react-router-dom";
import { ProductList } from "../components/ProductList";

export function Home() {
  return (
    <>
      <h1>Demo Products</h1>
      <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
        Explore pre-loaded demo products to see how Alt-Cart works. No extraction needed.
      </p>
      <p style={{ marginBottom: "1.5rem", fontSize: "var(--text-sm)" }}>
        <Link to="/s/a_search" className="product-card__link">
          Amazon white sneakers search
        </Link>
        {" · "}
        <Link to="/s/w_search" className="product-card__link">
          Walmart backpack search
        </Link>
      </p>

      <section className="demo-section">
        <h2>All products</h2>
        <ProductList />
      </section>

      <section className="about-section">
        <h2>About Alt-Cart</h2>
        <p>
          Alt-Cart helps visually impaired shoppers make informed purchasing decisions by
          providing accessible product information extracted from e-commerce websites.
        </p>
        <ul>
          <li>Detailed image descriptions for screen readers</li>
          <li>Review insights including fit analysis and common themes</li>
          <li>Return risk assessment based on customer feedback</li>
          <li>Full text-to-speech support with adjustable speed</li>
          <li>Keyboard-first navigation and WCAG-compliant design</li>
        </ul>
      </section>
    </>
  );
}

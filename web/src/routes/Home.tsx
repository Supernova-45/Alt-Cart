import { Link } from "react-router-dom";

export function Home() {
  return (
    <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
      <h1>EchoCart</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
        Accessible product passports for Amazon white sneakers and Walmart backpacks. Use the browser extension on a product or search page to open a passport.
      </p>
      <p style={{ marginBottom: "1rem" }}>
        <Link to="/s/a_search" className="product-card__link">
          Amazon white sneakers search demo
        </Link>
        {" · "}
        <Link to="/s/w_search" className="product-card__link">
          Walmart backpack search demo
        </Link>
      </p>
    </div>
  );
}

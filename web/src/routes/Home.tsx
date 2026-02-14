import { ProductList } from "../components/ProductList";

export function Home() {
  return (
    <>
      <h1>White Sneakers</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)" }}>
        Browse curated white sneaker products. Open a passport for accessible product details, image descriptions, and review insights.
      </p>
      <ProductList />
    </>
  );
}

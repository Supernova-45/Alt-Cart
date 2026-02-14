import { useSearchParams, Link } from "react-router-dom";

export function Unsupported() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const reason = searchParams.get("reason");

  return (
    <div className="section-card" style={{ maxWidth: "var(--max-width)" }}>
      <h1>Unsupported in demo</h1>
      <p style={{ marginBottom: "var(--space-lg)" }}>
        This demo supports Amazon white sneakers and Walmart backpacks.
      </p>
      {reason && (
        <p style={{ marginBottom: "var(--space-md)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Reason: {reason.replace(/_/g, " ")}
        </p>
      )}
      {url && (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <label htmlFor="unsupported-url" style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "var(--text-sm)" }}>
            URL:
          </label>
          <code
            id="unsupported-url"
            style={{
              display: "block",
              padding: "var(--space-md)",
              background: "var(--color-bg)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              wordBreak: "break-all",
            }}
          >
            {url}
          </code>
        </div>
      )}
      <p style={{ marginBottom: "var(--space-md)", fontWeight: 500 }}>
        Open a demo:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
        <Link to="/s/a_search" className="product-card__link" style={{ display: "inline-block", width: "fit-content" }}>
          Open Amazon sneakers search demo
        </Link>
        <Link to="/s/w_search" className="product-card__link" style={{ display: "inline-block", width: "fit-content" }}>
          Open Walmart backpack search demo
        </Link>
      </div>
      <p style={{ marginBottom: "var(--space-sm)", fontWeight: 500, fontSize: "var(--text-sm)" }}>
        Product demos:
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
        <li><Link to="/p/adidas" className="product-card__link" style={{ display: "inline-block" }}>adidas</Link></li>
        <li><Link to="/p/puma" className="product-card__link" style={{ display: "inline-block" }}>Puma</Link></li>
        <li><Link to="/p/on" className="product-card__link" style={{ display: "inline-block" }}>On</Link></li>
        <li><Link to="/p/w_ozark" className="product-card__link" style={{ display: "inline-block" }}>Ozark</Link></li>
        <li><Link to="/p/w_reebok" className="product-card__link" style={{ display: "inline-block" }}>Reebok</Link></li>
      </ul>
    </div>
  );
}

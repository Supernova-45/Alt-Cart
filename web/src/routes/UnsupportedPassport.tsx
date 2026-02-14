import { Link } from "react-router-dom";
import { SNAPSHOTS, PRODUCT_IDS } from "../lib/snapshotRegistry";

interface UnsupportedPassportProps {
  message?: string;
}

export function UnsupportedPassport({
  message = "Unsupported in demo. This product is not in our curated list.",
}: UnsupportedPassportProps) {
  return (
    <div className="section-card" style={{ maxWidth: "var(--max-width)" }}>
      <h1>Unsupported in demo</h1>
      <p style={{ marginBottom: "var(--space-lg)" }}>{message}</p>
      <p style={{ marginBottom: "var(--space-md)", fontWeight: 500 }}>
        Open one of these demo passports:
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {PRODUCT_IDS.map((id) => (
          <li key={id}>
            <Link
              to={`/passport/${id}`}
              className="product-card__link"
              style={{ display: "inline-block" }}
            >
              {SNAPSHOTS[id].label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

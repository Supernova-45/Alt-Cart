import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="error-card">
      <h1>Page not found</h1>
      <p className="error-card__message">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}

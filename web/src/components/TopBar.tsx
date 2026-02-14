import { Link } from "react-router-dom";

export function TopBar({
  lowVision,
  onLowVisionChange,
}: {
  lowVision: boolean;
  onLowVisionChange: (enabled: boolean) => void;
}) {
  return (
    <header className="top-bar" role="banner">
      <Link to="/" className="top-bar__logo">
        <img src="/logo.png" alt="Alt+Cart" className="top-bar__logo-img" />
        Alt+Cart
      </Link>
      <div className="toggle">
        <label htmlFor="low-vision-toggle" className="toggle__label">
          Low Vision Mode
        </label>
        <input
          id="low-vision-toggle"
          type="checkbox"
          className="toggle__input"
          checked={lowVision}
          onChange={(e) => onLowVisionChange(e.target.checked)}
          aria-label="Toggle low vision mode"
        />
      </div>
    </header>
  );
}

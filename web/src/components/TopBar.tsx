import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompareIds, getCompareUrl, onCompareUpdated } from "../lib/compare";

export function TopBar({
  lowVision,
  onLowVisionChange,
}: {
  lowVision: boolean;
  onLowVisionChange: (enabled: boolean) => void;
}) {
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    setCompareCount(getCompareIds().length);
    return onCompareUpdated(() => setCompareCount(getCompareIds().length));
  }, []);

  return (
    <header className="top-bar" role="banner">
      <Link to="/" className="top-bar__logo">
        <img src="/logo.png" alt="alt+cart" className="top-bar__logo-img" />
        alt+cart
      </Link>
      <div className="top-bar__actions">
        <Link
          to={getCompareUrl()}
          className="top-bar__compare"
          aria-label={compareCount > 0 ? `Compare ${compareCount} product${compareCount !== 1 ? "s" : ""}` : "Compare products"}
        >
          Compare{compareCount > 0 ? ` (${compareCount})` : ""}
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
      </div>
    </header>
  );
}

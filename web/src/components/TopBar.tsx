import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompareIds, getCompareUrl, onCompareUpdated } from "../lib/compare";
import type { Theme } from "../lib/theme";

export function TopBar({
  lowVision,
  onLowVisionChange,
  theme,
  onThemeChange,
}: {
  lowVision: boolean;
  onLowVisionChange: (enabled: boolean) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
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
        <button
          type="button"
          className="top-bar__theme-toggle"
          onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            <span className="top-bar__theme-icon" aria-hidden>☀</span>
          ) : (
            <span className="top-bar__theme-icon" aria-hidden>🌙</span>
          )}
        </button>
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

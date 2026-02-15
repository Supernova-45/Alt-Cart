import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompareIds, getCompareUrl, onCompareUpdated } from "../lib/compare";
import type { Theme } from "../lib/theme";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar({
  theme,
  onThemeChange,
}: {
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
        <Link to="/preferences" className="top-bar__compare" aria-label="Preferences">
          preferences
        </Link>
        <Link
          to={getCompareUrl()}
          className="top-bar__compare"
          aria-label={compareCount > 0 ? `Compare ${compareCount} product${compareCount !== 1 ? "s" : ""}` : "Compare products"}
        >
          compare{compareCount > 0 ? ` (${compareCount})` : ""}
        </Link>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}

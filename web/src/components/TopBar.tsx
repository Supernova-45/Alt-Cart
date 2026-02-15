import { Link } from "react-router-dom";
import type { Theme } from "../lib/theme";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
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
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}

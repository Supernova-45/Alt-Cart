import type { Theme } from "../lib/theme";

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <div
      className="theme-pill"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        className={`theme-pill__option theme-pill__option--light ${!isDark ? "theme-pill__option--active" : ""}`}
        onClick={() => onChange("light")}
        aria-pressed={!isDark}
        aria-label="Light mode"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`theme-pill__option theme-pill__option--dark ${isDark ? "theme-pill__option--active" : ""}`}
        onClick={() => onChange("dark")}
        aria-pressed={isDark}
        aria-label="Dark mode"
      >
        <MoonIcon />
      </button>
    </div>
  );
}

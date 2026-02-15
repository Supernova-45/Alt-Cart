import { useState, useEffect } from "react";
import { SkipLink } from "./SkipLink";
import { TopBar } from "./TopBar";
import { getLowVision, setLowVision } from "../lib/lowVision";
import { getTheme, setTheme, type Theme } from "../lib/theme";

export function Shell({ children }: { children: React.ReactNode }) {
  const [lowVision, setLowVisionState] = useState(() => getLowVision());
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (lowVision) {
        document.body.classList.add("low-vision");
      } else {
        document.body.classList.remove("low-vision");
      }
    }
  }, [lowVision]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.body.classList.add("theme-dark");
      } else {
        document.body.classList.remove("theme-dark");
      }
    }
  }, [theme]);

  const handleLowVisionChange = (enabled: boolean) => {
    setLowVision(enabled);
    setLowVisionState(enabled);
  };

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  return (
    <div className="shell">
      <SkipLink />
      <TopBar
        lowVision={lowVision}
        onLowVisionChange={handleLowVisionChange}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      <main id="content" className="shell__main" role="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

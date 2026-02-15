import { useState, useEffect } from "react";
import { SkipLink } from "./SkipLink";
import { TopBar } from "./TopBar";
import { getLowVision, setLowVision } from "../lib/lowVision";
import { getTheme, setTheme, type Theme } from "../lib/theme";
import { getPreferences } from "../lib/accessibilityPreferences";
import { setVoice } from "../lib/tts";

function applyAccessibilityPreferences(): void {
  if (typeof document === "undefined") return;
  const prefs = getPreferences();
  setVoice(prefs.ttsVoice);

  document.body.classList.toggle("preferences-dyslexia-font", prefs.fontFamily === "dyslexia");
  document.body.classList.remove("preferences-font-small", "preferences-font-medium", "preferences-font-large");
  document.body.classList.add(`preferences-font-${prefs.fontSize}`);
  document.body.classList.remove("preferences-reduced-motion-on", "preferences-reduced-motion-off");
  if (prefs.reducedMotion === "on") document.body.classList.add("preferences-reduced-motion-on");
  if (prefs.reducedMotion === "off") document.body.classList.add("preferences-reduced-motion-off");
  document.body.classList.toggle("preferences-highlight-focus", prefs.highlightFocus);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [lowVision, setLowVisionState] = useState(() => getLowVision());
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    applyAccessibilityPreferences();
    const handler = () => applyAccessibilityPreferences();
    window.addEventListener("preferences-updated", handler);
    return () => window.removeEventListener("preferences-updated", handler);
  }, []);

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

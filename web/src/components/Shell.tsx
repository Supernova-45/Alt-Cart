import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SkipLink } from "./SkipLink";
import { TopBar } from "./TopBar";
import { getTheme, setTheme, type Theme } from "../lib/theme";
import { getPreferences } from "../lib/accessibilityPreferences";
import {
  setVoice,
  setRate,
  cancel,
  isSpeaking,
  isPaused,
  pause,
  resume,
  repeatLast,
  speak,
  getPlayableText,
  isTTSSupported,
} from "../lib/tts";
import { getCompareIds, getCompareUrl } from "../lib/compare";
import { TTSCaptions } from "./TTSCaptions";
import { HelpModal } from "./HelpModal";
import { HelpButton } from "./HelpButton";

function applyAccessibilityPreferences(): void {
  if (typeof document === "undefined") return;
  const prefs = getPreferences();
  setVoice(prefs.ttsVoice);
  setRate(prefs.speechRate);

  document.body.classList.toggle("preferences-dyslexia-font", prefs.fontFamily === "dyslexia");
  document.body.classList.remove("preferences-font-small", "preferences-font-medium", "preferences-font-large");
  document.body.classList.add(`preferences-font-${prefs.fontSize}`);
  document.body.classList.remove("preferences-reduced-motion-on", "preferences-reduced-motion-off");
  if (prefs.reducedMotion === "on") document.body.classList.add("preferences-reduced-motion-on");
  if (prefs.reducedMotion === "off") document.body.classList.add("preferences-reduced-motion-off");
  document.body.classList.toggle("preferences-highlight-focus", prefs.highlightFocus);
  document.body.classList.toggle("low-vision", prefs.lowVision);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<Theme>(() => getTheme());
  const [ttsCaptions, setTtsCaptions] = useState(() => getPreferences().ttsCaptions);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (e.altKey && (e.key === "?" || e.key === "/" || e.code === "Slash")) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }
      if (e.key === " " && isSpeaking() && !isInput) {
        e.preventDefault();
        cancel();
        return;
      }
      if (isInput) return;

      if ((e.key === "p" || e.key === "P") && !e.metaKey && !e.ctrlKey) {
        if (isTTSSupported()) {
          e.preventDefault();
          if (isSpeaking()) {
            pause();
          } else if (isPaused()) {
            resume();
          } else {
            const text = getPlayableText();
            if (text) speak(text, { interrupt: true });
          }
        }
        return;
      }
      if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey) {
        if (isTTSSupported()) {
          e.preventDefault();
          repeatLast();
        }
        return;
      }
      if ((e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate("/");
        return;
      }
      if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey) {
        const ids = getCompareIds();
        if (ids.length > 0) {
          e.preventDefault();
          navigate(getCompareUrl());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    applyAccessibilityPreferences();
    const handler = () => {
      applyAccessibilityPreferences();
      setTtsCaptions(getPreferences().ttsCaptions);
    };
    window.addEventListener("preferences-updated", handler);
    return () => window.removeEventListener("preferences-updated", handler);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.body.classList.add("theme-dark");
      } else {
        document.body.classList.remove("theme-dark");
      }
    }
  }, [theme]);

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  return (
    <div className="shell">
      <SkipLink />
      <TopBar theme={theme} onThemeChange={handleThemeChange} />
      <main id="content" className="shell__main" role="main" tabIndex={-1}>
        {children}
      </main>
      <TTSCaptions enabled={ttsCaptions} />
      <HelpButton onClick={() => setHelpOpen((prev) => !prev)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

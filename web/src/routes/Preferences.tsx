import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPreferences,
  setPreference,
  type FontFamily,
  type FontSize,
  type ReducedMotion,
} from "../lib/accessibilityPreferences";
import {
  getAvailableVoices,
  setVoice,
  isTTSSupported,
} from "../lib/tts";

export function Preferences() {
  const [prefs, setPrefs] = useState(() => getPreferences());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const load = () => setVoices(getAvailableVoices());
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = load;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  useEffect(() => {
    setVoice(prefs.ttsVoice);
  }, [prefs.ttsVoice]);

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as FontFamily;
    setPreference("fontFamily", v);
    setPrefs((p) => ({ ...p, fontFamily: v }));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as FontSize;
    setPreference("fontSize", v);
    setPrefs((p) => ({ ...p, fontSize: v }));
  };

  const handleTtsVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setPreference("ttsVoice", v);
    setPrefs((p) => ({ ...p, ttsVoice: v }));
    setVoice(v);
  };

  const handleReducedMotionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as ReducedMotion;
    setPreference("reducedMotion", v);
    setPrefs((p) => ({ ...p, reducedMotion: v }));
  };

  const handleHighlightFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.checked;
    setPreference("highlightFocus", v);
    setPrefs((p) => ({ ...p, highlightFocus: v }));
  };

  return (
    <div className="section-card">
      <header className="passport-header" style={{ marginBottom: "var(--space-lg)" }}>
        <Link to="/" className="passport-header__back">
          ← Back
        </Link>
        <h1 className="passport-header__title">Preferences</h1>
      </header>

      <p style={{ marginBottom: "var(--space-xl)", color: "var(--color-text-muted)" }}>
        Customize your experience for accessibility and comfort.
      </p>

      <section aria-labelledby="prefs-font-heading" style={{ marginBottom: "var(--space-xl)" }}>
        <h2 id="prefs-font-heading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>
          Typography
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div className="form-group">
            <label htmlFor="prefs-font-family">Font</label>
            <select
              id="prefs-font-family"
              value={prefs.fontFamily}
              onChange={handleFontFamilyChange}
              aria-describedby="prefs-font-family-desc"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                fontSize: "var(--text-base)",
                fontFamily: "inherit",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            >
              <option value="default">Default (DM Sans)</option>
              <option value="dyslexia">OpenDyslexic (dyslexia-friendly)</option>
            </select>
            <p id="prefs-font-family-desc" style={{ margin: "var(--space-xs) 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              OpenDyslexic may help some people with dyslexia read more easily.
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="prefs-font-size">Font size</label>
            <select
              id="prefs-font-size"
              value={prefs.fontSize}
              onChange={handleFontSizeChange}
              aria-label="Font size"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                fontSize: "var(--text-base)",
                fontFamily: "inherit",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            >
              <option value="small">Small (16px)</option>
              <option value="medium">Medium (18px)</option>
              <option value="large">Large (20px)</option>
            </select>
          </div>
        </div>
      </section>

      {isTTSSupported() && (
        <section aria-labelledby="prefs-tts-heading" style={{ marginBottom: "var(--space-xl)" }}>
          <h2 id="prefs-tts-heading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>
            Text-to-speech voice
          </h2>
          <div className="form-group">
            <label htmlFor="prefs-tts-voice">Voice</label>
            <select
              id="prefs-tts-voice"
              value={prefs.ttsVoice}
              onChange={handleTtsVoiceChange}
              aria-label="TTS voice"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                fontSize: "var(--text-base)",
                fontFamily: "inherit",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                maxWidth: "100%",
              }}
            >
              <option value="">Default (browser choice)</option>
              {voices.map((v) => (
                <option key={v.name + v.lang} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      <section aria-labelledby="prefs-motion-heading" style={{ marginBottom: "var(--space-xl)" }}>
        <h2 id="prefs-motion-heading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>
          Motion
        </h2>
        <div className="form-group">
          <label htmlFor="prefs-reduced-motion">Reduced motion</label>
          <select
            id="prefs-reduced-motion"
            value={prefs.reducedMotion}
            onChange={handleReducedMotionChange}
            aria-describedby="prefs-reduced-motion-desc"
            style={{
              padding: "var(--space-sm) var(--space-md)",
              fontSize: "var(--text-base)",
              fontFamily: "inherit",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          >
            <option value="auto">Auto (follow system)</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
          <p id="prefs-reduced-motion-desc" style={{ margin: "var(--space-xs) 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Reduces or removes animations and transitions. Auto follows your system preference.
          </p>
        </div>
      </section>

      <section aria-labelledby="prefs-focus-heading" style={{ marginBottom: "var(--space-lg)" }}>
        <h2 id="prefs-focus-heading" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>
          Focus
        </h2>
        <div className="toggle">
          <input
            id="prefs-highlight-focus"
            type="checkbox"
            className="toggle__input"
            checked={prefs.highlightFocus}
            onChange={handleHighlightFocusChange}
            aria-describedby="prefs-highlight-focus-desc"
          />
          <label htmlFor="prefs-highlight-focus" className="toggle__label">
            Highlight focus
          </label>
        </div>
        <p id="prefs-highlight-focus-desc" style={{ margin: "var(--space-xs) 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Use a stronger focus ring to make keyboard focus more visible.
        </p>
      </section>
    </div>
  );
}

export type FontFamily = "default" | "dyslexia";
export type FontSize = "small" | "medium" | "large";
export type ReducedMotion = "auto" | "on" | "off";

export interface AccessibilityPreferences {
  fontFamily: FontFamily;
  fontSize: FontSize;
  ttsVoice: string;
  reducedMotion: ReducedMotion;
  highlightFocus: boolean;
}

const PREFERENCES_KEY = "altcart-accessibility-preferences";

const DEFAULTS: AccessibilityPreferences = {
  fontFamily: "default",
  fontSize: "medium",
  ttsVoice: "",
  reducedMotion: "auto",
  highlightFocus: false,
};

function loadFromStorage(): AccessibilityPreferences {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>;
    return {
      fontFamily: parsed.fontFamily ?? DEFAULTS.fontFamily,
      fontSize: parsed.fontSize ?? DEFAULTS.fontSize,
      ttsVoice: parsed.ttsVoice ?? DEFAULTS.ttsVoice,
      reducedMotion: parsed.reducedMotion ?? DEFAULTS.reducedMotion,
      highlightFocus: parsed.highlightFocus ?? DEFAULTS.highlightFocus,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function getPreferences(): AccessibilityPreferences {
  return loadFromStorage();
}

export function setPreferences(prefs: Partial<AccessibilityPreferences>): void {
  if (typeof window === "undefined") return;
  const current = loadFromStorage();
  const next = { ...current, ...prefs };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("preferences-updated", { detail: next }));
}

export function setPreference<K extends keyof AccessibilityPreferences>(
  key: K,
  value: AccessibilityPreferences[K]
): void {
  setPreferences({ [key]: value });
}

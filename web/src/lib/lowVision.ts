const LOW_VISION_KEY = "altcart-low-vision";

export function getLowVision(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOW_VISION_KEY) === "true";
}

export function setLowVision(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(LOW_VISION_KEY, "true");
  } else {
    localStorage.removeItem(LOW_VISION_KEY);
  }
}

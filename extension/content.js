/**
 * Hold-Alt Hover "Speak Alt Text" - Content script
 * Speaks image alt/aria/title when user holds Alt and hovers over image-like elements.
 */

let enabled = true;
let requireAltKey = true;
let lastSpokenKey = "";
let lastSpokenAt = 0;
const MIN_INTERVAL_MS = 900;
const BG_IMAGE_ANCESTOR_LIMIT = 5;

function clean(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function hasBackgroundImage(el) {
  if (!el) return false;
  const bg = window.getComputedStyle(el).backgroundImage;
  return bg && bg !== "none";
}

function findImageLikeElement(el) {
  if (!el) return null;

  const img = el.closest("img");
  if (img) return img;

  const roleImg = el.closest("[role='img']");
  if (roleImg) return roleImg;

  let current = el;
  let depth = 0;
  while (current && depth < BG_IMAGE_ANCESTOR_LIMIT) {
    if (hasBackgroundImage(current)) return current;
    current = current.parentElement;
    depth++;
  }
  return null;
}

function getImageDescription(el) {
  if (!el) return null;

  if (el.tagName === "IMG") {
    const alt = clean(el.getAttribute("alt"));
    const aria = clean(el.getAttribute("aria-label"));
    const title = clean(el.getAttribute("title"));
    return alt || aria || title || "Image";
  }

  const aria = clean(el.getAttribute("aria-label"));
  const title = clean(el.getAttribute("title"));
  const bg = window.getComputedStyle(el).backgroundImage;

  if (bg && bg !== "none") return aria || title || "Image";
  if (el.getAttribute("role") === "img") return aria || title || "Image";
  return null;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  window.speechSynthesis.speak(u);
}

function getStableKey(imgLike, desc) {
  if (imgLike.tagName === "IMG") {
    const src = imgLike.currentSrc || imgLike.src || "";
    return src + "|" + desc;
  }
  const id = imgLike.id || "";
  const aria = imgLike.getAttribute("aria-label") || "";
  return desc + "|" + id + "|" + aria;
}

function handleMousemove(e) {
  if (!enabled) return;
  if (requireAltKey && !e.altKey) return;

  const now = Date.now();
  if (now - lastSpokenAt < MIN_INTERVAL_MS) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return;

  const imgLike = findImageLikeElement(el);
  const desc = imgLike ? getImageDescription(imgLike) : null;
  if (!desc) return;

  const key = getStableKey(imgLike, desc);
  if (key === lastSpokenKey) return;

  lastSpokenKey = key;
  lastSpokenAt = now;
  speak(desc);
}

function applySettings(settings) {
  enabled = settings.hoverSpeakEnabled !== false;
  requireAltKey = settings.requireAltKey !== false;
}

document.addEventListener("mousemove", handleMousemove, { passive: true });

if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get({ hoverSpeakEnabled: true, requireAltKey: true }, applySettings);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
      chrome.storage.sync.get({ hoverSpeakEnabled: true, requireAltKey: true }, applySettings);
    }
  });
}

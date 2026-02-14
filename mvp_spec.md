# EchoCart MVP Spec (Vite + React) — Accessible “Product Passport” from Saved Amazon Pages (Condensed)

This is a **coding-agent-ready spec** for a **minimal, polished, accessible** MVP.  
**Important:** A Chrome extension will be added later, but **DO NOT build the extension in this phase**. The MVP is the web app only.

---

## 0) MVP Objective (demo must succeed)

A visually impaired user can:
1. Open the web app.
2. See a simple list of white sneaker products (from local snapshots / curated list).
3. Open a **Product Passport** page that:
   - Is screen-reader-first (headings/landmarks/skip link).
   - Supports **local TTS** (Web Speech API) with controls.
   - Shows **review warnings** + **return-risk** (hardcoded OK).
   - Has **Low Vision Mode** (bigger type + higher contrast).
4. Navigate end-to-end with keyboard.

### Local snapshots you already saved
- `white_sneakers.html` (search results)
- `adidas.html`, `adokoo.html`, `puma.html`, `on.html`
- Plus associated asset folders 

---

## 1) Scope and non-goals

### Scope
- **Vite + React + TypeScript**
- No backend, no live scraping, no Amazon network calls at runtime.
- Parse local HTML snapshots **best effort** (title/price/rating/count).
- Always have **hardcoded fallback** so demo never breaks.

### Non-goals
- Chrome extension (explicitly not in this build)
- Stagehand/Browserbase, vision models, real review mining, auth, DB

---

## 2) Deliverable: Web app routes

Use `react-router-dom`.

- `/` → **Home**
  - Show **4 curated demo products** (adidas/adokoo/puma/on), each with “Open Passport”.
  - Optional: show “Parsed results (best effort)” from `white_sneakers.html` (read-only list).

- `/passport/:id` → **Passport**
  - Load snapshot HTML for that product ID
  - Parse a few fields best effort
  - Merge into fallback passport data
  - Render a clean, accessible “Passport” view + TTS controls

- `*` → NotFound

---

## 3) Project structure (guidance)

```
public/
  snapshots/
    white_sneakers.html
    adidas.html
    adokoo.html
    puma.html
    on.html
  snapshots_assets/  (copy saved asset folders here to preserve relative paths)

src/
  routes/ Home.tsx, Passport.tsx, NotFound.tsx
  components/ Shell, SkipLink, TopBar, ProductList, ProductCard,
              SectionCard, StatPill, Toggle, TTSControls
  lib/ snapshotRegistry, fetchSnapshot, parseProductSnapshot, parseSearchSnapshot (optional),
       productModel, demoFallbacks, mergePassport, tts
  styles/ tokens.css, base.css, components.css, lowVision.css
```

---

## 4) Snapshot registry (authoritative mapping)

`src/lib/snapshotRegistry.ts`

```ts
export type SnapshotId = "search" | "adidas" | "adokoo" | "puma" | "on";

export const SNAPSHOTS: Record<SnapshotId, { label: string; path: string }> = {
  search: { label: "White sneakers search", path: "/snapshots/white_sneakers.html" },
  adidas: { label: "adidas VL Court 3.0", path: "/snapshots/adidas.html" },
  adokoo: { label: "Adokoo Fashion Sneakers", path: "/snapshots/adokoo.html" },
  puma: { label: "Puma Carina L", path: "/snapshots/puma.html" },
  on: { label: "On Cloud 6", path: "/snapshots/on.html" },
};
```

Home should render the 4 product IDs reliably (do not rely on parsing search snapshot for core list).

---

## 5) Data model (UI contract)

`src/lib/productModel.ts`

```ts
export type Severity = "low" | "medium" | "high";

export interface ReviewTheme {
  label: string;
  share: number;          // 0..1
  severity: Severity;
  evidence: string[];     // 2..6, MUST be prefixed "Demo snippet:"
}

export interface FitSummary {
  verdict: "Runs small" | "True to size" | "Runs large";
  confidence: number;     // 0..1
  evidence: string[];     // 1..3, "Demo snippet:"
}

export interface ReturnRisk {
  score: number;          // 0..1
  label: "Low" | "Medium" | "High";
  drivers: string[];      // 2..4
}

export interface ImageDescriptions {
  altShort: string;       // 1 sentence
  altLong: string;        // 5–10 sentences, structured
}

export interface ProductPassport {
  id: string;
  sourceSnapshotPath: string;

  name: string;
  brand?: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;

  shortDescription: string;
  longDescription: string;

  images: ImageDescriptions;
  fitSummary?: FitSummary;
  themes: ReviewTheme[];
  returnRisk: ReturnRisk;

  narration: { short: string; medium: string };
  demoDisclosure: string; // always shown in UI
}
```

---

## 6) Fetch + parse snapshots (best effort only)

### Fetch helper
`src/lib/fetchSnapshot.ts`
- `fetch(path)` → `html` → `DOMParser().parseFromString(html, "text/html")`
- Throw readable error on failure

### Product parsing
`src/lib/parseProductSnapshot.ts` returns partial fields:

```ts
export interface ParsedProductFields {
  title?: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
}
```

Selectors to try (in order):

**Title**
1. `#productTitle`
2. `meta[property="og:title"]` content
3. first `h1`
4. `document.title`

**Price**
1. `.a-price .a-offscreen` (first)
2. `#corePriceDisplay_desktop_feature_div .a-offscreen`
3. `#priceblock_ourprice` / `#priceblock_dealprice`

**Rating**
1. `#acrPopover` `title` or `aria-label`
2. `i.a-icon-star span.a-icon-alt`

**Review count**
1. `#acrCustomerReviewText`
2. `[data-hook="total-review-count"]`

Sanitize: `trim`, collapse whitespace.

### Search parsing (optional)
`src/lib/parseSearchSnapshot.ts` may extract a few items from:
- `div.s-result-item[data-component-type="s-search-result"]`
But do not depend on this for core demo.

---

## 7) Fallback passports (guarantee demo works)

`src/lib/demoFallbacks.ts`
- Provide one `ProductPassport` per id: `adidas`, `adokoo`, `puma`, `on`.
- Evidence snippets **must start with** `"Demo snippet:"` for transparency.
- `images.altLong` must follow this structure:
  1) overall type & color, 2) upper material/texture, 3) laces/closure, 4) toe shape,
  5) branding/panels, 6) heel, 7) sole thickness/tread, 8) notable details.

---

## 8) Merge logic (parsed fields override fallback)

`src/lib/mergePassport.ts`
- Start with fallback passport
- Override only if parsed value exists and is non-empty:
  - title → `name`
  - price → `priceText`
  - rating → `ratingText`
  - review count → `reviewCountText`
- Never remove fallback content if parsing fails.

---

## 9) TTS (Web Speech API) — required

`src/lib/tts.ts` must provide:
- `speak(text, { interrupt=true })`
- `pause`, `resume`, `cancel`
- `setRate(0.8..1.4)`
- `repeatLast()`

Rules:
- Track `lastSpokenText`
- Default `interrupt=true` → call `speechSynthesis.cancel()` first
- Split into sentences: `text.split(/(?<=[.!?])\s+/)`
- No autoplay on load
- If unsupported, show banner + disable TTS controls

TTSControls UI:
- Play summary (speaks `passport.narration.medium`)
- Pause/Resume toggle
- Repeat last
- Stop
- Speed slider (0.8–1.4)

---

## 10) UI + accessibility spec (must)

### Layout and style (minimalist, not template-y)
- Single centered column, `max-width ~ 900px`
- Base font size ~18px, line height 1.5+
- Neutral palette, subtle borders, rounded corners (8–12px), minimal/no shadows
- Visible focus rings (do not remove outlines)
- No gradients, no heavy animation

### Accessibility requirements
- Skip link → `main#content`
- Correct heading order: Home H1; product cards H2; Passport H1; sections H2
- `main` landmark; each section as `<section aria-labelledby=...>`
- Keyboard-first navigation works end-to-end
- Low Vision Mode toggle persists in `localStorage`

### Passport layout (exact sections)
- Header: Back link, H1 name, stat pills (price/rating/count if present), TTSControls
- Section 1 “Summary”: brand/price/fit + shortDescription + disclosure
- Section 2 “Image description”: altShort + altLong
- Section 3 “Reviewer warnings”: fit summary + themes + evidence
- Section 4 “Return risk”: score/label + drivers
Each section has “Read this section” button that speaks *only* the Passport text (not DOM scraped text).

---

## 11) Error states (must)

- Unknown `:id` → NotFound + link Home
- Snapshot fetch fails → show simple error card + link Home (Passport still within Shell)
- TTS unsupported → banner + disable buttons

---

## 12) Build steps for the coding agent

1. Scaffold Vite React TS; install `react-router-dom`.
2. Copy snapshots into `public/snapshots/` and assets under `public/` preserving relative paths.
3. Implement global styles + Low Vision CSS toggle (persisted).
4. Implement Shell (SkipLink + TopBar with Low Vision toggle).
5. Implement snapshot fetch + parsing + fallback passports + merge logic.
6. Build Home with the curated list + optional parsed results.
7. Build Passport with sections + TTS controls.
8. Verify:
   - Keyboard-only flow
   - Focus rings
   - Skip link
   - TTS works and does not autoplay
   - Low Vision mode clearly changes readability

---

## 13) Demo script (judge-ready)

1. Home → tab through curated products.
2. Open “On Cloud 6” Passport.
3. Play summary (audio).
4. Read reviewer warnings section (audio).
5. Toggle Low Vision mode.
6. Back → open a second product Passport (e.g., adidas) to show consistency.

---

## 14) Note on extension (future, NOT IN THIS BUILD)

An extension will later:
- Hotkey → open Passport with current tab URL
- Map known Amazon product IDs to `:id` routes
But for now, ship the web MVP only.

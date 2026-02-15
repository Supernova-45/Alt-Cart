# alt+cart

**Seamless, sustainable shopping made accessible.**

alt+cart transforms any e-commerce product page into an **accessible Product Passport**—a screen-reader-first, keyboard-navigable format with full text-to-speech support. Search across Amazon, Walmart, eBay, Target, Macy's, Etsy, Lowe's, Home Depot, and more—choose a store and enter a query, or paste a search URL from virtually any e-commerce site. We extract live product data, analyze reviews for fit and return risk, surface sustainability insights, and let you compare products with a spoken narrative.

---

## What Makes alt+cart Different

### Original

- **Product Passport** — A unified, structured format that turns scattered e-commerce pages into coherent, scannable product summaries. No more hunting through tabs or parsing dense layouts.
- **Review intelligence** — Fit analysis ("runs small", "true to size"), return risk assessment, and thematic review summaries (quality, value, style, sizing) derived from real customer feedback.
- **Spoken product comparison** — Select 2–3 products, then hear a natural-language comparison that highlights differences in fit, return risk, and sustainability.
- **Cross-domain extraction** — One pipeline for Amazon, Walmart, eBay, Target, Macy's, Etsy, Lowe's, and Home Depot. Paste a URL from any supported retailer and get a passport.

### Wowing

- **Live extraction** — We load the actual product page in a headless browser, extract structured data, and transform it in real time. No static scrapes or stale caches.
- **Search-to-passport flow** — Search for products by store and keyword, browse results with sort-by-price/rating/sustainability, then open any product for a full passport.
- **Chrome extension** — Open the current tab in alt+cart with one click or **Alt+Shift+P**. Works on product and search pages across supported retailers.
- **Hold Alt + hover** — Hear image descriptions spoken aloud on any page where the extension is active.

### Accessible

- **Screen-reader first** — Semantic HTML, ARIA labels, proper heading hierarchy, and skip links. Built for NVDA, JAWS, VoiceOver, and TalkBack.
- **Full TTS support** — Every section has a "Read this section" button. Play, pause, repeat, and adjust speech rate. Narrations are written for listening, not just reading.
- **Keyboard-only navigation** — Tab through the interface, activate with Enter, use shortcuts (H home, P play/pause, R repeat, C compare, Alt+? help).
- **Preferences** — Font size, dyslexia-friendly font, reduced motion, high contrast, low vision mode, and TTS voice selection.
- **Dark mode** — Easy on the eyes, theme toggle in the header.

### Sustainable

- **Sustainability scoring** — Materials, manufacturing, certifications, and shipping are scored and explained. Climate Pledge Friendly and similar badges are surfaced.
- **Sort by sustainability** — On search results, sort products by sustainability score alongside price and rating.
- **Sustainability in comparison** — When comparing products, hear which has the best sustainability profile and how they differ.

---

## How It Works

### Product Passport Pipeline

1. **User provides a URL** — Product page from Amazon, Walmart, eBay, Target, or Macy's.
2. **Backend loads the page** — Stagehand + Browserbase spin up a headless browser and navigate to the URL.
3. **Domain-specific extraction** — Dedicated extractors parse product name, price, rating, reviews, images, materials, certifications, and badges.
4. **Transform to ProductPassport** — Reviews are analyzed for fit and themes; return risk is computed; sustainability is scored; image descriptions are generated.
5. **Accessible display** — Clean, structured UI with TTS controls, keyboard navigation, and screen-reader-optimized markup.

### Search Pipeline

1. **User searches** — Choose a store (Amazon, Walmart, eBay, etc.) and enter a query, or paste a search results URL.
2. **Extract catalog** — Bright Data (when configured) or Browserbase + generic DOM parsing fetches product cards with name, price, rating, image, and link.
3. **Sort and browse** — Sort by relevance, price, rating, or sustainability. Click any product to extract its full passport.
4. **Compare** — Enter compare mode, select 2–3 products, and hear a spoken comparison.

### Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express, TypeScript, Stagehand (AI browser automation), Browserbase (managed browsers), Bright Data (catalog/search), Zod |
| **Frontend** | React 18, TypeScript, React Router, Web Speech API (TTS), Vite |
| **Extension** | Chrome Manifest v3, content script for Alt+hover image descriptions |

---

## Project Structure

```
alt+cart/
├── backend/          # Extraction API
│   └── src/
│       ├── extractors/     # Amazon, Walmart, eBay, Target, Macy's
│       ├── services/       # Extraction, transform, search, Bright Data
│       └── routes/          # /api/products, /api/search
├── web/               # React frontend
│   └── src/
│       ├── routes/         # Landing, Passport, Compare, ExtractSearch
│       ├── components/     # ProductCard, TTSControls, CompareBar
│       └── lib/            # API, sorting, comparison narrative
└── extension/         # Chrome extension
    ├── manifest.json
    ├── content.js         # Alt+hover speak alt text
    └── service_worker.js  # Open in alt+cart
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add BROWSERBASE_API_KEY, BROWSERBASE_PROJECT_ID
npm run dev
```

Runs on `http://localhost:3001`.

### Frontend

```bash
cd web
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### Chrome Extension

1. Run the web app.
2. Chrome → `chrome://extensions` → Developer mode → Load unpacked → select `extension/`.
3. Visit a product page → **Alt+Shift+P** or click the extension icon.

---

---

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/products/extract` — Extract product passport from URL
- `GET /api/products/:id` — Get extracted product by ID
- `POST /api/search/extract` — Extract search results from URL

---

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `BROWSERBASE_API_KEY` | Required for product extraction |
| `BROWSERBASE_PROJECT_ID` | Required for product extraction |
| `BRIGHTDATA_API_KEY` | Optional; enables catalog search for Amazon, Walmart, eBay, Etsy, Lowe's, Target, Macy's, Home Depot |

See `backend/README.md` for full list.

---

## Deployment

- **Frontend**: Vercel (e.g. `alt-cart.vercel.app`)
- **Backend**: Vercel serverless (proxied from frontend `/api`)
- **Extraction timeout**: Set Function Max Duration to 60s+ in Vercel (extraction can take 15–30 seconds)

---

## License

MIT

---

Built for accessible, sustainable shopping.

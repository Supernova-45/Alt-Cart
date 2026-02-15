# alt+cart Backend

Backend API for alt+cart: product passport extraction, search/catalog extraction, and data transformation. Powers live extraction from Amazon, Walmart, eBay, Target, and Macy's, plus search across 8+ retailers via Bright Data or Browserbase.

---

## Technological Pipeline

### Product Passport Extraction

```
URL → parseProductUrl() → Stagehand + Browserbase → Domain Extractor → TransformService → ProductPassport
```

1. **URL parsing** (`urlParser.ts`) — Validates URL, identifies domain (amazon, walmart, ebay, target, macys), extracts product ID (ASIN, item ID, etc.).
2. **Browser automation** — Stagehand initializes a headless browser via Browserbase, navigates to the product page.
3. **Domain-specific extraction** — Each retailer has a dedicated extractor:
   - `AmazonExtractor` — Name, price, rating, reviews, images, materials, certifications, Climate Pledge Friendly
   - `WalmartExtractor` — Same fields, Walmart-specific selectors
   - `EbayExtractor`, `TargetExtractor`, `MacysExtractor` — Retailer-specific parsers
4. **Transform** (`TransformService`) — Converts raw extracted data into a `ProductPassport`:
   - **Fit analysis** — Parses reviews for "runs small", "true to size", "size up/down"
   - **Review themes** — Quality, value, style, sizing with sentiment scores
   - **Return risk** — Score and label (Low/Medium/High) from rating and review patterns
   - **Sustainability** — Materials, manufacturing, certifications, shipping scores; Climate Pledge Friendly badges
   - **Narration** — Short and medium summaries for TTS
   - **Image descriptions** — Alt text for screen readers

### Search / Catalog Extraction

```
Search URL or (store + query) → parseSearchUrl() → Bright Data OR Browserbase + GenericSearchExtractor → SearchResultItem[]
```

1. **URL parsing** (`searchUrlParser.ts`) — Validates search URL, extracts domain and query. Supports Amazon, Walmart, eBay, Etsy, Target, Lowe's, Macy's, Home Depot, and generic URLs.
2. **Catalog fetch** — Priority order:
   - **Generic domains** (e.g. Temu, AliExpress, Uniqlo) — Browserbase + `GenericSearchExtractor` (DOM parsing)
   - **Known domains** — Bright Data first (if `BRIGHTDATA_API_KEY` set); fallback to Browserbase for Amazon/Walmart
   - **eBay, Etsy, Lowe's, Target, Macy's, Home Depot** — Bright Data only

3. **Search result items** — Each item has: name, price, rating, review count, image, product URL, `priceNumeric`, `ratingNumeric`, `sustainabilityScore` (when available) for sorting.

---

## Architecture

| Component | Role |
|-----------|------|
| **Express** | Web framework, routes, middleware |
| **Stagehand** | AI-powered browser automation (DOM interaction, navigation) |
| **Browserbase** | Managed browser sessions (headless Chrome) |
| **Bright Data** | Catalog/search API for Amazon, Walmart, eBay, Etsy, Lowe's, Target, Macy's, Home Depot |
| **Zod** | Request validation, schema parsing |
| **TypeScript** | Type safety |

---

## Project Structure

```
src/
├── server.ts                 # Express app entry
├── config/
│   └── env.ts               # Environment config
├── middleware/
│   ├── errorHandler.ts      # Error handling, supported domains
│   └── cors.ts              # CORS config
├── routes/
│   ├── health.ts            # GET /api/health
│   ├── products.ts          # POST /extract, GET /:id
│   └── search.ts            # POST /extract (search results)
├── services/
│   ├── extractionService.ts     # Product extraction orchestration
│   ├── searchExtractionService.ts # Search extraction orchestration
│   ├── stagehandService.ts       # Browser automation
│   ├── transformService.ts      # Raw → ProductPassport
│   └── brightDataCatalogService.ts # Bright Data catalog search
├── extractors/
│   ├── amazonExtractor.ts        # Amazon product page
│   ├── walmartExtractor.ts       # Walmart product page
│   ├── ebayExtractor.ts
│   ├── targetExtractor.ts
│   ├── macysExtractor.ts
│   ├── amazonSearchExtractor.ts
│   ├── walmartSearchExtractor.ts
│   ├── genericSearchExtractor.ts
│   └── catalogHtmlParsers/       # Cheerio parsers for Bright Data HTML
├── models/
│   └── productModel.ts          # ProductPassport, ExtractedProductData
├── utils/
│   ├── urlParser.ts             # Product URL parsing
│   ├── searchUrlParser.ts       # Search URL parsing
│   ├── returnRiskGenerator.ts   # Return risk from rating
│   ├── sustainabilityGenerator.ts # Sustainability scoring
│   └── logger.ts
└── types/
    └── search.ts                 # SearchResultItem
```

---

## Prerequisites

- Node.js 20+
- npm or yarn
- Browserbase account (API key and project ID)

---

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
BROWSERBASE_API_KEY=your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here
```

---

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001` with hot reload.

---

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server health status.

### Extract Product

```
POST /api/products/extract
Content-Type: application/json

{ "url": "https://www.amazon.com/dp/B0C2JYLPBW" }
```

Extracts product data and returns a ProductPassport.

### Get Product

```
GET /api/products/:id
```

Retrieves a previously extracted product by ID.

### Extract Search Results

```
POST /api/search/extract
Content-Type: application/json

{ "url": "https://www.amazon.com/s?k=sneakers" }
```

Extracts search/catalog results (product cards with name, price, rating, image, link).

---

## Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3001) |
| NODE_ENV | Environment | No (default: development) |
| BROWSERBASE_API_KEY | Browserbase API key | Yes |
| BROWSERBASE_PROJECT_ID | Browserbase project ID | Yes |
| FRONTEND_URL | Frontend URL for CORS | No (default: http://localhost:5173) |
| BRIGHTDATA_API_KEY | Bright Data API key | No |
| BRIGHTDATA_AMAZON_SEARCH_DATASET_ID | Amazon catalog | No |
| BRIGHTDATA_WALMART_SEARCH_DATASET_ID | Walmart catalog | No |
| BRIGHTDATA_EBAY_SEARCH_DATASET_ID | eBay catalog | No |
| BRIGHTDATA_ETSY_SEARCH_DATASET_ID | Etsy catalog | No |
| BRIGHTDATA_LOWES_SEARCH_DATASET_ID | Lowe's catalog | No |
| BRIGHTDATA_TARGET_SEARCH_DATASET_ID | Target catalog | No |
| BRIGHTDATA_MACYS_SEARCH_DATASET_ID | Macy's catalog | No |
| BRIGHTDATA_HOMEDEPOT_SEARCH_DATASET_ID | Home Depot catalog | No |
| BRIGHTDATA_UNLOCKER_ZONE | Web Unlocker zone | No (default: web_unlocker1) |
| BRIGHTDATA_SERP_ZONE | SERP API zone | No (default: serp_api1) |

**Bright Data (optional):** When `BRIGHTDATA_API_KEY` is set, catalog/search uses Bright Data for Amazon, Walmart, eBay, Etsy, Lowe's, Target, Macy's, and Home Depot. Product passport extraction always uses Browserbase + Stagehand.

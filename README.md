# alt+cart

Seamless, sustainable shopping for the visually impaired.

alt+cart is a web application that extracts accessible product information from e-commerce websites (Amazon, Walmart, eBay, Target, Macy's) and presents it in a screen-reader-first, keyboard-navigable format with full text-to-speech support.

## Features

- **Real-time product extraction** from Amazon, Walmart, eBay, Target, and Macy's URLs
- **Accessible product passports** with detailed information
- **Review intelligence** - fit analysis, common themes, return risk assessment
- **Image descriptions** for screen readers
- **Text-to-speech** controls with adjustable speed
- **Keyboard-first navigation** and WCAG-compliant design
- **Demo products** for exploration

## Project Structure

```
alt+cart/
├── backend/          # Node.js + Express API
│   └── src/         # TypeScript source
├── web/             # React frontend
│   └── src/         # React components & routes
└── extension/       # Chrome extension (legacy)
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Add your Browserbase credentials to `.env`:
```
BROWSERBASE_API_KEY=your_api_key
BROWSERBASE_PROJECT_ID=your_project_id
```

5. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to web directory:
```bash
cd web
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## How It Works

1. **User enters product URL** - Amazon, Walmart, eBay, Target, or Macy's product page URL
2. **Backend extracts data** - Using Stagehand + Browserbase for browser automation
3. **Transform to ProductPassport** - Analyze reviews, generate descriptions, assess return risk
4. **Display accessible view** - Clean, screen-reader-friendly interface with TTS support

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Stagehand (AI browser automation)
- Browserbase (managed browsers)
- Zod (schema validation)

### Frontend
- React 18
- TypeScript
- React Router
- Web Speech API (TTS)
- Vite (build tool)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/products/extract` - Extract product from URL
- `GET /api/products/:id` - Get extracted product by ID

## Development

### Backend
```bash
cd backend
npm run dev      # Start with hot reload
npm run build    # Build for production
npm start        # Run production build
```

### Frontend
```bash
cd web
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
BROWSERBASE_API_KEY=your_api_key
BROWSERBASE_PROJECT_ID=your_project_id
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001
```

**Vercel deployment:** When the frontend is deployed to altcart.vercel.app, it proxies API calls to the backend. Deploy the backend as a separate Vercel project (e.g. altcartbackend.vercel.app) and ensure the web project's `vercel.json` rewrites point to it.

## Troubleshooting: Extraction 500 Errors

If `POST /api/products/extract` returns 500:

1. **Environment variables** – In the **backend** Vercel project, set:
   - `BROWSERBASE_API_KEY` – from [Browserbase dashboard](https://browserbase.com)
   - `BROWSERBASE_PROJECT_ID` – your project ID
   Redeploy after adding them.

2. **Function timeout** – Extraction can take 15–30+ seconds. In the backend Vercel project: **Settings → Functions → Function Max Duration** – set to 60s (or higher on Pro). The Express framework preset doesn't support `maxDuration` in `vercel.json`, so use the Dashboard.

3. **Check logs** – Vercel Dashboard → Backend project → Deployments → select deployment → **Functions** tab → view logs for the actual error (e.g. missing env, Stagehand init failure, navigation timeout)

## Accessibility Features

- Semantic HTML with proper heading hierarchy
- ARIA labels and roles throughout
- Skip links for keyboard navigation
- Text-to-speech for all content sections
- High contrast mode toggle
- Keyboard-only navigation support
- Screen reader optimized layout

## Supported Platforms

- Amazon.com
- Walmart.com
- eBay.com
- Target.com
- Macy's

More platforms coming soon!

## Chrome Extension (Legacy)

The Chrome extension is still available but is now secondary to the standalone web application. To use:

1. Run the web app (`cd web && npm run dev`)
2. Open Chrome → `chrome://extensions` → Enable Developer mode
3. Load unpacked → select the `extension/` folder
4. Navigate to an Amazon product page
5. Use **Alt+Shift+P** or click the extension icon

## License

MIT

## Contributors

Built for accessible, sustainable shopping.

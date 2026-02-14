# Alt-Cart Backend

Backend API for Alt-Cart product extraction service. Extracts accessible product information from Amazon and Walmart product pages using Stagehand + Browserbase.

## Prerequisites

- Node.js 20+
- npm or yarn
- Browserbase account (API key and project ID)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file and configure:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Browserbase credentials:
```
BROWSERBASE_API_KEY=your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot reload.

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

{
  "url": "https://www.amazon.com/dp/B0C2JYLPBW"
}
```

Extracts product data and returns a ProductPassport.

### Get Product
```
GET /api/products/:id
```

Retrieves a previously extracted product by ID.

## Architecture

- **Express** - Web framework
- **Stagehand** - AI-powered browser automation
- **Browserbase** - Managed browser sessions
- **TypeScript** - Type safety
- **Zod** - Schema validation

## Project Structure

```
src/
├── server.ts              # Express app entry
├── config/
│   └── env.ts            # Environment config
├── middleware/
│   ├── errorHandler.ts   # Error handling
│   └── cors.ts           # CORS config
├── routes/
│   ├── health.ts         # Health check
│   └── products.ts       # Product endpoints
├── services/
│   ├── extractionService.ts  # Orchestration
│   ├── stagehandService.ts   # Browser automation
│   └── transformService.ts   # Data transformation
├── extractors/
│   ├── amazonExtractor.ts    # Amazon-specific
│   └── walmartExtractor.ts   # Walmart-specific
├── models/
│   └── productModel.ts       # TypeScript types
└── utils/
    ├── urlParser.ts          # URL validation
    └── logger.ts             # Logging
```

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3001) |
| NODE_ENV | Environment | No (default: development) |
| BROWSERBASE_API_KEY | Browserbase API key | Yes |
| BROWSERBASE_PROJECT_ID | Browserbase project ID | Yes |
| FRONTEND_URL | Frontend URL for CORS | No (default: http://localhost:5173) |

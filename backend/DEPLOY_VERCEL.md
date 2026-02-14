# Deploy Backend to api.altcart.vercel.app

## Prerequisites

- Vercel account (same one used for altcart.vercel.app)
- Browserbase API key and project ID

## Step 1: Create a New Vercel Project for the Backend

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (the same repo as the frontend)
3. **Important:** Set the **Root Directory** to `backend`
   - Click "Edit" next to Root Directory
   - Enter `backend`
   - This tells Vercel to deploy only the backend folder
4. Do **not** deploy yet—add environment variables first

## Step 2: Add Environment Variables

In the project settings (or during import), add:

| Variable | Value |
|----------|-------|
| `BROWSERBASE_API_KEY` | Your Browserbase API key |
| `BROWSERBASE_PROJECT_ID` | Your Browserbase project ID |
| `FRONTEND_URL` | `https://altcart.vercel.app` |

## Step 3: Deploy

Click **Deploy**. Vercel will:

1. Run `npm install` in the backend folder
2. Run `npm run build` (compiles TypeScript)
3. Deploy the Express app as a serverless function

Your backend will be live at something like `altcart-backend-xxx.vercel.app`.

## Step 4: Add Custom Domain api.altcart.vercel.app

1. Go to your backend project → **Settings** → **Domains**
2. Click **Add**
3. Enter `api.altcart.vercel.app`
4. Vercel will show DNS instructions

**If you own altcart.vercel.app:**

- If the main project (altcart.vercel.app) is on the same Vercel team, you can add the subdomain
- Vercel may add a CNAME record automatically, or you may need to add one in your DNS:
  - Type: `CNAME`
  - Name: `api`
  - Value: `cname.vercel-dns.com` (or the value Vercel shows)

**If using Vercel's default domain (e.g. `*.vercel.app`):**

- You can skip the custom domain and use the default URL (e.g. `altcart-backend-xxx.vercel.app`)
- Update the frontend: set `VITE_API_BASE_URL` in the web project to that URL

## Step 5: Update Frontend (if using custom domain)

If you successfully added `api.altcart.vercel.app`, the frontend will use it automatically (no env var needed when deployed to altcart.vercel.app).

If you use the default Vercel URL instead, set in the **web** project's Vercel env vars:

```
VITE_API_BASE_URL=https://your-backend-xxx.vercel.app
```

## Troubleshooting

- **Build fails:** Ensure `backend` is the root directory and `npm run build` works locally
- **Extraction fails:** Check that `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` are set correctly
- **CORS errors:** Ensure `FRONTEND_URL` is `https://altcart.vercel.app` (the CORS middleware allows this)

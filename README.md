# Alt+Cart 

Accessible product passports for visually impaired shoppers. Seamless, sustainable shopping from Amazon pages.

## Structure

```
  web/           # Vite + React app
  extension/     # Chrome extension (MV3)
```

## Development

### Web app

```bash
cd web
npm install
npm run dev
```

Runs at http://localhost:5173

### Chrome extension

1. Run the web app (`cd web && npm run dev`)
2. Open Chrome → `chrome://extensions` → Enable Developer mode
3. Load unpacked → select the `extension/` folder
4. Navigate to an Amazon product page
5. Use **Alt+Shift+P** or click the extension icon → Open Passport

### Supported products (demo)

- adidas VL Court 3.0 (ASIN: B0C2JYLPBW)
- Adokoo Fashion Sneakers (ASIN: B0CH9FJY8V)
- Puma Carina L (ASIN: B07HJLRXBT)
- On Cloud 6 (ASIN: B0D31VM76T)

Extension opens: `http://localhost:5173/passport?url=<current-tab-url>`. The web app maps known ASINs to passport IDs; unknown URLs show a fallback with demo links.

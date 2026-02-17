# alt+cart : Seamless, sustainable shopping for the visually impaired

## Inspiration

330 million people globally are visually impaired. 81 percent of shoppers with disabilities experience critical issues while online shopping. Two-thirds of shopping transactions initiated by visually impaired users are abandoned due to websites being inaccessible.

Yet today, there exist *no online shopping-centric platforms* designed for the visually impaired. Screen readers can read the DOM, but e-commerce websites aren't documents. Due to nonstandard layouts and scattered images, existing toolscan’t reliably answer the questions that matter: 
- What does this item actually look like? 
- Will it fit me?
- Would I regret this purchase?
- Is there a greener choice?

## What it does

**alt+cart** is a Chrome extension + web app that makes shopping readable again:

1) Hold Alt + hover to hear what’s on the page
- On any product page, hold Alt and hover over an image (or text region) to hear a spoken description of shopping-relevant details.

1) Search for any item and get an accessible product info page:
  - Name + price + popularity
  - Key specs (materials, dimensions, compatibility, care)
  - What people complain about in reviews
  - Sustainability signals (materials, certifications, manufacturing, badges)

2) Select 2-4 items for a conversational side-by-side comparison: 
  - fit/sizing conflicts (“true to size” vs “runs small”)
  - quality/durability themes
  - return-risk drivers

All of this can be navigated with just keyboard. We include TTS controls, captions and sentence highlighting, and user configuration options for font size, dyslexia-friendly font, reduced motion, and high contrast.

## How we built it

**Product extraction:** 
- **Browserbase** gives us stable, remote Chrome sessions that work inside serverless deployment.
- **Stagehand** drives navigation, waits for dynamic content, and runs DOM queries.certifications.
- **Bright Data** powers catalog search for known domains (Amazon, Walmart, eBay, Etsy, Lowe's, Target, Macy's, Home Depot). We try Bright Data first for speed and reliability. Search results are then sortable by relevance, price, or rating.

**Pipeline:**
- **Backend:** Extracted reviews feed into fit analysis (keyword matching for "runs small", "true to size") and thematic extraction (quality, value, style, sizing). Return risk is computed from rating distribution and review complaints. Sustainability scores come from materials, certifications, origin, and badges. Image descriptions are generated for the main product image.
- **Website:** Node.js, Express, TypeScript, Zod, React, Web Speech API (TTS). Deployed on Vercel.
- **Chrome extension:** Chrome Manifest v3, content script for Alt+hover image descriptions.

## Challenges we ran into

- **Fragmented site structures:** Amazon, Walmart, and Macy's each structure product pages differently. We built five domain-specific extractors with fallback selectors (e.g. `#productTitle` vs `meta[property="og:title"]` vs `h1`) to handle variation.
- **Rate limits and latency:** Bright Data and Browserbase can take over a minute to return a response, which posed challenges we tried to address with a fallback system.
- **Reviews are messy and contradictory:** Efficiently extracting meaningful information from free-form review text required keyword sets and severity scoring.

## What's next

- More realistic AI text-to-speech options
- A hands-free conversational voice agent for direct interaction while shopping
- Improving extraction robustness across a diverse set of e-commerce sites using LLMs
- A more personalized experience for each user, describing their preferred fit, items they've bought in the past, and their sustainability preferences.

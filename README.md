## Dynamic Portfolio Dashboard

Production-ready, full‑stack portfolio monitor built with Next.js (App Router), TypeScript, Tailwind CSS, and server API routes. It ingests the provided Excel sheet, renders a sector‑grouped dashboard with live CMP/P‑E/EPS lookups (via unofficial Yahoo/Google sources), and includes filters, pagination, and a polished UI.

### Live Links
- App: `https://portfolio-dashboard-zeta-olive.vercel.app/`
- Repo: `https://github.com/sai-d-kumar-balu/portfolio-dashboard.git`

### Stack
- Frontend: Next.js 16 (App Router), React, TypeScript, Tailwind
- Data & APIs: Next.js Route Handlers
- Charts: Recharts (pie)
- HTML parsing: Cheerio (for Google Finance)
- Animations: Motion for React

---

## Features
- Excel → JSON ingestion script (re‑run anytime): `scripts/export_portfolio.py`
- Sector grouping and summaries with pie chart
- Live metrics (when online): CMP from Yahoo, P/E & EPS from Google (unofficial scraping)
- Holdings table as modern cards with:
  - pagination
  - search (name/ticker), sector chips
  - quick toggles (Stage‑2 only, Gainers, Exits)
  - sorting (Investment, Gain, Name)
- Summary KPI cards with modals for breakdowns
- Resilient error handling and graceful fallbacks to Excel data

---

## Quick Start

1) Install
```bash
npm install
```

2) (Optional) Re‑export data from the provided Excel
```bash
# copies data/portfolio.xlsx -> src/data/portfolio.json
python scripts/export_portfolio.py
```

3) Dev server
```bash
npm run dev
# http://localhost:3000
```

4) Type‑check and build
```bash
npm run lint
npm run build
npm start
```

---

## Data Ingestion

The assignment’s Excel file is copied into `data/portfolio.xlsx` and normalized by:
```
scripts/export_portfolio.py
```
This script:
- understands sector headers in the sheet (e.g., “Financial Sector”, “Tech Sector”)
- maps columns (purchase price, qty, fundamentals, growth, stage2, notes)
- produces `src/data/portfolio.json` used at runtime

Re‑run the script whenever the spreadsheet changes.

---

## API Surface

- `GET /api/portfolio`
  - Returns the static snapshot (`src/data/portfolio.json`) plus computed sector summaries.
- `GET /api/market/[ticker]`
  - Resolves ticker to exchange symbol (NSE/BSE heuristic)
  - Fetches CMP from Yahoo’s quote endpoint (unofficial)
  - Scrapes P/E and EPS from Google Finance HTML via Cheerio
  - Caches (revalidate) aggressively and returns structured data

Notes:
- These are unofficial sources. When blocked or rate‑limited, the UI gracefully falls back to Excel values and shows live values only when available.

---

## Configuration

This project is designed to run without secrets. For CI deploys with GitHub Actions → Vercel, set:

- `VERCEL_TOKEN` (GitHub Actions secret)

No runtime `.env` is required for local runs. If you later add any keys, prefer placing them server‑side only and never exposing them to the client.

---

## Deployment

### One‑click (Vercel Dashboard)
1. Push to GitHub (main branch).
2. Import the repo in Vercel and deploy. Vercel will run `npm install` + `npm run build` automatically.

### GitHub Actions (CI) example
Use the provided workflow (adjust Node version if desired):

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Build Next.js app
        run: npm run build
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel deploy --prod --token=$VERCEL_TOKEN
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

Tip: Vercel also supports first‑class Git integration (recommended) without needing a token in CI.

---

## UI Guide

- Summary cards (clickable): open modal with top contributors
- Filters (top of holdings):
  - Search (name/ticker)
  - Sector chips (All + sectors from data)
  - Sort pills: Investment, Gain, Name
  - Toggles: Stage‑2 only, Show gainers, Show exits
- Sector Allocation: pie chart + legend

---

## Market Data Strategy

- Yahoo Finance CMP: unofficial quote endpoint
- Google Finance P/E & EPS: HTML scraping with Cheerio
- Caching: Next.js `fetch` with `revalidate` for short TTLs
- Error handling: if remote fails, the UI falls back to the spreadsheet snapshot

Security note: No secrets are embedded in the client. If you adopt paid APIs later, shift keys to server‑only routes.

---

## Known Limitations
- Unofficial sources can rate‑limit or change structure; the app falls back to snapshot values.
- CMP/P‑E/EPS aren’t guaranteed accurate without paid APIs—include disclaimers as needed.

---

## Contributing & Scripts

- Lint: `npm run lint`
- Dev: `npm run dev`
- Build: `npm run build`

Folder highlights:
```
src/app/api/        # API routes
src/components/     # UI components
src/hooks/          # SWR data hooks
src/lib/            # utilities (formatting, market-data fetch)
src/types/          # TypeScript models
src/data/           # generated portfolio.json
```

---

## Assignment Deliverables

- [x] Full Next.js app with TypeScript/Tailwind
- [x] Excel ingestion → JSON
- [x] Portfolio table with auto‑refresh live metrics
- [x] Sector grouping and summaries
- [x] Filters, sorting, pagination
- [x] Deployed to Vercel (link above)
- [ ] Loom video walkthrough (to be recorded)
- [ ] PDF/Word doc of challenges & mitigations (to be attached to email)

---

## License
MIT (or your preferred). Update as needed.

### References
- Next.js docs: https://nextjs.org/docs
- Deployment guide: https://nextjs.org/docs/app/building-your-application/deploying
- Recharts: https://recharts.org/en-US

# AU Price Tracker v3.1

A lightweight Node.js + SQLite project to track Australian retailer prices, compare across stores, and receive multi‑channel alerts.

## Quick start

```bash
cp .env.example .env          # fill SMTP, Stripe and VAPID keys
npm install
npm start                     # http://localhost:3000
```

## Scripts

* `npm run cron:deals` – generate `public/deals/YYYY-MM-DD.json`
* `npm --prefix next run dev` – preview ISR Next.js site

## Deploy

Works out‑of‑the‑box on Replit, Fly.io, Render or Railway.  
Persist `db.sqlite` using the platform’s volume feature if needed.

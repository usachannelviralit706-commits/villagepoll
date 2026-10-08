# PollPop — free online polls

PollPop is a free online voting site. Anyone can create a poll in seconds without signing up, share the link, and watch live results as people vote. The site is supported by display ads (Google AdSense), placed in slots across the home page, poll pages, and the create page.

## Features

- **Home page** with a hero, trending/new sort, category filters, and a feed of polls to vote on
- **Create a poll** with a question, optional description, 2–10 answer options, and a category
- **Poll page** to vote, see animated results that refresh live, and share via copy link, WhatsApp, X, or Facebook
- **One vote per person per poll**, tracked with an anonymous cookie
- **Ad slots** (leaderboard, in-feed, sidebar, below results) plus an auto-generated `/ads.txt`
- Starter polls are added automatically the first time the database is empty, so the site never looks empty

## Tech

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions)
- Tailwind CSS 4
- Netlify Database (managed Postgres) with Drizzle ORM
- Deployed on Netlify

## Turning on ads (earning money)

1. Apply for [Google AdSense](https://adsense.google.com) using your site URL.
2. In Netlify go to **Project configuration → Environment variables** and add:
   - `VITE_ADSENSE_CLIENT` — your publisher ID, e.g. `ca-pub-1234567890123456`
   - Optional ad unit IDs: `VITE_ADSENSE_SLOT_LEADERBOARD`, `VITE_ADSENSE_SLOT_INFEED`, `VITE_ADSENSE_SLOT_SIDEBAR`, `VITE_ADSENSE_SLOT_RESULTS`
3. Redeploy. The AdSense script loads, the placeholders turn into real ads, and `/ads.txt` lists your publisher ID.

Until `VITE_ADSENSE_CLIENT` is set, each ad slot shows a labelled "Ad space" placeholder.

## Running locally

```bash
pnpm install
netlify dev
```

`netlify dev` provides the local database. Schema changes: edit `db/schema.ts`, then run `npx drizzle-kit generate --name <change_name>`. Migrations in `netlify/database/migrations/` are applied automatically on deploy.

## Ideas for later

- Poll creator accounts and a "my polls" dashboard
- Closing dates, multiple-choice polls, and comments
- Reporting and moderation for inappropriate polls
- Privacy policy and cookie consent pages (AdSense requires a privacy policy before approval)

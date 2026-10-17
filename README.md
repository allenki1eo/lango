# Lango

A Swahili-first guide to Tanzanian government online services. Describe what you need in your own words; Lango finds the service, shows the documents to prepare and the steps to follow, and sends you to the official site to finish.

Lango never collects credentials, never embeds government portals and never processes applications.

- What we're building: [`docs/PRD.md`](docs/PRD.md)
- How it's built: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Rules and conventions for contributors and AI agents: [`CLAUDE.md`](CLAUDE.md)

## Current build (v0.2, October 2026)

- Ask box: plain Swahili/English questions go to `/api/ask`, which uses a free OpenRouter tool-calling model (`src/lib/ai/openrouter.ts`) over the curated catalog. Keyword cards appear instantly; if the model fails or is rate-limited, keyword search answers instead.
- 16 verified guides at `/sw/huduma/<slug>` and `/en/huduma/<slug>`, statically rendered, each with official sources, verified fees only and a last-checked date.
- Content: `src/data/catalog.json` (see [`docs/CONTENT.md`](docs/CONTENT.md)). The Turso/Drizzle schema stays for the planned admin panel (M2) but is not needed to deploy.
- Env: `OPENROUTER_API_KEY` (optional; without it Lango runs on keyword search), `AI_MODELS`, `AI_ENABLED`, `NEXT_PUBLIC_SITE_URL`.

## Getting started

Requires Node.js 22.9 or later and pnpm 10.

```bash
pnpm install
cp .env.example .env.local     # a local SQLite file is the default database
pnpm db:migrate                # create the tables
pnpm db:seed                   # import the 55 prototype services as "in review"
pnpm dev                       # http://localhost:3000 redirects to /sw
```

To preview content on the public site before the admin panel exists, run `pnpm db:seed --preview`. It publishes the unverified catalog and only works against a local file database.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test   # before every pull request
pnpm build && pnpm check:budget            # public pages stay under 150 KB of JavaScript
pnpm e2e                                   # Playwright, against the production build
```

CI runs all of these, plus a check that migrations match the schema and that the seed can run twice.

## Status

| Milestone | State |
|---|---|
| M0 Foundation | Done, except connecting the Turso, Resend and Vercel accounts |
| M1 Public catalog | Next |
| M2 Admin, M3 AI search, M4 Journeys, M5 Launch readiness | Planned |

## Visitor stats

Lango counts visits without cookies or personal data (see `src/lib/stats/core.ts`):

- Page views and official-site taps are sent by a tiny inline script to `POST /api/hit`; bots, prefetches and automated browsers are skipped.
- Daily unique visitors use a hash of IP + user agent salted with a per-day secret (`STATS_SECRET`); raw IPs are never stored and old hashes are deleted daily.
- All-time unique visitors are estimated with a HyperLogLog sketch (±3%).
- AI questions are counted in `/api/ask`.
- The footer shows public totals from `GET /api/wageni` (edge-cached for 60 s).
- Detailed charts live at `/takwimu`, protected by `LANGO_STATS_PASSWORD`. Data is stored in the Turso database (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).

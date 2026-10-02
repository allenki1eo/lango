# Lango

A Swahili-first guide to Tanzanian government online services. Describe what you need in your own words; Lango finds the service, shows the documents to prepare and the steps to follow, and sends you to the official site to finish.

Lango never collects credentials, never embeds government portals and never processes applications.

- What we're building: [`docs/PRD.md`](docs/PRD.md)
- How it's built: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Rules and conventions for contributors and AI agents: [`CLAUDE.md`](CLAUDE.md)

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

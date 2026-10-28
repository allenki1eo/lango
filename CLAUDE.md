# CLAUDE.md

Guidance for AI coding agents working in this repository. Read `docs/PRD.md` for what we are building and `docs/ARCHITECTURE.md` for how. When they conflict with this file, ask before proceeding.

## What Lango is

A Swahili-first guide to Tanzanian government online services. Users describe a need, Lango finds the service, shows documents and steps, and links to the official site. Lango never collects credentials, never embeds government portals and never processes applications.

## Stack

Next.js 16 (App Router) + TypeScript strict, Tailwind + shadcn/ui, Turso (libSQL) + Drizzle ORM, Auth.js v5 (magic links via Resend), next-intl, Zod, MiniSearch, OpenRouter (free tool-calling models), Vercel. Package manager: pnpm.

## Commands

```bash
pnpm dev              # local dev server
pnpm build            # production build
pnpm typecheck        # next typegen && tsc --noEmit
pnpm lint             # eslint
pnpm format           # prettier --write (format:check in CI)
pnpm test             # vitest
pnpm test:search      # search ranking fixture
pnpm e2e              # playwright (needs pnpm build first)
pnpm check:budget     # JS budget for prerendered public pages (needs pnpm build first)
pnpm db:generate      # drizzle-kit generate (after schema changes)
pnpm db:migrate       # apply migrations
pnpm db:seed          # load the prototype catalog as "in_review" (add --preview to publish it in a local file DB)
pnpm db:studio        # drizzle studio
```

Run `pnpm typecheck && pnpm lint && pnpm test` before declaring any task done.

## Rules that must not be broken

1. **Content comes from the catalog only** (`src/data/catalog.json` today; the database once the admin panel lands). Never hardcode steps, fees, requirements or URLs for a government service in code. The AI never generates them either.
2. **AI picks, it does not write.** The model may only call catalog tools; every card (steps, fees, links) is built server-side from the catalog, never from model text. The model's short reply must not state facts the tools didn't return. Always keep the local-search fallback working when `AI_ENABLED=false` or the API fails.
3. **Redact before logging or sending.** Every query passes through `lib/search/redact.ts` before it touches `search_logs`, `ai_cache` or the AI.
4. **Official links are allowlisted.** An `official_url` must be on its agency's domain or a subdomain. Validate in Zod and on save.
5. **Public visibility means `status = 'published'`.** Every public query filters on it.
6. **Roles are checked server-side.** Every admin server action calls `requireRole()` from `lib/roles.ts`. Middleware alone is not enough.
7. **Every content save writes a revision.** Use the helpers in `db/queries`, which do this for you.
8. **No credential or personal data collection on public pages.** No forms ask for NIN, phone numbers or passwords.

## Conventions

### Code
- Server components by default. Add `"use client"` only for interactive pieces (search box, drawer, checklist, language switch, admin forms).
- Public pages don't use next-intl on the client: no `NextIntlClientProvider`, no next-intl `Link` or client hooks. Translate on the server and pass strings to client components as props. Link with `components/public/locale-link.tsx`.
- Next.js 16 names: `src/proxy.ts` (not middleware), `"use cache"` + `cacheTag("catalog")` (not `unstable_cache`), `updateTag("catalog")` in server actions.
- Database access lives in `src/db/queries/*`. Components and actions never import `db` directly.
- Mutations are server actions in `actions.ts` next to the route, validated with Zod schemas from `lib/validation`.
- After publishing or unpublishing, call `updateTag("catalog")` (or `revalidateTag("catalog", "max")` outside server actions) and bump `catalog_version`.
- Official-link checks go through `lib/validation/official-url.ts`. Never write a second allowlist.
- Name files in kebab-case, components in PascalCase, and keep one component per file.
- No `any`. Prefer `satisfies` for typed config objects.

### Language
- Swahili is the default locale and is written first. English is a faithful translation. New visitors land on `/sw` whatever their browser language; only an explicit choice (the `NEXT_LOCALE` cookie) changes that.
- No user-facing strings in components. UI copy goes in `messages/sw.json` and `messages/en.json`; content goes in the `_sw` and `_en` columns.
- Swahili route segments: `huduma` (service), `njia` (journey), `tafuta` (search), `kuhusu` (about).
- Copy is plain, active and in sentence case. Buttons say exactly what happens ("Fungua tovuti rasmi", "Open the official site").

### Design
The public UI follows America.gov's calm front door: white pages, near-black indigo ink, soft grey "stage" cards with very round corners, a serif display face for big headlines and a tight grotesque for everything else. Tokens live in `src/app/globals.css` as CSS variables with light and dark values.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0F0E24` | Page background |
| `--band` | `#F2F2F0` | `#17163A` | Stage cards, soft panels, quiet buttons |
| `--surface` | `#FFFFFF` | `#1C1B42` | Cards, menu, inputs |
| `--ink` | `#0D0C24` | `#EFEEF8` | Text |
| `--muted` | `#5C5B70` | `#A9A8C6` | Secondary text |
| `--line` | `#E4E4EA` | `#2C2B56` | Borders, dividers |
| `--primary` | `#1F1C5C` | `#D9D6FF` | Primary buttons (Menyu, send, official site), with `--primary-ink` text |
| `--hero` | `#12103A` | `#0A0920` | Dark media panels (the ask panel, feature tiles), with `--hero-ink` text |
| `--sun` | `#F4A31B` | `#F4A31B` | Small accents (AI badge, brand keystone) |
| `--ok` | `#0F7A52` | `#4FD29B` | Completed steps, secure-link locks |
| `--hibiscus` | `#A8204F` | `#F0708F` | Emergency numbers |

- Type: Source Serif 4 (`serif-display` utility: big greetings, page titles, footer links and wordmark) and Inter Tight (interface text and section headings, medium weight, tight tracking), loaded with `next/font`.
- Shapes: pages open with a `stage` card (rounded 32 to 44 px) holding the header; cards are rounded 24 to 28 px with `shadow-card`; buttons are pills.
- Signature elements: the serif greeting with the ask box as the focal point on an indigo panel, agency "stamps" (rounded squares with the agency code), the arch motif, and a thin kanga edge on the footer.
- Header: wordmark, a single other-language toggle and a "Menyu" pill that opens a `<details>` dropdown. No client JavaScript.
- Motion is CSS only (the hero preview cycle, the agency wall drift), has a pause control and stops under `prefers-reduced-motion`.
- Media tiles are drawn with CSS and SVG from catalog data. No stock photos, no third-party seals or logos.
- Icons: `icon.tsx` ships to the browser with the ask box, so it holds only catalog icons and the ask box's marks. Put page-only glyphs in `glyph.tsx` (server only).
- Mobile first. Touch targets at least 44 px. Visible focus rings. Respect `prefers-reduced-motion`.
- Avoid all-caps labels and arrows appended to button text. Gradients only as soft light inside dark or grey panels.
- shadcn/ui is for the admin panel. Public pages use custom components on the same tokens to keep JavaScript small.

### Performance
- Public routes stay under 150 KB of JavaScript. Check with `pnpm build` output before merging.
- No third-party scripts on public pages.

## Definition of done
- Typecheck, lint and tests pass, including `test:search` if search code changed.
- New UI copy exists in both `sw.json` and `en.json`.
- New public UI works at 360 px width, in dark mode and with the keyboard.
- `pnpm build && pnpm check:budget` passes if public UI changed. The framework uses about 142 KB of the 150 KB budget.
- Schema changes include a generated migration and an updated seed if needed.
- Admin mutations check roles and write revisions.

## Working style
- For non-trivial changes, propose a short plan first and wait for approval.
- Keep pull requests focused on one milestone task from `docs/PRD.md` section 10.
- When unsure about government process details, leave the content to editors. Do not guess.

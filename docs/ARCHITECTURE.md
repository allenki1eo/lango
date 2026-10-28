# Lango: Architecture (v1)

Companion to `docs/PRD.md`. This document describes how v1 is built.

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), TypeScript 5.9 strict | Static generation for public pages, server actions for admin, one codebase |
| UI | Tailwind CSS + shadcn/ui | shadcn for the admin panel; public pages use custom components on the same tokens |
| Database | Turso (libSQL) | Cheap, fast reads, SQLite semantics, edge replicas |
| ORM | Drizzle ORM + drizzle-kit | Typed schema, migrations, first-class libSQL support |
| Auth | Auth.js (NextAuth v5), email magic link via Resend, Drizzle adapter | Invite-only staff sign-in without passwords |
| i18n | next-intl | Locale routing (`/sw`, `/en`), typed messages |
| Validation | Zod | Shared schemas for forms, server actions and API routes |
| Local search | MiniSearch over an in-memory catalog | The catalog is hundreds of rows; in-memory fuzzy search is faster and simpler than database full-text search at this size |
| AI | Anthropic API, model set by `AI_MODEL` (default a fast Haiku-class model) | Used only to choose among search candidates |
| Hosting | Vercel | Incremental static regeneration, cron jobs, preview deployments |
| Email | Resend | Magic links |
| Tests | Vitest (unit), Playwright (end to end) | |
| Lint and format | ESLint 9 with `eslint-config-next`, Prettier | ESLint 10 waits on `eslint-plugin-react` support |

## 2. System overview

```
                 ┌──────────────────────────────┐
  Citizen ──────▶│ Public pages (static + ISR)  │──── outbound link ───▶ Official .go.tz site
                 │ /sw, /en                     │
                 └──────────────┬───────────────┘
                                │ POST /api/search
                 ┌──────────────▼───────────────┐
                 │ Search service               │
                 │ 1. normalise + redact        │
                 │ 2. MiniSearch (local)        │
                 │ 3. AI pick (low confidence)  │──▶ Anthropic API
                 │ 4. log (anonymised)          │
                 └──────────────┬───────────────┘
                                │
  Staff ────────▶ Admin panel ──▶ Turso (libSQL) ◀── Vercel Cron: link check, stale scan
                 (server actions)      │
                                       └── on publish: revalidateTag("catalog")
```

## 3. Data model

All user-facing text has `_sw` and `_en` columns. With exactly two languages, columns are simpler and faster than a translations table.

### Tables

**agencies**
`id`, `code` (TRA), `name_sw`, `name_en`, `domain` (tra.go.tz), `home_url`, `created_at`, `updated_at`

**categories**
`id`, `slug`, `name_sw`, `name_en`, `sort_order`

**services**
`id`, `slug` (unique), `agency_id`, `category_id`, `title_sw`, `title_en`, `summary_sw`, `summary_en`, `official_url`, `guide_level` (`general` | `detailed`), `status` (`draft` | `in_review` | `published` | `archived`), `fee_note_sw`, `fee_note_en`, `time_note_sw`, `time_note_en`, `source_url`, `verified_at`, `verified_by` (user id), `created_at`, `updated_at`

**service_steps**
`id`, `service_id`, `position`, `body_sw`, `body_en`

**service_documents**
`id`, `service_id`, `position`, `body_sw`, `body_en`

**service_keywords**
`id`, `service_id`, `keyword`, `lang` (`sw` | `en` | `any`)

**journeys**
`id`, `slug`, `title_sw`, `title_en`, `summary_sw`, `summary_en`, `status`, `verified_at`, `verified_by`, `created_at`, `updated_at`

**journey_stages**
`id`, `journey_id`, `position`, `service_id`, `note_sw`, `note_en`

**journey_keywords**
same shape as `service_keywords`

**reports**
`id`, `target_type` (`service` | `journey`), `target_id`, `step_position` (nullable), `kind` (`wrong` | `outdated` | `broken_link` | `other`), `message`, `status` (`open` | `resolved` | `dismissed`), `created_at`, `resolved_by`, `resolved_at`

**search_logs**
`id`, `query_redacted`, `lang`, `method` (`local` | `ai` | `none`), `top_type`, `top_id`, `confidence`, `clicked` (boolean, set by a follow-up beacon), `created_at`

**ai_cache**
`query_key` (primary key: normalised and redacted query + locale + catalog version), `result_json`, `created_at`

**link_checks**
`id`, `url`, `status_code`, `ok`, `checked_at`

**revisions**
`id`, `entity_type`, `entity_id`, `snapshot_json`, `editor_id`, `note`, `created_at`

**users**, **accounts**, **sessions**, **verification_tokens**
Auth.js tables via the Drizzle adapter. `users` adds `role` (`admin` | `editor` | `reviewer`) and `invited_by`.

**settings**
`key`, `value_json` (for example `catalog_version`, `stale_after_days`)

### Rules
- Only `published` rows are visible publicly.
- `official_url` must be HTTPS and on the domain of the service's agency (or a subdomain). Enforced by `lib/validation/official-url.ts`, used by the Zod schemas and on save. Agency domains may not be registry suffixes such as `go.tz` or `or.tz`, which would allowlist every site under them. Not every agency is on `.go.tz` (for example `nhif.or.tz`, `tanesco.co.tz`).
- Summaries are nullable so imported guides can land without one; publishing requires a summary and a source URL.
- Steps and documents have stable ids. On-device progress is keyed by step id, so reordering or inserting a step never moves a user's ticks onto the wrong step.
- A journey can be published only when every service in it is published. Unpublishing or archiving a service that a published journey uses requires confirming the affected journeys. Deleting such a service is blocked by the foreign key.
- Saving any service or journey writes a `revisions` row.
- Publishing requires the `reviewer` or `admin` role, and sets `verified_at`, `verified_by` and `source_url`.
- Publishing bumps `settings.catalog_version` and calls `revalidateTag("catalog")`.

## 4. Routes

### Public (`src/app/[locale]/(public)`)
| Route | Rendering | Purpose |
|---|---|---|
| `/[locale]` | Static, tag `catalog` | Home: search, categories, directory |
| `/[locale]/huduma/[slug]` | Static per slug | Service guide |
| `/[locale]/njia/[slug]` | Static per slug | Journey |
| `/[locale]/tafuta` | Dynamic | Search results page (also works without JavaScript) |
| `/[locale]/kuhusu` | Static | About, disclaimer, how content is verified |

The home page also opens guides in a drawer for speed, but every guide has its own URL for sharing and SEO.

### API (`src/app/api`)
| Route | Purpose |
|---|---|
| `POST /api/search` | `{ q, locale }` returns `{ method, results[], clarify? }` |
| `POST /api/search/click` | Marks a search log as clicked |
| `POST /api/reports` | Creates a problem report (rate limited) |
| `GET /api/cron/link-check` | Weekly, protected by `CRON_SECRET` |
| `GET /api/cron/stale-scan` | Daily, flags content past `stale_after_days` |

### Admin (`src/app/admin`)
`/admin` dashboard, `/admin/services`, `/admin/services/[id]`, `/admin/journeys`, `/admin/journeys/[id]`, `/admin/agencies`, `/admin/categories`, `/admin/reports`, `/admin/search-insights`, `/admin/users`. Mutations use server actions that check the session role.

## 5. Search design

### Pipeline
1. **Normalise:** lowercase, strip accents and punctuation, collapse spaces.
2. **Redact:** replace digit runs of 6 or more (NIN, phone, TIN) and email addresses with tokens before anything is logged or sent out.
3. **Local search:** MiniSearch over services and journeys, indexing titles, summaries, keywords and agency code and name in both languages, with a Swahili and English stopword list, prefix and fuzzy matching, and title boosting. Returns the top 8 candidates with scores.
4. **Confidence check:** if the top score is clearly ahead of the second (thresholds in `lib/search/config.ts`, tuned from logs), return local results. Target: 80% of searches end here.
5. **AI pick:** otherwise, check `ai_cache`, then call the model with the query and the candidate list (id, type, titles, summary). The model returns JSON through a tool or structured output: `{ "match_id": string | null, "alternates": string[], "clarify": string | null }`.
6. **Validate:** discard any id that was not in the candidate list. On timeout (2.5 s), error or invalid output, fall back to local results.
7. **Log:** write an anonymised `search_logs` row.

### AI guardrails
- The model may only pick from the candidates it was given, and the server enforces this.
- The model never generates steps, fees, requirements or URLs. All displayed content comes from the database.
- The clarifying question is limited to one short sentence, in the user's language.
- No user identifiers are sent. Queries are redacted.
- Rate limit `/api/search` AI calls per IP (sliding window in Turso or Vercel's firewall rules).

### Catalog loading
The published catalog is fetched in a `"use cache"` function tagged with `cacheTag("catalog")`, and the MiniSearch index is built once per server instance per catalog version. At a few hundred entries this is under 1 MB in memory. Publishing actions call `updateTag("catalog")` (read-your-writes inside server actions); cron jobs and route handlers use `revalidateTag("catalog", "max")`.

## 6. Client-side behaviour
- Step progress is stored in `localStorage` under `lango:v1:progress:{type}:{id}` as a list of completed step ids, wrapped in try/catch. Ids that no longer exist are ignored.
- Language: new visitors always land on `/sw`; the proxy ignores `Accept-Language` until a choice is made. Choosing a language sets the `NEXT_LOCALE` cookie (a functional preference cookie, one year), from the proxy on full page loads and from the language switch on client-side navigations.
- No analytics cookies. Page analytics, if added, must be cookieless (for example Vercel Web Analytics).

## 7. Security
- Content Security Policy: no third-party scripts on public pages; `connect-src` limited to self.
- Outbound official links use `rel="noopener noreferrer"` and must match the agency domain allowlist.
- Admin routes are protected in `proxy.ts` (Next.js 16's name for middleware; session required) and in every server action (role check).
- Invite-only sign-in: an Auth.js `signIn` callback rejects any email not already in `users`, so magic links are never sent to strangers. Covered by a unit test.
- Reports and search endpoints are rate limited and validated with Zod. Rate limiting keys on a salted hash of the IP with a daily rotating salt; raw IPs are never stored.
- The free-text note on a problem report passes through `lib/search/redact.ts` before it is stored, because people will type phone and NIN numbers into it.
- All secrets live in Vercel environment variables.

## 8. Performance budget
- Budget: under 150 KB of gzipped JavaScript for each public page, measured on prerendered pages by `pnpm check:budget` in CI (noModule polyfills excluded). React 19 and the Next.js 16 router alone account for about 142 KB, so app code has roughly 8 KB. Search, the drawer and the checklist must stay small; MiniSearch runs on the server only.
- Public routes: server components by default; client components only for search, drawer, checklist and language switch.
- Public pages do not mount `NextIntlClientProvider` and do not use next-intl's client `Link` or hooks. Server components translate and pass strings to client components as props; links use `components/public/locale-link.tsx`, which renders `next/link` with a localised href.
- No component library JavaScript on public routes (shadcn is used in the admin panel only).
- Fonts: Source Serif 4 (display) and Inter Tight (interface) via `next/font`, subset to Latin, with `display: swap`.
- Images: none needed in v1. Icons are inline SVG.

## 9. Environment variables

| Name | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | Database URL |
| `TURSO_AUTH_TOKEN` | Database token |
| `AUTH_SECRET` | Auth.js secret |
| `AUTH_RESEND_KEY` | Resend API key for magic links |
| `EMAIL_FROM` | Sender address |
| `ANTHROPIC_API_KEY` | AI search |
| `AI_MODEL` | Model id for AI search |
| `AI_ENABLED` | Kill switch, `true` or `false` |
| `CRON_SECRET` | Protects cron routes |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO |

## 10. Project structure

```
src/
  proxy.ts       locale routing (Swahili-first), later admin session checks
  app/
    [locale]/
      (public)/
        page.tsx
        huduma/[slug]/page.tsx
        njia/[slug]/page.tsx
        tafuta/page.tsx
        kuhusu/page.tsx
      layout.tsx
    admin/
      (auth)/login/page.tsx
      (dashboard)/
        page.tsx
        services/...
        journeys/...
        agencies/...
        categories/...
        reports/...
        search-insights/...
        users/...
      layout.tsx
    api/
      search/route.ts
      search/click/route.ts
      reports/route.ts
      cron/link-check/route.ts
      cron/stale-scan/route.ts
  components/
    ui/          shadcn components (admin)
    public/      search box, drawer, service guide, journey, checklist, locale-link
    admin/       forms, tables, workflow controls
  db/
    schema.ts
    client.ts
    queries/     catalog.ts, services.ts, journeys.ts, reports.ts
    seed/        prototype-catalog.ts, seed.ts
  lib/
    search/      normalize.ts, redact.ts, local.ts, ai.ts, config.ts, index.ts
    auth.ts
    roles.ts
    env.ts       typed server environment
    fonts.ts
    validation/  official-url.ts, agency.ts, service.ts, journey.ts, report.ts
    i18n/        routing.ts, request.ts, navigation.ts
  messages/
    sw.json
    en.json
drizzle/         migrations
scripts/         check-js-budget.mjs
tests/
  unit/
  e2e/
```

## 11. Testing
- **Unit:** normalisation, redaction, local search ranking (a fixture of 50 real queries with expected matches), AI response validation, domain allowlist, role checks.
- **End to end:** search to guide to official link, language switch, checklist persistence, report submission, editor-to-reviewer publish flow.
- **CI:** typecheck, lint, format, unit tests, the search ranking fixture, a check that migrations match the schema, migrate and seed (twice, for idempotence), build, the JavaScript budget and end-to-end tests on every pull request. End-to-end tests also run against preview deployments once Vercel is connected.

## 12. Decisions to revisit
- Database full-text search or vector search in Turso once the catalog exceeds about 2,000 entries.
- Citizen accounts, if reminders or saved progress across devices are added.
- A WhatsApp channel reusing `lib/search` and the catalog queries.

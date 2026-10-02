# Lango: Product Requirements (v1)

Status: Draft for review
Owner: Allen
Last updated: 2 October 2026

## 1. Summary

Lango is a Swahili-first web platform that helps people in Tanzania find the right government online service and understand how to use it. A user types what they need in their own words ("nataka leseni ya udereva"), and Lango identifies the service, shows the documents to prepare and the steps to follow, and sends the user to the official government site to complete it.

Lango does not replace government portals, collect credentials or process applications. It is a guide layer on top of them.

## 2. Problem

Tanzania has dozens of government portals (TRA, NIDA, BRELA, RITA, HESLB, NECTA, Immigration, Lands and many more). Citizens face three problems:

1. **Finding the right portal.** People know what they want to do ("start a business", "get a birth certificate") but not which agency handles it.
2. **Understanding the process.** Requirements, documents, fees and payment by control number are unclear, so people make wasted trips or pay intermediaries.
3. **Processes that span agencies.** Many real goals need several agencies in a specific order (starting a business touches BRELA, TRA, the local council and sometimes OSHA). No single portal explains the whole path.

## 3. Goals and non-goals

### Goals for v1
- A user can describe a need in Swahili, English or a mix, and reach the correct service guide in one search, most of the time.
- Every published guide is accurate, dated and attributable to a reviewer.
- Multi-agency goals are explained as ordered journeys.
- A small team can keep content current without a developer.

### Non-goals for v1
- Logging into, embedding or automating government portals.
- User accounts for citizens. Progress stays on the device.
- Payments of any kind.
- WhatsApp bot, USSD, offline PWA and audio (planned for later phases).
- Zanzibar-specific institutions, beyond what is linked from Union agencies (to revisit).

## 4. Users

| User | Need | Context |
|---|---|---|
| Citizen | Complete a government task without wasting trips | Mobile, often Android on 3G/4G, Swahili-first, varying literacy |
| Small business owner | Register and stay compliant across agencies | Mobile and desktop, time-poor |
| Student | Admission, loans, exam results | Mobile, seasonal peaks (NECTA results, HESLB windows) |
| Helper (cyber café, agent, family member) | Guide someone else through a process | Desktop, repeats the same services daily |
| Content editor | Write and update guides | Desktop, admin panel |
| Reviewer | Verify guides against official sources before publishing | Desktop, admin panel |

## 5. Scope of v1

### 5.1 Public site
- **Home:** a search box, example queries, category filters and the full service directory.
- **Service guide** (`/sw/huduma/{slug}`): agency, official domain, a short description, documents to prepare, numbered steps, fee and time notes where verified, a "last checked" date, a button to open the official site, a step checklist that remembers progress on the device, share to WhatsApp, copy steps, and "report a problem".
- **Journey** (`/sw/njia/{slug}`): an ordered sequence of services toward one goal (for example, starting a business), with per-stage notes and progress.
- **Search results** (`/sw/tafuta?q=`): best match, other matches, and a clear empty state with suggestions.
- **Languages:** Swahili (default) and English, switchable everywhere, with content in both. New visitors always land on Swahili, whatever their browser language; once they choose a language, a cookie remembers it.
- **Trust signals:** the official domain on every guide, "last checked" dates, a clear statement that Lango is not a government site and never asks for passwords.

### 5.2 Search
- Users type free text in Swahili, English or a mix.
- **Stage 1, local search:** fast keyword and fuzzy matching over the published catalog (services and journeys).
- **Stage 2, AI assist:** when local confidence is low, an AI model chooses the best match only from the candidates that local search returned. It may also return one short clarifying question. It never writes steps, fees or requirements.
- If the AI is slow or unavailable, local results are shown. Search must never fail completely.
- Personal numbers (NIN, phone, TIN) are stripped from queries before logging or sending to the AI.

### 5.3 Journeys
- Editors compose journeys from existing services, in order, with optional notes per stage ("do this before registering for TIN").
- Search can return a journey when the query describes a goal rather than a single service.
- Launch with at least 5 journeys: starting a business, joining university, getting a passport from scratch, buying and registering land, buying and registering a vehicle.

### 5.4 Admin panel
- Invite-only sign-in for staff.
- Roles: **Admin** (users, settings, everything), **Editor** (create and edit drafts), **Reviewer** (verify and publish).
- Manage agencies, categories, services, steps, documents, keywords and journeys, all bilingual.
- Workflow: Draft, then In review, then Published. Publishing requires a reviewer and records the verification date and source URL.
- Guide level per service: **General** (generic steps, shown with a notice) or **Detailed** (service-specific, verified).
- Dashboard: content that is stale (not verified in 90 days), open problem reports, failed searches, broken links.
- Revision history for every service and journey, with restore.

### 5.5 Quality operations
- **Problem reports:** users can flag a step as wrong or outdated, with an optional note. Reports land in the admin queue.
- **Link checker:** a weekly job checks every official URL and flags failures on the dashboard.
- **Search insights:** the most common queries with no match, which drive the content roadmap.

## 6. Content requirements

- The 55 prototype entries are imported as the starting catalog, with the 11 detailed guides marked "Detailed" and the other 44 "General". They are imported as "In review" so a reviewer verifies each one before it is published.
- Before launch, at least 20 of the most-used services have Detailed guides verified by a reviewer.
- Every guide stores its source URL and the reviewer who verified it.
- Fees and processing times appear only when verified, never as estimates.
- Swahili is written first and reviewed by a fluent speaker. English is a faithful translation, not a different guide.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Public pages load fast on a low-end Android over 3G: LCP under 2.5 s, under 150 KB of JavaScript on public routes |
| Availability | Public pages are statically generated and cached, so they stay up if the database or AI is down |
| Accessibility | WCAG 2.2 AA, keyboard and screen-reader usable, 44 px touch targets, respects reduced motion |
| SEO | Each service and journey page is indexable, with Swahili titles that match how people search ("jinsi ya kupata TIN") |
| Privacy | No citizen accounts, no tracking cookies, no personal data stored; search logs are anonymised |
| Security | No credential collection; outbound links only to allowlisted agency domains; admin protected by auth and roles; audit log of changes |
| Cost | AI calls only on low-confidence searches, with caching; target under 20% of searches reaching the AI |

## 8. Success metrics

| Metric | Target at 3 months |
|---|---|
| Search success: searches that lead to a guide being opened | 75% or more |
| Official site click-through from guides | 50% or more |
| Published guides verified in the last 90 days | 90% or more |
| Problem reports resolved within 7 days | 80% or more |
| Searches answered without the AI | 80% or more |

## 9. Risks

| Risk | Mitigation |
|---|---|
| Guides go out of date as portals change | Verification dates, stale-content dashboard, user reports, weekly link checks |
| Users mistake Lango for a government site or a scam | Clear disclaimer, official domain on every guide, no data collection, aim for eGA endorsement |
| AI returns a wrong match | AI can only pick from candidates, low-confidence matches show alternatives, failed searches are reviewed |
| Too few people to maintain content | Start with the top 20 services, prioritise by search insights |
| Government changes a portal domain | Agency domains live in one table and update everywhere at once |

## 10. Release plan

| Milestone | Scope |
|---|---|
| M0 Foundation | Repo, Turso, Drizzle schema, i18n, design tokens, CI, deploy to Vercel (done, except connecting Turso, Resend and Vercel accounts) |
| M1 Public catalog | Import 55 services, home, service pages, categories, local search |
| M2 Admin | Auth, roles, CRUD, workflow, revisions, reports queue |
| M3 AI search | Candidate-constrained AI matching, caching, rate limits, search logs |
| M4 Journeys | Journey model, admin editor, public pages, journeys in search |
| M5 Launch readiness | 20 detailed guides verified, link checker, dashboard, accessibility and performance audit |

## 11. Open questions

1. Product name and domain: is "Lango" final, and which domain (.co.tz or .tz)?
2. Who verifies content at launch, and how many hours a week can they give?
3. Should the admin panel be in Swahili, English or both?
4. When should we approach eGA, and with what evidence?
5. Is Zanzibar coverage in scope for v2?
6. What is the monthly budget for AI calls?

## 12. Decisions

| Date | Decision |
|---|---|
| 2 October 2026 | The starting catalog is the 55 prototype entries (11 detailed, 44 general), not 60. |
| 2 October 2026 | English pages keep the Swahili route segments in v1 (`/en/huduma/...`). Translated segments can come later without breaking links, through redirects. |
| 2 October 2026 | New visitors land on Swahili regardless of `Accept-Language`; a language cookie remembers an explicit choice. |
| 2 October 2026 | Imported content starts "In review". Nothing is public until a reviewer verifies it. |

# Editing Lango's services

All public content lives in one file: [`src/data/catalog.json`](../src/data/catalog.json). Edit it on GitHub (pencil icon) and commit to `main`; Vercel redeploys in about a minute. Tests in `tests/unit/catalog.test.ts` block a deploy if a rule below is broken.

## Rules
1. **Only verified facts from official sites.** Every service needs `sources` (official URLs you read) and `lastChecked` (YYYY-MM-DD). Update `lastChecked` whenever you re-verify.
2. **Never guess fees.** A fee goes in `fees` only with its own official `source`. If you can't verify it, leave `fees` empty and write a `feeNote` telling people to check the control number / official page.
3. **Official links only.** `officialUrl`, `sources` and fee `source` must be on `*.go.tz` (or an agency's own official domain: `nhif.or.tz`, `tanesco.co.tz`).
4. Write Swahili first (`sw`), then a faithful English translation (`en`).

## Fields per service
`slug` (URL: /sw/huduma/<slug>), `agency`, `category` (one of `categories[].slug`), `icon`, `popular` (show on home), `title`, `summary`, `officialUrl`, `sources[]`, `documents[]`, `steps[]`, `fees[] {label, amount, source}`, `feeNote`, `contacts[] {label, value, href}`, `keywords[]` (words people type; used by search and the AI), `lastChecked`.

`emergency[]` powers the emergency strip; `offices[]` powers the assistant's `list_offices` tool (add regional offices here when verified).

Run `pnpm test` locally to check your edit.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Privacy-friendly visit counting. No cookies, no raw IPs, nothing that identifies a person is stored:
 * - daily uniques use HMAC(secret, day) as a salt, so hashes from different days cannot be linked;
 * - all-time uniques use a HyperLogLog sketch (1,024 small integers), which stores no identities at all.
 */

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|whatsapp|telegram|discord|preview|embedly|quora|pinterest|vkshare|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|httpx|axios|node-fetch|go-http|java\/|okhttp|libwww|scrapy|ahrefs|semrush|mj12|dotbot|petal|yandex|baidu|bytespider|gptbot|claude|perplexity|cron-job|vercel/i;

export function isBot(ua: string | null | undefined): boolean {
  if (!ua || ua.length < 20) return true;
  return BOT_RE.test(ua);
}

/** True for link prefetches and speculative prerenders, which are not real visits. */
export function isPrefetch(headers: Headers): boolean {
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""} ${headers.get("x-purpose") ?? ""}`;
  return /prefetch|prerender/i.test(purpose) || headers.has("next-router-prefetch");
}

/** Calendar day in Tanzania (UTC+3, no DST), e.g. "2026-10-17". */
export function dayKey(now = Date.now()): string {
  return new Date(now + 3 * 3600_000).toISOString().slice(0, 10);
}

export function lastDays(n: number, now = Date.now()): string[] {
  return Array.from({ length: n }, (_, i) => dayKey(now - (n - 1 - i) * 86_400_000));
}

export function dailyVisitorHash(secret: string, day: string, ip: string, ua: string): string {
  const salt = createHmac("sha256", secret).update(`lango-day:${day}`).digest();
  return createHmac("sha256", salt).update(`${ip}\n${ua}`).digest("base64url").slice(0, 22);
}

/* ---------- HyperLogLog (p = 10, 1,024 registers, ~3% error) ---------- */

export const HLL_P = 10;
export const HLL_M = 1 << HLL_P;

/** Register index and rank for a visitor. Only these two small numbers are ever stored. */
export function hllPoint(secret: string, ip: string, ua: string): { idx: number; rho: number } {
  const h = createHash("sha256").update(`${secret}\nlango-hll\n${ip}\n${ua}`).digest();
  const x = h.readBigUInt64BE(0);
  const idx = Number(x >> BigInt(64 - HLL_P));
  const rest = (x << BigInt(HLL_P)) & ((1n << 64n) - 1n);
  let rho = 1;
  for (let bit = 63n; bit >= 0n && !((rest >> bit) & 1n) && rho <= 64 - HLL_P; bit--) rho++;
  return { idx, rho };
}

export function hllEstimate(registers: Map<number, number>): number {
  const m = HLL_M;
  let sum = 0;
  let zeros = 0;
  for (let i = 0; i < m; i++) {
    const r = registers.get(i) ?? 0;
    sum += 2 ** -r;
    if (r === 0) zeros++;
  }
  const alpha = 0.7213 / (1 + 1.079 / m);
  const raw = (alpha * m * m) / sum;
  if (raw <= 2.5 * m && zeros > 0) return Math.round(m * Math.log(m / zeros));
  return Math.round(raw);
}

/* ---------- paths ---------- */

const PATH_RE = /^\/(sw|en)(\/[a-z0-9-]+){0,3}\/?$/;

/** Only well-formed public paths are recorded, so the table cannot be filled with junk. */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const p = raw.split(/[?#]/)[0]!.toLowerCase().slice(0, 120);
  if (!PATH_RE.test(p)) return null;
  return p.length > 3 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function serviceSlug(path: string): string | null {
  return path.match(/^\/(?:sw|en)\/huduma\/([a-z0-9-]+)$/)?.[1] ?? null;
}

export const SLUG_RE = /^[a-z0-9-]{1,60}$/;

/* ---------- stats page auth ---------- */

export const STATS_COOKIE = "lango_takwimu";

export function statsToken(password: string): string {
  return createHmac("sha256", password).update("lango-takwimu-v1").digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function statsSecret(): string {
  return process.env.STATS_SECRET || process.env.LANGO_STATS_PASSWORD || "lango-dev-secret";
}

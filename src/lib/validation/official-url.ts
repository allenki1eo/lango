/**
 * Official links must point at the agency's own domain or one of its subdomains, over HTTPS.
 * This is the single allowlist check used by the Zod schemas, the save path and the seed.
 */

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

/**
 * Registry suffixes that are never an agency's own domain. Allowing "go.tz" as an agency domain
 * would allowlist every government site, so these are rejected outright.
 */
const PUBLIC_SUFFIXES = new Set([
  "tz",
  "ac.tz",
  "co.tz",
  "go.tz",
  "hotel.tz",
  "info.tz",
  "me.tz",
  "mil.tz",
  "mobi.tz",
  "ne.tz",
  "or.tz",
  "sc.tz",
  "tv.tz",
]);

export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\.$/, "");
}

export function isValidDomain(domain: string): boolean {
  return DOMAIN_PATTERN.test(domain) && !PUBLIC_SUFFIXES.has(domain);
}

export function isOnAgencyDomain(url: string, agencyDomain: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  if (parsed.port && parsed.port !== "443") return false;

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const domain = normalizeDomain(agencyDomain);
  if (!isValidDomain(domain)) return false;

  return host === domain || host.endsWith(`.${domain}`);
}

import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";

// Official government domains. nhif.or.tz and tanesco.co.tz are the agencies' own official domains.
const allowed = /^https:\/\/([a-z0-9-]+\.)*(go\.tz|nhif\.or\.tz|tanesco\.co\.tz)(\/|$)/;

describe("catalog", () => {
  it("has the 16 required services with unique slugs", () => {
    expect(catalog.services).toHaveLength(16);
    expect(new Set(catalog.services.map((s) => s.slug)).size).toBe(16);
  });
  it.each(catalog.services.map((s) => [s.slug, s] as const))("%s cites official sources", (_, s) => {
    expect(s.officialUrl).toMatch(allowed);
    expect(s.sources.length).toBeGreaterThan(0);
    for (const u of s.sources) expect(u).toMatch(allowed);
    for (const f of s.fees) expect(f.source).toMatch(allowed);
    expect(s.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.steps.length).toBeGreaterThan(0);
    expect(s.fees.length > 0 || s.feeNote !== null).toBe(true);
    expect(catalog.categories.some((c) => c.slug === s.category)).toBe(true);
  });
});

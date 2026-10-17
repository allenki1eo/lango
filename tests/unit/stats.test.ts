import { describe, expect, it } from "vitest";
import {
  HLL_M,
  dailyVisitorHash,
  dayKey,
  hllEstimate,
  hllPoint,
  isBot,
  isPrefetch,
  normalizePath,
  serviceSlug,
} from "@/lib/stats/core";

const UA = "Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36";

describe("visit stats", () => {
  it("skips bots and keeps browsers", () => {
    expect(isBot(UA)).toBe(false);
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("WhatsApp/2.23.20.0 A")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/129.0")).toBe(true);
    expect(isBot("")).toBe(true);
  });

  it("detects prefetches", () => {
    expect(isPrefetch(new Headers({ "sec-purpose": "prefetch;prerender" }))).toBe(true);
    expect(isPrefetch(new Headers({ purpose: "prefetch" }))).toBe(true);
    expect(isPrefetch(new Headers({}))).toBe(false);
  });

  it("uses Tanzanian days", () => {
    expect(dayKey(Date.parse("2026-10-17T21:30:00Z"))).toBe("2026-10-18");
    expect(dayKey(Date.parse("2026-10-17T20:59:00Z"))).toBe("2026-10-17");
  });

  it("salts visitor hashes per day and never contains the IP", () => {
    const a = dailyVisitorHash("s", "2026-10-17", "41.59.1.2", UA);
    expect(a).toBe(dailyVisitorHash("s", "2026-10-17", "41.59.1.2", UA));
    expect(a).not.toBe(dailyVisitorHash("s", "2026-10-18", "41.59.1.2", UA));
    expect(a).not.toContain("41.59");
  });

  it("estimates distinct visitors within a few percent", () => {
    const regs = new Map<number, number>();
    const n = 20000;
    for (let i = 0; i < n; i++) {
      const { idx, rho } = hllPoint("s", `10.0.${i >> 8}.${i & 255}`, UA);
      expect(idx).toBeLessThan(HLL_M);
      regs.set(idx, Math.max(regs.get(idx) ?? 0, rho));
      // Repeats must not change the estimate.
      const again = hllPoint("s", `10.0.${i >> 8}.${i & 255}`, UA);
      expect(again).toEqual({ idx, rho });
    }
    expect(Math.abs(hllEstimate(regs) - n) / n).toBeLessThan(0.1);
    expect(hllEstimate(new Map())).toBe(0);
  });

  it("accepts only public paths", () => {
    expect(normalizePath("/sw/huduma/nida?x=1")).toBe("/sw/huduma/nida");
    expect(normalizePath("/en/")).toBe("/en");
    expect(normalizePath("/en/huduma/")).toBe("/en/huduma");
    expect(normalizePath("/takwimu")).toBeNull();
    expect(normalizePath("https://evil.example/")).toBeNull();
    expect(normalizePath(42)).toBeNull();
    expect(serviceSlug("/sw/huduma/nida")).toBe("nida");
    expect(serviceSlug("/sw/huduma")).toBeNull();
  });
});

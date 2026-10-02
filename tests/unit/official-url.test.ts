import { describe, expect, it } from "vitest";
import { isOnAgencyDomain, isValidDomain, normalizeDomain } from "@/lib/validation/official-url";

describe("isOnAgencyDomain", () => {
  it.each([
    ["https://tra.go.tz", "tra.go.tz"],
    ["https://www.tra.go.tz/huduma", "tra.go.tz"],
    ["https://taxpayerportal.tra.go.tz/login?x=1", "tra.go.tz"],
    ["https://WWW.TRA.GO.TZ", "tra.go.tz"],
    ["https://www.nhif.or.tz", "nhif.or.tz"],
    ["https://www.tanesco.co.tz", "tanesco.co.tz"],
    ["https://tra.go.tz:443/", "tra.go.tz"],
    ["https://tra.go.tz", "www.tra.go.tz"],
  ])("accepts %s for %s", (url, domain) => {
    expect(isOnAgencyDomain(url, domain)).toBe(true);
  });

  it.each([
    ["http://www.tra.go.tz", "tra.go.tz", "plain HTTP"],
    ["https://tra.go.tz.evil.com", "tra.go.tz", "domain used as a prefix"],
    ["https://eviltra.go.tz", "tra.go.tz", "domain used as a suffix without a dot"],
    ["https://brela.go.tz", "tra.go.tz", "another agency"],
    ["https://user:pass@tra.go.tz", "tra.go.tz", "embedded credentials"],
    ["https://tra.go.tz:8443", "tra.go.tz", "non-standard port"],
    ["javascript:alert(1)", "tra.go.tz", "script URL"],
    ["tra.go.tz", "tra.go.tz", "no scheme"],
    ["https://tra.go.tz", "go.tz", "registry suffix as agency domain"],
    ["https://tra.go.tz", "go.tz.", "registry suffix with a trailing dot"],
    ["https://nhif.or.tz", "or.tz", "another registry suffix"],
    ["https://anything.tz", "tz", "single-label domain"],
  ])("rejects %s for %s (%s)", (url, domain) => {
    expect(isOnAgencyDomain(url, domain)).toBe(false);
  });
});

describe("domain helpers", () => {
  it("normalises case, www and trailing dots", () => {
    expect(normalizeDomain("  WWW.Tra.Go.Tz. ")).toBe("tra.go.tz");
  });

  it("validates bare domains only", () => {
    expect(isValidDomain("tra.go.tz")).toBe(true);
    expect(isValidDomain("https://tra.go.tz")).toBe(false);
    expect(isValidDomain("tra.go.tz/path")).toBe(false);
    expect(isValidDomain("-tra.go.tz")).toBe(false);
    expect(isValidDomain("go.tz")).toBe(false);
    expect(isValidDomain("tz")).toBe(false);
  });
});

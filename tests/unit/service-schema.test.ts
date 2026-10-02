import { describe, expect, it } from "vitest";
import { agencySchema } from "@/lib/validation/agency";
import { serviceSchema } from "@/lib/validation/service";

const valid = {
  slug: "tra-tin",
  agencyId: "agency-1",
  categoryId: "category-1",
  titleSw: "Pata TIN",
  titleEn: "Get a TIN",
  summarySw: "",
  summaryEn: "",
  officialUrl: "https://www.tra.go.tz",
  guideLevel: "detailed",
  status: "draft",
  steps: [{ bodySw: "Fungua tovuti rasmi.", bodyEn: "Open the official site." }],
  documents: [],
  keywords: [{ keyword: "TIN" }],
} as const;

const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("serviceSchema", () => {
  it("accepts a valid draft and normalises optional fields and keywords", () => {
    const result = serviceSchema("tra.go.tz").parse(valid);
    expect(result.summarySw).toBeNull();
    expect(result.keywords).toEqual([{ keyword: "tin", lang: "any" }]);
  });

  it("rejects an official URL outside the agency domain", () => {
    const result = serviceSchema("tra.go.tz").safeParse({ ...valid, officialUrl: "https://tra-help.com" });
    expect(issuePaths(result)).toContain("officialUrl");
  });

  it("rejects an official URL on another agency's domain", () => {
    const result = serviceSchema("brela.go.tz").safeParse(valid);
    expect(issuePaths(result)).toContain("officialUrl");
  });

  it("requires bilingual fields in both languages", () => {
    const result = serviceSchema("tra.go.tz").safeParse({ ...valid, feeNoteSw: "Bure" });
    expect(issuePaths(result)).toContain("feeNoteEn");
  });

  it("requires a summary and source URL to publish", () => {
    const result = serviceSchema("tra.go.tz").safeParse({ ...valid, status: "published" });
    expect(issuePaths(result)).toEqual(expect.arrayContaining(["summarySw", "sourceUrl"]));
  });

  it("requires at least one step and a clean slug", () => {
    const result = serviceSchema("tra.go.tz").safeParse({ ...valid, slug: "TRA TIN", steps: [] });
    expect(issuePaths(result)).toEqual(expect.arrayContaining(["slug", "steps"]));
  });
});

describe("agencySchema", () => {
  const agency = {
    code: "TRA",
    nameSw: "Mamlaka ya Mapato Tanzania",
    nameEn: "Tanzania Revenue Authority",
    domain: "TRA.go.tz",
    homeUrl: "https://www.tra.go.tz",
  };

  it("normalises the domain", () => {
    expect(agencySchema.parse(agency).domain).toBe("tra.go.tz");
  });

  it("requires the home page to be on the agency domain", () => {
    const result = agencySchema.safeParse({ ...agency, homeUrl: "https://www.brela.go.tz" });
    expect(issuePaths(result)).toContain("homeUrl");
  });
});

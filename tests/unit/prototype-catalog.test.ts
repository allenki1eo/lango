import { describe, expect, it } from "vitest";
import { generalGuide, seedAgencies, seedCategories, seedServices } from "@/db/seed/prototype-catalog";
import { agencySchema } from "@/lib/validation/agency";
import { serviceSchema } from "@/lib/validation/service";

const agencyByCode = new Map(seedAgencies.map((agency) => [agency.code, agency]));

describe("prototype catalog", () => {
  it("has the expected size: 55 services, 11 of them detailed", () => {
    expect(seedServices).toHaveLength(55);
    expect(seedServices.filter((service) => service.guideLevel === "detailed")).toHaveLength(11);
  });

  it("has unique slugs, agency codes and category slugs", () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(seedServices.map((service) => service.slug))).toBe(true);
    expect(unique(seedAgencies.map((agency) => agency.code))).toBe(true);
    expect(unique(seedCategories.map((category) => category.slug))).toBe(true);
  });

  it("only references known agencies and categories, and uses every agency", () => {
    const categorySlugs = new Set(seedCategories.map((category) => category.slug));
    for (const service of seedServices) {
      expect(agencyByCode.has(service.agency), service.slug).toBe(true);
      expect(categorySlugs.has(service.category), service.slug).toBe(true);
    }
    const usedAgencies = new Set(seedServices.map((service) => service.agency));
    expect([...agencyByCode.keys()].filter((code) => !usedAgencies.has(code))).toEqual([]);
  });

  it("gives detailed guides their own steps and documents, and general entries a summary", () => {
    for (const service of seedServices) {
      if (service.guideLevel === "detailed") {
        expect(service.steps?.length, service.slug).toBeGreaterThan(0);
        expect(service.documents?.length, service.slug).toBeGreaterThan(0);
      } else {
        expect(service.steps, service.slug).toBeUndefined();
        expect(service.summarySw, service.slug).toBeTruthy();
      }
    }
  });

  it("passes the agency schema for every agency", () => {
    for (const agency of seedAgencies) {
      expect(agencySchema.safeParse(agency).success, agency.code).toBe(true);
    }
  });

  it("passes the service schema, including the domain allowlist, for every service", () => {
    for (const service of seedServices) {
      const result = serviceSchema(agencyByCode.get(service.agency)!.domain).safeParse({
        ...service,
        agencyId: service.agency,
        categoryId: service.category,
        status: "in_review",
        steps: service.steps ?? generalGuide.steps,
        documents: service.documents ?? generalGuide.documents,
        keywords: service.keywords.map((keyword) => ({ keyword })),
      });
      expect(result.error?.issues ?? [], service.slug).toEqual([]);
    }
  });
});

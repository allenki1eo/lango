import { z } from "zod";
import { CONTENT_STATUSES, GUIDE_LEVELS, KEYWORD_LANGS } from "@/db/schema";
import { isOnAgencyDomain } from "./official-url";

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, digits and single hyphens.");

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const bilingualItemSchema = z.object({
  bodySw: text(600),
  bodyEn: text(600),
});

export const keywordSchema = z.object({
  keyword: z.string().trim().toLowerCase().min(2).max(80),
  lang: z.enum(KEYWORD_LANGS).default("any"),
});

const serviceBaseSchema = z.object({
  slug: slugSchema,
  agencyId: z.string().min(1),
  categoryId: z.string().min(1),
  titleSw: text(140),
  titleEn: text(140),
  summarySw: optionalText(400),
  summaryEn: optionalText(400),
  officialUrl: z.url({ protocol: /^https$/ }),
  guideLevel: z.enum(GUIDE_LEVELS),
  status: z.enum(CONTENT_STATUSES),
  feeNoteSw: optionalText(300),
  feeNoteEn: optionalText(300),
  timeNoteSw: optionalText(300),
  timeNoteEn: optionalText(300),
  sourceUrl: z
    .url({ protocol: /^https$/ })
    .nullable()
    .optional(),
  steps: z.array(bilingualItemSchema).min(1).max(30),
  documents: z.array(bilingualItemSchema).max(30),
  keywords: z.array(keywordSchema).max(60),
});

/**
 * Builds the service schema for one agency. The official URL must sit on that agency's domain,
 * and bilingual fields must be filled in both languages together.
 */
export function serviceSchema(agencyDomain: string) {
  return serviceBaseSchema.superRefine((service, ctx) => {
    if (!isOnAgencyDomain(service.officialUrl, agencyDomain)) {
      ctx.addIssue({
        code: "custom",
        path: ["officialUrl"],
        message: `The official link must be on ${agencyDomain} or one of its subdomains.`,
      });
    }

    const pairs = [
      ["summarySw", "summaryEn"],
      ["feeNoteSw", "feeNoteEn"],
      ["timeNoteSw", "timeNoteEn"],
    ] as const;
    for (const [sw, en] of pairs) {
      if (Boolean(service[sw]) !== Boolean(service[en])) {
        ctx.addIssue({ code: "custom", path: [service[sw] ? en : sw], message: "Fill this in both languages." });
      }
    }

    if (service.status === "published") {
      if (!service.summarySw) {
        ctx.addIssue({ code: "custom", path: ["summarySw"], message: "A summary is required to publish." });
      }
      if (!service.sourceUrl) {
        ctx.addIssue({ code: "custom", path: ["sourceUrl"], message: "A source URL is required to publish." });
      }
    }
  });
}

export type ServiceInput = z.infer<ReturnType<typeof serviceSchema>>;

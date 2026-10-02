import { z } from "zod";
import { isOnAgencyDomain, isValidDomain, normalizeDomain } from "./official-url";

export const agencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z][A-Za-z0-9]{1,15}$/, "Use 2 to 16 letters or digits, starting with a letter.");

export const domainSchema = z
  .string()
  .transform(normalizeDomain)
  .refine(isValidDomain, "Enter a bare domain such as tra.go.tz.");

export const agencySchema = z
  .object({
    code: agencyCodeSchema,
    nameSw: z.string().trim().min(2).max(160),
    nameEn: z.string().trim().min(2).max(160),
    domain: domainSchema,
    homeUrl: z.url({ protocol: /^https$/ }),
  })
  .refine((agency) => isOnAgencyDomain(agency.homeUrl, agency.domain), {
    path: ["homeUrl"],
    message: "The home page must be on the agency's domain.",
  });

export type AgencyInput = z.infer<typeof agencySchema>;

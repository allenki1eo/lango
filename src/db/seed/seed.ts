/**
 * Loads the prototype catalog. Safe to run repeatedly: rows are upserted by code or slug,
 * and each service's steps, documents and keywords are replaced.
 *
 *   pnpm db:seed             import everything as "in_review", waiting for a reviewer
 *   pnpm db:seed --preview   also publish it, for previewing the public site on a local file database
 */
import { eq, sql } from "drizzle-orm";
import { readServerEnv } from "@/lib/env";
import { agencySchema } from "@/lib/validation/agency";
import { serviceSchema } from "@/lib/validation/service";
import { createDb } from "../client";
import * as t from "../schema";
import { generalGuide, seedAgencies, seedCategories, seedServices } from "./prototype-catalog";

const IMPORT_NOTE = "Imported from the prototype catalog";

async function main() {
  const env = readServerEnv();
  const preview = process.argv.includes("--preview");

  if (preview && !env.TURSO_DATABASE_URL.startsWith("file:")) {
    throw new Error("--preview publishes unverified content, so it only runs against a local file database.");
  }

  const db = createDb(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
  const agencyDomains = new Map(seedAgencies.map((agency) => [agency.code, agency.domain]));

  // Validate everything before writing anything.
  const agencies = seedAgencies.map((agency) => agencySchema.parse(agency));
  const services = seedServices.map((service) => {
    const domain = agencyDomains.get(service.agency);
    if (!domain) throw new Error(`Service ${service.slug} references unknown agency ${service.agency}`);
    if (!seedCategories.some((category) => category.slug === service.category)) {
      throw new Error(`Service ${service.slug} references unknown category ${service.category}`);
    }
    const input = serviceSchema(domain).parse({
      ...service,
      agencyId: service.agency,
      categoryId: service.category,
      status: "in_review",
      documents: service.documents ?? generalGuide.documents,
      steps: service.steps ?? generalGuide.steps,
      keywords: service.keywords.map((keyword) => ({ keyword, lang: "any" })),
    });
    return { ...input, agencyCode: service.agency, categorySlug: service.category };
  });

  const status: t.ContentStatus = preview ? "published" : "in_review";

  await db.transaction(async (tx) => {
    for (const agency of agencies) {
      await tx
        .insert(t.agencies)
        .values(agency)
        .onConflictDoUpdate({
          target: t.agencies.code,
          set: { nameSw: agency.nameSw, nameEn: agency.nameEn, domain: agency.domain, homeUrl: agency.homeUrl },
        });
    }

    for (const category of seedCategories) {
      await tx
        .insert(t.categories)
        .values(category)
        .onConflictDoUpdate({
          target: t.categories.slug,
          set: { nameSw: category.nameSw, nameEn: category.nameEn, sortOrder: category.sortOrder },
        });
    }

    const agencyIds = new Map((await tx.select().from(t.agencies)).map((row) => [row.code, row.id]));
    const categoryIds = new Map((await tx.select().from(t.categories)).map((row) => [row.slug, row.id]));

    for (const service of services) {
      const { steps, documents, keywords, agencyCode, categorySlug, ...fields } = service;
      const values = {
        ...fields,
        status,
        agencyId: agencyIds.get(agencyCode)!,
        categoryId: categoryIds.get(categorySlug)!,
      };

      const [row] = await tx
        .insert(t.services)
        .values(values)
        .onConflictDoUpdate({ target: t.services.slug, set: { ...values, updatedAt: new Date() } })
        .returning();
      if (!row) throw new Error(`Failed to upsert service ${service.slug}`);

      await tx.delete(t.serviceSteps).where(eq(t.serviceSteps.serviceId, row.id));
      await tx.delete(t.serviceDocuments).where(eq(t.serviceDocuments.serviceId, row.id));
      await tx.delete(t.serviceKeywords).where(eq(t.serviceKeywords.serviceId, row.id));

      const position = <T>(items: T[]) =>
        items.map((item, index) => ({ ...item, serviceId: row.id, position: index + 1 }));
      await tx.insert(t.serviceSteps).values(position(steps));
      if (documents.length) await tx.insert(t.serviceDocuments).values(position(documents));
      if (keywords.length) {
        await tx.insert(t.serviceKeywords).values(keywords.map((keyword) => ({ ...keyword, serviceId: row.id })));
      }

      await tx.insert(t.revisions).values({
        entityType: "service",
        entityId: row.id,
        snapshotJson: { ...row, steps, documents, keywords },
        note: IMPORT_NOTE,
      });
    }

    await tx
      .insert(t.settings)
      .values([
        { key: "catalog_version", valueJson: 0 },
        { key: "stale_after_days", valueJson: 90 },
      ])
      .onConflictDoNothing();
    // Content changed, so anything cached against the old catalog is stale.
    await tx
      .update(t.settings)
      .set({ valueJson: sql`cast(${t.settings.valueJson} + 1 as text)` })
      .where(eq(t.settings.key, "catalog_version"));
  });

  const detailed = services.filter((service) => service.guideLevel === "detailed").length;
  console.log(
    `Seeded ${agencies.length} agencies, ${seedCategories.length} categories and ${services.length} services ` +
      `(${detailed} detailed, ${services.length - detailed} general) as "${status}".`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

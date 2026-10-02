import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/* ---------- shared columns and enums ---------- */

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdateFn(() => new Date());

export const CONTENT_STATUSES = ["draft", "in_review", "published", "archived"] as const;
export const GUIDE_LEVELS = ["general", "detailed"] as const;
export const KEYWORD_LANGS = ["sw", "en", "any"] as const;
export const ROLES = ["admin", "editor", "reviewer"] as const;
export const REPORT_KINDS = ["wrong", "outdated", "broken_link", "other"] as const;
export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
export const TARGET_TYPES = ["service", "journey"] as const;
export const SEARCH_METHODS = ["local", "ai", "none"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type GuideLevel = (typeof GUIDE_LEVELS)[number];
export type Role = (typeof ROLES)[number];

/* ---------- auth (Auth.js Drizzle adapter shape, plus role) ---------- */

export const users = sqliteTable("users", {
  id: id(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  role: text("role", { enum: ROLES }).notNull().default("editor"),
  invitedBy: text("invited_by"),
  createdAt: createdAt(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ---------- catalog ---------- */

export const agencies = sqliteTable("agencies", {
  id: id(),
  code: text("code").notNull().unique(),
  nameSw: text("name_sw").notNull(),
  nameEn: text("name_en").notNull(),
  domain: text("domain").notNull(),
  homeUrl: text("home_url").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const categories = sqliteTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameSw: text("name_sw").notNull(),
  nameEn: text("name_en").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const services = sqliteTable(
  "services",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    agencyId: text("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    titleSw: text("title_sw").notNull(),
    titleEn: text("title_en").notNull(),
    // Nullable so imported guides can land before an editor writes the summary; required to publish.
    summarySw: text("summary_sw"),
    summaryEn: text("summary_en"),
    officialUrl: text("official_url").notNull(),
    guideLevel: text("guide_level", { enum: GUIDE_LEVELS }).notNull().default("general"),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default("draft"),
    feeNoteSw: text("fee_note_sw"),
    feeNoteEn: text("fee_note_en"),
    timeNoteSw: text("time_note_sw"),
    timeNoteEn: text("time_note_en"),
    sourceUrl: text("source_url"),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    verifiedBy: text("verified_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("services_status_idx").on(t.status),
    index("services_category_idx").on(t.categoryId),
    index("services_agency_idx").on(t.agencyId),
  ],
);

// Steps and documents keep stable ids so on-device progress survives reordering.
export const serviceSteps = sqliteTable(
  "service_steps",
  {
    id: id(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    bodySw: text("body_sw").notNull(),
    bodyEn: text("body_en").notNull(),
  },
  (t) => [uniqueIndex("service_steps_position_idx").on(t.serviceId, t.position)],
);

export const serviceDocuments = sqliteTable(
  "service_documents",
  {
    id: id(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    bodySw: text("body_sw").notNull(),
    bodyEn: text("body_en").notNull(),
  },
  (t) => [uniqueIndex("service_documents_position_idx").on(t.serviceId, t.position)],
);

export const serviceKeywords = sqliteTable(
  "service_keywords",
  {
    id: id(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    lang: text("lang", { enum: KEYWORD_LANGS }).notNull().default("any"),
  },
  (t) => [uniqueIndex("service_keywords_unique_idx").on(t.serviceId, t.keyword)],
);

/* ---------- journeys ---------- */

export const journeys = sqliteTable(
  "journeys",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    titleSw: text("title_sw").notNull(),
    titleEn: text("title_en").notNull(),
    summarySw: text("summary_sw"),
    summaryEn: text("summary_en"),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default("draft"),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    verifiedBy: text("verified_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("journeys_status_idx").on(t.status)],
);

export const journeyStages = sqliteTable(
  "journey_stages",
  {
    id: id(),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    // Restrict: a service used by a journey cannot be deleted out from under it.
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    noteSw: text("note_sw"),
    noteEn: text("note_en"),
  },
  (t) => [
    uniqueIndex("journey_stages_position_idx").on(t.journeyId, t.position),
    index("journey_stages_service_idx").on(t.serviceId),
  ],
);

export const journeyKeywords = sqliteTable(
  "journey_keywords",
  {
    id: id(),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    lang: text("lang", { enum: KEYWORD_LANGS }).notNull().default("any"),
  },
  (t) => [uniqueIndex("journey_keywords_unique_idx").on(t.journeyId, t.keyword)],
);

/* ---------- quality operations ---------- */

export const reports = sqliteTable(
  "reports",
  {
    id: id(),
    targetType: text("target_type", { enum: TARGET_TYPES }).notNull(),
    targetId: text("target_id").notNull(),
    stepPosition: integer("step_position"),
    kind: text("kind", { enum: REPORT_KINDS }).notNull(),
    // Redacted with lib/search/redact before it is stored.
    message: text("message"),
    status: text("status", { enum: REPORT_STATUSES }).notNull().default("open"),
    createdAt: createdAt(),
    resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  },
  (t) => [index("reports_status_idx").on(t.status), index("reports_target_idx").on(t.targetType, t.targetId)],
);

export const searchLogs = sqliteTable(
  "search_logs",
  {
    id: id(),
    queryRedacted: text("query_redacted").notNull(),
    lang: text("lang", { enum: ["sw", "en"] }).notNull(),
    method: text("method", { enum: SEARCH_METHODS }).notNull(),
    topType: text("top_type", { enum: TARGET_TYPES }),
    topId: text("top_id"),
    confidence: real("confidence"),
    clicked: integer("clicked", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("search_logs_created_idx").on(t.createdAt), index("search_logs_method_idx").on(t.method)],
);

export const aiCache = sqliteTable("ai_cache", {
  // Normalised and redacted query + locale + catalog version.
  queryKey: text("query_key").primaryKey(),
  resultJson: text("result_json", { mode: "json" }).notNull(),
  createdAt: createdAt(),
});

export const linkChecks = sqliteTable(
  "link_checks",
  {
    id: id(),
    url: text("url").notNull(),
    statusCode: integer("status_code"),
    ok: integer("ok", { mode: "boolean" }).notNull(),
    checkedAt: integer("checked_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("link_checks_url_idx").on(t.url, t.checkedAt)],
);

export const revisions = sqliteTable(
  "revisions",
  {
    id: id(),
    entityType: text("entity_type", { enum: TARGET_TYPES }).notNull(),
    entityId: text("entity_id").notNull(),
    snapshotJson: text("snapshot_json", { mode: "json" }).notNull(),
    editorId: text("editor_id").references(() => users.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("revisions_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json", { mode: "json" }).notNull(),
});

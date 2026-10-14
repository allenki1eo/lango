import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const serverEnvSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1).default("file:local.db"),
  TURSO_AUTH_TOKEN: z.string().optional(),
  AI_ENABLED: booleanString,
  AI_MODELS: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function readServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  // Treat empty strings from .env files as unset so defaults apply.
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ""));
  return serverEnvSchema.parse(cleaned);
}

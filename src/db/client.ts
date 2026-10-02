import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { readServerEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(url: string, authToken?: string) {
  return drizzle(createClient({ url, authToken }), { schema });
}

export type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { langoDb?: Db };

/** Shared database handle. Import only from src/db/queries and scripts, never from components. */
export function getDb(): Db {
  if (!globalForDb.langoDb) {
    const env = readServerEnv();
    globalForDb.langoDb = createDb(env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN);
  }
  return globalForDb.langoDb;
}

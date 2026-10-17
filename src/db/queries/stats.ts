import type { Client, InStatement } from "@libsql/client";
import { getDb } from "@/db/client";
import { dayKey, hllEstimate, lastDays } from "@/lib/stats/core";

/**
 * Visit counters (see lib/stats/core.ts for the privacy model). Raw SQL on the shared libSQL client;
 * tables are created on first use so no migration step is needed.
 *   stats_daily   (day, metric, key) -> count   metrics: pv, uv, page, svc, tap, ai
 *   stats_uniques (day, hash)                   today's salted hashes only; older days are deleted
 *   stats_hll     (idx) -> rho                  HyperLogLog registers for all-time uniques
 */

const g = globalThis as unknown as { langoStatsReady?: Promise<void> };

function client(): Client {
  return getDb().$client;
}

async function ready(): Promise<Client> {
  const c = client();
  g.langoStatsReady ??= c
    .batch(
      [
        "CREATE TABLE IF NOT EXISTS stats_daily (day TEXT NOT NULL, metric TEXT NOT NULL, key TEXT NOT NULL DEFAULT '', count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, metric, key))",
        "CREATE TABLE IF NOT EXISTS stats_uniques (day TEXT NOT NULL, hash TEXT NOT NULL, PRIMARY KEY (day, hash))",
        "CREATE TABLE IF NOT EXISTS stats_hll (idx INTEGER PRIMARY KEY, rho INTEGER NOT NULL)",
        "CREATE TABLE IF NOT EXISTS stats_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)",
        "INSERT OR IGNORE INTO stats_meta (k, v) VALUES ('created', datetime('now'))",
      ],
      "write",
    )
    .then(() => undefined)
    .catch((e) => {
      g.langoStatsReady = undefined;
      throw e;
    });
  await g.langoStatsReady;
  return c;
}

const bump = (day: string, metric: string, key = "", by = 1): InStatement => ({
  sql: "INSERT INTO stats_daily (day, metric, key, count) VALUES (?, ?, ?, ?) ON CONFLICT (day, metric, key) DO UPDATE SET count = count + excluded.count",
  args: [day, metric, key, by],
});

export async function recordPageView(input: {
  path: string;
  service: string | null;
  visitorHash: string;
  hll: { idx: number; rho: number };
}): Promise<void> {
  const c = await ready();
  const day = dayKey();
  const res = await c.batch(
    [
      {
        sql: "INSERT INTO stats_uniques (day, hash) VALUES (?, ?) ON CONFLICT DO NOTHING",
        args: [day, input.visitorHash],
      },
      bump(day, "pv"),
      bump(day, "page", input.path),
      ...(input.service ? [bump(day, "svc", input.service)] : []),
    ],
    "write",
  );
  if (res[0]?.rowsAffected !== 1) return;
  // First visit from this visitor today.
  await c.batch(
    [
      bump(day, "uv"),
      {
        sql: "INSERT INTO stats_hll (idx, rho) VALUES (?, ?) ON CONFLICT (idx) DO UPDATE SET rho = max(rho, excluded.rho)",
        args: [input.hll.idx, input.hll.rho],
      },
      { sql: "DELETE FROM stats_uniques WHERE day < ?", args: [day] },
    ],
    "write",
  );
}

export async function recordEvent(metric: "tap" | "ai", key = ""): Promise<void> {
  const c = await ready();
  await c.execute(bump(dayKey(), metric, key));
}

async function allTimeUniques(c: Client): Promise<number> {
  const rows = await c.execute("SELECT idx, rho FROM stats_hll");
  return hllEstimate(new Map(rows.rows.map((r) => [Number(r.idx), Number(r.rho)])));
}

export type PublicCounts = { visitors: number; today: number };

export async function readPublicCounts(): Promise<PublicCounts> {
  const c = await ready();
  const [visitors, today] = await Promise.all([
    allTimeUniques(c),
    c.execute({ sql: "SELECT count FROM stats_daily WHERE day = ? AND metric = 'uv' AND key = ''", args: [dayKey()] }),
  ]);
  const t = Number(today.rows[0]?.count ?? 0);
  // The sketch is approximate; never show fewer visitors in total than today.
  return { visitors: Math.max(visitors, t), today: t };
}

export type DayRow = { day: string; pv: number; uv: number; ai: number; tap: number };
export type Ranked = { key: string; count: number };
export type FullStats = {
  days: DayRow[];
  totals: { pv: number; ai: number; tap: number; uniques: number; firstDay: string | null };
  /** When the stats tables were created (UTC). If this changes on every deploy, the database is not persistent. */
  dbCreated: string | null;
  topPages: Ranked[];
  topServices: { key: string; views: number; taps: number }[];
};

export async function readFullStats(range = 30): Promise<FullStats> {
  const c = await ready();
  const days = lastDays(range);
  const from = days[0]!;
  const [daily, totals, pages, svc, uniques, meta] = await Promise.all([
    c.execute({
      sql: "SELECT day, metric, count FROM stats_daily WHERE day >= ? AND metric IN ('pv','uv','ai','tap') AND key = '' UNION ALL SELECT day, metric, SUM(count) FROM stats_daily WHERE day >= ? AND metric = 'tap' AND key <> '' GROUP BY day",
      args: [from, from],
    }),
    c.execute(
      "SELECT metric, SUM(count) AS n, MIN(day) AS first FROM stats_daily WHERE metric IN ('pv','ai','tap') GROUP BY metric",
    ),
    c.execute({
      sql: "SELECT key, SUM(count) AS n FROM stats_daily WHERE metric = 'page' AND day >= ? GROUP BY key ORDER BY n DESC LIMIT 15",
      args: [from],
    }),
    c.execute({
      sql: "SELECT metric, key, SUM(count) AS n FROM stats_daily WHERE metric IN ('svc','tap') AND key <> '' AND day >= ? GROUP BY metric, key",
      args: [from],
    }),
    allTimeUniques(c),
    c.execute("SELECT v FROM stats_meta WHERE k = 'created'"),
  ]);

  const byDay = new Map(days.map((d) => [d, { day: d, pv: 0, uv: 0, ai: 0, tap: 0 }]));
  for (const r of daily.rows) {
    const row = byDay.get(String(r.day));
    const m = String(r.metric) as "pv" | "uv" | "ai" | "tap";
    if (row) row[m] += Number(r.count ?? 0);
  }
  const tot = Object.fromEntries(totals.rows.map((r) => [String(r.metric), Number(r.n ?? 0)]));
  const firsts = totals.rows
    .map((r) => String(r.first))
    .filter(Boolean)
    .sort();
  const services = new Map<string, { key: string; views: number; taps: number }>();
  for (const r of svc.rows) {
    const key = String(r.key);
    const s = services.get(key) ?? { key, views: 0, taps: 0 };
    if (r.metric === "svc") s.views += Number(r.n);
    else s.taps += Number(r.n);
    services.set(key, s);
  }

  return {
    days: [...byDay.values()],
    totals: { pv: tot.pv ?? 0, ai: tot.ai ?? 0, tap: tot.tap ?? 0, uniques, firstDay: firsts[0] ?? null },
    topPages: pages.rows.map((r) => ({ key: String(r.key), count: Number(r.n) })),
    dbCreated: meta.rows[0] ? String(meta.rows[0].v) : null,
    topServices: [...services.values()].sort((a, b) => b.views + b.taps - (a.views + a.taps)).slice(0, 16),
  };
}

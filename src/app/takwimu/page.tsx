import type { Metadata } from "next";
import { cookies } from "next/headers";
import { readFullStats, type DayRow, type FullStats } from "@/db/queries/stats";
import { getService, loc } from "@/lib/catalog";
import { bricolage, publicSans } from "@/lib/fonts";
import { STATS_COOKIE, safeEqual, statsToken } from "@/lib/stats/core";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Takwimu · Lango", robots: { index: false, follow: false } };

const nf = new Intl.NumberFormat("en-GB");

async function authed(): Promise<boolean> {
  const password = process.env.LANGO_STATS_PASSWORD;
  const cookie = (await cookies()).get(STATS_COOKIE)?.value;
  return !!password && !!cookie && safeEqual(cookie, statsToken(password));
}

function Bi({ sw, en }: { sw: string; en: string }) {
  return (
    <>
      {sw} <span className="font-normal text-muted">· {en}</span>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" className={`${bricolage.variable} ${publicSans.variable}`}>
      <body>
        <main className="wrap space-y-6 py-8">{children}</main>
      </body>
    </html>
  );
}

function Login({ error }: { error?: string }) {
  return (
    <Shell>
      <form
        method="post"
        action="/takwimu/login"
        className="mx-auto mt-16 max-w-sm space-y-4 rounded-2xl bg-surface p-6 shadow-card"
      >
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          <Bi sw="Takwimu za Lango" en="Lango stats" />
        </h1>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">
            <Bi sw="Nenosiri" en="Password" />
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="min-h-12 w-full rounded-xl border border-line bg-bg px-3"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">
            {error === "rate" ? (
              <Bi sw="Majaribio mengi. Subiri dakika moja." en="Too many tries. Wait a minute." />
            ) : (
              <Bi sw="Nenosiri si sahihi." en="Wrong password." />
            )}
          </p>
        ) : null}
        <button className="min-h-12 w-full rounded-xl bg-sun font-display font-bold text-sun-ink">
          Ingia · Log in
        </button>
      </form>
    </Shell>
  );
}

function Stat({ sw, en, value, note }: { sw: string; en: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="text-sm font-semibold">
        <Bi sw={sw} en={en} />
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-display tabular-nums">{value}</p>
      {note ? <p className="text-xs text-muted">{note}</p> : null}
    </div>
  );
}

const short = (d: string) => `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`;

/** Server-rendered SVG bars: no chart library, no client JavaScript. */
function Bars({
  days,
  series,
}: {
  days: DayRow[];
  series: { key: keyof Omit<DayRow, "day">; color: string; sw: string; en: string }[];
}) {
  const W = 720;
  const H = 180;
  const pad = 22;
  const max = Math.max(1, ...days.flatMap((d) => series.map((s) => d[s.key])));
  const slot = (W - pad) / days.length;
  const bw = Math.max(2, (slot - 3) / series.length);
  return (
    <figure className="rounded-2xl bg-surface p-4 shadow-card">
      <figcaption className="mb-2 flex flex-wrap gap-4 text-sm">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm" style={{ background: s.color }} />
            <Bi sw={s.sw} en={s.en} />
          </span>
        ))}
        <span className="ml-auto text-muted">max {nf.format(max)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="h-auto w-full" role="img" aria-label="30-day chart">
        <line x1={pad} x2={W} y1={H} y2={H} stroke="var(--line)" />
        <line x1={pad} x2={W} y1={H / 2} y2={H / 2} stroke="var(--line)" strokeDasharray="3 4" />
        <text x={0} y={10} fontSize="10" fill="var(--muted)">
          {nf.format(max)}
        </text>
        <text x={0} y={H / 2 + 3} fontSize="10" fill="var(--muted)">
          {nf.format(Math.round(max / 2))}
        </text>
        {days.map((d, i) => (
          <g key={d.day}>
            {series.map((s, j) => {
              const h = (d[s.key] / max) * (H - 8);
              return (
                <rect
                  key={s.key}
                  x={pad + i * slot + j * bw + 1}
                  y={H - h}
                  width={bw - 0.5}
                  height={h}
                  rx={1.5}
                  fill={s.color}
                >
                  <title>{`${d.day} · ${s.en}: ${d[s.key]}`}</title>
                </rect>
              );
            })}
            {i % 5 === 0 || i === days.length - 1 ? (
              <text x={pad + i * slot + slot / 2} y={H + 14} fontSize="10" textAnchor="middle" fill="var(--muted)">
                {short(d.day)}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </figure>
  );
}

function Ranking({ rows, sw, en }: { rows: { label: string; sub?: string; value: number }[]; sw: string; en: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-card">
      <h2 className="mb-3 font-display text-lg font-bold">
        <Bi sw={sw} en={en} />
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Bado hakuna data · No data yet</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.sub ?? nf.format(r.value)}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-bg">
                <div className="h-1.5 rounded-full bg-teal" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Dashboard({ s }: { s: FullStats }) {
  const today = s.days.at(-1)!;
  const sum = (k: keyof Omit<DayRow, "day">) => s.days.reduce((n, d) => n + d[k], 0);
  return (
    <Shell>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-display">
            <Bi sw="Takwimu za Lango" en="Lango stats" />
          </h1>
          <p className="text-sm text-muted">
            Siku 30 zilizopita, saa za Afrika Mashariki · Last 30 days, East Africa Time
            {s.totals.firstDay ? ` · tangu / since ${s.totals.firstDay}` : ""}
          </p>
        </div>
        <form method="post" action="/takwimu/logout">
          <button className="min-h-10 rounded-xl border border-line px-4 text-sm font-semibold">Toka · Log out</button>
        </form>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          sw="Wageni leo"
          en="Visitors today"
          value={nf.format(today.uv)}
          note={`${nf.format(today.pv)} kurasa · page views`}
        />
        <Stat
          sw="Wageni wote"
          en="All-time visitors"
          value={`≈ ${nf.format(s.totals.uniques)}`}
          note="makadirio · estimate (±3%)"
        />
        <Stat
          sw="Kurasa zilizotazamwa"
          en="Page views"
          value={nf.format(s.totals.pv)}
          note={`siku 30 · 30 days: ${nf.format(sum("pv"))}`}
        />
        <Stat
          sw="Maswali kwa AI"
          en="AI questions"
          value={nf.format(s.totals.ai)}
          note={`leo · today: ${nf.format(today.ai)}`}
        />
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">
          <Bi sw="Wageni na kurasa kwa siku" en="Visitors and page views per day" />
        </h2>
        <Bars
          days={s.days}
          series={[
            { key: "uv", color: "var(--teal)", sw: "Wageni", en: "Unique visitors" },
            { key: "pv", color: "var(--sun)", sw: "Kurasa", en: "Page views" },
          ]}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">
          <Bi sw="Maswali kwa AI na kubofya tovuti rasmi" en="AI questions and official-site taps per day" />
        </h2>
        <Bars
          days={s.days}
          series={[
            { key: "ai", color: "var(--hero)", sw: "Maswali kwa AI", en: "AI questions" },
            { key: "tap", color: "var(--teal-light)", sw: "Kubofya", en: "Official-site taps" },
          ]}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Ranking
          sw="Kurasa maarufu"
          en="Top pages (30 days)"
          rows={s.topPages.map((p) => ({ label: p.key, value: p.count }))}
        />
        <Ranking
          sw="Huduma maarufu"
          en="Top services: views / taps"
          rows={s.topServices.map((x) => {
            const svc = getService(x.key);
            return {
              label: svc ? loc(svc.title, "sw") : x.key,
              value: x.views + x.taps,
              sub: `${nf.format(x.views)} / ${nf.format(x.taps)}`,
            };
          })}
        />
      </div>

      <p className="text-xs text-muted">
        Hakuna vidakuzi wala anwani za IP zinazohifadhiwa; roboti na prefetch hazihesabiwi. · No cookies or IP addresses
        are stored for visitors; bots and prefetches are not counted.
      </p>
    </Shell>
  );
}

export default async function TakwimuPage({ searchParams }: PageProps<"/takwimu">) {
  const { e } = await searchParams;
  if (!(await authed())) return <Login error={typeof e === "string" ? e : undefined} />;
  const stats = await readFullStats(30).catch((err: unknown) => {
    console.error("[takwimu] storage error:", err instanceof Error ? err.message : err);
    return null;
  });
  if (stats) return <Dashboard s={stats} />;
  return (
    <Shell>
      <p role="alert" className="rounded-2xl bg-surface p-6 shadow-card">
        Hifadhidata haipatikani · Storage unavailable. Check TURSO_DATABASE_URL / TURSO_AUTH_TOKEN.
      </p>
    </Shell>
  );
}

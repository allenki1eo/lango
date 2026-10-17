import { after, type NextRequest } from "next/server";
import { recordEvent, recordPageView } from "@/db/queries/stats";
import { rateLimit } from "@/lib/ai/rate-limit";
import {
  SLUG_RE,
  dailyVisitorHash,
  dayKey,
  hllPoint,
  isBot,
  isPrefetch,
  normalizePath,
  serviceSlug,
  statsSecret,
} from "@/lib/stats/core";

/**
 * Visit beacon: POST { p: path } for a page view or { t: slug } for an official-link tap.
 * Answers 204 at once; counting happens after the response so the page never waits on it.
 */
export async function POST(req: NextRequest) {
  const done = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua) || isPrefetch(req.headers)) return done;
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return done;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`hit:${ip}`, 60)) return done;

  let body: { p?: unknown; t?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done;
  }

  after(async () => {
    try {
      if (typeof body.t === "string" && SLUG_RE.test(body.t)) {
        await recordEvent("tap", body.t);
        return;
      }
      const path = normalizePath(body.p);
      if (!path) return;
      const secret = statsSecret();
      await recordPageView({
        path,
        service: serviceSlug(path),
        visitorHash: dailyVisitorHash(secret, dayKey(), ip, ua),
        hll: hllPoint(secret, ip, ua),
      });
    } catch (e) {
      console.error("[hit] not counted:", e instanceof Error ? e.message : e);
    }
  });
  return done;
}

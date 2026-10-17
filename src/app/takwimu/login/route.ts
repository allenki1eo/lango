import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/ai/rate-limit";
import { STATS_COOKIE, safeEqual, statsToken } from "@/lib/stats/core";

const back = (query = "") => new Response(null, { status: 303, headers: { Location: `/takwimu${query}` } });

/** Plain form POST (works without JavaScript). Sets an HttpOnly session cookie scoped to /takwimu. */
export async function POST(req: NextRequest) {
  const password = process.env.LANGO_STATS_PASSWORD;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`takwimu:${ip}`, 5)) return back("?e=rate");
  const form = await req.formData().catch(() => null);
  const given = String(form?.get("password") ?? "");
  if (!password || !safeEqual(statsToken(given), statsToken(password))) return back("?e=1");
  const res = back();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `${STATS_COOKIE}=${statsToken(password)}; Path=/takwimu; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Strict${secure}`,
  );
  return res;
}

import { STATS_COOKIE } from "@/lib/stats/core";

export function POST() {
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/takwimu",
      "Set-Cookie": `${STATS_COOKIE}=; Path=/takwimu; Max-Age=0; HttpOnly; SameSite=Strict`,
    },
  });
}

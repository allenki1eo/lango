import { readPublicCounts } from "@/db/queries/stats";

/** Public aggregate counts for the footer widget. Cached at the edge for 60 s. */
export async function GET() {
  try {
    const counts = await readPublicCounts();
    return Response.json(counts, {
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("[wageni] unavailable:", e instanceof Error ? e.message : e);
    return Response.json(
      { error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "public, s-maxage=30" } },
    );
  }
}

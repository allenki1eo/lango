import { NextResponse, type NextRequest } from "next/server";
import { toCards } from "@/lib/ai/cards";
import { ask } from "@/lib/ai/openrouter";
import { rateLimit } from "@/lib/ai/rate-limit";
import type { ToolEvent } from "@/lib/ai/tools";
import { searchServices } from "@/lib/catalog";

// Hobby allows up to 60 s with Fluid compute; we stop well before that (20 s AI budget).
export const maxDuration = 30;

/**
 * POST { q, locale, fast?, stream? }.
 * stream=true → Server-Sent Events: `cards` (instant keyword result), then `answer` (AI text + cards), then `done`.
 * Otherwise a single JSON response. Debug reasons are only returned with ?debug=<ASK_DEBUG_SECRET>.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });

  let body: { q?: unknown; locale?: unknown; fast?: unknown; stream?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  const q = typeof body.q === "string" ? body.q.trim().slice(0, 300) : "";
  const l = body.locale === "en" ? "en" : "sw";
  if (q.length < 2) return NextResponse.json({ error: "bad" }, { status: 400 });
  const secret = process.env.ASK_DEBUG_SECRET;
  const debug = !!secret && req.nextUrl.searchParams.get("debug") === secret;

  const searchEvents = (): ToolEvent[] => {
    const slugs = searchServices(q).map((s) => s.slug);
    return slugs.length ? [{ type: "services", slugs }] : [];
  };
  const searchPayload = () => ({ text: "", cards: toCards(searchEvents(), l), source: "search" as const });
  if (body.fast === true) return NextResponse.json(searchPayload());

  const aiOn = process.env.AI_ENABLED !== "false" && !!process.env.OPENROUTER_API_KEY;
  const runAi = async () => {
    const t0 = Date.now();
    if (!aiOn) {
      console.warn(
        "[ask] ai skipped:",
        process.env.OPENROUTER_API_KEY ? "AI_ENABLED=false" : "OPENROUTER_API_KEY missing",
      );
      return { ...searchPayload(), reason: process.env.OPENROUTER_API_KEY ? "disabled" : "no-key" };
    }
    try {
      const out = await ask(q, l, { signal: req.signal });
      const events = out.events.length ? out.events : searchEvents();
      console.info(`[ask] ai ok model=${out.model} ms=${Date.now() - t0} attempts=${out.attempts.join(",")}`);
      return {
        text: out.text,
        cards: toCards(events, l),
        source: "ai" as const,
        model: out.model,
        ms: Date.now() - t0,
        reason: out.attempts.join(","),
      };
    } catch (e) {
      const attempts =
        (e as { attempts?: string[] }).attempts?.join(",") ?? (e instanceof Error ? e.message : "unknown");
      console.error(`[ask] ai failed ms=${Date.now() - t0} reason=${attempts}`);
      return { ...searchPayload(), ms: Date.now() - t0, reason: attempts };
    }
  };
  const strip = <T extends { reason?: string }>(p: T) => {
    if (debug) return p;
    const { reason: _r, ...rest } = p;
    void _r;
    return rest;
  };

  if (body.stream !== true) return NextResponse.json(strip(await runAi()));

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (event: string, data: unknown) =>
        ctrl.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      send("cards", searchPayload());
      send("answer", strip(await runAi()));
      send("done", {});
      ctrl.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

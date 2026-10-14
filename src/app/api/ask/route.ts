import { NextResponse, type NextRequest } from "next/server";
import { toCards } from "@/lib/ai/cards";
import { ask } from "@/lib/ai/openrouter";
import { rateLimit } from "@/lib/ai/rate-limit";
import type { ToolEvent } from "@/lib/ai/tools";
import { searchServices } from "@/lib/catalog";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });

  let body: { q?: unknown; locale?: unknown; fast?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  const q = typeof body.q === "string" ? body.q.trim().slice(0, 300) : "";
  const l = body.locale === "en" ? "en" : "sw";
  if (q.length < 2) return NextResponse.json({ error: "bad" }, { status: 400 });

  const searchEvents = (): ToolEvent[] => {
    const slugs = searchServices(q).map((s) => s.slug);
    return slugs.length ? [{ type: "services", slugs }] : [];
  };

  // fast=true: instant keyword answer shown while the AI thinks (free models can take 5-20 s).
  if (body.fast === true) return NextResponse.json({ text: "", cards: toCards(searchEvents(), l), source: "search" });

  if (process.env.AI_ENABLED !== "false" && process.env.OPENROUTER_API_KEY) {
    try {
      const out = await ask(q, l, AbortSignal.timeout(22_000));
      const events = out.events.length ? out.events : searchEvents();
      return NextResponse.json({ text: out.text, cards: toCards(events, l), source: "ai", model: out.model });
    } catch {
      // Free models can be rate-limited or down; fall through to keyword search so the app always answers.
    }
  }
  return NextResponse.json({ text: "", cards: toCards(searchEvents(), l), source: "search" });
}

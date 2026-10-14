import { getService, loc, searchServices } from "@/lib/catalog";
import { redact } from "./redact";
import { runTool, toolDefs, type ToolEvent } from "./tools";

/**
 * Free OpenRouter models with tool calling, fastest reliable first (benchmarked 2026-10-14 from Dar:
 * nemotron-ultra 1.6 s, north-mini 0.9 s, lfm 1.1 s, dots 2.4 s, laguna-xs 4.5 s; gemma/laguna-s were 429).
 * Each gets its own short timeout; on any failure we move to the next.
 */
export const DEFAULT_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "cohere/north-mini-code:free",
  "dots-studio/dots-3-note-preview:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "poolside/laguna-xs-2.1:free",
];

export function models(): string[] {
  const env = process.env.AI_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return env?.length ? env : DEFAULT_MODELS;
}

type Msg = { role: string; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

/** Prefetch keyword candidates (and the top guide) into the prompt so the model rarely needs a tool round. */
function systemPrompt(question: string, l: string) {
  const hits = searchServices(question, 4);
  const top = hits[0] && getService(hits[0].slug);
  const guide = top
    ? `\nTop candidate guide (${top.slug}): steps: ${top.steps.map((s) => loc(s, l)).join(" | ")}. Fees: ${
        top.fees.map((f) => `${loc(f.label, l)} ${loc(f.amount, l)}`).join("; ") ||
        (top.feeNote ? loc(top.feeNote, l) : "not verified")
      }.`
    : "";
  return {
    hits,
    text: `You are Lango, a friendly guide to Tanzanian government services by Hanki Technologies.
Reply in ${l === "en" ? "English" : "Kiswahili"}: plain text, no markdown, 1-3 short sentences saying what to do first.
Candidate services from Lango's verified catalog: ${hits.map((h) => `${h.slug} (${loc(h.title, l)})`).join(", ") || "none"}.${guide}
If the top candidate fits, answer directly WITHOUT calling tools. Call a tool only if you need a different service, fees, or offices.
The app already shows full steps, fees and the official link as cards. Never invent fees, URLs, numbers or steps; if unsure, say to check the official site.
Never ask for passwords, NIN or phone numbers. Emergencies: 112 police, 114 fire, 115 ambulance.`,
  };
}

async function call(model: string, messages: Msg[], withTools: boolean, ms: number, signal?: AbortSignal) {
  const ctl = AbortSignal.any([AbortSignal.timeout(ms), ...(signal ? [signal] : [])]);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: ctl,
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://lango.hanki.co.tz",
      "X-Title": "Lango by Hanki Technologies",
    },
    body: JSON.stringify({
      model,
      messages,
      ...(withTools ? { tools: toolDefs } : {}),
      max_tokens: 300,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // The account-wide free quota (50/day without credits) applies to every model: no point trying others.
    if (body.includes("free-models-per-day")) throw new Error("daily-limit");
    throw new Error(`http-${res.status}`);
  }
  const data = (await res.json()) as { choices?: { message: Msg }[]; error?: { code?: number } };
  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error(`empty${data.error?.code ? `-${data.error.code}` : ""}`);
  return msg;
}

const reason = (e: unknown) =>
  e instanceof Error
    ? e.name === "TimeoutError" || e.name === "AbortError"
      ? "timeout"
      : e.message.slice(0, 60)
    : "unknown";

export type AskResult = { text: string; events: ToolEvent[]; model: string; attempts: string[] };

/** At most one tool round. Each model attempt is capped (default 8 s); failures fall through to the next model. */
export async function ask(
  question: string,
  l: string,
  opts: { perAttemptMs?: number; budgetMs?: number; signal?: AbortSignal } = {},
): Promise<AskResult> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("no-key");
  const started = Date.now();
  const budget = opts.budgetMs ?? 20_000;
  const per = opts.perAttemptMs ?? 8_000;
  const q = redact(question);
  const sys = systemPrompt(q, l);
  const baseEvents: ToolEvent[] = sys.hits.length ? [{ type: "services", slugs: sys.hits.map((h) => h.slug) }] : [];
  const attempts: string[] = [];

  for (const model of models()) {
    const left = budget - (Date.now() - started);
    if (left < 2_000) break;
    const messages: Msg[] = [
      { role: "system", content: sys.text },
      { role: "user", content: q },
    ];
    try {
      const msg = await call(model, messages, true, Math.min(per, left), opts.signal);
      if (!msg.tool_calls?.length) {
        const text = (msg.content ?? "").trim();
        if (!text) throw new Error("empty-text");
        return { text, events: baseEvents, model, attempts: [...attempts, `${model}:ok`] };
      }
      const events = [...baseEvents];
      messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });
      for (const tc of msg.tool_calls.slice(0, 3)) {
        let args: Record<string, string> = {};
        try {
          args = JSON.parse(tc.function.arguments || "{}");
        } catch {}
        const { result, event } = runTool(tc.function.name, args, l);
        if (event) events.push(event);
        messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
      }
      // One follow-up for the wording, without tools. If it's slow, the cards from the tool calls still stand.
      const left2 = budget - (Date.now() - started);
      let text = "";
      if (left2 > 1_500) {
        try {
          text = ((await call(model, messages, false, Math.min(per, left2), opts.signal)).content ?? "").trim();
        } catch (e) {
          attempts.push(`${model}:followup-${reason(e)}`);
        }
      }
      return { text, events, model, attempts: [...attempts, `${model}:ok-tools`] };
    } catch (e) {
      attempts.push(`${model}:${reason(e)}`);
      if (reason(e) === "daily-limit") break;
    }
  }
  const err = new Error("all-models-failed");
  (err as Error & { attempts?: string[] }).attempts = attempts;
  throw err;
}

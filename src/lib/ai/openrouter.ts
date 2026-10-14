import { redact } from "./redact";
import { runTool, toolDefs, type ToolEvent } from "./tools";

/** Free OpenRouter models with tool calling, best first (checked 2026-10-14). OpenRouter tries them in order. */
export const DEFAULT_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
];

export function models(): string[] {
  const env = process.env.AI_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return (env?.length ? env : DEFAULT_MODELS).slice(0, 3); // OpenRouter accepts up to 3 in `models`
}

const system = (
  l: string,
) => `You are Lango, a friendly guide to Tanzanian government services, made by Hanki Technologies.
Reply in ${l === "en" ? "English" : "Kiswahili"} (short, plain, warm; 1-3 sentences).
Rules:
- ALWAYS call search_services first, then get_service_guide for the best match. Use lookup_fees for fee questions, list_offices for offices, open_link to show the official site.
- The app shows the full steps, fees and official link as cards, so do NOT repeat the steps. Just say briefly what to do first.
- Never invent fees, URLs, phone numbers or steps. Only use tool results. If unsure, say so and point to the official site.
- Never ask for passwords, NIN or phone numbers.
- If the user describes an emergency, tell them to call 112 (police), 114 (fire) or 115 (ambulance).`;

type Msg = { role: string; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export async function ask(question: string, l: string, signal?: AbortSignal) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("no-key");
  const messages: Msg[] = [
    { role: "system", content: system(l) },
    { role: "user", content: redact(question) },
  ];
  const events: ToolEvent[] = [];
  let model = "";
  for (let turn = 0; turn < 4; turn++) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://lango.hanki.co.tz",
        "X-Title": "Lango by Hanki Technologies",
      },
      body: JSON.stringify({ models: models(), messages, tools: toolDefs, max_tokens: 400, temperature: 0.2 }),
    });
    if (!res.ok) throw new Error(`openrouter-${res.status}`);
    const data = (await res.json()) as { model?: string; choices?: { message: Msg }[] };
    model = data.model ?? model;
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error("empty");
    messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });
    if (!msg.tool_calls?.length) return { text: (msg.content ?? "").trim(), events, model };
    for (const call of msg.tool_calls) {
      let args: Record<string, string> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {}
      const { result, event } = runTool(call.function.name, args, l);
      if (event) events.push(event);
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  return { text: "", events, model };
}

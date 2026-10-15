/**
 * Whether the assistant can answer: on unless AI_ENABLED is "false", and only with an OpenRouter key.
 * The ask route and the public "AI" label both use this, so the label never promises a disabled assistant.
 */
export function isAiEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.AI_ENABLED !== "false" && !!env.OPENROUTER_API_KEY;
}

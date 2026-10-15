import { describe, expect, it } from "vitest";
import { isAiEnabled } from "@/lib/ai/enabled";

describe("isAiEnabled", () => {
  it("is on with a key unless AI_ENABLED is false", () => {
    expect(isAiEnabled({ OPENROUTER_API_KEY: "k" })).toBe(true);
    expect(isAiEnabled({ OPENROUTER_API_KEY: "k", AI_ENABLED: "true" })).toBe(true);
    expect(isAiEnabled({ OPENROUTER_API_KEY: "k", AI_ENABLED: "false" })).toBe(false);
  });

  it("is off without an OpenRouter key", () => {
    expect(isAiEnabled({ AI_ENABLED: "true" })).toBe(false);
    expect(isAiEnabled({ AI_ENABLED: "true", OPENROUTER_API_KEY: "" })).toBe(false);
  });
});

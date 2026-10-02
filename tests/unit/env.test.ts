import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/lib/env";

describe("readServerEnv", () => {
  it("applies defaults, treating empty strings as unset", () => {
    const env = readServerEnv({ TURSO_DATABASE_URL: "", AI_ENABLED: "" });
    expect(env.TURSO_DATABASE_URL).toBe("file:local.db");
    expect(env.AI_ENABLED).toBe(false);
  });

  it("parses the AI kill switch strictly", () => {
    expect(readServerEnv({ AI_ENABLED: "true" }).AI_ENABLED).toBe(true);
    expect(() => readServerEnv({ AI_ENABLED: "yes" })).toThrow();
  });
});

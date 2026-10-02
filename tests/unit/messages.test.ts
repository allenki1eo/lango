import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import sw from "@/messages/sw.json";

/** Flattens messages into "path: type" entries so both locales can be compared structurally. */
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) {
    return [`${path}: array(${value.length})`, ...value.flatMap((item, index) => shape(item, `${path}[${index}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => shape(child, path ? `${path}.${key}` : key));
  }
  return [`${path}: ${typeof value}`];
}

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}.${key}`));
  }
  return [];
}

describe("messages", () => {
  it("have the same keys and shape in Swahili and English", () => {
    expect(shape(en)).toEqual(shape(sw));
  });

  it("use the same placeholders in both languages", () => {
    const english = new Map(strings(en));
    for (const [path, message] of strings(sw)) {
      expect(placeholders(english.get(path) ?? ""), path).toEqual(placeholders(message));
    }
  });

  it("have no empty strings", () => {
    for (const [path, message] of [...strings(sw), ...strings(en)]) {
      expect(message.trim(), path).not.toBe("");
    }
  });
});

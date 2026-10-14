import { describe, expect, it } from "vitest";
import { searchServices } from "@/lib/catalog";

const cases: [string, string][] = [
  ["Nataka kupata kitambulisho cha NIDA", "nida-kitambulisho"],
  ["How much is a passport?", "pasipoti"],
  ["Sajili biashara", "brela-usajili-biashara"],
  ["Matokeo ya NECTA", "necta-matokeo"],
  ["nunua luku", "tanesco-luku"],
  ["cheti cha kuzaliwa", "rita-cheti-kuzaliwa-kifo"],
  ["control number", "gepg-malipo"],
  ["mkopo chuo kikuu", "heslb-mkopo"],
  ["renew driving licence", "leseni-udereva"],
  ["namba ya polisi", "dharura-polisi"],
];

describe("keyword search", () => {
  it.each(cases)("%s → %s", (q, slug) => expect(searchServices(q)[0]?.slug).toBe(slug));
  it("returns nothing for stop words only", () => expect(searchServices("nataka kupata")).toEqual([]));
});

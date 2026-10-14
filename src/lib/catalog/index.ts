import data from "@/data/catalog.json";

export type Localized = { sw: string; en: string };
export type Fee = { label: Localized; amount: string | Localized; source: string };
export type Contact = { label: Localized; value: string; href: string };
export type Service = {
  slug: string;
  agency: string;
  category: string;
  icon: string;
  popular?: boolean;
  title: Localized;
  summary: Localized;
  officialUrl: string;
  sources: string[];
  documents: Localized[];
  steps: Localized[];
  fees: Fee[];
  feeNote: Localized | null;
  contacts: Contact[];
  keywords: string[];
  lastChecked: string;
};
export type Category = { slug: string; name: Localized; icon: string };
export type Office = {
  agency: string;
  name: Localized;
  region: string;
  phone?: string;
  hours?: Localized;
  source: string;
  note?: Localized;
};
export type Emergency = { number: string; label: Localized };

type Catalog = {
  lastChecked: string;
  categories: Category[];
  services: Service[];
  emergency: Emergency[];
  offices: Office[];
};

/** The curated catalog. Edit src/data/catalog.json (see docs/CONTENT.md) and redeploy. */
export const catalog = data as Catalog;

export const getService = (slug: string) => catalog.services.find((s) => s.slug === slug);
export const servicesIn = (category: string) => catalog.services.filter((s) => s.category === category);
export const popularServices = () => catalog.services.filter((s) => s.popular);
export const loc = (v: string | Localized, l: string) => (typeof v === "string" ? v : l === "en" ? v.en : v.sw);

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9*# ]+/g, " ");
}

const STOP = new Set(
  "nataka kupata ya la wa na kwa cha za jinsi gani nini how to i want get the a an of for my is do can ni nina ninataka naomba tafadhali please kuhusu about".split(
    " ",
  ),
);

/** Small keyword ranker: exact keyword phrases score highest, then word overlaps with titles and keywords. */
export function searchServices(query: string, limit = 5): Service[] {
  const q = normalize(query);
  const words = q.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (!words.length) return [];
  const scored = catalog.services.map((s) => {
    const kw = s.keywords.map(normalize);
    const hay = normalize([s.title.sw, s.title.en, s.summary.sw, s.summary.en, s.agency].join(" "));
    let score = 0;
    for (const k of kw) if (k.includes(" ") && q.includes(k)) score += 6;
    for (const w of words) {
      if (kw.some((k) => k === w)) score += 5;
      else if (kw.some((k) => k.startsWith(w) || (w.length > 3 && k.includes(w)))) score += 3;
      if (hay.includes(w)) score += 1;
    }
    return { s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export function findOffices(agency?: string, region?: string): Office[] {
  const a = agency ? normalize(agency) : "";
  const r = region ? normalize(region) : "";
  return catalog.offices.filter(
    (o) => (!a || normalize(o.agency).includes(a)) && (!r || normalize(o.region).includes(r) || o.region === "Kitaifa"),
  );
}

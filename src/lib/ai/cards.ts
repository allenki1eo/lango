import { catalog, findOffices, getService, loc, type Service } from "@/lib/catalog";
import type { ToolEvent } from "./tools";

export type BriefCard = {
  slug: string;
  title: string;
  agency: string;
  summary: string;
  icon: string;
  officialUrl: string;
};
export type GuideCard = BriefCard & {
  documents: string[];
  steps: string[];
  fees: { label: string; amount: string; source: string }[];
  feeNote: string | null;
  lastChecked: string;
  sources: string[];
};
export type OfficeCard = { agency: string; name: string; phone?: string; note?: string; source: string };
export type Cards = { guide?: GuideCard; services: BriefCard[]; offices: OfficeCard[] };

const brief = (s: Service, l: string): BriefCard => ({
  slug: s.slug,
  title: loc(s.title, l),
  agency: s.agency,
  summary: loc(s.summary, l),
  icon: s.icon,
  officialUrl: s.officialUrl,
});

/** Turns tool events into display cards. All content comes from the curated catalog, never from the model. */
export function toCards(events: ToolEvent[], l: string): Cards {
  let guideSlug: string | undefined;
  const slugs: string[] = [];
  const offices: OfficeCard[] = [];
  for (const e of events) {
    if (e.type === "guide" || e.type === "link") guideSlug = e.slug;
    if (e.type === "services") slugs.push(...e.slugs);
    if (e.type === "offices")
      for (const o of findOffices(e.agency, e.region))
        if (!offices.some((x) => x.name === loc(o.name, l)))
          offices.push({
            agency: o.agency,
            name: loc(o.name, l),
            phone: o.phone,
            note: o.note && loc(o.note, l),
            source: o.source,
          });
  }
  guideSlug ??= slugs[0];
  const agencyHint = events.find((e) => e.type === "offices" && e.agency);
  if (!guideSlug && agencyHint?.type === "offices")
    guideSlug = catalog.services.find((s) => s.agency.toLowerCase() === agencyHint.agency!.toLowerCase())?.slug;
  const g = guideSlug ? getService(guideSlug) : undefined;
  const guide: GuideCard | undefined = g && {
    ...brief(g, l),
    documents: g.documents.map((d) => loc(d, l)),
    steps: g.steps.map((d) => loc(d, l)),
    fees: g.fees.map((f) => ({ label: loc(f.label, l), amount: loc(f.amount, l), source: f.source })),
    feeNote: g.feeNote && loc(g.feeNote, l),
    lastChecked: g.lastChecked,
    sources: g.sources,
  };
  const services = [...new Set(slugs)]
    .filter((s) => s !== guideSlug)
    .map(getService)
    .filter((s): s is Service => !!s)
    .slice(0, 4)
    .map((s) => brief(s, l));
  return { guide, services, offices };
}

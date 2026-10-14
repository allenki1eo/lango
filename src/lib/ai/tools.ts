import { catalog, findOffices, getService, loc, searchServices, type Service } from "@/lib/catalog";

export const toolDefs = [
  {
    type: "function",
    function: {
      name: "search_services",
      description: "Search Lango's verified catalog of Tanzanian government services. Always call this first.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Short keywords in Swahili or English, e.g. 'nida kitambulisho'" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_service_guide",
      description: "Get the verified documents, steps, fees and official link for one service id from search_services.",
      parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_fees",
      description: "Get only the verified fees for a service id. Never state a fee that this tool does not return.",
      parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_offices",
      description:
        "List known offices/contacts for an agency (e.g. NIDA, TRA, RITA, Polisi), optionally filtered by region.",
      parameters: { type: "object", properties: { agency: { type: "string" }, region: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "open_link",
      description: "Show the user a button to the official website for a service id.",
      parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  },
] as const;

export type ToolEvent =
  | { type: "services"; slugs: string[] }
  | { type: "guide"; slug: string }
  | { type: "link"; slug: string }
  | { type: "offices"; agency?: string; region?: string };

const brief = (s: Service, l: string) => ({
  id: s.slug,
  title: loc(s.title, l),
  agency: s.agency,
  summary: loc(s.summary, l),
});

/** Runs a tool against the curated catalog. Returns JSON for the model plus a UI event. */
export function runTool(name: string, args: Record<string, string>, l: string): { result: unknown; event?: ToolEvent } {
  const svc = args.id ? getService(args.id) : undefined;
  switch (name) {
    case "search_services": {
      const hits = searchServices(args.query ?? "");
      return {
        result: hits.length
          ? hits.map((s) => brief(s, l))
          : { none: true, categories: catalog.categories.map((c) => c.slug) },
        event: hits.length ? { type: "services", slugs: hits.map((s) => s.slug) } : undefined,
      };
    }
    case "get_service_guide":
      if (!svc) return { result: { error: "unknown id" } };
      return {
        result: {
          ...brief(svc, l),
          officialUrl: svc.officialUrl,
          documents: svc.documents.map((d) => loc(d, l)),
          steps: svc.steps.map((d) => loc(d, l)),
          fees: svc.fees.map((f) => ({ label: loc(f.label, l), amount: loc(f.amount, l) })),
          feeNote: svc.feeNote ? loc(svc.feeNote, l) : null,
          lastChecked: svc.lastChecked,
        },
        event: { type: "guide", slug: svc.slug },
      };
    case "lookup_fees":
      if (!svc) return { result: { error: "unknown id" } };
      return {
        result: {
          fees: svc.fees.map((f) => ({ label: loc(f.label, l), amount: loc(f.amount, l), source: f.source })),
          note: svc.feeNote ? loc(svc.feeNote, l) : null,
        },
        event: { type: "guide", slug: svc.slug },
      };
    case "list_offices": {
      const offices = findOffices(args.agency, args.region);
      return {
        result: offices.length
          ? offices.map((o) => ({
              agency: o.agency,
              name: loc(o.name, l),
              phone: o.phone,
              note: o.note && loc(o.note, l),
            }))
          : { none: true, advice: "Region office data not available; point to the agency's official site." },
        event: { type: "offices", agency: args.agency, region: args.region },
      };
    }
    case "open_link":
      if (!svc) return { result: { error: "unknown id" } };
      return { result: { shown: true, url: svc.officialUrl }, event: { type: "link", slug: svc.slug } };
    default:
      return { result: { error: "unknown tool" } };
  }
}

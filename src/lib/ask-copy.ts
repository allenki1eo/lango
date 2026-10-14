import type { Locale } from "@/lib/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { AskCopy } from "@/components/public/ask-box";

export async function getAskCopy(locale: Locale): Promise<AskCopy> {
  const s = await getTranslations({ locale, namespace: "Search" });
  const a = await getTranslations({ locale, namespace: "Ask" });
  const g = await getTranslations({ locale, namespace: "Guide" });
  return {
    label: s("label"),
    placeholder: s("placeholder"),
    submit: s("submit"),
    tryLabel: s("tryLabel"),
    examples: s.raw("examples") as string[],
    thinking: a("thinking"),
    error: a("error"),
    rate: a("rate"),
    noMatch: a("noMatch"),
    aiNote: a("aiNote"),
    related: a("related"),
    offices: a("offices"),
    viewGuide: a("viewGuide"),
    official: g("official"),
    documents: g("documents"),
    steps: g("steps"),
    fees: g("fees"),
    noFees: g("noFees"),
    feeSource: g("feeSource"),
    lastChecked: g.raw("lastChecked") as string,
    done: g.raw("done") as string,
    reset: g("reset"),
  };
}

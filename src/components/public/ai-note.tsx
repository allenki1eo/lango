import { useTranslations } from "next-intl";
import { isAiEnabled } from "@/lib/ai/enabled";
import { Icon } from "./icon";

/**
 * Tells visitors the ask box is AI-assisted and where its facts come from. Server-rendered, and shown
 * only while the assistant is switched on, so it costs no client JavaScript and never over-promises.
 */
export function AiNote() {
  const t = useTranslations("Ask");
  if (!isAiEnabled()) return null;

  return (
    <p className="mt-3 flex max-w-[760px] flex-wrap items-center gap-x-2 gap-y-1 text-[0.9375rem] text-muted in-data-[surface=hero]:text-hero-muted">
      <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2.5 py-0.5 text-sm font-semibold text-ink in-data-[surface=hero]:bg-white/12 in-data-[surface=hero]:text-hero-ink">
        <Icon name="sparkle" className="text-teal in-data-[surface=hero]:text-sun" />
        {t("aiBadge")}
      </span>
      <span>{t("aiIntro")}</span>
    </p>
  );
}

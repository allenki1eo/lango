import { useTranslations } from "next-intl";
import { isAiEnabled } from "@/lib/ai/enabled";
import { Glyph } from "./glyph";

/**
 * Tells visitors the ask box is AI-assisted and where its facts come from. Server-rendered, and shown
 * only while the assistant is switched on, so it costs no client JavaScript and never over-promises.
 */
export function AiNote() {
  const t = useTranslations("Ask");
  if (!isAiEnabled()) return null;

  return (
    <p className="mx-auto mt-3 flex max-w-[60ch] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center text-[0.875rem] text-muted in-data-[surface=hero]:text-hero-muted">
      <span className="inline-flex items-center gap-1 font-semibold text-ink in-data-[surface=hero]:text-hero-ink">
        <Glyph name="sparkle" className="text-sun" />
        {t("aiBadge")}
      </span>
      <span>{t("aiIntro")}</span>
    </p>
  );
}

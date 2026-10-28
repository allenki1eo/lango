import { useTranslations } from "next-intl";
import { Glyph } from "./glyph";

/**
 * One quiet line above the page, in the place official sites state who runs them, but honest about Lango:
 * an independent guide that links out and never asks for personal data. A native <details> needs no JavaScript.
 */
export function TrustBanner() {
  const t = useTranslations("Banner");

  return (
    <details className="group text-[0.8125rem] text-muted">
      <summary className="wrap flex min-h-11 items-center justify-center gap-1.5 py-1.5 text-center">
        <span>{t("text")}</span>
        <span className="sr-only">{t("toggle")}</span>
        <Glyph name="info" />
      </summary>
      <div className="wrap grid max-w-[880px] gap-5 pt-2 pb-6 text-[0.9375rem] sm:grid-cols-2 sm:gap-8">
        <BannerPoint icon="globe" title={t("linksTitle")} body={t("linksBody")} />
        <BannerPoint icon="lock" title={t("privacyTitle")} body={t("privacyBody")} />
      </div>
    </details>
  );
}

function BannerPoint({ icon, title, body }: { icon: "globe" | "lock"; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 flex-none place-items-center rounded-full bg-band text-[1.1rem] text-ink">
        <Glyph name={icon} />
      </span>
      <p>
        <strong className="block font-semibold text-ink">{title}</strong>
        <span>{body}</span>
      </p>
    </div>
  );
}

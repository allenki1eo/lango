import { useTranslations } from "next-intl";
import { Icon } from "./icon";

/**
 * The strip above the header, modelled on the "official website" banner of government service sites,
 * but honest about what Lango is: an independent guide that links out and never asks for personal data.
 * A native <details> keeps it working without JavaScript.
 */
export function TrustBanner() {
  const t = useTranslations("Banner");

  return (
    <details className="group border-b border-line bg-band text-[0.875rem]">
      <summary className="wrap flex min-h-11 items-start gap-2 py-2.5 sm:items-center sm:py-1.5">
        <Icon name="shield" className="mt-0.5 text-teal sm:mt-0" />
        <span>
          {t("text")}{" "}
          <span className="link inline-flex items-center gap-0.5 font-medium whitespace-nowrap">
            {t("toggle")}
            <Icon name="down" className="transition-transform group-open:rotate-180" />
          </span>
        </span>
      </summary>
      <div className="wrap grid gap-5 pt-3 pb-5 sm:grid-cols-2 sm:gap-8">
        <BannerPoint icon="globe" title={t("linksTitle")} body={t("linksBody")} />
        <BannerPoint icon="lock" title={t("privacyTitle")} body={t("privacyBody")} />
      </div>
    </details>
  );
}

function BannerPoint({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 flex-none place-items-center rounded-full bg-teal-soft text-[1.15rem] text-teal">
        <Icon name={icon} />
      </span>
      <p className="max-w-[56ch]">
        <strong className="block">{title}</strong>
        <span className="text-muted">{body}</span>
      </p>
    </div>
  );
}

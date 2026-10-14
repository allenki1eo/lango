import { useTranslations } from "next-intl";
import { HankiBadge } from "./hanki-badge";

export function SiteFooter() {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-line pt-6.5 pb-10 text-[0.9375rem] text-muted">
      <div className="wrap space-y-2">
        <HankiBadge label={t("by")} />
        <p className="max-w-[70ch]">{t("disclaimer")}</p>
        <p className="max-w-[70ch]">{t("privacy")}</p>
      </div>
    </footer>
  );
}

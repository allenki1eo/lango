import { useLocale, useTranslations } from "next-intl";
import { BrandMark } from "./brand-mark";
import { LanguageSwitch } from "./language-switch";

export function SiteHeader() {
  const t = useTranslations("Language");
  const locale = useLocale();

  return (
    <div className="relative flex items-center justify-between gap-4 pt-[max(18px,env(safe-area-inset-top))]">
      <BrandMark />
      <LanguageSwitch active={locale} label={t("label")} names={{ sw: t("sw"), en: t("en") }} />
    </div>
  );
}

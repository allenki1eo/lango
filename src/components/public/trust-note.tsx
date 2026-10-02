import { useTranslations } from "next-intl";
import { Icon } from "./icon";

export function TrustNote() {
  const t = useTranslations("Trust");

  return (
    <aside className="flex gap-4 rounded-2xl bg-brand-soft p-5 sm:p-6">
      <Icon name="shield" className="mt-0.5 size-6 text-ok" />
      <div>
        <h2 className="mb-1 font-display text-[1.0625rem] font-bold">{t("title")}</h2>
        <p className="max-w-[64ch] text-[0.9375rem]">{t("body")}</p>
      </div>
    </aside>
  );
}

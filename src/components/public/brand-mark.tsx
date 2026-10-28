import { useTranslations } from "next-intl";
import { LocaleLink } from "./locale-link";

/** Lango wordmark: a doorway (lango = gate) with the Hanki saffron diamond as the keystone, set beside a serif name. */
export function BrandMark() {
  const t = useTranslations("Common");
  return (
    <LocaleLink
      href="/"
      className="inline-flex min-h-11 items-center gap-2 font-serif text-[1.625rem] leading-none tracking-[-0.03em] no-underline"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="size-[26px]">
        <path
          d="M6 29V14a10 10 0 0 1 20 0v15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path d="M16 8.5 20 12.5 16 16.5 12 12.5Z" fill="var(--sun)" />
        <path
          d="M12.5 29v-7a3.5 3.5 0 0 1 7 0v7"
          fill="none"
          stroke="var(--teal-light)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      {t("brand")}
    </LocaleLink>
  );
}

import { useTranslations } from "next-intl";
import { LocaleLink } from "./locale-link";

export function BrandMark() {
  const t = useTranslations("Common");

  return (
    <LocaleLink
      href="/"
      className="inline-flex min-h-11 items-center gap-2.5 font-display text-[1.45rem] leading-none font-extrabold tracking-[-0.02em] no-underline"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
        className="size-[30px] text-sun"
      >
        <path d="M5 29V15a11 11 0 0 1 22 0v14" />
        <path d="M12 29V16a4 4 0 0 1 8 0v13" />
      </svg>
      {t("brand")}
    </LocaleLink>
  );
}

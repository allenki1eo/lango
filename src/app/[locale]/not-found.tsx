import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/public/locale-link";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="wrap py-16 outline-none">
        <h1 className="mb-2 font-display text-[2rem] leading-tight font-extrabold tracking-display">{t("title")}</h1>
        <p className="mb-6 text-muted">{t("body")}</p>
        <LocaleLink
          href="/"
          className="inline-flex min-h-12 items-center rounded-lg bg-hero px-5 font-semibold text-hero-ink no-underline transition hover:brightness-125"
        >
          {t("back")}
        </LocaleLink>
      </main>
      <SiteFooter />
    </>
  );
}

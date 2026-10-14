import { useTranslations } from "next-intl";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { LocaleLink } from "@/components/public/locale-link";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <>
      <header data-surface="hero" className="bg-hero pb-6 text-hero-ink">
        <div className="wrap">
          <SiteHeader />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap py-16 outline-none">
        <h1 className="mb-2 font-display text-[2rem] leading-tight font-extrabold tracking-display">{t("title")}</h1>
        <p className="mb-6 text-muted">{t("body")}</p>
        <LocaleLink
          href="/"
          className="inline-flex min-h-12 items-center rounded-[14px] bg-teal px-5 font-semibold text-white no-underline transition hover:brightness-110"
        >
          {t("back")}
        </LocaleLink>
      </main>
      <SiteFooter />
    </>
  );
}

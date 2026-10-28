import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/public/locale-link";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <div className="stage">
          <div className="wrap pb-20 text-center">
            <SiteHeader />
            <h1 className="serif-display mt-[clamp(48px,10vw,110px)] text-[clamp(2.75rem,8vw,5rem)]">{t("title")}</h1>
            <p className="mt-4 text-[1.125rem] text-muted">{t("body")}</p>
            <LocaleLink
              href="/"
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-semibold text-primary-ink no-underline transition hover:opacity-90"
            >
              {t("back")}
            </LocaleLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

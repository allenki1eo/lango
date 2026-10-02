import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBox } from "@/components/public/search-box";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { LocaleLink } from "@/components/public/locale-link";
import type { Locale } from "@/lib/i18n/routing";

// Placeholder until local search lands in M1. It keeps the hero's search form from leading to a 404.
export async function generateMetadata({ params }: PageProps<"/[locale]/tafuta">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "SearchPage" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/tafuta">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("SearchPage");

  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? "";

  return (
    <>
      <header data-surface="hero" className="bg-hero pb-8 text-hero-ink">
        <div className="wrap">
          <SiteHeader />
          <h1 className="mt-8 mb-5 font-display text-[clamp(1.75rem,5vw,2.5rem)] leading-tight font-extrabold tracking-display">
            {t("title")}
          </h1>
          <SearchBox defaultValue={query} />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap pt-10 pb-12 outline-none">
        <div className="max-w-[720px] rounded-2xl bg-surface p-6 shadow-card" role="status">
          {query ? <p className="mb-2 text-sm text-muted">{t("youSearched", { query })}</p> : null}
          <h2 className="mb-1 font-display text-xl font-bold">{t("comingSoonTitle")}</h2>
          <p className="text-muted">{t("comingSoonBody")}</p>
          <LocaleLink
            href="/"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-line px-4 font-medium no-underline transition-colors hover:bg-brand-soft"
          >
            {t("back")}
          </LocaleLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

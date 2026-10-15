import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AskBox } from "@/components/public/ask-box";
import { LocaleLink } from "@/components/public/locale-link";
import { PageHeader } from "@/components/public/page-header";
import { ServiceTile } from "@/components/public/service-tile";
import { getAskCopy } from "@/lib/ask-copy";
import { searchServices } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

/** Works without JavaScript: the ask box falls back to this keyword search. */
export async function generateMetadata({ params }: PageProps<"/[locale]/tafuta">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/tafuta">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SearchPage" });
  const n = await getTranslations({ locale, namespace: "Nav" });
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 200) ?? "";
  const hits = query ? searchServices(query, 8) : [];
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader crumbs={[{ href: getPathname({ href: "/", locale }), label: n("home") }]}>
        <h1 className="mt-2 mb-5 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold tracking-display">
          {t("title")}
        </h1>
        <AskBox
          locale={locale}
          action={getPathname({ href: "/tafuta", locale })}
          copy={await getAskCopy(locale)}
          defaultValue={query}
        />
      </PageHeader>
      <div className="wrap pt-8 pb-14">
        {query ? <p className="mb-4 text-muted">{t("youSearched", { query })}</p> : null}
        {hits.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hits.map((s) => (
              <ServiceTile key={s.slug} s={s} locale={locale} />
            ))}
          </div>
        ) : query ? (
          <p>{t("noResults", { query })}</p>
        ) : null}
        <LocaleLink href="/" className="link mt-6 inline-flex min-h-11 items-center font-medium">
          {t("back")}
        </LocaleLink>
      </div>
    </main>
  );
}

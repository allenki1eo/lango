import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AiNote } from "@/components/public/ai-note";
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
      <PageHeader current="search" crumbs={[{ href: getPathname({ href: "/", locale }), label: n("home") }]}>
        <div className="mx-auto max-w-[760px] text-center">
          {/* Before a search the page is the ask box itself, so it is titled for that. */}
          <h1 className="serif-display mt-4 mb-8 text-[clamp(2.75rem,8vw,5rem)]">{query ? t("title") : n("search")}</h1>
          <AskBox
            locale={locale}
            action={getPathname({ href: "/tafuta", locale })}
            copy={await getAskCopy(locale)}
            defaultValue={query}
            note={<AiNote />}
          />
        </div>
      </PageHeader>
      <div className="wrap pt-12 pb-6">
        {query ? <p className="mb-4 text-muted">{t("youSearched", { query })}</p> : null}
        {hits.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

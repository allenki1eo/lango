import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/public/page-header";
import { ServiceTile } from "@/components/public/service-tile";
import { SiteFooter } from "@/components/public/site-footer";
import { catalog, loc, servicesIn } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({ params }: PageProps<"/[locale]/huduma">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Services" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: { canonical: `/${locale}/huduma`, languages: { sw: "/sw/huduma", en: "/en/huduma" } },
  };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/huduma">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Services" });
  return (
    <>
      <PageHeader>
        <h1 className="mt-8 font-display text-[clamp(1.9rem,5vw,2.8rem)] font-extrabold tracking-display">
          {t("title")}
        </h1>
        <p className="text-hero-muted">{t("lede")}</p>
      </PageHeader>
      <main id="main" tabIndex={-1} className="wrap space-y-9 pt-8 pb-14 outline-none">
        {catalog.categories.map((c) => (
          <section key={c.slug}>
            <h2 className="mb-3 font-display text-xl font-bold">{loc(c.name, locale)}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {servicesIn(c.slug).map((s, i) => (
                <ServiceTile key={s.slug} s={s} locale={locale} i={i} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}

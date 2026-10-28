import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/public/icon";
import { PageHeader } from "@/components/public/page-header";
import { ServiceTile } from "@/components/public/service-tile";
import { catalog, loc, servicesIn } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
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
  const n = await getTranslations({ locale, namespace: "Nav" });

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader current="services" crumbs={[{ href: getPathname({ href: "/", locale }), label: n("home") }]}>
        <h1 className="serif-display mt-3 text-[clamp(2.75rem,8vw,5.25rem)]">{t("title")}</h1>
        <p className="mt-4 max-w-[48ch] text-[clamp(1.0625rem,2vw,1.25rem)] text-muted">{t("lede")}</p>
        <nav aria-labelledby="jump" className="mt-8">
          <h2 id="jump" className="mb-3 text-sm font-medium text-muted">
            {t("jump")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {catalog.categories.map((c) => (
              <li key={c.slug}>
                <a
                  href={`#${c.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 text-[0.9375rem] font-medium no-underline shadow-card transition-shadow hover:shadow-float"
                >
                  <Icon name={c.icon} />
                  {loc(c.name, locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <div className="wrap space-y-16 pt-14 pb-6 sm:pt-20">
        {catalog.categories.map((c) => {
          const services = servicesIn(c.slug);
          return (
            <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="scroll-mt-6">
              <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
                <span className="grid size-11 place-items-center rounded-2xl bg-band text-[1.25rem]">
                  <Icon name={c.icon} />
                </span>
                <h2
                  id={`${c.slug}-title`}
                  className="flex-1 text-[clamp(1.5rem,3vw,1.875rem)] font-medium tracking-[-0.035em]"
                >
                  {loc(c.name, locale)}
                </h2>
                <span className="text-sm text-muted">{t("count", { count: services.length })}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s) => (
                  <ServiceTile key={s.slug} s={s} locale={locale} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

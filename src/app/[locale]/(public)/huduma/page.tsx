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
      <PageHeader crumbs={[{ href: getPathname({ href: "/", locale }), label: n("home") }]}>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,5vw,2.8rem)] leading-tight font-extrabold tracking-display">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-[60ch] text-[1.0625rem] text-muted">{t("lede")}</p>
        <nav aria-labelledby="jump" className="mt-6">
          <h2 id="jump" className="mb-2 text-sm font-semibold text-muted">
            {t("jump")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {catalog.categories.map((c) => (
              <li key={c.slug}>
                <a
                  href={`#${c.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[0.9375rem] font-medium no-underline transition-colors hover:border-hero sm:min-h-10"
                >
                  <Icon name={c.icon} className="text-teal" />
                  {loc(c.name, locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <div className="wrap space-y-12 pt-10 pb-16">
        {catalog.categories.map((c) => {
          const services = servicesIn(c.slug);
          return (
            <section key={c.slug} id={c.slug} aria-labelledby={`${c.slug}-title`} className="scroll-mt-4">
              <div className="mb-4 flex items-center gap-3 border-b-2 border-hero pb-3">
                <span className="grid size-10 place-items-center rounded-lg bg-hero text-[1.2rem] text-sun">
                  <Icon name={c.icon} />
                </span>
                <h2
                  id={`${c.slug}-title`}
                  className="flex-1 font-display text-[1.375rem] font-extrabold tracking-display"
                >
                  {loc(c.name, locale)}
                </h2>
                <span className="text-sm text-muted">{t("count", { count: services.length })}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

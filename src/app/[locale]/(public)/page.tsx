import type { Route } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmergencyStrip } from "@/components/public/emergency-strip";
import { Hero } from "@/components/public/hero";
import { Icon } from "@/components/public/icon";
import { ServiceTile } from "@/components/public/service-tile";
import { SiteFooter } from "@/components/public/site-footer";
import { getAskCopy } from "@/lib/ask-copy";
import { catalog, loc, popularServices, servicesIn } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Hero" });
  const h = await getTranslations({ locale, namespace: "Home" });
  const copy = await getAskCopy(locale);

  return (
    <>
      <Hero locale={locale} title={t("title")} subtitle={t("subtitle")} copy={copy} />
      <main id="main" tabIndex={-1} className="wrap space-y-12 pt-10 pb-14 outline-none">
        <section aria-labelledby="popular">
          <h2 id="popular" className="mb-4 font-display text-2xl font-extrabold tracking-display">
            {h("popular")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices().map((s, i) => (
              <ServiceTile key={s.slug} s={s} locale={locale} i={i} />
            ))}
          </div>
        </section>
        <EmergencyStrip locale={locale} title={h("emergency")} />
        <section aria-labelledby="cats">
          <h2 id="cats" className="mb-4 font-display text-2xl font-extrabold tracking-display">
            {h("categories")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.map((c) => (
              <div key={c.slug} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
                  <span className="grid size-9 place-items-center rounded-lg bg-hero text-sun">
                    <Icon name={c.icon} />
                  </span>
                  {loc(c.name, locale)}
                </h3>
                <ul>
                  {servicesIn(c.slug).map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${locale}/huduma/${s.slug}` as Route}
                        className="flex min-h-11 items-center justify-between gap-2 border-t border-line py-1.5 no-underline hover:text-teal"
                      >
                        {loc(s.title, locale)} <Icon name="chevron" className="text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

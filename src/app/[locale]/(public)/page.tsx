import type { Route } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmergencyStrip } from "@/components/public/emergency-strip";
import { Hero } from "@/components/public/hero";
import { TopicCard } from "@/components/public/topic-card";
import { getAskCopy } from "@/lib/ask-copy";
import { catalog, popularServices, servicesIn } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Hero" });
  const h = await getTranslations({ locale, namespace: "Home" });
  const services = getPathname({ href: "/huduma", locale });

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero
        locale={locale}
        copy={{
          title: t("title"),
          subtitle: t("subtitle"),
          popular: h("popular"),
          popularLede: h("popularLede"),
          jump: h("jump"),
        }}
        ask={await getAskCopy(locale)}
        popular={popularServices().slice(0, 6)}
      />
      <section aria-labelledby="topics-title" id="topics" className="scroll-mt-4 bg-band py-12 sm:py-16">
        <div className="wrap">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h2
                id="topics-title"
                className="font-display text-[clamp(1.6rem,4vw,2.1rem)] font-extrabold tracking-display"
              >
                {h("topics")}
              </h2>
              <p className="max-w-[60ch] text-muted">{h("topicsLede")}</p>
            </div>
            <Link href={services as Route} className="link inline-flex min-h-11 items-center font-semibold">
              {h("seeAll")}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.map((c) => (
              <TopicCard
                key={c.slug}
                category={c}
                services={servicesIn(c.slug)}
                locale={locale}
                href={`${services}#${c.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="wrap py-12">
        <EmergencyStrip locale={locale} title={h("emergency")} />
      </div>
    </main>
  );
}

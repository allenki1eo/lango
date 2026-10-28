import type { Route } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmergencyStrip } from "@/components/public/emergency-strip";
import { AgencyWall, DeviceTray, PrivacyNight, SourceSeals } from "@/components/public/feature-art";
import { FeatureRow } from "@/components/public/feature-row";
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
  const g = await getTranslations({ locale, namespace: "Guide" });
  const services = getPathname({ href: "/huduma", locale });
  const agencies = [...new Set(catalog.services.map((s) => s.agency))];
  // Four previews (the CSS cycle is timed for four): popular guides with a verified fee first.
  const popular = popularServices();
  const previews = [...popular.filter((s) => s.fees.length), ...popular.filter((s) => !s.fees.length)].slice(0, 4);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero
        locale={locale}
        copy={{
          title: t("title"),
          subtitle: t("subtitle"),
          previewLabel: h("previewLabel"),
          pause: h("pause"),
          emergencyPill: h("emergencyPill"),
        }}
        ask={await getAskCopy(locale)}
        previews={previews}
        previewCopy={(s) => ({
          steps: h("previewSteps"),
          docs: h("previewDocs"),
          fees: g("fees"),
          checked: h("previewChecked", { date: s.lastChecked }),
        })}
        emergency={catalog.emergency[0]?.number ?? ""}
      />

      <div className="wrap space-y-[clamp(88px,14vw,168px)] py-[clamp(88px,14vw,168px)]">
        <FeatureRow
          id="agencies"
          media={<AgencyWall services={catalog.services} locale={locale} />}
          title={h("agenciesTitle", { count: agencies.length })}
          body={h("agenciesBody")}
          link={{ href: services, label: h("seeAll") }}
        />
        <FeatureRow id="privacy" media={<PrivacyNight />} title={h("privacyTitle")} body={h("privacyBody")} />
        <FeatureRow
          id="sources"
          media={<SourceSeals agencies={agencies} />}
          title={h("sourcesTitle")}
          body={h("sourcesBody")}
        />
        <FeatureRow
          id="no-app"
          media={<DeviceTray />}
          title={h("appTitle")}
          body={h("appBody")}
          link={{ href: getPathname({ href: "/tafuta", locale }), label: h("askLink") }}
        />
      </div>

      <section aria-labelledby="topics-title" id="topics" className="scroll-mt-6">
        <div className="wrap text-center">
          <h2 id="topics-title" className="serif-display text-[clamp(3rem,9vw,6rem)] text-balance">
            {h("topics")}
          </h2>
          <p className="mx-auto mt-6 max-w-[46ch] text-[clamp(1.0625rem,2vw,1.25rem)] text-muted">{h("topicsLede")}</p>
          <Link
            href={services as Route}
            className="mt-8 inline-flex min-h-12 items-center rounded-full bg-band px-6 text-[1.0625rem] font-semibold no-underline transition-colors hover:bg-line"
          >
            {h("seeAll")}
          </Link>
        </div>
        <div className="wrap mt-14 grid max-w-[1240px] items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <div className="wrap max-w-[1240px] py-[clamp(72px,10vw,120px)]">
        <EmergencyStrip locale={locale} title={h("emergency")} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Checklist } from "@/components/public/checklist";
import { Glyph } from "@/components/public/glyph";
import { Icon } from "@/components/public/icon";
import { AgencyStamp } from "@/components/public/agency-stamp";
import { PageHeader } from "@/components/public/page-header";
import { ServiceTile } from "@/components/public/service-tile";
import { catalog, getService, loc, servicesIn } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => catalog.services.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/huduma/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: loc(s.title, locale),
    description: loc(s.summary, locale),
    alternates: {
      canonical: `/${locale}/huduma/${slug}`,
      languages: { sw: `/sw/huduma/${slug}`, en: `/en/huduma/${slug}` },
    },
  };
}

export default async function ServicePage({ params }: PageProps<"/[locale]/huduma/[slug]">) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const s = getService(slug);
  if (!s) notFound();
  const t = await getTranslations({ locale, namespace: "Guide" });
  const a = await getTranslations({ locale, namespace: "Ask" });
  const n = await getTranslations({ locale, namespace: "Nav" });
  const category = catalog.categories.find((c) => c.slug === s.category);
  const servicesPath = getPathname({ href: "/huduma", locale });
  const steps = s.steps.map((x) => loc(x, locale));
  const host = new URL(s.officialUrl).hostname;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: loc(s.title, locale),
    description: loc(s.summary, locale),
    inLanguage: locale,
    step: steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
    supply: s.documents.map((d) => ({ "@type": "HowToSupply", name: loc(d, locale) })),
    url: s.officialUrl,
  };

  const sections = [
    s.documents.length ? { id: "nyaraka", label: t("documents") } : null,
    { id: "hatua", label: t("steps") },
    { id: "ada", label: t("fees") },
    s.contacts.length ? { id: "mawasiliano", label: t("contacts") } : null,
    { id: "vyanzo", label: t("sources") },
  ].filter((x) => x !== null);
  const related = [...servicesIn(s.category), ...catalog.services.filter((x) => x.popular)]
    .filter((x, i, arr) => x.slug !== s.slug && arr.indexOf(x) === i)
    .slice(0, 3);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader
        current="services"
        crumbs={[
          { href: getPathname({ href: "/", locale }), label: n("home") },
          { href: servicesPath, label: n("services") },
          ...(category ? [{ href: `${servicesPath}#${category.slug}`, label: loc(category.name, locale) }] : []),
        ]}
      >
        <div className="mt-4 flex items-center gap-3">
          <AgencyStamp agency={s.agency} icon={s.icon} size="lg" />
          <p className="text-[0.9375rem] text-muted">
            {t("agency")}
            <strong className="block text-lg font-semibold tracking-tight text-ink">{s.agency}</strong>
          </p>
        </div>
        <h1 className="serif-display mt-6 max-w-[16ch] text-[clamp(2.6rem,7.5vw,5rem)] text-balance">
          {loc(s.title, locale)}
        </h1>
        <p className="mt-5 max-w-[56ch] text-[clamp(1.0625rem,2vw,1.25rem)] text-muted">{loc(s.summary, locale)}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={s.officialUrl}
            data-tap={s.slug}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-13 items-center gap-2 rounded-full bg-primary px-6 text-[1.0625rem] font-semibold text-primary-ink no-underline transition hover:opacity-90"
          >
            {t("official")} <Icon name="external" />
          </a>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Glyph name="lock" className="text-ok" />
            {t("leaving", { host })}
          </p>
        </div>
      </PageHeader>
      <div className="wrap grid gap-10 pt-12 pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        <aside className="lg:order-2">
          <nav aria-labelledby="on-this-page" className="rounded-[28px] bg-band p-5 lg:sticky lg:top-6">
            <h2 id="on-this-page" className="mb-1 text-sm font-medium text-muted">
              {t("onThisPage")}
            </h2>
            <ul>
              {sections.map((x) => (
                <li key={x.id}>
                  <a
                    href={`#${x.id}`}
                    className="flex min-h-11 items-center font-medium no-underline hover:underline hover:underline-offset-4"
                  >
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 space-y-14">
          {s.documents.length ? (
            <GuideSection id="nyaraka" title={t("documents")}>
              <ul className="divide-y divide-line rounded-[28px] border border-line bg-surface px-2 shadow-card">
                {s.documents.map((d) => (
                  <li key={d.sw} className="flex gap-3 p-4">
                    <Icon name="check" className="mt-1 text-ok" />
                    {loc(d, locale)}
                  </li>
                ))}
              </ul>
            </GuideSection>
          ) : null}
          <GuideSection id="hatua" title={t("steps")}>
            <p className="-mt-2 mb-4 text-[0.9375rem] text-muted">{t("stepsHint")}</p>
            <Checklist id={s.slug} items={steps} doneLabel={t.raw("done") as string} resetLabel={t("reset")} />
          </GuideSection>
          <GuideSection id="ada" title={t("fees")}>
            <div className="rounded-[28px] bg-band p-5 sm:p-7">
              {s.fees.length ? (
                <dl className="divide-y divide-line">
                  {s.fees.map((f) => (
                    <div key={f.label.sw} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap justify-between gap-x-4">
                        <dt>{loc(f.label, locale)}</dt>
                        <dd className="text-xl font-semibold tracking-tight whitespace-nowrap tabular-nums">
                          {loc(f.amount, locale)}
                        </dd>
                      </div>
                      <a href={f.source} target="_blank" rel="noopener noreferrer" className="link text-sm text-muted">
                        {t("feeSource")}: {new URL(f.source).hostname}
                      </a>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="font-semibold text-hibiscus">{t("noFees")}</p>
              )}
              {s.feeNote ? <p className="mt-3 text-sm text-muted">{loc(s.feeNote, locale)}</p> : null}
            </div>
          </GuideSection>
          {s.contacts.length ? (
            <GuideSection id="mawasiliano" title={t("contacts")}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {s.contacts.map((c) => (
                  <li key={c.value}>
                    <a
                      href={c.href}
                      className="flex min-h-14 items-center gap-3 rounded-3xl border border-line bg-surface p-4 no-underline shadow-card transition-shadow hover:shadow-float"
                    >
                      <Glyph name="phone" />
                      <span>
                        <span className="block text-sm text-muted">{loc(c.label, locale)}</span>
                        <strong>{c.value}</strong>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </GuideSection>
          ) : null}
          <GuideSection id="vyanzo" title={t("sources")}>
            <ul className="space-y-1.5 text-[0.9375rem]">
              {s.sources.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer" className="link break-all">
                    {u.replace(/^https?:\/\//, "").slice(0, 70)}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">{t("lastChecked", { date: s.lastChecked })}</p>
          </GuideSection>
        </div>
      </div>
      <section aria-labelledby="related" className="stage py-12 sm:py-16">
        <div className="wrap">
          <h2 id="related" className="mb-6 text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium tracking-[-0.04em]">
            {a("related")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x) => (
              <ServiceTile key={x.slug} s={x} locale={locale} />
            ))}
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}

function GuideSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="mb-5 text-[clamp(1.75rem,3.6vw,2.25rem)] font-medium tracking-[-0.04em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

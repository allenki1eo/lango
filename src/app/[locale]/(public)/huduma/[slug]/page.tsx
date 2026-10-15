import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Checklist } from "@/components/public/checklist";
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
        crumbs={[
          { href: getPathname({ href: "/", locale }), label: n("home") },
          { href: servicesPath, label: n("services") },
          ...(category ? [{ href: `${servicesPath}#${category.slug}`, label: loc(category.name, locale) }] : []),
        ]}
      >
        <div className="mt-2 flex items-start gap-4">
          <AgencyStamp agency={s.agency} icon={s.icon} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">
              {t("agency")}: {s.agency}
            </p>
            <h1 className="font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05] font-extrabold tracking-display text-balance">
              {loc(s.title, locale)}
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-[62ch] text-[1.0625rem] text-muted">{loc(s.summary, locale)}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={s.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-hero px-5 font-display font-bold text-hero-ink no-underline transition hover:brightness-125"
          >
            {t("official")} <Icon name="external" />
          </a>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon name="lock" className="text-ok" />
            {t("leaving", { host })}
          </p>
        </div>
      </PageHeader>
      <div className="wrap grid gap-8 pt-9 pb-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <aside className="lg:order-2">
          <nav
            aria-labelledby="on-this-page"
            className="rounded-lg border border-line bg-surface p-4 lg:sticky lg:top-4"
          >
            <h2 id="on-this-page" className="mb-1 font-display font-bold">
              {t("onThisPage")}
            </h2>
            <ul>
              {sections.map((x) => (
                <li key={x.id}>
                  <a href={`#${x.id}`} className="link flex min-h-10 items-center">
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 space-y-10">
          {s.documents.length ? (
            <GuideSection id="nyaraka" title={t("documents")}>
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {s.documents.map((d) => (
                  <li key={d.sw} className="flex gap-3 p-3.5">
                    <Icon name="check" className="mt-1 text-ok" />
                    {loc(d, locale)}
                  </li>
                ))}
              </ul>
            </GuideSection>
          ) : null}
          <GuideSection id="hatua" title={t("steps")}>
            <p className="-mt-1 mb-3 text-sm text-muted">{t("stepsHint")}</p>
            <Checklist id={s.slug} items={steps} doneLabel={t.raw("done") as string} resetLabel={t("reset")} />
          </GuideSection>
          <GuideSection id="ada" title={t("fees")}>
            <div className="rounded-lg border-l-8 border-teal bg-teal-soft p-4 sm:p-5">
              {s.fees.length ? (
                <dl className="divide-y divide-line">
                  {s.fees.map((f) => (
                    <div key={f.label.sw} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap justify-between gap-x-4">
                        <dt>{loc(f.label, locale)}</dt>
                        <dd className="font-display text-lg font-extrabold whitespace-nowrap">
                          {loc(f.amount, locale)}
                        </dd>
                      </div>
                      <a href={f.source} target="_blank" rel="noopener noreferrer" className="link text-xs">
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
                      className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-surface p-3 no-underline hover:border-hero"
                    >
                      <Icon name="phone" className="text-teal" />
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
      <section aria-labelledby="related" className="border-t border-line bg-band py-12">
        <div className="wrap">
          <h2 id="related" className="mb-4 font-display text-[1.375rem] font-extrabold tracking-display">
            {a("related")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4">
      <h2
        id={`${id}-title`}
        className="mb-3 border-b border-line pb-2 font-display text-[1.375rem] font-extrabold tracking-display"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

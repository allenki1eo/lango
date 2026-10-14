import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Checklist } from "@/components/public/checklist";
import { Icon } from "@/components/public/icon";
import { PageHeader } from "@/components/public/page-header";
import { ServiceTile } from "@/components/public/service-tile";
import { SiteFooter } from "@/components/public/site-footer";
import { catalog, getService, loc, servicesIn } from "@/lib/catalog";
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

  return (
    <>
      <PageHeader>
        <div className="mt-8 flex items-start gap-4">
          <span className="grid size-14 flex-none place-items-center rounded-2xl bg-sun text-[1.6rem] text-sun-ink">
            <Icon name={s.icon} />
          </span>
          <div>
            <p className="text-sm text-hero-muted">
              {t("agency")}: {s.agency}
            </p>
            <h1 className="font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05] font-extrabold tracking-display text-balance">
              {loc(s.title, locale)}
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-[60ch] text-hero-muted">{loc(s.summary, locale)}</p>
        <a
          href={s.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-sun px-5 font-display font-bold text-sun-ink no-underline hover:brightness-105"
        >
          {t("official")} <Icon name="external" /> <span className="text-sm font-normal">{host}</span>
        </a>
      </PageHeader>
      <main id="main" tabIndex={-1} className="wrap grid gap-8 pt-8 pb-14 outline-none lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {s.documents.length ? (
            <section>
              <h2 className="mb-3 font-display text-xl font-bold">{t("documents")}</h2>
              <ul className="space-y-2">
                {s.documents.map((d) => (
                  <li key={d.sw} className="flex gap-2.5 rounded-xl bg-surface p-3 shadow-card">
                    <Icon name="check" className="mt-1 text-teal" />
                    {loc(d, locale)}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section>
            <h2 className="mb-1 font-display text-xl font-bold">{t("steps")}</h2>
            <p className="mb-3 text-sm text-muted">{t("stepsHint")}</p>
            <Checklist id={s.slug} items={steps} doneLabel={t.raw("done") as string} resetLabel={t("reset")} />
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h2 className="mb-2 font-display text-lg font-bold">{t("fees")}</h2>
            {s.fees.length ? (
              <ul className="space-y-2">
                {s.fees.map((f) => (
                  <li key={f.label.sw} className="border-b border-line pb-2">
                    <div className="flex justify-between gap-3">
                      <span>{loc(f.label, locale)}</span>
                      <strong className="whitespace-nowrap">{loc(f.amount, locale)}</strong>
                    </div>
                    <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-muted">
                      {t("feeSource")}: {new URL(f.source).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-semibold text-hibiscus">{t("noFees")}</p>
            )}
            {s.feeNote ? <p className="mt-2 text-sm text-muted">{loc(s.feeNote, locale)}</p> : null}
          </section>
          {s.contacts.length ? (
            <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <h2 className="mb-2 font-display text-lg font-bold">{t("contacts")}</h2>
              <ul>
                {s.contacts.map((c) => (
                  <li key={c.value}>
                    <a href={c.href} className="flex min-h-11 items-center gap-2">
                      <Icon name="phone" className="text-teal" />
                      {loc(c.label, locale)}: <strong>{c.value}</strong>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="rounded-2xl border border-line bg-surface p-4 text-sm shadow-card">
            <h2 className="mb-2 font-display text-lg font-bold">{t("sources")}</h2>
            <ul className="space-y-1.5">
              {s.sources.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer" className="break-all">
                    {u.replace(/^https?:\/\//, "").slice(0, 70)}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted">{t("lastChecked", { date: s.lastChecked })}</p>
          </section>
        </aside>
        <section className="lg:col-span-2">
          <h2 className="mb-3 font-display text-xl font-bold">{a("related")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...servicesIn(s.category), ...catalog.services.filter((x) => x.popular)]
              .filter((x, i, arr) => x.slug !== s.slug && arr.indexOf(x) === i)
              .slice(0, 3)
              .map((x, i) => (
                <ServiceTile key={x.slug} s={x} locale={locale} i={i} />
              ))}
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteFooter />
    </>
  );
}

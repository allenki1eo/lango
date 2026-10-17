import type { Route } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { catalog, loc, popularServices } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { BrandMark } from "./brand-mark";
import { HankiBadge } from "./hanki-badge";
import { Icon } from "./icon";
import { VisitorCount } from "./visitor-count";

/** Return-to-top band, link columns on the brand colour, then the identifier with the disclaimer. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const locale = useLocale() as Locale;
  const services = getPathname({ href: "/huduma", locale });

  return (
    <footer>
      <div className="border-t border-line bg-band">
        <div className="wrap py-2">
          <a href="#top" className="link inline-flex min-h-11 items-center gap-1 font-medium">
            <Icon name="up" />
            {t("top")}
          </a>
        </div>
      </div>
      <div data-surface="hero" className="bg-hero text-hero-ink">
        <div className="wrap grid gap-x-8 gap-y-9 py-11 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <BrandMark />
            <p className="max-w-[30ch] text-hero-muted">{t("tagline")}</p>
          </div>
          <FooterColumn title={t("topics")}>
            {catalog.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`${services}#${c.slug}` as Route} className="link">
                  {loc(c.name, locale)}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title={t("popular")}>
            {popularServices()
              .slice(0, 8)
              .map((s) => (
                <li key={s.slug}>
                  <Link href={`/${locale}/huduma/${s.slug}` as Route} className="link">
                    {loc(s.title, locale)}
                  </Link>
                </li>
              ))}
          </FooterColumn>
          <FooterColumn title={t("emergency")}>
            {catalog.emergency.map((e) => (
              <li key={e.number}>
                <a href={`tel:${e.number}`} className="link">
                  <strong className="font-display text-sun">{e.number}</strong> {loc(e.label, locale)}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>
      </div>
      <div data-surface="hero" className="bg-[color-mix(in_oklab,var(--hero)_82%,black)] text-hero-muted">
        <div className="wrap space-y-2 py-7 text-[0.9375rem]">
          <p className="max-w-[75ch]">{t("disclaimer")}</p>
          <p className="max-w-[75ch]">{t("privacy")}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <HankiBadge label={t("by")} />
            <VisitorCount label={t("visitors")} todayLabel={t("visitorsToday")} hint={t("visitorsHint")} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {/* Full-height touch targets in two columns on phones; a compact list from the small breakpoint up. */}
      <ul className="grid grid-cols-2 gap-x-4 text-[0.9375rem] sm:block sm:space-y-1.5 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:py-1 sm:[&_a]:min-h-0 sm:[&_a]:py-0">
        {children}
      </ul>
    </section>
  );
}

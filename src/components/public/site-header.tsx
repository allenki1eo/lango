import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { BrandMark } from "./brand-mark";
import { Icon } from "./icon";
import { LanguageSwitch } from "./language-switch";
import { NavLinks, type NavItem } from "./nav-links";

/** White identity bar with the language switch, then the primary navigation on the brand colour. */
export function SiteHeader() {
  const t = useTranslations("Nav");
  const l = useTranslations("Language");
  const locale = useLocale() as Locale;
  const home = getPathname({ href: "/", locale });
  const items: NavItem[] = [
    { href: home, label: t("home"), match: "exact" },
    { href: getPathname({ href: "/huduma", locale }), label: t("services"), match: "prefix" },
    { href: getPathname({ href: "/tafuta", locale }), label: t("search"), match: "prefix" },
    { href: `${home}#dharura`, label: t("emergency"), match: "none" },
  ];

  return (
    <header className="relative z-30 bg-surface">
      <div className="wrap flex min-h-[72px] items-center justify-between gap-3 py-2">
        <BrandMark />
        <div className="flex items-center gap-2">
          <LanguageSwitch
            active={locale}
            label={l("label")}
            names={{ sw: l("sw"), en: l("en") }}
            icon={<Icon name="globe" className="sm:hidden" />}
          />
          <details className="group md:hidden">
            <summary
              aria-label={t("menu")}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-hero px-3.5 font-semibold text-hero-ink"
            >
              <Icon name="menu" />
              <span className="sr-only sm:not-sr-only">{t("menu")}</span>
            </summary>
            <nav
              aria-label={t("label")}
              className="absolute inset-x-0 top-full border-y border-line bg-surface shadow-float"
            >
              <NavLinks items={items} variant="menu" />
            </nav>
          </details>
        </div>
      </div>
      <nav
        aria-label={t("label")}
        data-surface="hero"
        className="kanga hidden bg-hero pb-1.5 text-hero-ink [--kanga-height:6px] md:block"
      >
        <div className="wrap">
          <NavLinks items={items} variant="bar" />
        </div>
      </nav>
      <div aria-hidden="true" className="kanga h-1.5 [--kanga-height:6px] md:hidden" />
    </header>
  );
}

import type { Route } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { BrandMark } from "./brand-mark";
import { Glyph } from "./glyph";
import { Icon } from "./icon";
import { LanguageSwitch } from "./language-switch";

export type Section = "home" | "services" | "search";

/**
 * The wordmark on the left; a quiet language toggle and a single "Menyu" pill on the right.
 * The menu is a native <details> dropdown and the current page is marked on the server, so it ships no JavaScript.
 * It sits inside each page's stage card, so a new page always starts with the menu closed.
 */
export function SiteHeader({ current }: { current?: Section }) {
  const t = useTranslations("Nav");
  const l = useTranslations("Language");
  const locale = useLocale() as Locale;
  const home = getPathname({ href: "/", locale });
  const items: { href: string; label: string; section?: Section }[] = [
    { href: home, label: t("home"), section: "home" },
    { href: getPathname({ href: "/huduma", locale }), label: t("services"), section: "services" },
    { href: getPathname({ href: "/tafuta", locale }), label: t("search"), section: "search" },
    { href: `${home}#dharura`, label: t("emergency") },
  ];

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 pt-4 sm:pt-7">
      <BrandMark />
      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitch
          active={locale}
          label={l("label")}
          names={{ sw: l("sw"), en: l("en") }}
          icon={<Glyph name="globe" />}
        />
        <details className="group relative">
          <summary className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink transition hover:opacity-90">
            {t("menu")}
          </summary>
          <nav
            aria-label={t("label")}
            className="absolute top-full right-0 mt-2 w-[min(17rem,calc(100vw-2.5rem))] rounded-[28px] border border-line bg-surface p-2 text-ink shadow-float"
          >
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    aria-current={item.section && item.section === current ? "page" : undefined}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-[20px] px-4 text-[1.0625rem] font-medium no-underline transition-colors hover:bg-band aria-[current=page]:bg-band aria-[current=page]:font-semibold"
                  >
                    {item.label}
                    <Icon name="chevron" className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}

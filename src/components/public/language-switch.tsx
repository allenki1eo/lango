"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { routing, rememberLocale, type Locale } from "@/lib/i18n/routing";

type LanguageSwitchProps = {
  active: Locale;
  label: string;
  names: Record<Locale, string>;
};

/** Swaps the locale prefix of the current path. Uses only Next.js primitives to keep public JS small. */
function withLocale(pathname: string, locale: Locale): string {
  const [, , ...rest] = pathname.split("/");
  return `/${[locale, ...rest].filter(Boolean).join("/")}`;
}

export function LanguageSwitch({ active, label, names }: LanguageSwitchProps) {
  const pathname = usePathname();
  const router = useRouter();

  function choose(event: MouseEvent<HTMLAnchorElement>, locale: Locale, href: string) {
    rememberLocale(locale);

    // Carry the query string (for example a search) across, without opting pages into dynamic rendering.
    const { search } = window.location;
    if (!search || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    router.replace(`${href}${search}` as Route, { scroll: false });
  }

  return (
    <nav aria-label={label} className="inline-flex rounded-full bg-white/12 p-[3px]">
      {routing.locales.map((locale) => {
        const href = withLocale(pathname, locale);
        const isActive = locale === active;
        return (
          <Link
            key={locale}
            href={href as Route}
            lang={locale}
            hrefLang={locale}
            replace
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            onClick={isActive ? undefined : (event) => choose(event, locale, href)}
            className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold text-hero-ink no-underline transition-colors hover:bg-white/10 aria-[current=true]:bg-sun aria-[current=true]:text-sun-ink sm:min-h-9"
          >
            {names[locale]}
          </Link>
        );
      })}
    </nav>
  );
}

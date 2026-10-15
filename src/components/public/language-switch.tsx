"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { routing, rememberLocale, type Locale } from "@/lib/i18n/routing";

type LanguageSwitchProps = {
  active: Locale;
  label: string;
  names: Record<Locale, string>;
  /** Shown before the label on small screens. Rendered on the server so icons stay out of the client bundle. */
  icon?: ReactNode;
};

/** Swaps the locale prefix of the current path. Uses only Next.js primitives to keep public JS small. */
function withLocale(pathname: string, locale: Locale): string {
  const [, , ...rest] = pathname.split("/");
  return `/${[locale, ...rest].filter(Boolean).join("/")}`;
}

export function LanguageSwitch({ active, label, names, icon }: LanguageSwitchProps) {
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
    // On small screens only the other language shows, as a single toggle; wider screens show both.
    <nav aria-label={label} className="inline-flex rounded-full sm:border sm:border-line sm:p-[3px]">
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-semibold no-underline transition-colors hover:bg-band aria-[current=true]:bg-sun aria-[current=true]:text-sun-ink max-sm:aria-[current=true]:hidden sm:min-h-9 sm:border-0"
          >
            {icon}
            {names[locale]}
          </Link>
        );
      })}
    </nav>
  );
}

import type { Route } from "next";
import Link from "next/link";
import { loc, type Service } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { AskCopy } from "./ask-box";
import { AskBox } from "./ask-box";
import { Icon } from "./icon";

type HeroCopy = { title: string; subtitle: string; popular: string; popularLede: string; jump: string };

/**
 * Home hero. The ask box stays the focal point on the left; on the right a "most searched" card gives
 * one-tap routes to the busiest services, like the "How do I…" shortcuts of government service sites.
 */
export function Hero({
  locale,
  copy,
  ask,
  popular,
}: {
  locale: Locale;
  copy: HeroCopy;
  ask: AskCopy;
  popular: Service[];
}) {
  return (
    <section data-surface="hero" className="kanga relative overflow-hidden bg-hero pb-14 text-hero-ink">
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -top-10 -right-28 w-[420px] text-sun opacity-[0.12] lg:right-[-60px]"
      >
        {/* The arch motif: the brand mark's doorway, drawn large. */}
        <path d="M60 400V190a140 140 0 0 1 280 0v210" fill="none" stroke="currentColor" strokeWidth="34" />
        <path d="M140 400v-90a60 60 0 0 1 120 0v90" fill="none" stroke="currentColor" strokeWidth="26" />
      </svg>
      <div className="wrap relative grid gap-10 pt-[clamp(32px,6vw,64px)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <h1 className="mb-3 max-w-[16ch] font-display text-[clamp(2.1rem,6vw,3.6rem)] leading-[1.02] font-extrabold tracking-display text-balance">
            {copy.title}
          </h1>
          <p className="mb-7 max-w-[48ch] text-[1.0625rem] text-hero-muted">{copy.subtitle}</p>
          <AskBox locale={locale} action={getPathname({ href: "/tafuta", locale })} copy={ask} />
        </div>
        <section
          aria-labelledby="popular"
          data-surface="light"
          className="rounded-xl bg-surface p-5 text-ink shadow-float sm:p-6"
        >
          <h2 id="popular" className="font-display text-xl font-extrabold tracking-display">
            {copy.popular}
          </h2>
          <p className="mb-3 text-[0.9375rem] text-muted">{copy.popularLede}</p>
          <ul className="divide-y divide-line border-y border-line">
            {popular.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${locale}/huduma/${s.slug}` as Route}
                  className="group flex min-h-12 items-center gap-3 py-1.5 font-semibold no-underline"
                >
                  <span className="grid size-8 flex-none place-items-center rounded-md bg-teal-soft text-teal">
                    <Icon name={s.icon} />
                  </span>
                  <span className="flex-1 text-link underline decoration-transparent underline-offset-3 group-hover:decoration-current">
                    {loc(s.title, locale)}
                  </span>
                  <Icon name="chevron" className="text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
          <a href="#topics" className="link mt-3 inline-flex min-h-11 items-center gap-1 font-semibold">
            <Icon name="down" />
            {copy.jump}
          </a>
        </section>
      </div>
    </section>
  );
}

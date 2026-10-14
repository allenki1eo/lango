import type { Locale } from "@/lib/i18n/routing";
import { getPathname } from "@/lib/i18n/navigation";
import type { AskCopy } from "./ask-box";
import { AskBox } from "./ask-box";
import { SiteHeader } from "./site-header";

/** Indigo hero with a kanga-style border; the ask box is the focal point. */
export function Hero({
  locale,
  title,
  subtitle,
  copy,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  copy: AskCopy;
}) {
  return (
    <header data-surface="hero" className="kanga relative overflow-hidden bg-hero pb-12 text-hero-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-[340px] rounded-full border-[28px] border-sun/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-[300px] rounded-full border-[22px] border-teal-light/15"
      />
      <div className="wrap relative">
        <SiteHeader />
        <h1 className="mt-[clamp(28px,6vw,60px)] mb-3 max-w-[16ch] font-display text-[clamp(2.1rem,6.4vw,3.9rem)] leading-[1.02] font-extrabold tracking-display text-balance">
          {title}
        </h1>
        <p className="mb-6 max-w-[48ch] text-[1.0625rem] text-hero-muted">{subtitle}</p>
        <AskBox locale={locale} action={getPathname({ href: "/tafuta", locale })} copy={copy} />
      </div>
    </header>
  );
}

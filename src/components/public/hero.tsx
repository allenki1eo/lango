import type { CSSProperties } from "react";
import type { Service } from "@/lib/catalog";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { AiNote } from "./ai-note";
import type { AskCopy } from "./ask-box";
import { AskBox } from "./ask-box";
import { Glyph } from "./glyph";
import { Icon } from "./icon";
import { PreviewCard, type PreviewCopy } from "./preview-card";
import { SiteHeader } from "./site-header";

type HeroCopy = { title: string; subtitle: string; previewLabel: string; pause: string; emergencyPill: string };

/**
 * Home stage, after America.gov's front door: a quiet serif greeting, then the ask box on an indigo panel
 * with rotating previews of real guides beneath it. The previews are pure CSS, so the page adds no JavaScript.
 */
export function Hero({
  locale,
  copy,
  ask,
  previews,
  previewCopy,
  emergency,
}: {
  locale: Locale;
  copy: HeroCopy;
  ask: AskCopy;
  previews: Service[];
  previewCopy: (s: Service) => PreviewCopy;
  emergency: string;
}) {
  return (
    <section className="stage pb-6 sm:pb-8">
      <div className="wrap">
        <SiteHeader current="home" />
        <div className="mx-auto max-w-[860px] pt-[clamp(36px,8vw,84px)] text-center">
          <h1 className="serif-display text-[clamp(3.25rem,11vw,6.75rem)] text-balance">{copy.title}</h1>
          <p className="mx-auto mt-4 max-w-[30ch] text-[clamp(1.125rem,2.4vw,1.4rem)] leading-snug text-muted sm:mt-6">
            {copy.subtitle}
          </p>
        </div>

        <div className="preview-stage mx-auto mt-9 max-w-[800px] sm:mt-12">
          <div
            data-surface="hero"
            className="relative isolate overflow-hidden rounded-[36px] bg-hero px-2 pt-2 pb-6 text-hero-ink shadow-float sm:rounded-[44px] sm:px-3 sm:pt-3 sm:pb-8"
          >
            <PanelArt />
            <AskBox locale={locale} action={getPathname({ href: "/tafuta", locale })} copy={ask} note={<AiNote />} />
            <div
              role="img"
              aria-label={copy.previewLabel}
              className="preview-slides relative mx-auto mt-7 h-[232px] max-w-[540px] px-2 sm:mt-9 sm:h-[244px]"
            >
              {previews.map((s, i) => (
                <div
                  key={`${s.slug}-${i}`}
                  aria-hidden="true"
                  className="preview-slide absolute inset-x-2"
                  style={{ "--i": i } as CSSProperties}
                >
                  <PreviewCard s={s} locale={locale} copy={previewCopy(s)} />
                </div>
              ))}
            </div>
          </div>
          <div className="preview-pause-control mt-5 flex justify-center">
            <label className="grid size-12 cursor-pointer place-items-center rounded-full bg-ink/7 text-ink transition-colors hover:bg-ink/12 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
              <input type="checkbox" className="preview-pause peer sr-only" />
              <Glyph name="pause" className="peer-checked:hidden" />
              <Glyph name="play" className="hidden peer-checked:block" />
              <span className="sr-only">{copy.pause}</span>
            </label>
          </div>
        </div>

        <a
          href="#dharura"
          className="mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-[0.9375rem] font-medium no-underline shadow-card transition-shadow hover:shadow-float"
        >
          <span className="rounded-full bg-hibiscus px-2.5 py-1 text-xs font-semibold text-white">{emergency}</span>
          {copy.emergencyPill}
          <Icon name="chevron" className="text-muted" />
        </a>
      </div>
    </section>
  );
}

/** Soft light pools and the Lango arch, drawn behind the panel's content. */
function PanelArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-1/3 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_112_255/0.35),transparent)]" />
      <div className="absolute -bottom-1/2 -left-24 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(63_193_184/0.22),transparent)]" />
      <svg viewBox="0 0 400 400" className="absolute -right-24 -bottom-24 w-[380px] text-white opacity-[0.05]">
        <path d="M60 400V190a140 140 0 0 1 280 0v210" fill="none" stroke="currentColor" strokeWidth="34" />
        <path d="M140 400v-90a60 60 0 0 1 120 0v90" fill="none" stroke="currentColor" strokeWidth="26" />
      </svg>
    </div>
  );
}

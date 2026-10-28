import type { Route } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { HankiBadge } from "./hanki-badge";
import { VisitorCount } from "./visitor-count";

/** A few big serif links, the wordmark set huge, then credits, the disclaimer and a thin kanga edge. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const n = useTranslations("Nav");
  const c = useTranslations("Common");
  const locale = useLocale() as Locale;
  const home = getPathname({ href: "/", locale });
  const links = [
    { href: getPathname({ href: "/huduma", locale }), label: n("services") },
    { href: getPathname({ href: "/tafuta", locale }), label: n("search") },
    { href: `${home}#dharura`, label: t("emergency") },
  ];

  return (
    <footer className="kanga pb-[6px] [--kanga-height:6px]">
      <div className="wrap pt-[clamp(80px,12vw,150px)] pb-10 text-center">
        <nav aria-label={t("nav")}>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href as Route}
                  className="serif-display inline-flex min-h-11 items-center text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[1.1] no-underline transition-opacity hover:opacity-60"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p
          aria-hidden="true"
          className="serif-display mt-[clamp(56px,9vw,110px)] pb-[0.18em] text-[clamp(7rem,34vw,22rem)] leading-[0.8] tracking-[-0.06em] select-none"
        >
          {c("brand")}
        </p>

        <div className="mt-10 grid items-center gap-6 text-[0.9375rem] sm:grid-cols-3">
          <div className="flex justify-center sm:justify-start">
            <HankiBadge label={t("by")} />
          </div>
          <div className="flex items-center justify-center gap-3">
            <Laurel />
            <p className="leading-tight">
              <strong className="block font-semibold">{t("credit")}</strong>
              <span className="text-muted">{t("creditSub")}</span>
            </p>
            <Laurel flip />
          </div>
          <div className="flex justify-center sm:justify-end">
            <VisitorCount label={t("visitors")} todayLabel={t("visitorsToday")} hint={t("visitorsHint")} />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[70ch] space-y-1.5 text-sm text-muted">
          <p>{t("disclaimer")}</p>
          <p>{t("privacy")}</p>
        </div>
      </div>
    </footer>
  );
}

/** A small laurel sprig, mirrored on the other side of the credit. */
function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 64"
      aria-hidden="true"
      focusable="false"
      className={`h-16 w-auto flex-none text-ink ${flip ? "-scale-x-100" : ""}`}
    >
      <path d="M18 62C8 50 6 30 14 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {[8, 16, 24, 32, 40, 48].map((y, i) => (
        <ellipse
          key={y}
          cx={i % 2 ? 15 : 7}
          cy={y + 4}
          rx="2.4"
          ry="5.5"
          fill="currentColor"
          transform={`rotate(${i % 2 ? 35 : -35} ${i % 2 ? 15 : 7} ${y + 4})`}
        />
      ))}
    </svg>
  );
}

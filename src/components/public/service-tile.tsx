import type { Route } from "next";
import Link from "next/link";
import { loc, type Service } from "@/lib/catalog";
import { AgencyStamp } from "./agency-stamp";

/** A service card: agency stamp, linked title and the one-line summary, all one tap target. */
export function ServiceTile({ s, locale }: { s: Service; locale: string }) {
  return (
    <Link
      href={`/${locale}/huduma/${s.slug}` as Route}
      className="group flex h-full gap-3.5 rounded-lg border border-line bg-surface p-4 no-underline transition-[border-color,box-shadow] hover:border-hero hover:shadow-card"
    >
      <AgencyStamp agency={s.agency} icon={s.icon} />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.0625rem] leading-snug font-bold text-link underline decoration-transparent underline-offset-3 transition-[text-decoration-color] group-hover:decoration-current">
          {loc(s.title, locale)}
        </span>
        <span className="mt-1 line-clamp-2 block text-[0.9375rem] text-muted">{loc(s.summary, locale)}</span>
      </span>
    </Link>
  );
}

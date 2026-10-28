import { loc, type Service } from "@/lib/catalog";
import { AgencyStamp } from "./agency-stamp";
import { Glyph } from "./glyph";

export type PreviewCopy = { steps: string; docs: string; fees: string; checked: string };

/** A miniature of a Lango guide, built from the catalog, shown in the hero's rotating previews. */
export function PreviewCard({ s, locale, copy }: { s: Service; locale: string; copy: PreviewCopy }) {
  const fee = s.fees[0];
  return (
    <div data-surface="light" className="rounded-[28px] bg-surface p-5 text-left text-ink shadow-float sm:p-6">
      <div className="flex items-center gap-3">
        <AgencyStamp agency={s.agency} icon={s.icon} />
        <div className="min-w-0">
          <p className="truncate text-lg leading-tight font-semibold tracking-tight">{loc(s.title, locale)}</p>
          <p className="line-clamp-1 text-sm text-muted">{loc(s.summary, locale)}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl bg-band py-3 text-center">
        <Stat label={copy.steps} value={String(s.steps.length)} />
        <Stat label={copy.docs} value={String(s.documents.length)} />
        <Stat label={copy.fees} value={fee ? loc(fee.amount, locale) : "—"} />
      </dl>
      <p className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
        <span className="flex min-w-0 items-center gap-1.5">
          <Glyph name="lock" className="text-ok" />
          <span className="truncate">{new URL(s.officialUrl).hostname}</span>
        </span>
        <span className="hidden whitespace-nowrap sm:inline">{copy.checked}</span>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-[0.9375rem] leading-tight font-semibold tabular-nums sm:text-base">{value}</dd>
    </div>
  );
}

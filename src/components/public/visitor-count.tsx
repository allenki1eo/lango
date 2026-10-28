/**
 * Tiny public counter for the footer. Rendered on the server as an empty shell;
 * VisitBeacon's inline script fills in the numbers from the edge-cached /api/wageni after the page has loaded,
 * so this adds no JavaScript of its own.
 */
export function VisitorCount({ label, todayLabel, hint }: { label: string; todayLabel: string; hint: string }) {
  return (
    <p
      title={hint}
      data-wageni=""
      aria-live="polite"
      className="inline-flex min-h-8 items-center gap-2 rounded-full bg-band px-3.5 text-sm text-muted opacity-0 transition-opacity duration-300"
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-sun" />
      <span>
        {label}:{" "}
        <strong data-n="visitors" className="font-semibold text-ink tabular-nums after:content-[attr(data-v)]" />
      </span>
      <span data-today="" hidden>
        · {todayLabel}:{" "}
        <strong data-n="today" className="font-semibold text-ink tabular-nums after:content-[attr(data-v)]" />
      </span>
      <span className="sr-only">({hint})</span>
    </p>
  );
}

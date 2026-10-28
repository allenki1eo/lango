import { catalog, loc } from "@/lib/catalog";
import { Icon } from "./icon";

/** Free emergency numbers as big tap-to-call tiles on a soft hibiscus card. */
export function EmergencyStrip({ locale, title }: { locale: string; title: string }) {
  return (
    <section
      id="dharura"
      aria-labelledby="dharura-title"
      className="scroll-mt-6 rounded-[36px] bg-hibiscus-soft p-6 sm:rounded-[44px] sm:p-10"
    >
      <h2
        id="dharura-title"
        className="mb-6 flex items-center gap-3 text-[clamp(1.6rem,3.4vw,2.25rem)] font-medium tracking-[-0.035em]"
      >
        <Icon name="siren" className="text-hibiscus" /> {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {catalog.emergency.map((e) => (
          <li key={e.number}>
            <a
              href={`tel:${e.number}`}
              className="flex min-h-20 flex-col justify-center rounded-3xl bg-surface px-4 py-3 no-underline shadow-card transition-shadow hover:shadow-float"
            >
              <span className="serif-display text-[2.25rem] text-hibiscus">{e.number}</span>
              <span className="mt-1 text-sm text-muted">{loc(e.label, locale)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

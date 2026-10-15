import { catalog, loc } from "@/lib/catalog";
import { Icon } from "./icon";

/** Free emergency numbers as an emergency alert: a hibiscus rule, a pale wash and big tap-to-call tiles. */
export function EmergencyStrip({ locale, title }: { locale: string; title: string }) {
  return (
    <section
      id="dharura"
      aria-labelledby="dharura-title"
      className="scroll-mt-4 rounded-lg border-l-8 border-hibiscus bg-hibiscus-soft p-5 sm:p-6"
    >
      <h2 id="dharura-title" className="mb-4 flex items-center gap-2 font-display text-xl font-extrabold">
        <Icon name="siren" className="text-hibiscus" /> {title}
      </h2>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {catalog.emergency.map((e) => (
          <li key={e.number}>
            <a
              href={`tel:${e.number}`}
              className="flex min-h-16 flex-col justify-center rounded-md border border-line bg-surface px-3 py-2.5 no-underline transition-colors hover:border-hibiscus"
            >
              <span className="font-display text-[1.75rem] leading-none font-extrabold text-hibiscus">{e.number}</span>
              <span className="mt-1 text-sm">{loc(e.label, locale)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

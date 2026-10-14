import { catalog, loc } from "@/lib/catalog";
import { Icon } from "./icon";

export function EmergencyStrip({ locale, title }: { locale: string; title: string }) {
  return (
    <section aria-labelledby="dharura" className="rounded-3xl bg-hibiscus p-5 text-white sm:p-6">
      <h2 id="dharura" className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
        <Icon name="siren" /> {title}
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {catalog.emergency.map((e) => (
          <li key={e.number}>
            <a
              href={`tel:${e.number}`}
              className="flex min-h-16 flex-col justify-center rounded-2xl bg-white/12 px-3 py-2 no-underline hover:bg-white/20"
            >
              <span className="font-display text-2xl leading-none font-extrabold">{e.number}</span>
              <span className="text-sm">{loc(e.label, locale)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

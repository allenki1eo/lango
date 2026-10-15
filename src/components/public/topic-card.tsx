import type { Route } from "next";
import Link from "next/link";
import { loc, type Category, type Service } from "@/lib/catalog";
import { Icon } from "./icon";

/** A topic in the home grid: icon, the topic title (to its section of all services) and its services. */
export function TopicCard({
  category,
  services,
  locale,
  href,
}: {
  category: Category;
  services: Service[];
  locale: string;
  href: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <span className="mb-3 grid size-12 place-items-center rounded-lg bg-hero text-[1.35rem] text-sun">
        <Icon name={category.icon} />
      </span>
      <h3 className="mb-1 font-display text-lg leading-snug font-bold">
        <Link href={href as Route} className="link inline-flex min-h-11 items-center">
          {loc(category.name, locale)}
        </Link>
      </h3>
      <ul>
        {services.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/${locale}/huduma/${s.slug}` as Route}
              className="group flex min-h-11 items-center justify-between gap-2 border-t border-line py-1.5 no-underline"
            >
              <span className="group-hover:text-link group-hover:underline">{loc(s.title, locale)}</span>
              <Icon name="chevron" className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

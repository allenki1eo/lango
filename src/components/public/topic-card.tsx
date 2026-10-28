import type { Route } from "next";
import Link from "next/link";
import { loc, type Category, type Service } from "@/lib/catalog";
import { Icon } from "./icon";

/** A topic card in the home grid: icon, the topic title (to its section of all services) and its services. */
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
    <article className="rounded-[28px] border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid size-11 flex-none place-items-center rounded-2xl bg-band text-[1.3rem]">
          <Icon name={category.icon} />
        </span>
        <h3 className="text-lg leading-snug font-semibold tracking-tight">
          <Link
            href={href as Route}
            className="inline-flex min-h-11 items-center no-underline hover:underline hover:underline-offset-4"
          >
            {loc(category.name, locale)}
          </Link>
        </h3>
      </div>
      <ul className="divide-y divide-line">
        {services.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/${locale}/huduma/${s.slug}` as Route}
              className="group flex min-h-12 items-center justify-between gap-3 py-2 text-[0.9375rem] no-underline"
            >
              <span className="group-hover:underline group-hover:underline-offset-4">{loc(s.title, locale)}</span>
              <Icon name="chevron" className="text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

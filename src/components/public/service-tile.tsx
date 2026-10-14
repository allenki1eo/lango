import type { Route } from "next";
import Link from "next/link";
import { loc, type Service } from "@/lib/catalog";
import { Icon } from "./icon";

const tints = ["bg-sun-soft text-hero", "bg-teal-soft text-teal", "bg-hibiscus-soft text-hibiscus"];

export function ServiceTile({ s, locale, i = 0 }: { s: Service; locale: string; i?: number }) {
  return (
    <Link
      href={`/${locale}/huduma/${s.slug}` as Route}
      className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 no-underline shadow-card transition hover:-translate-y-0.5 hover:border-teal"
    >
      <span className={`grid size-12 flex-none place-items-center rounded-xl text-[1.4rem] ${tints[i % 3]}`}>
        <Icon name={s.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display leading-tight font-bold">{loc(s.title, locale)}</span>
        <span className="block truncate text-sm text-muted">{s.agency}</span>
      </span>
      <Icon name="chevron" className="text-muted transition group-hover:translate-x-0.5 group-hover:text-teal" />
    </Link>
  );
}

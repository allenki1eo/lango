"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** `match` decides when a link is the current page: the exact path, any path below it, or never (anchors). */
export type NavItem = { href: string; label: string; match: "exact" | "prefix" | "none" };

/** Primary navigation links. Client-side only to mark the current page; the copy arrives as props. */
export function NavLinks({ items, variant }: { items: NavItem[]; variant: "bar" | "menu" }) {
  const pathname = usePathname();

  return (
    <ul className={variant === "bar" ? "flex gap-1" : "divide-y divide-line"}>
      {items.map(({ href, label, match }) => {
        const current = match === "exact" ? pathname === href : match === "prefix" && pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href as Route}
              aria-current={current ? "page" : undefined}
              // The header persists across soft navigations, so close the mobile menu once a link is chosen.
              onClick={
                variant === "menu" ? (e) => e.currentTarget.closest("details")?.removeAttribute("open") : undefined
              }
              className={
                variant === "bar"
                  ? "inline-flex min-h-12 items-center px-3.5 font-semibold text-hero-ink no-underline shadow-[inset_0_-4px_0_transparent] transition-[box-shadow,background-color] hover:bg-white/10 aria-[current=page]:shadow-[inset_0_-4px_0_var(--sun)]"
                  : "flex min-h-12 items-center px-4 font-semibold no-underline hover:bg-band aria-[current=page]:border-l-4 aria-[current=page]:border-sun aria-[current=page]:pl-3"
              }
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

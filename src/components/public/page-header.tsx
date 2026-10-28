import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "./icon";
import { SiteHeader, type Section } from "./site-header";

export type Crumb = { href: string; label: string };

/** The stage card for inner pages: the header, a breadcrumb trail home, then the page's own heading. */
export function PageHeader({
  crumbs,
  current,
  children,
}: {
  crumbs: Crumb[];
  current?: Section;
  children: React.ReactNode;
}) {
  const t = useTranslations("Common");

  return (
    <div className="stage">
      <div className="wrap pb-10 sm:pb-14">
        <SiteHeader current={current} />
        <nav aria-label={t("breadcrumb")} className="mt-8 sm:mt-12">
          <ol className="flex flex-wrap items-center text-[0.9375rem] text-muted">
            {crumbs.map((c) => (
              <li key={c.href} className="inline-flex items-center">
                <Link href={c.href as Route} className="link inline-flex min-h-11 items-center">
                  {c.label}
                </Link>
                <Icon name="chevron" className="mx-1.5" />
              </li>
            ))}
          </ol>
        </nav>
        {children}
      </div>
    </div>
  );
}

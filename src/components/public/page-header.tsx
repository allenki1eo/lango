import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "./icon";

export type Crumb = { href: string; label: string };

/** Title band for inner pages: a breadcrumb trail back to the home page, then the page's own heading. */
export function PageHeader({ crumbs, children }: { crumbs: Crumb[]; children: React.ReactNode }) {
  const t = useTranslations("Common");

  return (
    <div className="border-b border-line bg-band">
      <div className="wrap pt-3 pb-8 sm:pb-10">
        <nav aria-label={t("breadcrumb")}>
          <ol className="flex flex-wrap items-center text-[0.9375rem]">
            {crumbs.map((c) => (
              <li key={c.href} className="inline-flex items-center">
                <Link href={c.href as Route} className="link inline-flex min-h-11 items-center">
                  {c.label}
                </Link>
                <Icon name="chevron" className="mx-1 text-muted" />
              </li>
            ))}
          </ol>
        </nav>
        {children}
      </div>
    </div>
  );
}

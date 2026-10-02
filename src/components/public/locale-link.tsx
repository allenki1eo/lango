import type { Route } from "next";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { getPathname } from "@/lib/i18n/navigation";

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: Parameters<typeof getPathname>[0]["href"];
};

/**
 * A server-rendered link to a page in the current locale. Unlike next-intl's Link it ships no
 * client runtime, which keeps public routes inside the JavaScript budget.
 */
export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();
  return <Link href={getPathname({ href, locale }) as Route} {...props} />;
}

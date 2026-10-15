import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import type { Locale } from "@/lib/i18n/routing";

/** Shared chrome for public pages: identity bar and navigation above, link-rich footer below. */
export default async function PublicLayout({ children, params }: LayoutProps<"/[locale]">) {
  // Layouts render alongside pages, so each one sets the locale itself to stay statically rendered.
  setRequestLocale((await params).locale as Locale);

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

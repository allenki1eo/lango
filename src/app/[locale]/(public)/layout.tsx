import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/public/site-footer";
import type { Locale } from "@/lib/i18n/routing";

/** Shared footer for public pages. Each page draws its own stage card, with the header inside it. */
export default async function PublicLayout({ children, params }: LayoutProps<"/[locale]">) {
  // Layouts render alongside pages, so each one sets the locale itself to stay statically rendered.
  setRequestLocale((await params).locale as Locale);

  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}

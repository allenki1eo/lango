import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/public/hero";
import { HowItWorks } from "@/components/public/how-it-works";
import { SiteFooter } from "@/components/public/site-footer";
import { TrustNote } from "@/components/public/trust-note";
import type { Locale } from "@/lib/i18n/routing";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <main id="main" tabIndex={-1} className="wrap space-y-10 pt-11 pb-12 outline-none">
        <HowItWorks />
        <TrustNote />
      </main>
      <SiteFooter />
    </>
  );
}

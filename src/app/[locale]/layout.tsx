import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { readServerEnv } from "@/lib/env";
import { TrustBanner } from "@/components/public/trust-banner";
import { VisitBeacon } from "@/components/public/visit-beacon";
import { interTight, sourceSerif } from "@/lib/fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E24" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(readServerEnv().NEXT_PUBLIC_SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    alternates: {
      canonical: getPathname({ href: "/", locale }),
      languages: Object.fromEntries(routing.locales.map((l) => [l, getPathname({ href: "/", locale: l })])),
    },
    openGraph: { siteName: "Lango", locale: locale === "sw" ? "sw_TZ" : "en_TZ", type: "website" },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <html lang={locale} className={`${sourceSerif.variable} ${interTight.variable}`}>
      <body id="top">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-sun px-4 py-3 font-semibold text-sun-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t("skipToContent")}
        </a>
        <TrustBanner />
        {/* No NextIntlClientProvider: public client components receive their copy as props, keeping JS small. */}
        {children}
        <VisitBeacon />
      </body>
    </html>
  );
}

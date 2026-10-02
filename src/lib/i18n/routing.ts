import { defineRouting } from "next-intl/routing";

export const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const routing = defineRouting({
  locales: ["sw", "en"],
  defaultLocale: "sw",
  localePrefix: "always",
  // A functional preference cookie only: it remembers the language a visitor chose.
  localeCookie: { name: LOCALE_COOKIE, maxAge: ONE_YEAR_SECONDS, sameSite: "lax" },
  // Swahili path segments (huduma, njia, tafuta, kuhusu) are shared by both locales in v1.
});

export type Locale = (typeof routing.locales)[number];

/**
 * Client-side counterpart of the cookie next-intl's proxy sets. Soft navigations skip the proxy,
 * so the language switch calls this to remember the visitor's choice.
 */
export function rememberLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

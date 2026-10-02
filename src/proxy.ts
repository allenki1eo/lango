import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { LOCALE_COOKIE, routing } from "@/lib/i18n/routing";

const handleI18n = createMiddleware(routing);

/**
 * Lango is Swahili-first: a visitor without a saved choice lands on /sw even when their browser
 * asks for English. Once they pick a language, the locale cookie remembers it.
 */
export default function proxy(request: NextRequest) {
  if (request.cookies.has(LOCALE_COOKIE)) return handleI18n(request);

  const headers = new Headers(request.headers);
  headers.delete("accept-language");
  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  // Everything except API routes, the admin panel, Next.js internals and files with an extension.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};

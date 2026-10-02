import Link from "next/link";
import { bricolage, instrument } from "@/lib/fonts";

// Fallback for paths outside the locale routes. Locale pages use [locale]/not-found.tsx instead.
export default function GlobalNotFound() {
  return (
    <html lang="sw" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>
        <main className="wrap grid min-h-dvh content-center gap-2 py-16">
          <h1 className="font-display text-[2rem] leading-tight font-extrabold tracking-display">
            Ukurasa haukupatikana
          </h1>
          <p className="text-muted" lang="en">
            Page not found
          </p>
          <Link
            href="/sw"
            className="mt-4 inline-flex min-h-12 w-fit items-center rounded-[14px] bg-brand px-5 font-semibold text-brand-ink no-underline"
          >
            Lango
          </Link>
        </main>
      </body>
    </html>
  );
}

import Link from "next/link";
import { interTight, sourceSerif } from "@/lib/fonts";

// Fallback for paths outside the locale routes. Locale pages use [locale]/not-found.tsx instead.
export default function GlobalNotFound() {
  return (
    <html lang="sw" className={`${sourceSerif.variable} ${interTight.variable}`}>
      <body>
        <main className="wrap grid min-h-dvh content-center gap-2 py-16">
          <h1 className="serif-display text-[2.75rem]">Ukurasa haukupatikana</h1>
          <p className="text-muted" lang="en">
            Page not found
          </p>
          <Link
            href="/sw"
            className="mt-4 inline-flex min-h-12 w-fit items-center rounded-full bg-primary px-6 font-semibold text-primary-ink no-underline"
          >
            Lango
          </Link>
        </main>
      </body>
    </html>
  );
}

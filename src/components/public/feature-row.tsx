import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/** One "why Lango" row: a large rounded media tile beside a short headline, a sentence and an optional link. */
export function FeatureRow({
  id,
  media,
  title,
  body,
  link,
}: {
  id: string;
  media: ReactNode;
  title: string;
  body: string;
  link?: { href: string; label: string };
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-[clamp(40px,8vw,112px)]"
    >
      <div className="mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-[36px] sm:rounded-[44px] md:mr-0">
        {media}
      </div>
      <div className="max-w-[24rem]">
        <h2
          id={id}
          className="text-[clamp(2rem,4.4vw,2.75rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance"
        >
          {title}
        </h2>
        <p className="mt-5 text-[1.0625rem] text-muted">{body}</p>
        {link ? (
          <Link
            href={link.href as Route}
            className="mt-4 inline-flex min-h-11 items-center font-semibold no-underline hover:underline hover:underline-offset-4"
          >
            {link.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import { LocaleLink } from "./locale-link";

export function ExampleQueries() {
  const t = useTranslations("Search");
  const examples = t.raw("examples") as string[];

  return (
    <div className="relative mt-4 flex flex-wrap items-center gap-2">
      <span className="mr-0.5 text-[0.9375rem] text-hero-muted">{t("tryLabel")}</span>
      {examples.map((example) => (
        <LocaleLink
          key={example}
          href={{ pathname: "/tafuta", query: { q: example } }}
          className="inline-flex min-h-11 items-center rounded-full border border-white/40 px-3.5 text-[0.9375rem] no-underline transition-colors hover:bg-white/14 sm:min-h-[38px]"
        >
          {example}
        </LocaleLink>
      ))}
    </div>
  );
}

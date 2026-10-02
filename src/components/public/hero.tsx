import { useTranslations } from "next-intl";
import { Arches } from "./arches";
import { ExampleQueries } from "./example-queries";
import { SearchBox } from "./search-box";
import { SiteHeader } from "./site-header";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <header data-surface="hero" className="relative overflow-hidden bg-hero pb-11 text-hero-ink">
      <Arches className="pointer-events-none absolute -right-20 -bottom-1.5 w-[300px] text-sun opacity-40 sm:-right-15 sm:w-[420px]" />
      <div className="wrap relative">
        <SiteHeader />
        <h1 className="mt-[clamp(34px,7vw,64px)] mb-3.5 max-w-[15ch] font-display text-[clamp(2.15rem,6.4vw,3.9rem)] leading-[1.02] font-extrabold tracking-display text-balance">
          {t("title")}
        </h1>
        <p className="mb-6.5 max-w-[46ch] text-[1.0625rem] text-hero-muted">{t("subtitle")}</p>
        <SearchBox />
        <ExampleQueries />
      </div>
    </header>
  );
}

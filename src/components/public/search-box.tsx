import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/lib/i18n/navigation";
import { Icon } from "./icon";

/**
 * The hero's focal point. A plain GET form, so search works before (and without) JavaScript.
 */
export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  const t = useTranslations("Search");
  const locale = useLocale();

  return (
    <form
      role="search"
      action={getPathname({ href: "/tafuta", locale })}
      method="get"
      className="relative flex max-w-[720px] gap-2 rounded-[20px] bg-surface p-2 text-ink shadow-float transition-shadow focus-within:shadow-[0_0_0_3px_var(--sun),var(--shadow-float)]"
    >
      <span className="grid place-items-center pr-1 pl-3 text-muted">
        <Icon name="search" />
      </span>
      <label htmlFor="q" className="sr-only">
        {t("label")}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={200}
        defaultValue={defaultValue}
        placeholder={t("placeholder")}
        className="min-w-0 flex-1 bg-transparent px-1 py-3.5 text-lg font-medium outline-none placeholder:text-muted placeholder:opacity-100 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        className="flex min-h-[50px] items-center gap-2 rounded-[14px] bg-sun px-5 font-semibold text-sun-ink transition hover:brightness-105 sm:px-6"
      >
        {t("submit")}
      </button>
    </form>
  );
}

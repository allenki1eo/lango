import { useTranslations } from "next-intl";

type Step = { title: string; body: string };

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps") as Step[];

  return (
    <section aria-labelledby="how-title">
      <h2 id="how-title" className="mb-1.5 font-display text-[1.75rem] leading-tight font-bold tracking-[-0.02em]">
        {t("title")}
      </h2>
      <p className="mb-7 max-w-[56ch] text-muted">{t("lede")}</p>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-2xl bg-surface p-5 shadow-card sm:flex-col sm:gap-3">
            <span
              aria-hidden="true"
              className="grid size-12 flex-none place-items-center rounded-[14px] border-[1.5px] border-brand/35 bg-brand-soft font-display text-lg font-extrabold text-brand"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="mb-1 font-display text-[1.0625rem] leading-snug font-bold">{step.title}</h3>
              <p className="text-[0.9375rem] text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

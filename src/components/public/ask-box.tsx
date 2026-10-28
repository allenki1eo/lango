"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Cards } from "@/lib/ai/cards";
import { Checklist } from "./checklist";
import { Icon } from "./icon";

export type AskCopy = {
  label: string;
  placeholder: string;
  submit: string;
  tryLabel: string;
  examples: string[];
  thinking: string;
  error: string;
  rate: string;
  noMatch: string;
  aiNote: string;
  related: string;
  offices: string;
  viewGuide: string;
  official: string;
  documents: string;
  steps: string;
  fees: string;
  noFees: string;
  feeSource: string;
  lastChecked: string;
  done: string;
  reset: string;
};

type Answer = { q: string; text: string; cards: Cards; source: string };

/**
 * The hero's focal point. Without JavaScript it is a plain GET form to /tafuta; with it, questions go to
 * the assistant and the answer renders as cards built from Lango's verified catalog.
 */
export function AskBox({
  locale,
  action,
  copy,
  defaultValue = "",
  note,
}: {
  locale: string;
  action: string;
  copy: AskCopy;
  defaultValue?: string;
  /** Server-rendered line under the box (the AI label), passed in so its copy stays off the client bundle. */
  note?: ReactNode;
}) {
  const [q, setQ] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [err, setErr] = useState("");
  const out = useRef<HTMLDivElement>(null);

  async function run(question: string) {
    if (question.trim().length < 2 || busy) return;
    setBusy(true);
    setErr("");
    setAnswer(null);
    let got = false;
    try {
      // Server-Sent Events: instant keyword cards first, then the assistant's answer.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: question, locale, stream: true }),
      });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok || !res.body) throw new Error("err");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const chunk = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const ev = /^event: (\w+)/m.exec(chunk)?.[1];
          const data = /^data: (.*)$/m.exec(chunk)?.[1];
          if (!data || (ev !== "cards" && ev !== "answer")) continue;
          const d = JSON.parse(data);
          got = true;
          setAnswer({ q: question, ...d, text: String(d.text ?? "").replace(/\*\*|__|`/g, "") });
        }
      }
    } catch (e) {
      if (!got) setErr(e instanceof Error && e.message === "rate" ? copy.rate : copy.error);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => out.current?.focus());
    }
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(q);
  };
  const prefix = `/${locale}`;
  const g = answer?.cards.guide;

  return (
    <div>
      <form
        role="search"
        action={action}
        method="get"
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-full border border-line bg-surface p-2 pl-6 text-ink shadow-float transition-shadow focus-within:shadow-[0_0_0_3px_var(--focus)]"
      >
        <label htmlFor="q" className="sr-only">
          {copy.label}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={300}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-muted placeholder:opacity-100 sm:text-xl [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          disabled={busy}
          className="grid size-12 flex-none place-items-center rounded-full bg-primary text-xl text-primary-ink transition hover:opacity-90 disabled:opacity-70"
        >
          {busy ? (
            <span
              className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <Icon name="arrow" />
          )}
          <span className="sr-only">{copy.submit}</span>
        </button>
      </form>
      {note}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-2">
        <span className="text-[0.9375rem] text-muted in-data-[surface=hero]:text-hero-muted">{copy.tryLabel}</span>
        {copy.examples.map((ex) => (
          <a
            key={ex}
            href={`${action}?q=${encodeURIComponent(ex)}`}
            onClick={(e) => {
              e.preventDefault();
              setQ(ex);
              run(ex);
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-ink/6 px-4 text-[0.9375rem] no-underline transition-colors hover:bg-ink/10 in-data-[surface=hero]:bg-white/12 in-data-[surface=hero]:hover:bg-white/20"
          >
            {ex}
          </a>
        ))}
      </div>

      <div ref={out} tabIndex={-1} aria-live="polite" className="outline-none">
        {busy ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-muted in-data-[surface=hero]:text-hero-muted">
            <span className="size-2 animate-ping rounded-full bg-sun" aria-hidden="true" />
            {copy.thinking}
          </p>
        ) : null}
        {err ? (
          <p data-surface="light" className="mt-6 rounded-3xl bg-surface p-5 text-ink shadow-card">
            {err}
          </p>
        ) : null}
        {answer ? (
          <section
            data-surface="light"
            className="mt-6 space-y-4 rounded-[28px] bg-surface p-5 text-left text-ink shadow-float sm:p-7"
          >
            <p className="text-sm text-muted">“{answer.q}”</p>
            {answer.text ? <p className="text-[1.05rem] leading-relaxed whitespace-pre-line">{answer.text}</p> : null}
            {!g ? (
              <p>{copy.noMatch}</p>
            ) : (
              <article className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 flex-none place-items-center rounded-2xl bg-band text-[1.35rem]">
                    <Icon name={g.icon} />
                  </span>
                  <div>
                    <h2 className="text-xl leading-tight font-semibold tracking-tight">{g.title}</h2>
                    <p className="text-sm text-muted">
                      {g.agency} · {g.summary}
                    </p>
                  </div>
                </div>
                <a
                  href={g.officialUrl}
                  data-tap={g.slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink no-underline hover:opacity-90"
                >
                  {copy.official} <Icon name="external" />{" "}
                  <span className="truncate text-sm font-normal">{new URL(g.officialUrl).hostname}</span>
                </a>
                {g.documents.length ? (
                  <div>
                    <h3 className="mb-2 font-semibold">{copy.documents}</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {g.documents.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div>
                  <h3 className="mb-2 font-semibold">{copy.steps}</h3>
                  <Checklist id={g.slug} items={g.steps} doneLabel={copy.done} resetLabel={copy.reset} />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">{copy.fees}</h3>
                  {g.fees.length ? (
                    <ul className="space-y-1.5">
                      {g.fees.map((f) => (
                        <li key={f.label} className="flex justify-between gap-3 border-b border-line pb-1.5">
                          <span>
                            {f.label}{" "}
                            <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-muted">
                              [{copy.feeSource}]
                            </a>
                          </span>
                          <strong className="whitespace-nowrap">{f.amount}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-semibold">{copy.noFees}</p>
                  )}
                  {g.feeNote ? <p className="mt-2 text-sm text-muted">{g.feeNote}</p> : null}
                </div>
                <p className="text-xs text-muted">
                  {copy.lastChecked.replace("{date}", g.lastChecked)} ·{" "}
                  {g.sources.map((s, i) => (
                    <a key={s} href={s} target="_blank" rel="noopener noreferrer" className="mr-1">
                      [{i + 1}] {new URL(s).hostname}
                    </a>
                  ))}
                </p>
                <a
                  href={`${prefix}/huduma/${g.slug}`}
                  className="link inline-flex min-h-11 items-center gap-1 font-semibold"
                >
                  {copy.viewGuide} <Icon name="chevron" />
                </a>
              </article>
            )}
            {answer.cards.offices.length ? (
              <div>
                <h3 className="mb-2 font-semibold">{copy.offices}</h3>
                <ul className="space-y-1.5">
                  {answer.cards.offices.map((o) => (
                    <li key={o.name} className="text-sm">
                      <strong>{o.agency}</strong>: {o.name}
                      {o.phone ? (
                        <>
                          {" "}
                          · <a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a>
                        </>
                      ) : null}
                      {o.note ? <span className="block text-muted">{o.note}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {answer.cards.services.length ? (
              <div>
                <h3 className="mb-2 font-semibold">{copy.related}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {answer.cards.services.map((s) => (
                    <a
                      key={s.slug}
                      href={`${prefix}/huduma/${s.slug}`}
                      className="flex min-h-12 items-center gap-2 rounded-2xl bg-band p-3 no-underline hover:bg-line"
                    >
                      <Icon name={s.icon} />
                      <span className="font-medium">{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="text-xs text-muted">{copy.aiNote}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

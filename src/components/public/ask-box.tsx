"use client";

import { useRef, useState, type FormEvent } from "react";
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
}: {
  locale: string;
  action: string;
  copy: AskCopy;
  defaultValue?: string;
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
        className="relative flex max-w-[760px] gap-2 rounded-xl border-2 border-hero bg-surface p-1.5 text-ink shadow-card transition-shadow focus-within:shadow-[0_0_0_3px_var(--sun)] in-data-[surface=hero]:border-transparent in-data-[surface=hero]:shadow-float"
      >
        <span className="hidden place-items-center pl-3 text-teal sm:grid">
          <Icon name="sparkle" />
        </span>
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
          className="min-w-0 flex-1 bg-transparent px-2 py-3.5 text-[1.05rem] font-medium outline-none placeholder:text-muted placeholder:opacity-100 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[52px] items-center gap-2 rounded-lg bg-sun px-5 font-display font-bold text-sun-ink transition hover:brightness-105 disabled:opacity-70 sm:px-7"
        >
          {busy ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-sun-ink border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <Icon name="search" />
          )}
          <span>{copy.submit}</span>
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-0.5 text-[0.9375rem] text-muted in-data-[surface=hero]:text-hero-muted">
          {copy.tryLabel}
        </span>
        {copy.examples.map((ex) => (
          <a
            key={ex}
            href={`${action}?q=${encodeURIComponent(ex)}`}
            onClick={(e) => {
              e.preventDefault();
              setQ(ex);
              run(ex);
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 text-[0.9375rem] no-underline transition-colors hover:border-hero sm:min-h-[38px] in-data-[surface=hero]:border-white/35 in-data-[surface=hero]:bg-transparent in-data-[surface=hero]:hover:bg-white/12"
          >
            {ex}
          </a>
        ))}
      </div>

      <div ref={out} tabIndex={-1} aria-live="polite" className="outline-none">
        {busy ? (
          <p className="mt-6 flex items-center gap-2 text-muted in-data-[surface=hero]:text-hero-muted">
            <span className="size-2 animate-ping rounded-full bg-sun" aria-hidden="true" />
            {copy.thinking}
          </p>
        ) : null}
        {err ? (
          <p data-surface="light" className="mt-6 rounded-lg border border-line bg-surface p-4 text-ink">
            {err}
          </p>
        ) : null}
        {answer ? (
          <section
            data-surface="light"
            className="mt-6 max-w-[760px] space-y-3 rounded-xl border border-line bg-surface p-4 text-ink shadow-float sm:p-6"
          >
            <p className="text-sm text-muted">“{answer.q}”</p>
            {answer.text ? <p className="text-[1.05rem] leading-relaxed whitespace-pre-line">{answer.text}</p> : null}
            {!g ? (
              <p>{copy.noMatch}</p>
            ) : (
              <article className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 flex-none place-items-center rounded-xl bg-sun-soft text-[1.35rem] text-hero">
                    <Icon name={g.icon} />
                  </span>
                  <div>
                    <h2 className="font-display text-xl leading-tight font-bold">{g.title}</h2>
                    <p className="text-sm text-muted">
                      {g.agency} · {g.summary}
                    </p>
                  </div>
                </div>
                <a
                  href={g.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-hero px-4 font-semibold text-hero-ink no-underline hover:brightness-125"
                >
                  {copy.official} <Icon name="external" />{" "}
                  <span className="truncate text-sm font-normal">{new URL(g.officialUrl).hostname}</span>
                </a>
                {g.documents.length ? (
                  <div>
                    <h3 className="mb-2 font-display font-bold">{copy.documents}</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {g.documents.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div>
                  <h3 className="mb-2 font-display font-bold">{copy.steps}</h3>
                  <Checklist id={g.slug} items={g.steps} doneLabel={copy.done} resetLabel={copy.reset} />
                </div>
                <div>
                  <h3 className="mb-2 font-display font-bold">{copy.fees}</h3>
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
                <h3 className="mb-2 font-display font-bold">{copy.offices}</h3>
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
                <h3 className="mb-2 font-display font-bold">{copy.related}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {answer.cards.services.map((s) => (
                    <a
                      key={s.slug}
                      href={`${prefix}/huduma/${s.slug}`}
                      className="flex min-h-12 items-center gap-2 rounded-lg border border-line p-3 no-underline hover:border-hero"
                    >
                      <Icon name={s.icon} className="text-teal" />
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

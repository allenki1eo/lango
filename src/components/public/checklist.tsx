"use client";

import { useEffect, useState } from "react";

type Props = { id: string; items: string[]; doneLabel: string; resetLabel: string };

/** Step checklist. Progress lives in localStorage only, never on a server. */
export function Checklist({ id, items, doneLabel, resetLabel }: Props) {
  const key = `lango:steps:${id}`;
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as boolean[];
      // Read after hydration so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved.length === items.length) setDone(saved);
    } catch {}
  }, [key, items.length]);
  const toggle = (i: number) =>
    setDone((d) => {
      const next = d.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  const count = done.filter(Boolean).length;
  return (
    <div>
      <ol className="space-y-2">
        {items.map((step, i) => (
          <li key={i}>
            <label className="flex min-h-11 cursor-pointer gap-3 rounded-3xl border border-line bg-surface p-4 transition-colors has-[:checked]:border-ok has-[:checked]:bg-ok-soft">
              <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className="grid size-7 flex-none place-items-center rounded-full bg-primary text-sm font-semibold text-primary-ink peer-checked:bg-ok peer-focus-visible:outline-3 peer-focus-visible:outline-focus"
              >
                {done[i] ? "✓" : i + 1}
              </span>
              <span className="pt-0.5 peer-checked:text-muted peer-checked:line-through">{step}</span>
            </label>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>{doneLabel.replace("{done}", String(count)).replace("{total}", String(items.length))}</span>
        {count > 0 ? (
          <button
            type="button"
            className="min-h-11 rounded-lg px-3 font-medium underline"
            onClick={() => {
              setDone(items.map(() => false));
              try {
                localStorage.removeItem(key);
              } catch {}
            }}
          >
            {resetLabel}
          </button>
        ) : null}
      </p>
    </div>
  );
}

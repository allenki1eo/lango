/** "by Hanki Technologies" lockup using the Hanki Code Diamond mark. */
export function HankiBadge({ label }: { label: string }) {
  return (
    <a
      href="https://www.hanki.co.tz"
      className="inline-flex min-h-11 items-center gap-2 font-medium text-muted no-underline hover:text-ink"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="size-6 rounded-md bg-[#1F1C5C] p-1">
        <path
          d="M41 11 L7 50 L41 89M59 11 L93 50 L59 89"
          fill="none"
          stroke="#F5F2EA"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M50 34 L66 50 L50 66 L34 50 Z" fill="#F4A31B" />
      </svg>
      {label}
    </a>
  );
}

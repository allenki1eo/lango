/** The hero's signature motif: four nested arches, a gateway ("lango"). Purely decorative. */
export function Arches({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M10 320V160a150 150 0 0 1 300 0v160" />
      <path d="M50 320V160a110 110 0 0 1 220 0v160" />
      <path d="M90 320V160a70 70 0 0 1 140 0v160" />
      <path d="M130 320V160a30 30 0 0 1 60 0v160" />
    </svg>
  );
}

import type { SVGProps } from "react";

const paths = {
  chevron: <path d="m9 6 6 6-6 6" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </>
  ),
  id: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.2" />
      <path d="M6 16c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4M14.5 10H18M14.5 13.5H18" />
    </>
  ),
  passport: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 16.5h6" />
    </>
  ),
  tax: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  certificate: (
    <>
      <rect x="4" y="3" width="16" height="13" rx="2" />
      <path d="M8 7h8M8 10.5h5" />
      <circle cx="15" cy="17" r="2.5" />
      <path d="m13.5 19-.5 3 2-1 2 1-.5-3" />
    </>
  ),
  car: (
    <>
      <path d="M5 16V11l2-5h10l2 5v5" />
      <path d="M3 16h18v2H3zM5 11h14" />
      <circle cx="8" cy="14" r=".6" />
      <circle cx="16" cy="14" r=".6" />
    </>
  ),
  land: (
    <>
      <path d="M3 20h18M5 20v-6l7-5 7 5v6" />
      <path d="M10 20v-4h4v4" />
    </>
  ),
  health: (
    <>
      <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />
      <path d="M12 10v4M10 12h4" />
    </>
  ),
  pension: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5" />
    </>
  ),
  school: (
    <>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c2 2 10 2 12 0v-5M22 9v6" />
    </>
  ),
  results: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  power: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  water: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  siren: (
    <>
      <path d="M6 18v-6a6 6 0 0 1 12 0v6" />
      <path d="M4 18h16v3H4zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4" />
    </>
  ),
  pay: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  check: <path d="m5 12 5 5L20 7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} as const;

export type IconName = keyof typeof paths;
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { name: IconName | string };

/**
 * Inline stroke icon for service and topic icons (named in the catalog) plus the few UI marks the ask box uses.
 * The ask box is a client component, so this whole map ships to the browser: keep page-only glyphs in glyph.tsx.
 * Decorative by default; pair it with visible or screen-reader text.
 */
export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={["size-[1.15em] flex-none", className].filter(Boolean).join(" ")}
      {...props}
    >
      {paths[name as IconName] ?? paths.chevron}
    </svg>
  );
}

import { Icon } from "./icon";

const sizes = {
  sm: "size-10 rounded-xl text-[0.625rem]",
  md: "size-12 rounded-2xl text-[0.6875rem]",
  lg: "size-16 rounded-[22px] text-[0.875rem]",
} as const;

/**
 * The agency "stamp": a rounded square carrying the agency's short code (NIDA, TRA, BRELA…). Agencies
 * without a short code (a ministry, for example) show the service icon instead.
 */
export function AgencyStamp({
  agency,
  icon,
  size = "md",
}: {
  agency: string;
  icon: string;
  size?: keyof typeof sizes;
}) {
  const code = /^[\p{L}-]{2,7}$/u.test(agency) ? agency : null;

  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center border border-line bg-band leading-none font-semibold tracking-tight text-ink ${sizes[size]} ${code ? "" : "text-[1.35rem]"}`}
    >
      {code ?? <Icon name={icon} />}
    </span>
  );
}

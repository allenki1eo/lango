import { Icon } from "./icon";

/**
 * The agency "stamp": a rounded square carrying the agency's short code (NIDA, TRA, BRELA…). Agencies
 * without a short code (a ministry, for example) show the service icon instead.
 */
export function AgencyStamp({ agency, icon, size = "md" }: { agency: string; icon: string; size?: "md" | "lg" }) {
  const code = /^[\p{L}-]{2,7}$/u.test(agency) ? agency : null;
  const box = size === "lg" ? "size-16 rounded-xl" : "size-12 rounded-lg";
  const text = code && code.length > 5 ? "text-[0.625rem]" : size === "lg" ? "text-[0.95rem]" : "text-[0.75rem]";

  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center border-2 border-sun/45 bg-sun-soft font-display leading-none font-extrabold text-ink ${box} ${code ? text : "text-[1.4rem]"}`}
    >
      {code ?? <Icon name={icon} />}
    </span>
  );
}

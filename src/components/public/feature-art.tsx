import { loc, type Service } from "@/lib/catalog";
import { Glyph } from "./glyph";

/*
 * Media tiles for the home page's feature rows. Drawn with CSS and SVG from catalog data, so there are
 * no images to download and nothing to license. All decorative: the row's text carries the meaning.
 */

/** A slowly drifting wall of agency "pages", standing in for the many sites Lango gathers. */
export function AgencyWall({ services, locale }: { services: Service[]; locale: string }) {
  const rows = [0, 1, 2, 3].map((r) => services.filter((_, i) => i % 4 === r));
  return (
    <div aria-hidden="true" className="relative size-full overflow-hidden bg-hero">
      <div className="absolute inset-[-20%] flex -rotate-12 flex-col justify-center gap-3">
        {rows.map((row, r) => (
          <div key={r} className={r % 2 ? "translate-x-[-12%]" : ""}>
            {/* The row repeats so that sliding it by half its width loops without a seam. */}
            <div className="drift flex w-max gap-3">
              {[...row, ...row, ...row, ...row].map((s, i) => (
                <div
                  key={`${s.slug}-${i}`}
                  className="w-44 flex-none rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-hero-ink"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-md bg-white/12 px-1.5 py-0.5 text-[0.625rem] font-semibold">
                      {s.agency}
                    </span>
                    <span className="h-1.5 flex-1 rounded-full bg-white/10" />
                  </div>
                  <p className="line-clamp-2 text-[0.8125rem] leading-snug font-medium">{loc(s.title, locale)}</p>
                  <div className="mt-3 space-y-1.5">
                    <span className="block h-1.5 w-full rounded-full bg-white/10" />
                    <span className="block h-1.5 w-2/3 rounded-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--hero)_95%)]" />
    </div>
  );
}

/** Night sky and an open lock: the privacy promise. */
export function PrivacyNight() {
  return (
    <div
      aria-hidden="true"
      className="grid size-full place-items-center bg-[radial-gradient(1px_1px_at_20%_30%,white,transparent),radial-gradient(1px_1px_at_70%_20%,white,transparent),radial-gradient(1.5px_1.5px_at_40%_80%,white,transparent),radial-gradient(1px_1px_at_85%_65%,white,transparent),radial-gradient(1px_1px_at_10%_75%,white,transparent),radial-gradient(1px_1px_at_55%_45%,white,transparent),linear-gradient(to_bottom,#07061a,#1f1c5c)] bg-[length:180px_180px,220px_220px,260px_260px,200px_200px,240px_240px,300px_300px,100%_100%]"
    >
      <span className="grid size-32 place-items-center rounded-full bg-[#e9e8f3] text-[2.75rem] text-[#0d0c24] shadow-[0_20px_60px_-10px_rgb(0_0_0/0.6)]">
        <Glyph name="lock" />
      </span>
    </div>
  );
}

/** A field of seals, a few carrying agency codes: answers come from the agencies themselves. */
export function SourceSeals({ agencies }: { agencies: string[] }) {
  // Every third seal carries a code, walking through the agencies in catalog order.
  const cells = Array.from({ length: 12 }, (_, i) => (i % 3 === 0 ? agencies[(i / 3) % agencies.length] : null));
  return (
    <div aria-hidden="true" className="relative size-full overflow-hidden bg-band">
      <div className="absolute inset-[-14%] grid grid-cols-4 gap-4">
        {cells.map((code, i) => (
          <span
            key={i}
            className={`grid aspect-square place-items-center rounded-full bg-surface text-[0.8125rem] font-semibold tracking-tight text-ink shadow-[0_10px_30px_-12px_rgb(13_12_36/0.25)] ${
              Math.floor(i / 4) % 2 ? "translate-x-1/2" : ""
            }`}
          >
            {code ? (
              <span className="grid size-[70%] place-items-center rounded-full border-2 border-dashed border-line">
                {code}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A tray of devices: it is just a website. */
export function DeviceTray() {
  return (
    <div aria-hidden="true" className="relative size-full overflow-hidden bg-band">
      <div className="absolute top-1/2 left-[14%] flex -translate-y-1/2 gap-4 rounded-[36px] bg-surface/70 p-4 shadow-[0_30px_60px_-30px_rgb(13_12_36/0.35)]">
        {(["device", "tablet", "laptop"] as const).map((g) => (
          <span
            key={g}
            className="grid size-24 place-items-center rounded-[26px] bg-surface text-[2.6rem] text-ink shadow-[0_8px_20px_-10px_rgb(13_12_36/0.3)]"
          >
            <Glyph name={g} />
          </span>
        ))}
      </div>
    </div>
  );
}

import { SiteHeader } from "./site-header";

export function PageHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header data-surface="hero" className="kanga bg-hero pb-9 text-hero-ink">
      <div className="wrap">
        <SiteHeader />
        {children}
      </div>
    </header>
  );
}

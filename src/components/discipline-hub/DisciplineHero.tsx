import Link from "next/link";
import {
  Route,
  Gauge,
  Layers,
  Mountain,
  Flag,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DisciplineHubPageData } from "@/lib/discipline-hub/types";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  route: Route,
  gauge: Gauge,
  layers: Layers,
  mountain: Mountain,
  flag: Flag,
  zap: Zap,
};

export function DisciplineHero({
  breadcrumbs,
  eyebrow,
  hero,
  pillars,
  focusCard,
}: {
  breadcrumbs: DisciplineHubPageData["breadcrumbs"];
  eyebrow: string;
  hero: DisciplineHubPageData["hero"];
  pillars: DisciplineHubPageData["pillars"];
  focusCard: DisciplineHubPageData["focusCard"];
}) {
  return (
    <section className="border-b border-border bg-[#f7f8f9]">
      <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)_minmax(240px,0.72fr)] lg:items-stretch lg:gap-5 lg:px-8 lg:py-7">
        <div className="flex flex-col justify-center">
          <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>›</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/80">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <p className="mt-4 text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-2 font-display text-[clamp(2.4rem,4.8vw,3.6rem)] leading-[1.02] font-bold tracking-tight text-foreground">
            {hero.title}
          </h1>

          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {hero.description}
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-3">
            {pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon] ?? Layers;
              return (
                <li key={pillar.id} className="flex gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-white">
                    <Icon className="size-4 text-accent" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">
                      {pillar.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">
                      {pillar.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-md sm:min-h-[300px] lg:min-h-[320px] lg:rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
          <img
            src={hero.imageSrc}
            alt={hero.imageAlt}
            className="absolute inset-0 size-full object-cover object-[center_35%]"
          />
        </div>

        <aside className="flex flex-col justify-center rounded-lg bg-[#12161c] px-5 py-6 text-white sm:px-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            {focusCard.title}
          </p>
          <dl className="mt-5 space-y-3.5 text-[13px]">
            <div>
              <dt className="text-[11px] tracking-[0.06em] text-white/45 uppercase">
                Best for
              </dt>
              <dd className="mt-0.5 font-medium text-white/90">
                {focusCard.bestFor}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.06em] text-white/45 uppercase">
                Typical terrain
              </dt>
              <dd className="mt-0.5 font-medium text-white/90">
                {focusCard.typicalTerrain}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.06em] text-white/45 uppercase">
                Key gear
              </dt>
              <dd className="mt-0.5 font-medium text-white/90">
                {focusCard.keyGear}
              </dd>
            </div>
          </dl>
          <Link
            href={focusCard.ctaHref}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-white/25 px-4 text-[12px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:border-accent hover:text-accent"
          >
            {focusCard.ctaLabel} →
          </Link>
        </aside>
      </div>
    </section>
  );
}

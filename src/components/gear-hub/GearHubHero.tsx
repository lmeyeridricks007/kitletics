import Link from "next/link";
import {
  BadgeCheck,
  Database,
  Tag,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { GearHubPageData } from "@/lib/gear-hub/types";

const TRUST_ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  Database,
  Tag,
  Target,
};

export function GearHubHero({
  breadcrumbs,
  hero,
}: {
  breadcrumbs: GearHubPageData["breadcrumbs"];
  hero: GearHubPageData["hero"];
}) {
  return (
    <section className="border-b border-border bg-[#f7f8f9]">
      <div className="mx-auto w-full max-w-[90rem] px-4 pt-6 pb-5 sm:px-6 lg:px-8 lg:pt-7 lg:pb-6">
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

        <div className="mt-5 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1.05fr)] lg:gap-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.4rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-tight text-foreground">
              {hero.titleLines[0]}
              <br />
              {hero.titleLines[1]}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              {hero.description}
            </p>
          </div>

          <div
            className="relative mx-auto aspect-[5/3] w-full max-w-xl overflow-hidden rounded-lg bg-[#eef0f2]"
            aria-label="Cross-sport gear examples"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_40%,rgba(200,245,66,0.22),transparent_58%)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
            <img
              src={hero.montage[0]?.src}
              alt={hero.montage[0]?.alt ?? ""}
              className="absolute top-[10%] left-[4%] z-[2] w-[48%] max-w-[240px] -rotate-[14deg] object-contain drop-shadow-lg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
            <img
              src={hero.montage[1]?.src}
              alt={hero.montage[1]?.alt ?? ""}
              className="absolute top-[4%] right-[8%] z-[3] w-[32%] max-w-[150px] rotate-[8deg] object-contain drop-shadow-lg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
            <img
              src={hero.montage[2]?.src}
              alt={hero.montage[2]?.alt ?? ""}
              className="absolute right-[2%] bottom-[6%] z-[2] w-[44%] max-w-[220px] rotate-[-8deg] object-contain drop-shadow-lg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
            <img
              src={hero.montage[3]?.src}
              alt={hero.montage[3]?.alt ?? ""}
              className="absolute bottom-[6%] left-[8%] z-[1] h-[40%] w-[40%] max-w-[190px] rounded-md object-cover shadow-md ring-1 ring-black/5"
            />
          </div>
        </div>

        <ul className="mt-8 grid gap-4 border-t border-border/80 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {hero.trust.map((item) => {
            const Icon = TRUST_ICONS[item.icon] ?? BadgeCheck;
            return (
              <li key={item.title} className="flex gap-2.5">
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div>
                  <p className="text-[13px] font-bold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

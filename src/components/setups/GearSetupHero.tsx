import Image from "next/image";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  Clock3,
  Package,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import type { GearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";

interface GearSetupHeroProps {
  data: GearSetupPageData;
}

export function GearSetupHero({ data }: GearSetupHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      {/* Full-bleed contextual image — primary mockup center/right plane */}
      {data.heroImageSrc && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          aria-hidden
        >
          <Image
            src={data.heroImageSrc}
            alt=""
            fill
            className="object-cover object-[center_20%]"
            sizes="58vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-transparent" />
        </div>
      )}

      <Container size="wide" className="relative py-7 sm:py-8 lg:py-9">
        <Breadcrumbs items={data.breadcrumbs} className="mb-5" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.78fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,0.55fr)_minmax(260px,0.72fr)]">
          <div className="min-w-0 space-y-4 lg:max-w-xl">
            <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
              {data.eyebrow}
            </p>
            <h1 className="font-display text-[2rem] font-bold tracking-tight text-foreground sm:text-[2.55rem] leading-[1.05]">
              {data.setup.title}
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted">
              {data.setup.description}
            </p>
            {data.scenario && (
              <p className="max-w-md border-l-2 border-accent pl-3 text-[13px] leading-relaxed text-foreground">
                <span className="font-semibold">Scenario. </span>
                {data.scenario}
              </p>
            )}

            <ul className="flex flex-wrap gap-x-5 gap-y-2.5 pt-1">
              {data.curatedBy && (
                <li className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                  <BadgeCheck
                    className="size-3.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span>
                    <span className="font-semibold text-foreground">
                      Expert curated
                    </span>
                    <span className="text-subtle"> · By {data.curatedBy}</span>
                  </span>
                </li>
              )}
              {data.updatedLabel && (
                <li className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                  <CalendarClock
                    className="size-3.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span>
                    <span className="font-semibold text-foreground">Updated</span>
                    <span className="text-subtle"> · {data.updatedLabel}</span>
                  </span>
                </li>
              )}
              {data.nextReviewLabel && (
                <li className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                  <Clock3
                    className="size-3.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span>
                    <span className="font-semibold text-foreground">
                      Next review
                    </span>
                    <span className="text-subtle">
                      {" "}
                      · {data.nextReviewLabel}
                    </span>
                  </span>
                </li>
              )}
              <li className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                <Package
                  className="size-3.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span>
                  <span className="font-semibold text-foreground">
                    {data.coreItemCount} core items
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Mobile / tablet hero image */}
          {data.heroImageSrc && (
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted lg:hidden">
              <Image
                src={data.heroImageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          )}

          {/* Desktop spacer so why-card aligns to far right over image */}
          <div className="hidden xl:block" aria-hidden />

          <aside className="bg-[#0b1220] p-5 text-white sm:p-6 lg:justify-self-end lg:w-full lg:max-w-[300px]">
            <h2 className="font-display text-[15px] font-semibold leading-snug">
              {data.whyTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {data.whyReasons.map((reason) => (
                <li
                  key={reason}
                  className="flex gap-2.5 text-[13px] leading-snug text-white/85"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}

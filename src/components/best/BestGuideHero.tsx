import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Database,
  FlaskConical,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import type { BestGuideTrustPillarIcon } from "@/lib/best/category-config";

const PILLAR_ICONS: Record<BestGuideTrustPillarIcon, LucideIcon> = {
  shield: BadgeCheck,
  database: Database,
  research: FlaskConical,
  refresh: RefreshCw,
  check: CheckCircle2,
  sparkles: Sparkles,
};

export function BestGuideHero({ data }: { data: BestGuidePageData }) {
  const {
    guide,
    heroImageSrc,
    updatedLabel,
    nextReviewLabel,
    resolvedTrustPillars,
    breadcrumbs,
    coverage,
  } = data;

  const coverageLine = coverage.hasAuthenticConsideredSet
    ? `${coverage.consideredCount} evaluated · ${coverage.shortlistedCount} shortlisted · ${coverage.recommendedCount} recommended`
    : undefined;

  return (
    <section className="border-b border-border">
      <div className="relative overflow-hidden bg-mesh">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-accent"
        />

        <Container size="wide" className="relative pt-5 pb-0 sm:pt-6">
          <Breadcrumbs items={breadcrumbs} className="mb-5" />

          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
            <div className="pb-8 lg:pb-10">
              <p className="inline-flex items-center bg-accent px-2 py-1 text-[11px] font-bold tracking-[0.14em] text-accent-foreground uppercase">
                Decision Guide
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                {guide.title}
              </h1>
              {heroImageSrc ? (
                <div className="relative mt-5 -mx-4 aspect-[16/10] overflow-hidden border border-border bg-surface-muted sm:mx-0 lg:hidden">
                  <Image
                    src={heroImageSrc}
                    alt=""
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                </div>
              ) : null}
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                {guide.intro}
              </p>
              {(coverageLine || updatedLabel || nextReviewLabel) && (
                <p className="mt-5 text-[12px] text-subtle">
                  {coverageLine && <span>{coverageLine}</span>}
                  {coverageLine && (updatedLabel || nextReviewLabel) && (
                    <span className="mx-1.5 text-border">•</span>
                  )}
                  {updatedLabel && <span>Updated {updatedLabel}</span>}
                  {updatedLabel && nextReviewLabel && (
                    <span className="mx-1.5 text-border">•</span>
                  )}
                  {nextReviewLabel && (
                    <span>Next review: {nextReviewLabel}</span>
                  )}
                </p>
              )}
              <Link
                href="#quick-picks"
                className="mt-6 inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-[12px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
              >
                See top picks
                <ArrowDown className="size-3.5" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>

            {heroImageSrc && (
              <div className="relative hidden aspect-[5/4] overflow-hidden border border-border bg-surface-muted lg:block">
                <Image
                  src={heroImageSrc}
                  alt=""
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  aria-hidden
                  className="absolute bottom-0 left-0 h-1 w-full bg-accent lg:bottom-auto lg:left-0 lg:h-full lg:w-1"
                />
              </div>
            )}
          </div>
        </Container>
      </div>

      {resolvedTrustPillars.length > 0 && (
        <div className="border-t border-border bg-accent-muted">
          <Container size="wide" className="py-4 sm:py-5">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {resolvedTrustPillars.map((pillar) => {
                const Icon = PILLAR_ICONS[pillar.icon] ?? BadgeCheck;
                return (
                  <li key={pillar.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-accent text-accent-foreground">
                      <Icon className="size-4" strokeWidth={2} aria-hidden />
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
          </Container>
        </div>
      )}
    </section>
  );
}

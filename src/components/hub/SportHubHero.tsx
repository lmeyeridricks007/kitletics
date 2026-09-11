import Link from "next/link";
import { ArrowRight, Footprints, Watch, Layers } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import type { SportHubData } from "@/lib/hubs/types";

export function SportHubHero({ data }: { data: SportHubData }) {
  const { config, breadcrumbs } = data;

  return (
    <section className="relative overflow-hidden border-b border-border bg-mesh">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <Container className="relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14 lg:py-16">
        <div className="space-y-5">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">
            {config.hero.eyebrow}
          </p>
          <h1 className="max-w-xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {config.hero.title}
          </h1>
          <p className="max-w-lg text-base text-muted sm:text-lg">
            {config.hero.description}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <ButtonLink href={config.hero.primaryCta.href} size="lg">
              {config.hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={config.hero.secondaryCta.href}
              variant="outline"
              size="lg"
            >
              {config.hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        <RunningHeroVisual />
      </Container>
    </section>
  );
}

function RunningHeroVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm lg:max-w-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(10,132,255,0.14),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(26,31,43,0.08),transparent_50%)]" />
      <div className="absolute inset-6 grid grid-cols-2 gap-3 sm:inset-8 sm:gap-4">
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface/90 p-4 backdrop-blur-sm">
          <Footprints className="size-6 text-accent" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] font-medium tracking-wide text-subtle uppercase">
              Footwear
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-foreground">
              Running shoes
            </p>
            <p className="mt-1 text-xs text-muted">Daily · Race · Trail</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col justify-between rounded-xl border border-border/80 bg-surface/90 p-4 backdrop-blur-sm">
          <Watch className="size-6 text-accent" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] font-medium tracking-wide text-subtle uppercase">
              Tech
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-foreground">
              GPS watches
            </p>
            <p className="mt-1 text-xs text-muted">Pace · Load · Maps</p>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-4 rounded-xl border border-border/80 bg-charcoal-950 p-4 text-white dark:bg-charcoal-900">
          <Layers className="size-5 shrink-0 text-accent" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
              Decision stack
            </p>
            <p className="truncate font-display text-sm font-semibold">
              Use case → category → product
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-accent" />
        </div>
      </div>
    </div>
  );
}

export function PrimaryActionsBar({ data }: { data: SportHubData }) {
  const { primaryActions } = data.config;
  return (
    <section className="border-b border-border bg-surface">
      <Container className="py-6 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {primaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.featured
                  ? "group relative overflow-hidden rounded-2xl bg-charcoal-950 p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-charcoal-900"
                  : "group rounded-2xl border border-border bg-surface-elevated p-5 transition-colors hover:border-accent"
              }
            >
              {action.featured && (
                <span className="mb-3 inline-block text-[10px] font-medium tracking-wide text-accent uppercase">
                  Start here
                </span>
              )}
              <p
                className={
                  action.featured
                    ? "font-display text-lg font-semibold"
                    : "font-display text-base font-semibold text-foreground group-hover:text-accent"
                }
              >
                {action.label}
              </p>
              {action.description && (
                <p
                  className={
                    action.featured
                      ? "mt-2 text-sm text-white/70"
                      : "mt-2 text-sm text-muted"
                  }
                >
                  {action.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

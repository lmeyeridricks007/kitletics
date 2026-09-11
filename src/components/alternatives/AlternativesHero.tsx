import Image from "next/image";
import {
  BadgeCheck,
  Database,
  FlaskConical,
  RefreshCw,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { SourceProductSummary } from "@/components/alternatives/SourceProductSummary";
import type { AlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const TRUST_ICONS = [BadgeCheck, Database, FlaskConical, RefreshCw] as const;

interface AlternativesHeroProps {
  data: AlternativesPageData;
}

export function AlternativesHero({ data }: AlternativesHeroProps) {
  const {
    product,
    breadcrumbs,
    source,
    config,
    lastUpdatedLabel,
    nextReviewLabel,
    heroBackgroundSrc,
  } = data;

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-muted">
      {heroBackgroundSrc && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block" aria-hidden>
          <Image
            src={heroBackgroundSrc}
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="48vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-muted via-surface-muted/80 to-transparent" />
        </div>
      )}

      <Container className="relative py-8 sm:py-10 lg:py-12">
        <Breadcrumbs items={breadcrumbs} className="mb-5" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(260px,0.85fr)] lg:items-center lg:gap-10">
          <div className="min-w-0 space-y-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
              Alternatives guide
            </p>
            <h1 className="font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.35rem] leading-[1.1]">
              Best Alternatives to{" "}
              <span className="block sm:inline">{product.fullName}</span>
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted">
              {source.intro || source.summary}
            </p>
            {(lastUpdatedLabel || nextReviewLabel) && (
              <p className="text-[12px] text-subtle">
                {lastUpdatedLabel && <>Last updated: {lastUpdatedLabel}</>}
                {lastUpdatedLabel && nextReviewLabel && " · "}
                {nextReviewLabel && <>Next review: {nextReviewLabel}</>}
              </p>
            )}

            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {config.trustIndicators.map((item, i) => {
                const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
                return (
                  <li
                    key={item.title}
                    className="inline-flex items-center gap-1.5 text-[12px] text-muted"
                  >
                    <Icon className="size-3.5 shrink-0 text-foreground" aria-hidden />
                    <span className="font-medium text-foreground">
                      {item.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[5/3] w-full overflow-hidden">
              {source.media ? (
                <Image
                  src={source.media.src}
                  alt={
                    source.media.alt ??
                    `${product.fullName} product image`
                  }
                  fill
                  className="object-contain drop-shadow-md"
                  sizes="(max-width: 1024px) 90vw, 36vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/60 text-sm text-subtle">
                  Image unavailable
                </div>
              )}
            </div>
          </div>

          <div className="lg:justify-self-end lg:w-full lg:max-w-[300px]">
            <SourceProductSummary data={data} />
          </div>
        </div>
      </Container>
    </section>
  );
}

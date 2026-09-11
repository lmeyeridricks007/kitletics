import Image from "next/image";
import {
  BadgeCheck,
  BarChart3,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ToolsRecommendationCard } from "@/components/tools-hub/ToolsRecommendationCard";
import type { ToolsHubData } from "@/lib/tools/get-tools-hub-data";

const TRUST_ICONS = [BadgeCheck, BarChart3, RefreshCw, UserRound] as const;

interface ToolsHeroProps {
  data: ToolsHubData;
}

export function ToolsHero({ data }: ToolsHeroProps) {
  const { hero, recommendation, breadcrumbs } = data;

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      {hero.heroImageSrc && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
          aria-hidden
        >
          <Image
            src={hero.heroImageSrc}
            alt=""
            fill
            className="object-cover object-center"
            sizes="55vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent" />
        </div>
      )}

      <Container size="wide" className="relative py-7 sm:py-8 lg:py-9">
        <Breadcrumbs items={breadcrumbs} className="mb-5" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.45fr)_minmax(260px,0.7fr)]">
          <div className="min-w-0 space-y-4 lg:max-w-xl">
            <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="font-display text-[2rem] font-bold tracking-tight text-foreground sm:text-[2.55rem] leading-[1.05]">
              <span className="block">{hero.titleLine1}</span>
              <span className="block">{hero.titleLine2}</span>
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted">
              {hero.description}
            </p>

            <ul className="flex flex-wrap gap-x-5 gap-y-2.5 pt-1">
              {hero.trust.map((item, i) => {
                const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
                return (
                  <li
                    key={item.title}
                    className="inline-flex items-center gap-1.5 text-[12px] text-muted"
                  >
                    <Icon
                      className="size-3.5 shrink-0 text-accent"
                      aria-hidden
                    />
                    <span>
                      <span className="font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="text-subtle"> · {item.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {hero.heroImageSrc && (
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted lg:hidden">
              <Image
                src={hero.heroImageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          )}

          <div className="hidden xl:block" aria-hidden />

          <div className="lg:justify-self-end">
            <ToolsRecommendationCard recommendation={recommendation} />
          </div>
        </div>
      </Container>
    </section>
  );
}

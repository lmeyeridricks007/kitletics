"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { LongFormGuidePageData } from "@/lib/guides/get-long-form-guide-page-data";

interface GuideHeroProps {
  data: LongFormGuidePageData;
  sidebar: ReactNode;
}

export function GuideHero({ data, sidebar }: GuideHeroProps) {
  const { guide, config, author, readingMinutes, lastUpdatedLabel, nextReviewLabel } =
    data;
  const title = config?.displayTitle ?? guide.title;
  const deck = config?.deck ?? guide.subtitle ?? guide.shortDescription;
  const heroSrc = config?.heroImageSrc;
  const eyebrow = config?.eyebrow ?? "Buying Guide";

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      {heroSrc && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block"
          aria-hidden
        >
          <Image
            src={heroSrc}
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="42vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
        </div>
      )}

      <div className="relative mx-auto grid max-w-[var(--container)] gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:gap-12 lg:px-8 lg:py-12">
        <div className="min-w-0">
          <Breadcrumbs items={data.breadcrumbs} className="mb-5" />
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-[1.85rem] font-bold tracking-tight text-foreground sm:text-[2.4rem] leading-[1.12]">
            {title}
          </h1>
          {deck && (
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              {deck}
            </p>
          )}

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <li className="flex items-start gap-2 text-[12px] text-muted">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
              <span>
                <span className="font-semibold text-foreground">Expert Guide</span>
                <span className="block">
                  {author
                    ? `By ${author.name}`
                    : "Researched & written by Kitletics specialists."}
                </span>
              </span>
            </li>
            {lastUpdatedLabel && (
              <li className="flex items-start gap-2 text-[12px] text-muted">
                <RefreshCw className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                <span>
                  <span className="font-semibold text-foreground">Updated</span>
                  <span className="block">{lastUpdatedLabel}</span>
                </span>
              </li>
            )}
            {nextReviewLabel && (
              <li className="flex items-start gap-2 text-[12px] text-muted">
                <BookOpen className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                <span>
                  <span className="font-semibold text-foreground">Next review</span>
                  <span className="block">{nextReviewLabel}</span>
                </span>
              </li>
            )}
            <li className="flex items-start gap-2 text-[12px] text-muted">
              <Clock className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
              <span>
                <span className="font-semibold text-foreground">Reading time</span>
                <span className="block">{readingMinutes} min read</span>
              </span>
            </li>
          </ul>

          {heroSrc && (
            <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden lg:hidden">
              <Image
                src={heroSrc}
                alt={config?.heroImageAlt ?? ""}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </div>

        <div className="lg:pt-8">{sidebar}</div>
      </div>
    </section>
  );
}

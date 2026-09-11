"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  GuideNumberedHeading,
  GuideSection,
} from "@/components/guides/GuidePrimitives";
import type { GuideFactorPanel } from "@/lib/guides/long-form-config";
import type { GuideProductCardData } from "@/lib/guides/get-long-form-guide-page-data";
import { cn } from "@/lib/utils";

export function GuideFactorsSection({
  number,
  factors,
  productMedia,
}: {
  number: number;
  factors: GuideFactorPanel[];
  productMedia: Record<string, GuideProductCardData | undefined>;
}) {
  const [activeId, setActiveId] = useState(factors[0]?.id ?? "");
  const active = factors.find((f) => f.id === activeId) ?? factors[0];

  if (!active) return null;

  return (
    <GuideSection id="factors">
      <GuideNumberedHeading number={number} title="Key factors explained" />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        These factors change the ride and buying decision. None is universally
        “better” — match them to how and where you run.
      </p>

      <div
        role="tablist"
        aria-label="Shoe factors"
        className="mt-6 flex gap-1 overflow-x-auto border-b border-border"
      >
        {factors.map((f) => {
          const selected = f.id === active.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(f.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 text-[12px] font-semibold tracking-wide transition-colors",
                selected
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <ul className="space-y-2.5">
          {active.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-[14px] leading-snug text-foreground"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-accent"
                strokeWidth={2.5}
                aria-hidden
              />
              {b}
            </li>
          ))}
          {active.browseHref && (
            <li className="pt-2">
              <Link
                href={active.browseHref}
                className="text-[13px] font-medium text-link hover:underline"
              >
                {active.browseLabel ?? "Browse related shoes →"}
              </Link>
            </li>
          )}
        </ul>

        {active.levels && active.levels.length > 0 && (
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
              {active.label} levels
            </p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {active.levels.map((level) => {
                const card = level.productId
                  ? productMedia[level.productId]
                  : undefined;
                return (
                  <li
                    key={level.id}
                    className="border border-border bg-white p-3"
                  >
                    {card?.media && (
                      <div className="relative mb-2 aspect-[5/3] overflow-hidden bg-surface-muted">
                        <Image
                          src={card.media.src}
                          alt={card.media.alt ?? card.product.fullName}
                          fill
                          className="object-contain p-1"
                          sizes="160px"
                        />
                      </div>
                    )}
                    <p className="text-[13px] font-bold">{level.label}</p>
                    <p className="mt-1 text-[12px] leading-snug text-muted">
                      {level.description}
                    </p>
                    {card && (
                      <Link
                        href={`/products/${card.product.slug}`}
                        className="mt-2 inline-block text-[11px] font-medium text-link hover:underline"
                      >
                        Example: {card.brand?.name} {card.product.name} →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </GuideSection>
  );
}

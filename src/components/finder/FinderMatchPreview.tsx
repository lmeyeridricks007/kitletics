"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinderPreviewPayload } from "@/lib/finder/preview-action";
import type { ResolvedFinderStep } from "@/lib/finder/resolve-steps";

interface FinderMatchPreviewProps {
  preview: FinderPreviewPayload | null;
  loading?: boolean;
  steps: ResolvedFinderStep[];
  currentStepIndex: number;
  methodologyHref?: string;
}

export function FinderMatchPreview({
  preview,
  loading,
  steps,
  currentStepIndex,
  methodologyHref = "/guides/how-to-choose-running-shoes",
}: FinderMatchPreviewProps) {
  const quality = preview?.matchQuality ?? 0;
  const displaySteps = steps;
  // Semicircle arc length = π * r with r=56
  const arcLen = Math.PI * 56;
  const dash = (quality / 100) * arcLen;

  return (
    <div className="space-y-4">
      <aside className="rounded border border-white/10 bg-[#12181c] p-5 text-white">
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">
          Your match preview
        </p>

        <div className="mt-4 flex flex-col items-center">
          <div
            className="relative h-[76px] w-[140px]"
            role="img"
            aria-label={`${quality}% ${preview?.matchQualityLabel ?? "Match quality"}`}
          >
            <svg viewBox="0 0 140 80" className="size-full" aria-hidden>
              <path
                d="M 14 72 A 56 56 0 0 1 126 72"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 14 72 A 56 56 0 0 1 126 72"
                fill="none"
                stroke="var(--color-accent, #c8f135)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${arcLen}`}
                className="transition-[stroke-dasharray]"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-0.5">
              <span className="font-display text-[1.65rem] font-bold leading-none text-accent">
                {loading ? "…" : `${quality}%`}
              </span>
            </div>
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-white/70">
            {preview?.matchQualityLabel ?? "Match quality"}
            <Link
              href={methodologyHref}
              className="text-white/40 hover:text-accent"
              aria-label="How matching works"
            >
              <Info className="size-3.5" />
            </Link>
          </p>
          <p className="mt-2 text-center text-[11px] leading-snug text-white/45">
            Compatibility based on your answers and product data — not a
            probability of satisfaction.
          </p>
        </div>

        <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
          {displaySteps.map((step, index) => {
            const done = !step.isResults && index < currentStepIndex;
            const current = index === currentStepIndex && !step.isResults;
            return (
              <li
                key={step.id}
                className="flex items-center gap-2 text-[12px] text-white/70"
              >
                <span
                  className={cn(
                    "inline-flex size-4 items-center justify-center rounded-full",
                    done
                      ? "bg-accent text-[#0b1220]"
                      : current
                        ? "border border-accent"
                        : "border border-white/25",
                  )}
                  aria-hidden
                >
                  {done && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                {step.shortTitle}
              </li>
            );
          })}
        </ul>
      </aside>

      <aside className="rounded border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
          Top matches (preview)
        </p>

        {!preview?.ready || preview.matches.length === 0 ? (
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            {preview?.message ??
              "Answer a few more questions to preview your matches."}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {preview.matches.map((m) => (
              <li key={m.productId} className="flex gap-3">
                <Link
                  href={m.href}
                  className="relative size-14 shrink-0 overflow-hidden rounded bg-surface-muted"
                >
                  {m.imageSrc ? (
                    <Image
                      src={m.imageSrc}
                      alt={m.imageAlt || m.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[9px] text-subtle">
                      Image unavailable
                    </span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={m.href}
                    className="block truncate text-[13px] font-semibold text-foreground hover:text-accent"
                  >
                    {m.name}
                  </Link>
                  {typeof m.score === "number" && m.scoreLabel && (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded bg-[#123524] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      <span className="text-accent">
                        {(m.score / 10).toFixed(1)}
                      </span>
                      {m.scoreLabel}
                    </span>
                  )}
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                    {m.roleLabel}
                  </p>
                  <Link
                    href={m.href}
                    className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2563eb]"
                  >
                    View details
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

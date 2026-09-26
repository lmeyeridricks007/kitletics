"use client";

import Link from "next/link";
import {
  Check,
  Footprints,
  Layers,
  Map,
  Target,
  User,
  BookOpen,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResolvedFinderStep } from "@/lib/finder/resolve-steps";
import { stepIsComplete } from "@/lib/finder/resolve-steps";
import type { FinderResponses } from "@/domain/finders/types";

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  Footprints,
  Map,
  User,
  Layers,
  Target,
  Shield,
};

interface FinderProgressSidebarProps {
  steps: ResolvedFinderStep[];
  currentStepIndex: number;
  responses: FinderResponses;
  summaryRows: { key: string; label: string; value: string; icon?: string }[];
  onEditSummary?: () => void;
  onJumpToStep?: (index: number) => void;
  helpGuideHref?: string;
  helpGuideLabel?: string;
  /** When true, all question steps are complete and Results is current */
  resultsComplete?: boolean;
  /** Server-rendered Edit link (results page) */
  editHref?: string;
}

export function FinderProgressSidebar({
  steps,
  currentStepIndex,
  responses,
  summaryRows,
  onEditSummary,
  onJumpToStep,
  helpGuideHref,
  helpGuideLabel,
  resultsComplete = false,
  editHref,
}: FinderProgressSidebarProps) {
  const questionSteps = steps.filter((s) => !s.isResults);
  const total = steps.length;
  const displayIndex = resultsComplete
    ? Math.max(0, total - 1)
    : Math.min(currentStepIndex, Math.max(0, total - 1));
  const completedBefore = resultsComplete
    ? questionSteps.length
    : questionSteps.filter((_, i) => i < currentStepIndex).length;
  const currentComplete = resultsComplete
    ? true
    : stepIsComplete(
        questionSteps[Math.min(currentStepIndex, questionSteps.length - 1)] ??
          questionSteps[0],
        responses,
      );
  const completedCount = resultsComplete
    ? questionSteps.length
    : completedBefore + (currentComplete ? 0.35 : 0);
  const pct =
    total > 0
      ? Math.round(
          (completedCount / Math.max(1, questionSteps.length)) * 100,
        )
      : 0;
  const clampedPct = resultsComplete
    ? 100
    : Math.min(100, Math.max(8, pct));

  return (
    <aside className="flex h-full min-h-[calc(100vh-8rem)] flex-col bg-[#12181c] text-white">
      <div className="flex-1 space-y-6 p-5 sm:p-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">
            Your progress
          </p>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={clampedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress ${clampedPct} percent`}
          >
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${clampedPct}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-white/70">
            {resultsComplete
              ? `${total} of ${total} completed`
              : `Step ${Math.min(displayIndex + 1, total)} of ${total}`}
          </p>
        </div>

        <ol className="space-y-1">
          {steps.map((step, index) => {
            const isResults = step.isResults;
            const isDone =
              resultsComplete || (!isResults && index < currentStepIndex);
            const isCurrent = resultsComplete
              ? isResults
              : !isResults && index === currentStepIndex;
            const jumpable =
              !resultsComplete && !isResults && index <= currentStepIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (jumpable) onJumpToStep?.(index);
                  }}
                  disabled={!jumpable}
                  className={cn(
                    "flex w-full items-center gap-3 rounded px-2 py-2 text-left text-[13px] transition-colors",
                    isCurrent && "bg-white/10",
                    !jumpable && "cursor-default",
                    !resultsComplete && !jumpable && "opacity-50",
                    jumpable && "hover:bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      isDone || isCurrent
                        ? "bg-accent text-[#0b1220]"
                        : "border border-white/30 text-white/60",
                    )}
                    aria-hidden
                  >
                    {isDone && !isCurrent ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : isDone && isCurrent && isResults ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      isCurrent ? "font-semibold text-white" : "text-white/75",
                    )}
                  >
                    {step.shortTitle}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">
              Your summary
            </p>
            {editHref ? (
              <Link
                href={editHref}
                className="text-[12px] font-semibold text-accent hover:underline"
              >
                Edit answers
              </Link>
            ) : onEditSummary ? (
              <button
                type="button"
                onClick={() => onEditSummary()}
                className="text-[12px] font-semibold text-accent hover:underline"
              >
                Edit
              </button>
            ) : null}
          </div>
          {summaryRows.length === 0 ? (
            <p className="mt-3 text-[12px] text-white/45">
              Your answers will appear here as you go.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {summaryRows.map((row) => {
                const Icon = SUMMARY_ICONS[row.icon ?? ""] ?? Footprints;
                return (
                  <li key={row.key} className="flex items-start gap-2.5">
                    <Icon
                      className="mt-0.5 size-3.5 shrink-0 text-accent"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-white/45">{row.label}</p>
                      <p className="truncate text-[12px] font-medium text-white">
                        {row.value}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {(helpGuideHref || helpGuideLabel) && (
        <div className="border-t border-white/10 p-5 sm:p-6">
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="text-[13px] font-semibold text-white">Need help?</p>
            <p className="mt-1 text-[12px] text-white/60">
              See our buying guide for context before you decide.
            </p>
            {helpGuideHref && (
              <Link
                href={helpGuideHref}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent hover:underline"
              >
                <BookOpen className="size-3.5" aria-hidden />
                {helpGuideLabel ?? "View guide"}
              </Link>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import type { FinderDefinition, FinderResponses } from "@/domain/finders/types";
import type { RegionCode } from "@/domain/shared/types";
import { getVisibleQuestions } from "@/domain/finders/normalization";
import {
  decodeFinderShareStateBrowser,
  buildFinderResultsHref,
} from "@/domain/finders/share-state";
import { withRegionalBudgetOptions } from "@/domain/finders/configs/running-shoe-finder";
import { useRegionPreference } from "@/components/region/RegionPreferenceProvider";
import { trackFinderEvent } from "@/domain/finders/analytics";
import type { FinderUiConfig } from "@/lib/finder/finder-ui-config";
import {
  formatResponseLabel,
  hasAnswer,
  resolveFinderSteps,
} from "@/lib/finder/resolve-steps";
import {
  previewFinderMatches,
  type FinderPreviewPayload,
} from "@/lib/finder/preview-action";
import { FinderProgressSidebar } from "@/components/finder/FinderProgressSidebar";
import { FinderMatchPreview } from "@/components/finder/FinderMatchPreview";
import { FinderQuestionCard } from "@/components/finder/FinderQuestionCard";
import { FinderAnswerSummary } from "@/components/finder/FinderQuestion";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { cn } from "@/lib/utils";

const VISUAL_FIXTURE_RESPONSES: FinderResponses = {
  terrain: "road",
  primaryUse: "daily-training",
  distances: ["10k", "half"],
  cushioning: "cushioned",
  stability: "not-sure",
};

export function FinderFlow({
  definition,
  uiConfig,
  initialResponses = {},
  startAtSummary = false,
  heroProducts = [],
  region: initialRegion = "NL",
  enableVisualFixture = false,
}: {
  definition: FinderDefinition;
  /** Current Finder UI only — avoid importing all FINDER_UI_BY_SLUG on the client. */
  uiConfig: FinderUiConfig;
  initialResponses?: FinderResponses;
  startAtSummary?: boolean;
  heroProducts?: {
    id: string;
    src: string;
    alt: string;
  }[];
  region?: RegionCode;
  /** Dev-only mid-flow fixture */
  enableVisualFixture?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { region: preferredRegion } = useRegionPreference();
  const region = preferredRegion || initialRegion;
  const ui = uiConfig;

  const shareFromUrl = useMemo(() => {
    const s = searchParams.get("s");
    if (!s) return null;
    const decoded = decodeFinderShareStateBrowser(s, definition.slug);
    return decoded.ok ? decoded : null;
  }, [searchParams, definition.slug]);

  const regionalDefinition = useMemo(
    () => withRegionalBudgetOptions(definition, region),
    [definition, region],
  );

  const [responses, setResponses] = useState<FinderResponses>(() => {
    const fromShare = shareFromUrl?.responses ?? initialResponses;
    return enableVisualFixture
      ? { ...VISUAL_FIXTURE_RESPONSES, ...fromShare }
      : fromShare;
  });
  const [stepIndex, setStepIndex] = useState(() =>
    enableVisualFixture ? 2 : startAtSummary || searchParams.get("edit") === "1"
      ? 999
      : 0,
  );
  const [phase, setPhase] = useState<"flow" | "summary">(
    (startAtSummary || searchParams.get("edit") === "1") && !enableVisualFixture
      ? "summary"
      : "flow",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<FinderPreviewPayload | null>(null);
  const [previewPending, startPreviewTransition] = useTransition();

  const [navPending, setNavPending] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareFromUrl) return;
    setResponses((prev) =>
      Object.keys(prev).length ? prev : shareFromUrl.responses,
    );
    if (searchParams.get("edit") === "1") {
      setPhase("summary");
      setStepIndex(999);
    }
  }, [shareFromUrl, searchParams]);

  const steps = useMemo(
    () => resolveFinderSteps(regionalDefinition, responses, ui),
    [regionalDefinition, responses, ui],
  );

  // Clamp step when visible steps change
  useEffect(() => {
    if (phase !== "flow") return;
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, stepIndex, phase]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const questionSteps = steps.filter((s) => !s.isResults);
  const progressTotal = steps.length;
  const questionStepCount = questionSteps.length;

  const requiredKeys = useMemo(() => {
    return getVisibleQuestions(regionalDefinition, responses)
      .filter((q) => q.required)
      .map((q) => q.key);
  }, [regionalDefinition, responses]);

  const refreshPreview = useCallback(() => {
    startPreviewTransition(async () => {
      const payload = await previewFinderMatches({
        finderSlug: definition.slug,
        responses,
        region,
        requiredKeys,
        previewMinAnswered: ui.previewMinAnswered ?? 2,
      });
      setPreview(payload);
    });
  }, [definition.slug, responses, region, requiredKeys, ui.previewMinAnswered]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  useEffect(() => {
    trackFinderEvent("finder_started", { finderId: definition.id });
  }, [definition.id]);

  const summaryRows = useMemo(() => {
    const fields =
      ui.summaryFields.length > 0
        ? ui.summaryFields
        : definition.questions.slice(0, 5).map((q) => ({
            key: q.key,
            label: q.title,
            icon: "Footprints",
          }));
    return fields
      .map((f) => {
        const value = formatResponseLabel(definition, f.key, responses);
        if (!value) return null;
        return { key: f.key, label: f.label, value, icon: f.icon };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [ui.summaryFields, definition, responses]);

  function setAnswer(key: string, value: FinderResponses[string]) {
    setResponses((prev) => {
      const next = { ...prev, [key]: value };
      // Clear dependent answers when parent changes
      for (const q of definition.questions) {
        if (!q.showWhen) continue;
        if (q.showWhen.key !== key) continue;
        delete next[q.key];
      }
      return next;
    });
    setErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
    trackFinderEvent("finder_question_answered", {
      finderId: definition.id,
      questionKey: key,
    });
  }

  function validateCurrentStep(): boolean {
    if (!currentStep || currentStep.isResults) return true;
    const nextErrors: Record<string, string> = {};
    for (const q of currentStep.questions) {
      if (!q.required) continue;
      if (!hasAnswer(responses[q.key])) {
        nextErrors[q.key] = "Please select an option to continue.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (!currentStep) return;
    if (currentStep.isResults) {
      seeResults();
      return;
    }
    if (!validateCurrentStep()) return;

    const nextIdx = stepIndex + 1;
    const nextStep = steps[nextIdx];
    if (!nextStep || nextStep.isResults) {
      setPhase("summary");
      setStepIndex(questionSteps.length);
      return;
    }
    setStepIndex(nextIdx);
    trackFinderEvent("finder_step_viewed", {
      finderId: definition.id,
      step: nextIdx,
    });
  }

  function back() {
    if (phase === "summary") {
      setPhase("flow");
      setStepIndex(Math.max(0, questionSteps.length - 1));
      return;
    }
    if (stepIndex <= 0) return;
    setStepIndex((s) => s - 1);
  }

  function seeResults() {
    if (navPending) return;
    setNavError(null);
    setNavPending(true);
    try {
      const href = buildFinderResultsHref(definition, responses);
      trackFinderEvent("finder_completed", { finderId: definition.id });
      // Hard navigate: App Router soft nav from middleware-rewritten
      // `/tools/<slug>` (→ `/tools/finder/<slug>`) to `/tools/<slug>/results`
      // can no-op and leave the user on the summary screen.
      if (typeof window !== "undefined") {
        window.location.assign(href);
        return;
      }
      router.push(href);
    } catch {
      setNavPending(false);
      setNavError("Could not open your matches. Please try again.");
    }
  }

  function editKey(key: string) {
    const idx = steps.findIndex((s) =>
      s.questions.some((q) => q.key === key),
    );
    if (idx >= 0) {
      setPhase("flow");
      setStepIndex(idx);
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: definition.title },
  ];

  const isLastQuestionStep =
    currentStep &&
    !currentStep.isResults &&
    (stepIndex >= questionStepCount - 1 ||
      steps[stepIndex + 1]?.isResults);

  if (phase === "summary") {
    return (
      <div className="border-t border-border bg-surface-muted">
        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[250px_minmax(0,1fr)_300px]">
          <div className="hidden lg:block">
            <div className="sticky top-0 h-[calc(100vh-0px)] overflow-y-auto">
              <FinderProgressSidebar
                steps={steps}
                currentStepIndex={questionSteps.length}
                responses={responses}
                summaryRows={summaryRows}
                onEditSummary={() => setPhase("flow")}
                onJumpToStep={(i) => {
                  setPhase("flow");
                  setStepIndex(i);
                }}
                helpGuideHref={ui.helpGuideHref}
                helpGuideLabel={ui.helpGuideLabel}
              />
            </div>
          </div>
          <div className="bg-white px-4 py-8 sm:px-8">
            <FinderAnswerSummary
              definition={definition}
              responses={responses}
              onEdit={editKey}
              heading={ui.summaryHeading ?? "Your profile"}
            />
            {navError && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {navError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-sm font-medium"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <button
                type="button"
                onClick={seeResults}
                disabled={navPending}
                aria-busy={navPending}
                className="ml-auto inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-[#0b1220] uppercase disabled:opacity-60"
              >
                {navPending ? "Loading matches…" : "See my matches"}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="hidden border-l border-[#0d1216] bg-[#0d1216] p-4 lg:block">
            <div className="sticky top-4">
              <FinderMatchPreview
                preview={preview}
                loading={previewPending}
                steps={steps}
                currentStepIndex={questionSteps.length}
                methodologyHref={ui.helpGuideHref}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        {/* Left rail */}
        <div className="hidden lg:block">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            <FinderProgressSidebar
              steps={steps}
              currentStepIndex={Math.min(stepIndex, questionStepCount - 1)}
              responses={responses}
              summaryRows={summaryRows}
              onEditSummary={() => {
                const firstAnswered = steps.findIndex((s) =>
                  s.questions.some((q) => hasAnswer(responses[q.key])),
                );
                if (firstAnswered >= 0) setStepIndex(firstAnswered);
              }}
              onJumpToStep={setStepIndex}
              helpGuideHref={ui.helpGuideHref}
              helpGuideLabel={ui.helpGuideLabel}
            />
          </div>
        </div>

        {/* Center */}
        <div className="min-w-0 px-4 py-5 sm:px-7 sm:py-6">
          {/* Mobile progress */}
          <div className="mb-4 lg:hidden">
            <p className="text-[11px] font-bold tracking-wide text-subtle uppercase">
              Step {Math.min(stepIndex + 1, progressTotal)} of {progressTotal}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{
                  width: `${Math.round(((stepIndex + 1) / Math.max(1, progressTotal)) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-[12px] font-medium text-foreground">
              {currentStep?.shortTitle}
            </p>
          </div>

          <Breadcrumbs items={breadcrumbs} className="mb-4" />

          <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(140px,0.5fr)] lg:items-start">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                {ui.eyebrow}
              </p>
              <h1 className="mt-1.5 font-display text-[1.6rem] font-bold tracking-tight text-foreground sm:text-[1.95rem] leading-[1.1]">
                {ui.headline}
              </h1>
              <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
                {ui.supportingCopy}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {typeof ui.estimatedTimeMinutes === "number" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
                    <Clock3 className="size-3" aria-hidden />
                    Takes ~{ui.estimatedTimeMinutes} minutes
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
                  <ShieldCheck className="size-3" aria-hidden />
                  Free · No signup required
                </span>
              </div>
            </div>
            {heroProducts.length > 0 && (
              <div className="relative hidden h-24 sm:block lg:h-28">
                {heroProducts.slice(0, 3).map((p, i) => (
                  <div
                    key={p.id}
                    className="absolute top-0 aspect-square w-[44%] overflow-hidden"
                    style={{
                      left: `${i * 26}%`,
                      zIndex: 3 - i,
                      transform: `rotate(${(i - 1) * 7}deg)`,
                    }}
                  >
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      sizes="120px"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-border bg-white p-4 sm:p-5">
            <p className="inline-flex rounded bg-[#f4ffe0] px-2 py-1 text-[11px] font-bold tracking-wide text-[#0b1220] uppercase">
              Step {Math.min(stepIndex + 1, progressTotal)} of {progressTotal}
            </p>

            {currentStep && !currentStep.isResults && (
              <div className="mt-4 space-y-7">
                {currentStep.questions.map((q) => (
                  <FinderQuestionCard
                    key={q.id}
                    question={q}
                    value={responses[q.key]}
                    onChange={(v) => setAnswer(q.key, v)}
                    error={errors[q.key]}
                  />
                ))}

                {currentStep.questions.some((q) => q.key === "stability") && (
                  <div className="flex gap-2 border border-[#e8efc8] bg-[#f7fbe8] px-3 py-2.5 text-[12px] text-muted">
                    <span className="font-semibold text-foreground">
                      Not sure?
                    </span>
                    That&apos;s fine. Choose what you know — we won&apos;t
                    diagnose gait from a click.
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={back}
                disabled={stepIndex === 0}
                className={cn(
                  "inline-flex items-center gap-2 border border-border bg-[#f3f4f6] px-4 py-2.5 text-sm font-medium text-foreground",
                  stepIndex === 0 && "pointer-events-none opacity-40",
                )}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                className="ml-auto inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
              >
                {isLastQuestionStep ? "See my matches" : "Next question"}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Mobile preview */}
          <div className="mt-6 space-y-3 lg:hidden">
            <details className="border border-border bg-white p-3">
              <summary className="cursor-pointer text-[13px] font-semibold">
                Your answers ({summaryRows.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {summaryRows.map((r) => (
                  <li key={r.key} className="text-[12px] text-muted">
                    <span className="font-medium text-foreground">{r.label}:</span>{" "}
                    {r.value}
                  </li>
                ))}
              </ul>
            </details>
            <FinderMatchPreview
              preview={preview}
              loading={previewPending}
              steps={steps}
              currentStepIndex={Math.min(stepIndex, questionStepCount - 1)}
              methodologyHref={ui.helpGuideHref}
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
            {[
              "Evidence-backed recommendations",
              "Unbiased & independent",
              "Fresh product & price data",
              "Find what fits you",
            ].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right rail */}
        <div className="hidden border-l border-[#0d1216] bg-[#0d1216] p-4 lg:block">
          <div className="sticky top-4">
            <FinderMatchPreview
              preview={preview}
              loading={previewPending}
              steps={steps}
              currentStepIndex={Math.min(stepIndex, questionStepCount - 1)}
              methodologyHref={ui.helpGuideHref}
            />
            {preview?.ready && (
              <button
                type="button"
                onClick={() => {
                  if (isLastQuestionStep) seeResults();
                  else next();
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#2563eb]"
              >
                See all matches
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared Kitletics Finder shell — alias for reusable framework consumers */
export { FinderFlow as FinderShell };

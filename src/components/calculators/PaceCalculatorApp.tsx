"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Clock3, ShieldCheck } from "lucide-react";
import type { CalculatorDefinition } from "@/domain/calculators/types";
import type { Tool } from "@/domain/tools/types";
import { RACE_DISTANCES, getRaceDistanceById } from "@/domain/calculators/running/distances";
import {
  runPaceCalculation,
  type PaceCalcMode,
} from "@/domain/calculators/running/pace";
import {
  generateSplits,
  negativeSplitPaceSummary,
  type SplitIntervalMode,
} from "@/domain/calculators/running/splits";
import {
  distanceToMeters,
  formatDuration,
  formatPace,
  metersToDistance,
  paceDisplayToSecondsPerMeter,
  secondsPerMeterToPaceDisplay,
  type DistanceUnit,
} from "@/domain/calculators/units";
import {
  parsePaceUrlState,
  serializePaceUrlState,
  type PaceUrlState,
} from "@/domain/calculators/share-state";
import { trackCalculatorEvent } from "@/domain/calculators/analytics";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import {
  DurationInput,
  PaceInput,
} from "@/components/calculators/DurationInput";
import {
  ToolInputRail,
  ToolRailSection,
  ToolWorkspaceShell,
} from "@/components/tools/ToolWorkspaceShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { cn } from "@/lib/utils";

const MODES: { value: PaceCalcMode; label: string }[] = [
  { value: "pace", label: "Pace" },
  { value: "time", label: "Time" },
  { value: "distance", label: "Distance" },
];

function preferredSplitInterval(
  distanceMeters: number,
  preference: string,
): SplitIntervalMode {
  if (preference === "1km") return "1km";
  if (preference === "5km") return "5km";
  if (preference === "1mi") return "1mi";
  if (preference === "checkpoints") return "checkpoints";
  const half = 21097.5;
  const mara = 42195;
  if (
    Math.abs(distanceMeters - half) < 1 ||
    Math.abs(distanceMeters - mara) < 1
  ) {
    return "checkpoints";
  }
  if (distanceMeters > 25000) return "5km";
  return "1km";
}

function darkSelectClass() {
  return "w-full rounded border border-white/20 bg-[#0d1216] px-3 py-2.5 text-[13px] text-white outline-none focus:border-accent";
}

export function PaceCalculatorApp({
  definition,
  initialQuery,
  relatedTools = [],
  helpGuideHref,
  helpGuideLabel,
  heroImageSrc = "/images/running/category/use-race.jpg",
  estimatedMinutes = 1,
}: {
  definition: CalculatorDefinition;
  initialQuery: Record<string, string | undefined>;
  relatedTools?: Tool[];
  helpGuideHref?: string;
  helpGuideLabel?: string;
  heroImageSrc?: string;
  estimatedMinutes?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initial = parsePaceUrlState(initialQuery);

  const [mode, setMode] = useState<PaceCalcMode>(initial.mode);
  const [distanceId, setDistanceId] = useState(initial.distanceId ?? "10k");
  const [customDistance, setCustomDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    initial.distanceUnit,
  );
  const [timeSeconds, setTimeSeconds] = useState(initial.timeSeconds ?? 2730);
  const [paceSecondsPerKm, setPaceSecondsPerKm] = useState(
    initial.paceSecondsPerKm ?? 273,
  );
  const [paceUnit, setPaceUnit] = useState<"km" | "mi">(initial.paceUnit);
  const [splitPref, setSplitPref] = useState(initial.splitInterval);
  const [negativeSplit, setNegativeSplit] = useState(
    initial.negativeSplit ?? "",
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showResult, setShowResult] = useState(
    () => Boolean(initial.timeSeconds || initial.paceSecondsPerKm),
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kitletics.distanceUnit");
      if (!initialQuery.unit && (stored === "km" || stored === "mi")) {
        setDistanceUnit(stored);
      }
    } catch {
      /* ignore */
    }
    trackCalculatorEvent("calculator_opened", {
      toolId: definition.id,
      mode: initial.mode,
    });
    // Mount-once: open event + localStorage unit hydrate must not re-run on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional empty deps
  }, []);

  const distanceMeters = useMemo(() => {
    if (customDistance.trim()) {
      const n = Number(customDistance);
      if (Number.isFinite(n) && n > 0) {
        return distanceToMeters(n, distanceUnit);
      }
    }
    const preset = getRaceDistanceById(distanceId);
    return preset?.meters ?? initial.distanceMeters ?? 10000;
  }, [customDistance, distanceUnit, distanceId, initial.distanceMeters]);

  const paceSecondsPerMeter = useMemo(
    () =>
      paceDisplayToSecondsPerMeter(
        paceSecondsPerKm,
        paceUnit === "mi" ? "min_per_mile" : "min_per_km",
      ),
    [paceSecondsPerKm, paceUnit],
  );

  function changePaceUnit(next: "km" | "mi") {
    if (next === paceUnit) return;
    const spm = paceDisplayToSecondsPerMeter(
      paceSecondsPerKm,
      paceUnit === "mi" ? "min_per_mile" : "min_per_km",
    );
    const nextDisplay = Math.round(
      secondsPerMeterToPaceDisplay(
        spm,
        next === "mi" ? "min_per_mile" : "min_per_km",
      ),
    );
    setPaceSecondsPerKm(nextDisplay);
    setPaceUnit(next);
    trackCalculatorEvent("calculator_unit_changed", {
      toolId: definition.id,
      unit: next,
    });
  }

  function changeDistanceUnit(next: DistanceUnit) {
    if (customDistance.trim()) {
      const n = Number(customDistance);
      if (Number.isFinite(n) && n > 0) {
        const meters = distanceToMeters(n, distanceUnit);
        setCustomDistance(
          String(Math.round(metersToDistance(meters, next) * 1000) / 1000),
        );
      }
    }
    setDistanceUnit(next);
    try {
      localStorage.setItem("kitletics.distanceUnit", next);
    } catch {
      /* ignore */
    }
  }

  const result = useMemo(() => {
    if (!showResult) return null;
    if (mode === "pace") {
      if (!(distanceMeters > 0) || !(timeSeconds > 0)) return null;
      return runPaceCalculation({
        mode: "pace",
        distanceMeters,
        durationSeconds: timeSeconds,
      });
    }
    if (mode === "time") {
      if (!(distanceMeters > 0) || !(paceSecondsPerMeter > 0)) return null;
      return runPaceCalculation({
        mode: "time",
        distanceMeters,
        paceSecondsPerMeter,
      });
    }
    if (!(timeSeconds > 0) || !(paceSecondsPerMeter > 0)) return null;
    return runPaceCalculation({
      mode: "distance",
      durationSeconds: timeSeconds,
      paceSecondsPerMeter,
    });
  }, [showResult, mode, distanceMeters, timeSeconds, paceSecondsPerMeter]);

  const splits = useMemo(() => {
    if (!result || mode === "distance") return [];
    const interval = preferredSplitInterval(result.distanceMeters, splitPref);
    const ns =
      negativeSplit === "1"
        ? 0.01
        : negativeSplit === "2"
          ? 0.02
          : negativeSplit === "3"
            ? 0.03
            : undefined;
    return generateSplits({
      distanceMeters: result.distanceMeters,
      paceSecondsPerMeter: result.paceSecondsPerMeter,
      interval: ns ? "finish-only" : interval,
      negativeSplitFraction: ns,
    });
  }, [result, mode, splitPref, negativeSplit]);

  const nsSummary = useMemo(() => {
    if (!result || !negativeSplit) return null;
    const frac =
      negativeSplit === "1"
        ? 0.01
        : negativeSplit === "2"
          ? 0.02
          : negativeSplit === "3"
            ? 0.03
            : 0;
    if (!frac) return null;
    return negativeSplitPaceSummary(
      result.distanceMeters,
      result.paceSecondsPerMeter,
      frac,
    );
  }, [result, negativeSplit]);

  const commitUrl = useCallback(() => {
    if (!result) return;
    const state: PaceUrlState = {
      mode,
      distanceId: customDistance.trim() ? undefined : distanceId,
      distanceMeters: customDistance.trim() ? distanceMeters : undefined,
      distanceUnit,
      timeSeconds: mode === "time" ? result.durationSeconds : timeSeconds,
      paceSecondsPerKm:
        mode === "pace"
          ? result.conversions.pacePerKmSeconds
          : paceUnit === "km"
            ? paceSecondsPerKm
            : Math.round(
                secondsPerMeterToPaceDisplay(
                  paceSecondsPerMeter,
                  "min_per_km",
                ),
              ),
      paceUnit: "km",
      splitInterval: splitPref,
      negativeSplit: negativeSplit || undefined,
    };
    const qs = serializePaceUrlState(state);
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [
    result,
    mode,
    customDistance,
    distanceId,
    distanceMeters,
    distanceUnit,
    timeSeconds,
    paceSecondsPerKm,
    paceUnit,
    paceSecondsPerMeter,
    splitPref,
    negativeSplit,
    router,
    pathname,
  ]);

  useEffect(() => {
    if (!result) return;
    trackCalculatorEvent("calculator_calculated", {
      toolId: definition.id,
      mode,
      distancePreset: distanceId,
    });
    const t = setTimeout(commitUrl, 400);
    return () => clearTimeout(t);
  }, [result, mode, distanceId, definition.id, commitUrl]);

  function calculate() {
    setShowResult(true);
  }

  function resetInputs() {
    setShowResult(false);
    setMode("pace");
    setDistanceId("10k");
    setCustomDistance("");
    setTimeSeconds(2730);
    setPaceSecondsPerKm(273);
    setPaceUnit("km");
    setNegativeSplit("");
    router.replace(pathname, { scroll: false });
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const distanceLabel =
    customDistance.trim() ||
    getRaceDistanceById(distanceId)?.label ||
    `${Math.round(metersToDistance(distanceMeters, distanceUnit) * 100) / 100} ${distanceUnit}`;

  const basisLine = result
    ? mode === "pace"
      ? `Based on ${distanceLabel} in ${formatDuration(result.durationSeconds)}`
      : mode === "time"
        ? `Based on ${distanceLabel} at ${result.conversions.pacePerKmLabel}/km`
        : `Based on ${formatDuration(result.durationSeconds)} at ${result.conversions.pacePerKmLabel}/km`
    : null;

  const ctaLabel =
    mode === "pace"
      ? "Calculate pace"
      : mode === "time"
        ? "Calculate time"
        : "Calculate distance";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: definition.title },
  ];

  const liveTools = relatedTools.filter((t) => t.available);

  // Pace visualization: relative bar lengths (slower = longer). Scale against 10:00/km.
  const vizRows = result
    ? [
        {
          id: "km",
          label: "min/km",
          value: result.conversions.pacePerKmLabel,
          seconds: result.conversions.pacePerKmSeconds,
          color: "#22c55e",
        },
        {
          id: "mi",
          label: "min/mile",
          value: result.conversions.pacePerMileLabel,
          seconds: result.conversions.pacePerMileSeconds,
          color: "#3b82f6",
        },
      ]
    : [];
  const vizMax = Math.max(600, ...vizRows.map((r) => r.seconds));

  const inputRail = (
    <ToolInputRail
      footer={
        helpGuideHref ? (
          <div className="rounded border border-white/10 bg-white/5 p-4">
            <p className="text-[13px] font-semibold text-white">Need help?</p>
            <p className="mt-1 text-[12px] text-white/60">
              Learn how pace, time and distance relate — and how to use splits.
            </p>
            <Link
              href={helpGuideHref}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent hover:underline"
            >
              <BookOpen className="size-3.5" aria-hidden />
              {helpGuideLabel ?? "View pace guide"}
            </Link>
          </div>
        ) : null
      }
    >
      <ToolRailSection title="Input">
        <SegmentedControl
          label="I want to calculate"
          variant="dark"
          options={MODES}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setShowResult(false);
          }}
        />

        {mode !== "distance" && (
          <div>
            <label
              htmlFor="race-distance"
              className="mb-1.5 block text-[11px] font-medium tracking-wide text-white/55 uppercase"
            >
              Race distance
            </label>
            <select
              id="race-distance"
              value={customDistance ? "custom" : distanceId}
              onChange={(e) => {
                if (e.target.value === "custom") return;
                setDistanceId(e.target.value);
                setCustomDistance("");
              }}
              className={darkSelectClass()}
            >
              {RACE_DISTANCES.filter((d) => !d.ultra || d.id === "50k").map(
                (d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ),
              )}
              <option value="custom">Custom…</option>
            </select>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Custom"
                value={customDistance}
                onChange={(e) => setCustomDistance(e.target.value)}
                className="min-w-0 flex-1 rounded border border-white/20 bg-[#0d1216] px-3 py-2 text-[13px] text-white outline-none focus:border-accent"
              />
              <select
                aria-label="Distance unit"
                value={distanceUnit}
                onChange={(e) =>
                  changeDistanceUnit(e.target.value as DistanceUnit)
                }
                className="rounded border border-white/20 bg-[#0d1216] px-2 py-2 text-[12px] text-white"
              >
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>
        )}

        {mode !== "time" && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium tracking-wide text-white/55 uppercase">
              Your time
            </p>
            <DurationInput
              totalSeconds={timeSeconds}
              onChange={setTimeSeconds}
              variant="dark"
            />
          </div>
        )}

        {mode !== "pace" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">
                Your pace
              </p>
            </div>
            <SegmentedControl
              label="Pace units"
              variant="dark"
              options={[
                { value: "km", label: "min/km" },
                { value: "mi", label: "min/mile" },
              ]}
              value={paceUnit}
              onChange={(u) => changePaceUnit(u)}
            />
            <div className="mt-2">
              <PaceInput
                paceSeconds={paceSecondsPerKm}
                onChange={setPaceSecondsPerKm}
                variant="dark"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={calculate}
          className="inline-flex w-full items-center justify-center gap-2 bg-accent px-4 py-3 text-[13px] font-bold tracking-wide text-[#0b1220] uppercase hover:opacity-90"
        >
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </button>

        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-white/70 hover:text-accent"
            aria-expanded={advancedOpen}
          >
            Advanced options {advancedOpen ? "↑" : "↓"}
          </button>
          {advancedOpen && mode !== "distance" && (
            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="split-interval"
                  className="mb-1 block text-[11px] text-white/55 uppercase"
                >
                  Splits
                </label>
                <select
                  id="split-interval"
                  value={splitPref}
                  onChange={(e) => setSplitPref(e.target.value)}
                  className={darkSelectClass()}
                >
                  <option value="auto">Auto</option>
                  <option value="1km">Every 1 km</option>
                  <option value="5km">Every 5 km</option>
                  <option value="1mi">Every mile</option>
                  <option value="checkpoints">Race checkpoints</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="neg-split"
                  className="mb-1 block text-[11px] text-white/55 uppercase"
                >
                  Negative split plan
                </label>
                <select
                  id="neg-split"
                  value={negativeSplit}
                  onChange={(e) => setNegativeSplit(e.target.value)}
                  className={darkSelectClass()}
                >
                  <option value="">Even pace</option>
                  <option value="1">1% negative</option>
                  <option value="2">2% negative</option>
                  <option value="3">3% negative</option>
                </select>
                <p className="mt-1.5 text-[11px] text-white/45">
                  Pacing math only — not a fatigue prediction.
                </p>
              </div>
            </div>
          )}
        </div>
      </ToolRailSection>
    </ToolInputRail>
  );

  const center = (
    <div className="px-4 py-5 sm:px-7 sm:py-6">
      {/* Mobile inputs */}
      <div className="mb-5 border border-border bg-[#12181c] p-4 lg:hidden">
        <p className="text-[11px] font-bold tracking-wide text-white/50 uppercase">
          Inputs
        </p>
        <div className="mt-3 space-y-3">{/* simplified: link to scroll */}</div>
        <div className="mt-3 space-y-3 text-white">
          <SegmentedControl
            label="Calculate"
            variant="dark"
            options={MODES}
            value={mode}
            onChange={setMode}
          />
          {mode !== "time" && (
            <DurationInput
              totalSeconds={timeSeconds}
              onChange={setTimeSeconds}
              variant="dark"
            />
          )}
          <button
            type="button"
            onClick={calculate}
            className="w-full bg-accent py-3 text-[13px] font-bold text-[#0b1220] uppercase"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      <Breadcrumbs items={breadcrumbs} className="mb-4" />

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(160px,0.55fr)] lg:items-start">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            Running Pace Calculator
          </p>
          <h1 className="mt-1.5 font-display text-[1.65rem] font-bold tracking-tight text-foreground sm:text-[2rem] leading-[1.1]">
            Calculate your training paces from any race time
          </h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
            Enter distance and time to get pace, speed and race splits — or solve
            for finish time or distance.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
              <Clock3 className="size-3" aria-hidden />
              Takes ~{estimatedMinutes} minute
              {estimatedMinutes === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
              <ShieldCheck className="size-3" aria-hidden />
              Free · No signup required
            </span>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden sm:block lg:aspect-auto lg:h-36">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
            priority
          />
        </div>
      </div>

      <div aria-live="polite">
        {result ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border border-accent/40 bg-[#f7fbe8] px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-[#0b1220] uppercase">
                  Your results
                </p>
                <p className="mt-1 text-[13px] text-muted">{basisLine}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
                  {result.primaryLabel}
                </p>
                <p className="font-display text-3xl font-bold tabular-nums text-accent sm:text-4xl">
                  {result.primaryValue}
                  {result.primaryUnit && (
                    <span className="ml-1 text-lg font-semibold text-[#0b1220]">
                      {result.primaryUnit}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Pace &amp; speed summary
              </h2>
              <div className="mt-3 overflow-x-auto border border-border">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="bg-surface-muted text-[11px] tracking-wide text-subtle uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Metric
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Value
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        metric: "Pace (min/km)",
                        value: result.conversions.pacePerKmLabel,
                        note: "Time per kilometre",
                        accent: true,
                      },
                      {
                        metric: "Pace (min/mile)",
                        value: result.conversions.pacePerMileLabel,
                        note: "Time per mile",
                      },
                      {
                        metric: "Speed (km/h)",
                        value: result.conversions.speedKmhLabel,
                        note: "Average speed",
                      },
                      {
                        metric: "Speed (mph)",
                        value: result.conversions.speedMphLabel,
                        note: "Average speed",
                      },
                      {
                        metric: "Distance",
                        value: `${Math.round(metersToDistance(result.distanceMeters, "km") * 100) / 100} km`,
                        note: formatDuration(result.durationSeconds),
                      },
                    ].map((row) => (
                      <tr
                        key={row.metric}
                        className="border-t border-border"
                      >
                        <th
                          scope="row"
                          className="px-4 py-2.5 font-medium text-foreground"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                row.accent ? "bg-accent" : "bg-subtle/40",
                              )}
                              aria-hidden
                            />
                            {row.metric}
                          </span>
                        </th>
                        <td className="px-4 py-2.5 font-semibold tabular-nums">
                          {row.value}
                        </td>
                        <td className="px-4 py-2.5 text-muted">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[12px] text-muted">
                Results are exact arithmetic from your distance and time (or
                pace). Adjust for conditions and terrain as needed.
              </p>
            </section>

            <section className="mt-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Key conversions
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "min/km",
                    value: result.conversions.pacePerKmLabel,
                    highlight: true,
                  },
                  {
                    label: "min/mile",
                    value: result.conversions.pacePerMileLabel,
                  },
                  {
                    label: "km/h",
                    value: result.conversions.speedKmhLabel,
                  },
                  {
                    label: "Finish time",
                    value: formatDuration(result.durationSeconds),
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className={cn(
                      "border bg-white px-3 py-3",
                      c.highlight ? "border-accent" : "border-border",
                    )}
                  >
                    <p className="text-[10px] font-bold tracking-wide text-subtle uppercase">
                      {c.label}
                    </p>
                    <p className="mt-1 font-display text-xl font-bold tabular-nums">
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {vizRows.length > 0 && (
              <section className="mt-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Pace visualization
                </h2>
                <p className="mt-1 text-[12px] text-muted">
                  Longer bars mean slower pace (more seconds per unit distance).
                </p>
                <ul className="mt-4 space-y-3">
                  {vizRows.map((row) => (
                    <li key={row.id}>
                      <div className="mb-1 flex justify-between text-[12px]">
                        <span className="font-medium">{row.label}</span>
                        <span className="tabular-nums text-muted">
                          {row.value}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(8, (row.seconds / vizMax) * 100)}%`,
                            backgroundColor: row.color,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {nsSummary && (
              <section className="mt-6 border border-border bg-surface-muted px-4 py-3 text-[13px]">
                <p className="font-semibold">Negative split targets</p>
                <p className="mt-1 text-muted">
                  First half ~
                  {formatPace(
                    Math.round(
                      secondsPerMeterToPaceDisplay(
                        nsSummary.firstHalfPaceSpm,
                        "min_per_km",
                      ),
                    ),
                  )}
                  /km · Second half ~
                  {formatPace(
                    Math.round(
                      secondsPerMeterToPaceDisplay(
                        nsSummary.secondHalfPaceSpm,
                        "min_per_km",
                      ),
                    ),
                  )}
                  /km
                </p>
              </section>
            )}

            {splits.length > 0 && (
              <section className="mt-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Race splits
                </h2>
                <div className="mt-3 overflow-x-auto border border-border">
                  <table className="w-full min-w-[280px] text-left text-sm">
                    <thead className="bg-surface-muted text-[11px] tracking-wide text-subtle uppercase">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Point
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Cumulative
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Segment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {splits.map((row) => (
                        <tr
                          key={`${row.label}-${row.distanceMeters}`}
                          className="border-t border-border"
                        >
                          <th scope="row" className="px-4 py-2.5 font-medium">
                            {row.label}
                          </th>
                          <td className="px-4 py-2.5 tabular-nums">
                            {row.cumulativeLabel}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums text-muted">
                            {row.segmentLabel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                className="border border-border bg-white px-3 py-2 text-[12px] font-semibold"
              >
                {copied ? "Copied" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={resetInputs}
                className="border border-border bg-white px-3 py-2 text-[12px] font-semibold"
              >
                Check another time
              </button>
            </div>

            <div className="mt-6 border border-[#e5efc0] bg-[#f7fbe8] px-4 py-4">
              <p className="text-[13px] font-semibold text-[#0b1220]">
                Training for a race?
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Find shoes matched to your distance and training.
              </p>
              <Link
                href="/tools/running-shoe-finder"
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#0b1220] uppercase hover:underline"
              >
                Running Shoe Finder
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-border px-5 py-10 text-center text-[13px] text-muted">
            Enter your inputs on the left, then calculate to see pace, speed and
            splits.
          </div>
        )}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
        {[
          "Evidence-based calculations",
          "Unbiased & independent",
          "Transparent formulas",
          "Data privacy first",
          "Built for athletes",
        ].map((t) => (
          <li key={t} className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-accent" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  const right = (
    <>
      <aside className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
          Summary
        </p>
        {result ? (
          <dl className="mt-3 space-y-2 text-[12px]">
            <div>
              <dt className="text-subtle">{result.primaryLabel}</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {result.primaryValue}
                {result.primaryUnit ? ` ${result.primaryUnit}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-subtle">Distance</dt>
              <dd className="font-medium">{distanceLabel}</dd>
            </div>
            <div>
              <dt className="text-subtle">Time</dt>
              <dd className="font-medium tabular-nums">
                {formatDuration(result.durationSeconds)}
              </dd>
            </div>
            <div>
              <dt className="text-subtle">Formula</dt>
              <dd className="font-medium">Pace = time ÷ distance</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-[12px] text-muted">
            Results appear here after you calculate.
          </p>
        )}
        <button
          type="button"
          onClick={resetInputs}
          className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb]"
        >
          Check another time
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </aside>

      <aside className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
          Why these results?
        </p>
        <ul className="mt-3 space-y-2">
          {definition.methodologyBody.slice(0, 4).map((line, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-muted">
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-accent"
                strokeWidth={3}
                aria-hidden
              />
              {line}
            </li>
          ))}
        </ul>
        {definition.formulaDisplay && (
          <p className="mt-3 rounded bg-surface-muted px-2 py-1.5 font-mono text-[11px]">
            {definition.formulaDisplay}
          </p>
        )}
      </aside>

      <aside className="border border-border bg-white p-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
          Quick reference
        </p>
        <ul className="mt-3 space-y-2 text-[12px] text-muted">
          <li>
            <span className="font-medium text-foreground">Pace</span> — time per
            unit distance (min/km or min/mile)
          </li>
          <li>
            <span className="font-medium text-foreground">Speed</span> — distance
            per unit time (km/h or mph)
          </li>
          <li>
            <span className="font-medium text-foreground">Splits</span> — absolute
            distance × pace (no cumulative drift)
          </li>
        </ul>
      </aside>

      {liveTools.length > 0 && (
        <aside className="border border-border bg-white p-4">
          <p className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
            Related tools
          </p>
          <ul className="mt-3 space-y-2">
            {liveTools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-[13px] font-semibold text-foreground hover:text-accent"
                >
                  {tool.name}
                </Link>
                <p className="text-[11px] text-muted">
                  {tool.shortDescription ?? tool.description}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/tools"
            className="mt-3 inline-flex text-[12px] font-semibold text-[#2563eb]"
          >
            View all tools →
          </Link>
        </aside>
      )}
    </>
  );

  return (
    <ToolWorkspaceShell left={inputRail} center={center} right={right} />
  );
}

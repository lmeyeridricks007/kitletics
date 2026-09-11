"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { CalculatorDefinition } from "@/domain/calculators/types";
import {
  RACE_DISTANCES,
  getRaceDistanceById,
} from "@/domain/calculators/running/distances";
import {
  RIEGEL_EXPONENT,
  predictEquivalentRaceTimes,
  runRacePrediction,
} from "@/domain/calculators/running/race-predictor";
import { paceConversions } from "@/domain/calculators/running/pace";
import { formatDuration } from "@/domain/calculators/units";
import {
  buildPaceHandoffQuery,
  parsePredictorUrlState,
  serializePredictorUrlState,
} from "@/domain/calculators/share-state";
import { trackCalculatorEvent } from "@/domain/calculators/analytics";
import { DurationInput } from "@/components/calculators/DurationInput";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function RacePredictorApp({
  definition,
  initialQuery,
}: {
  definition: CalculatorDefinition;
  initialQuery: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const initial = parsePredictorUrlState(initialQuery);

  const [fromId, setFromId] = useState(initial.fromId ?? "10k");
  const [toId, setToId] = useState(initial.toId ?? "half");
  const [timeSeconds, setTimeSeconds] = useState(initial.timeSeconds ?? 2910);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exponent, setExponent] = useState(initial.exponent ?? RIEGEL_EXPONENT);
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackCalculatorEvent("calculator_opened", { toolId: definition.id });
  }, [definition.id]);

  const fromMeters =
    getRaceDistanceById(fromId)?.meters ?? initial.fromMeters ?? 10000;
  const toMeters =
    getRaceDistanceById(toId)?.meters ?? initial.toMeters ?? 21097.5;

  const prediction = useMemo(() => {
    if (!(fromMeters > 0) || !(toMeters > 0) || !(timeSeconds > 0)) return null;
    return runRacePrediction({
      sourceDistanceMeters: fromMeters,
      sourceTimeSeconds: timeSeconds,
      targetDistanceMeters: toMeters,
      exponent,
    });
  }, [fromMeters, toMeters, timeSeconds, exponent]);

  const table = useMemo(() => {
    if (!(fromMeters > 0) || !(timeSeconds > 0)) return [];
    return predictEquivalentRaceTimes({
      sourceDistanceMeters: fromMeters,
      sourceTimeSeconds: timeSeconds,
      exponent,
      includeUltra: false,
    });
  }, [fromMeters, timeSeconds, exponent]);

  const conversions = prediction
    ? paceConversions(prediction.predictedPaceSecondsPerMeter)
    : null;

  const error = useMemo(() => {
    if (!touched) return undefined;
    if (!(timeSeconds > 0)) return "Enter a finish time.";
    if (!prediction) return "We couldn't calculate that combination.";
    return undefined;
  }, [touched, timeSeconds, prediction]);

  const commitUrl = useCallback(() => {
    if (!prediction) return;
    const qs = serializePredictorUrlState({
      fromId,
      toId,
      timeSeconds,
      distanceUnit: "km",
      exponent: exponent !== RIEGEL_EXPONENT ? exponent : undefined,
    });
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [
    prediction,
    fromId,
    toId,
    timeSeconds,
    exponent,
    router,
    pathname,
  ]);

  useEffect(() => {
    if (!prediction) return;
    trackCalculatorEvent("calculator_calculated", {
      toolId: definition.id,
      distancePreset: fromId,
    });
    const t = setTimeout(commitUrl, 400);
    return () => clearTimeout(t);
  }, [prediction, fromId, definition.id, commitUrl]);

  const fromLabel = getRaceDistanceById(fromId)?.label ?? "Race";
  const toLabel = getRaceDistanceById(toId)?.label ?? "Target";

  const paceHref = prediction
    ? `/tools/running-pace-calculator?${buildPaceHandoffQuery({
        distanceId: toId,
        distanceMeters: toMeters,
        timeSeconds: prediction.predictedTimeSeconds,
      })}`
    : undefined;

  async function copyResult() {
    if (!prediction) return;
    const text = `${fromLabel} ${formatDuration(timeSeconds)} → estimated ${toLabel} ${formatDuration(prediction.predictedTimeSeconds)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    commitUrl();
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: definition.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      trackCalculatorEvent("calculator_shared", { toolId: definition.id });
    } catch {
      /* cancel */
    }
  }

  function applyPreset(params: Record<string, string>) {
    const parsed = parsePredictorUrlState(params);
    if (parsed.fromId) setFromId(parsed.fromId);
    if (parsed.toId) setToId(parsed.toId);
    if (parsed.timeSeconds) setTimeSeconds(parsed.timeSeconds);
    setTouched(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {definition.presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.params)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent"
            >
              {p.label}
            </button>
          ))}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Recent performance</legend>
          <label htmlFor="from-distance" className="text-xs text-subtle">
            Distance
          </label>
          <select
            id="from-distance"
            value={fromId}
            onChange={(e) => {
              setFromId(e.target.value);
              setTouched(true);
            }}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm"
          >
            {RACE_DISTANCES.filter((d) => d.predictionTable || ["5k", "10k", "half", "marathon", "1mi"].includes(d.id)).map(
              (d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ),
            )}
          </select>
        </fieldset>

        <div className="space-y-2">
          <p className="text-sm font-medium">Time</p>
          <DurationInput
            totalSeconds={timeSeconds}
            onChange={(s) => {
              setTimeSeconds(s);
              setTouched(true);
            }}
            idPrefix="source-time"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Predict</legend>
          <label htmlFor="to-distance" className="sr-only">
            Target distance
          </label>
          <select
            id="to-distance"
            value={toId}
            onChange={(e) => {
              setToId(e.target.value);
              setTouched(true);
            }}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm"
          >
            {RACE_DISTANCES.filter((d) =>
              ["1mi", "5k", "10k", "half", "marathon"].includes(d.id),
            ).map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </fieldset>

        <div>
          <button
            type="button"
            className="text-xs text-subtle hover:text-foreground"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide" : "Advanced"} endurance factor
          </button>
          {showAdvanced && (
            <div className="mt-3 rounded-xl border border-border p-4">
              <label htmlFor="exponent" className="text-xs text-muted">
                Endurance factor (typical {RIEGEL_EXPONENT})
              </label>
              <input
                id="exponent"
                type="number"
                step="0.01"
                min={1.01}
                max={1.15}
                value={exponent}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setExponent(n);
                }}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {prediction && conversions ? (
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-wide text-subtle uppercase">
              Predicted {toLabel}
            </p>
            <p className="mt-2 font-display text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
              {formatDuration(prediction.predictedTimeSeconds)}
            </p>
            <p className="mt-3 text-sm text-muted">
              {conversions.pacePerKmLabel} /km · {conversions.pacePerMileLabel}{" "}
              /mile
            </p>
            <p className="mt-4 text-sm text-muted">
              Based on: {fromLabel} in {formatDuration(timeSeconds)}
            </p>
            <p className="mt-2 text-xs text-subtle">
              {prediction.reliabilityLabel} · Estimated equivalent — not a
              guaranteed race outcome.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={copyResult}>
                {copied ? "Copied" : "Copy result"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={share}>
                Share
              </Button>
              {paceHref && (
                <Link
                  href={paceHref}
                  className="inline-flex h-9 items-center rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-foreground"
                  onClick={() =>
                    trackCalculatorEvent("calculator_related_tool_opened", {
                      toolId: definition.id,
                      target: "pace",
                    })
                  }
                >
                  View pacing for this prediction
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted">
            Enter a recent result to see an estimated equivalent time.
          </div>
        )}

        {table.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-semibold">
              Your equivalent race times
            </h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[240px] text-left text-sm">
                <thead className="bg-surface-muted text-xs tracking-wide text-subtle uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Distance
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Estimated time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr
                      key={row.distanceId}
                      className={cn(
                        "border-t border-border",
                        row.isSource && "bg-accent/5",
                      )}
                    >
                      <th scope="row" className="px-4 py-2.5 font-medium">
                        {row.label}
                        {row.isSource ? " (known)" : ""}
                      </th>
                      <td className="px-4 py-2.5 tabular-nums">
                        {row.timeLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Race predictors estimate equivalent fitness, not guaranteed race
              outcomes. Endurance, terrain, weather, pacing, fueling and course
              profile can materially change actual results.
            </p>
          </div>
        )}

        <p className="text-sm text-muted">
          Know your target time?{" "}
          <Link
            href="/tools/running-pace-calculator"
            className="font-medium text-accent hover:underline"
          >
            Calculate your race pace →
          </Link>
        </p>
        <p className="text-sm text-muted">
          Training for this race?{" "}
          <Link
            href="/tools/shoe-rotation-planner"
            className="font-medium text-accent hover:underline"
          >
            Build your running shoe rotation →
          </Link>
        </p>
      </div>
    </div>
  );
}

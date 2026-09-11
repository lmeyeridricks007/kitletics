"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  buildSimplePlan,
  buildAdvancedPlan,
  requiredRunPaceForTarget,
  formatRaceTime,
  parseTimeToSeconds,
  paceToSecondsPerKm,
  compareScenarios,
  type RacePlanResult,
} from "@/domain/hyrox/race-calculator";
import { getCurrentHyroxSinglesFormat } from "@/content/hyrox/competition";
import { getStationSequence } from "@/domain/competition/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Mode = "simple" | "advanced" | "target";

export function HyroxRaceCalculatorClient() {
  const format = getCurrentHyroxSinglesFormat();
  const seq = useMemo(() => getStationSequence(format), [format]);
  const [mode, setMode] = useState<Mode>("simple");
  const [pace, setPace] = useState("5:00");
  const [avgStation, setAvgStation] = useState("4:00");
  const [transitions, setTransitions] = useState("8:00");
  const [target, setTarget] = useState("1:15:00");
  const [advanced, setAdvanced] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const step of seq) {
      const id =
        step.kind === "run" ? `run-${step.runIndex}` : (step.station?.id ?? "");
      init[id] = step.kind === "run" ? "5:00" : "4:00";
    }
    return init;
  });
  const [scenarioB, setScenarioB] = useState<RacePlanResult | null>(null);

  const result = useMemo(() => {
    const tr = parseTimeToSeconds(transitions) ?? 0;
    if (mode === "simple") {
      const paceSec = paceToSecondsPerKm(pace);
      const st = parseTimeToSeconds(avgStation);
      if (paceSec == null || st == null) return null;
      return buildSimplePlan({
        format,
        averageRunPaceSecPerKm: paceSec,
        averageStationSeconds: st,
        totalTransitionSeconds: tr,
      });
    }
    if (mode === "advanced") {
      const segmentSeconds: Record<string, number> = {};
      for (const [k, v] of Object.entries(advanced)) {
        const s = parseTimeToSeconds(v);
        if (s != null) segmentSeconds[k] = s;
      }
      return buildAdvancedPlan({
        format,
        segmentSeconds,
        totalTransitionSeconds: tr,
      });
    }
    return null;
  }, [mode, pace, avgStation, transitions, advanced, format]);

  const targetResult = useMemo(() => {
    if (mode !== "target") return null;
    const t = parseTimeToSeconds(target);
    const stEach = parseTimeToSeconds(avgStation);
    const tr = parseTimeToSeconds(transitions) ?? 0;
    if (t == null || stEach == null) return null;
    const stationTotal = stEach * format.stations.length;
    return requiredRunPaceForTarget({
      format,
      targetFinishSeconds: t,
      stationSecondsTotal: stationTotal,
      transitionSeconds: tr,
    });
  }, [mode, target, avgStation, transitions, format]);

  function saveAsScenarioB() {
    if (result) setScenarioB(result);
  }

  const comparison =
    result && scenarioB ? compareScenarios(scenarioB, result) : null;

  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "HYROX Race Time Calculator" },
          ]}
          className="mb-8"
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          HYROX Race Time Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Plan finish time from your assumed run and station splits. Uses the
          verified Season {format.seasonLabel} singles station order — not a
          physiological predictor.
        </p>
        <p className="mt-2 text-xs text-muted">
          Format verified {format.lastVerifiedAt.slice(0, 10)} · Evidence-backed
          CompetitionFormat · Kitletics is not affiliated with HYROX.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["simple", "Simple"],
              ["advanced", "Advanced splits"],
              ["target", "Target finish"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm",
                mode === id ? "border-accent bg-accent/10" : "border-border",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "simple" && (
          <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-3">
            <label className="text-sm">
              Avg 1 km run pace
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                placeholder="5:00"
              />
            </label>
            <label className="text-sm">
              Avg station time
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={avgStation}
                onChange={(e) => setAvgStation(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Transition allowance
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={transitions}
                onChange={(e) => setTransitions(e.target.value)}
              />
            </label>
          </div>
        )}

        {mode === "advanced" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {seq.map((step) => {
              const id =
                step.kind === "run"
                  ? `run-${step.runIndex}`
                  : (step.station?.id ?? "");
              return (
                <label key={id} className="text-sm">
                  {step.label}
                  <input
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                    value={advanced[id] ?? ""}
                    onChange={(e) =>
                      setAdvanced((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                  />
                </label>
              );
            })}
            <label className="text-sm">
              Transition allowance
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={transitions}
                onChange={(e) => setTransitions(e.target.value)}
              />
            </label>
          </div>
        )}

        {mode === "target" && (
          <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-3">
            <label className="text-sm">
              Target finish
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Assumed avg station
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={avgStation}
                onChange={(e) => setAvgStation(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Transition allowance
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={transitions}
                onChange={(e) => setTransitions(e.target.value)}
              />
            </label>
          </div>
        )}

        {mode === "target" && targetResult && (
          <div className="mt-8 rounded-xl border border-border bg-background/70 p-6">
            {targetResult.ok ? (
              <>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Required average run pace
                </p>
                <p className="font-display mt-1 text-4xl font-semibold">
                  {targetResult.requiredPaceLabel} / km
                </p>
                <p className="mt-2 text-sm text-muted">{targetResult.message}</p>
              </>
            ) : (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {targetResult.message}
              </p>
            )}
          </div>
        )}

        {result && mode !== "target" && (
          <div className="mt-10 space-y-6">
            <div className="rounded-xl border border-border bg-background/70 p-6">
              <p className="text-xs uppercase tracking-wide text-muted">
                Estimated finish · race plan
              </p>
              <p className="font-display mt-1 text-4xl font-semibold">
                {formatRaceTime(result.totalSeconds)}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Running</dt>
                  <dd>{formatRaceTime(result.runningSeconds)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Stations</dt>
                  <dd>{formatRaceTime(result.stationSeconds)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Transitions</dt>
                  <dd>{formatRaceTime(result.transitionSeconds)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">{result.disclaimer}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 pr-4 font-medium">Segment</th>
                    <th className="py-2 pr-4 font-medium">Time</th>
                    <th className="py-2 font-medium">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {result.segments.map((s) => (
                    <tr key={s.id} className="border-b border-border/60">
                      <td className="py-2 pr-4">{s.label}</td>
                      <td className="py-2 pr-4">{formatRaceTime(s.seconds)}</td>
                      <td className="py-2">
                        {formatRaceTime(s.cumulativeSeconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={saveAsScenarioB}
              >
                Save as comparison baseline
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm"
                onClick={() => window.print()}
              >
                Print race plan
              </button>
              <Link
                href="/tools/hyrox-shoe-finder"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Find race shoes
              </Link>
              <Link
                href="/tools/hyrox-race-kit-builder"
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Build race kit
              </Link>
            </div>

            {comparison && (
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Scenario comparison
                </h2>
                <ul className="mt-3 space-y-1 text-sm">
                  {comparison.map((row) => (
                    <li key={row.label}>
                      {row.label}: {row.a} → {row.b} (
                      {row.deltaSec >= 0 ? "+" : ""}
                      {formatRaceTime(Math.abs(row.deltaSec))}
                      {row.deltaSec < 0 ? " faster" : row.deltaSec > 0 ? " slower" : ""}
                      )
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

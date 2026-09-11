"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  calculatePlatesPerSide,
  estimateOneRepMaxSuite,
} from "@/domain/calculators/strength";

export function StrengthCalculatorsClient({
  initial = "1rm",
}: {
  initial?: "1rm" | "plates";
}) {
  const [tab, setTab] = useState<"1rm" | "plates">(initial);
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [target, setTarget] = useState(140);
  const [bar, setBar] = useState(20);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  const oneRm = useMemo(
    () => estimateOneRepMaxSuite(weight, reps),
    [weight, reps],
  );
  const plates = useMemo(
    () =>
      calculatePlatesPerSide({
        targetWeight: target,
        barWeight: bar,
        unit,
      }),
    [target, bar, unit],
  );

  return (
    <div className="bg-mesh">
      <Container className="py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: tab === "1rm" ? "1RM Calculator" : "Plate Calculator" },
          ]}
          className="mb-8"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${tab === "1rm" ? "bg-foreground text-background" : "border border-border"}`}
            onClick={() => setTab("1rm")}
          >
            1RM Calculator
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${tab === "plates" ? "bg-foreground text-background" : "border border-border"}`}
            onClick={() => setTab("plates")}
          >
            Plate Calculator
          </button>
        </div>

        {tab === "1rm" ? (
          <div className="mt-8 max-w-lg space-y-4">
            <h1 className="font-display text-3xl font-semibold">
              One-Rep Max Estimator
            </h1>
            <p className="text-sm text-muted">
              Estimates only using common formulas. Not a measured physiological
              1RM.
            </p>
            <label className="block text-sm">
              Weight lifted
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </label>
            <label className="block text-sm">
              Reps completed
              <input
                type="number"
                min={1}
                max={12}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
            </label>
            <ul className="space-y-2 rounded-lg border border-border p-4 text-sm">
              <li>Epley: {oneRm.epley.toFixed(1)}</li>
              <li>Brzycki: {oneRm.brzycki.toFixed(1)}</li>
              <li>Lombardi: {oneRm.lombardi.toFixed(1)}</li>
            </ul>
            <p className="text-xs text-muted">{oneRm.note}</p>
          </div>
        ) : (
          <div className="mt-8 max-w-lg space-y-4">
            <h1 className="font-display text-3xl font-semibold">
              Plate Calculator
            </h1>
            <label className="block text-sm">
              Unit
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={unit}
                onChange={(e) => setUnit(e.target.value as "kg" | "lb")}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </label>
            <label className="block text-sm">
              Target total weight
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </label>
            <label className="block text-sm">
              Barbell weight
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={bar}
                onChange={(e) => setBar(Number(e.target.value))}
              />
            </label>
            <ul className="space-y-2 rounded-lg border border-border p-4 text-sm">
              {plates.perSide.length === 0 ? (
                <li>No plates needed / target below bar.</li>
              ) : (
                plates.perSide.map((p) => (
                  <li key={p.plate}>
                    {p.count} × {p.plate}
                    {unit} per side
                  </li>
                ))
              )}
            </ul>
            <p className="text-xs text-muted">
              Loadable ≈ {plates.loadable}
              {unit}
              {plates.remainder > 0
                ? ` · remainder ${plates.remainder}${unit} (not exact with available plates)`
                : ""}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

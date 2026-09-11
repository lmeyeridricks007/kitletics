"use client";

import { useState } from "react";
import type { SpecDiffRow } from "@/lib/comparison/engine";

export function SpecComparisonToggle({
  groups,
  productIds,
  productLabels,
}: {
  groups: { id: string; label: string; rows: SpecDiffRow[] }[];
  productIds: string[];
  productLabels: Record<string, string>;
}) {
  const [differencesOnly, setDifferencesOnly] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={differencesOnly}
          aria-label="Show only differences"
          onClick={() => setDifferencesOnly((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span
            className={`h-4 w-7 rounded-full transition-colors ${
              differencesOnly ? "bg-accent" : "bg-border"
            }`}
            aria-hidden
          >
            <span
              className={`mt-0.5 block h-3 w-3 rounded-full bg-white transition-transform ${
                differencesOnly ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </span>
          Show only differences
        </button>
        <p className="text-xs text-subtle">
          Differences highlighted neutrally — not better/worse.
        </p>
      </div>

      {groups.map((group) => {
        const rows = differencesOnly
          ? group.rows.filter((r) => r.state === "different" || r.state === "missing")
          : group.rows;
        if (rows.length === 0) return null;
        return (
          <div key={group.id}>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-subtle uppercase">
              {group.label}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">{group.label} specification comparison</caption>
                <thead className="sticky top-0 bg-surface-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Spec
                    </th>
                    {productIds.map((id) => (
                      <th
                        key={id}
                        scope="col"
                        className="px-3 py-2.5 font-medium"
                      >
                        {productLabels[id]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr
                      key={row.key}
                      className={
                        row.state === "different"
                          ? "bg-accent/5"
                          : undefined
                      }
                    >
                      <th
                        scope="row"
                        className="px-3 py-2.5 font-normal text-muted"
                      >
                        {row.label}
                        {row.unit ? (
                          <span className="text-subtle"> ({row.unit})</span>
                        ) : null}
                        {row.state === "different" ? (
                          <span className="sr-only"> (differs)</span>
                        ) : null}
                      </th>
                      {productIds.map((id) => (
                        <td
                          key={id}
                          className={`px-3 py-2.5 tabular-nums ${
                            row.state === "different" ? "font-medium" : ""
                          }`}
                        >
                          {row.valuesByProduct[id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function UseCaseWhyDisclosure({
  factors,
}: {
  factors: { key: string; score: number; explanation: string }[];
}) {
  if (factors.length === 0) return null;
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        Why?
      </summary>
      <ul className="mt-2 space-y-1.5 border-l-2 border-border pl-3 text-muted">
        {factors.map((f) => (
          <li key={f.key}>
            <span className="font-medium text-foreground">{f.key}</span>
            <span className="text-subtle"> · {f.score}</span>
            <span className="block text-xs">{f.explanation}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

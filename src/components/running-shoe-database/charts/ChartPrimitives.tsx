"use client";

import { useId } from "react";
import type { ChartBarPoint } from "@/lib/running-shoe-database/charts/types";
import { cn } from "@/lib/utils";

function PatternDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <pattern
        id={`${prefix}-striped`}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
      </pattern>
      <pattern
        id={`${prefix}-dotted`}
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1.4" fill="currentColor" opacity="0.55" />
      </pattern>
      <pattern
        id={`${prefix}-dashed`}
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 5 H6"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
      </pattern>
      <pattern
        id={`${prefix}-cross`}
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 0 L8 8 M8 0 L0 8"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.45"
        />
      </pattern>
    </defs>
  );
}

function fillFor(
  pattern: ChartBarPoint["pattern"],
  prefix: string,
  highlighted: boolean,
): string {
  if (highlighted) return "var(--foreground)";
  if (pattern === "solid") return "var(--foreground)";
  return `url(#${prefix}-${pattern})`;
}

export function AccessibleBarList({
  points,
  valueSuffix,
  highlightedId,
  onActivate,
  ariaLabel,
  summary,
  mode = "count",
  formatValue,
}: {
  points: ChartBarPoint[];
  valueSuffix?: string;
  highlightedId?: string | null;
  onActivate: (point: ChartBarPoint) => void;
  ariaLabel: string;
  summary: string;
  mode?: "count" | "share";
  formatValue?: (point: ChartBarPoint) => string;
}) {
  const uid = useId().replace(/:/g, "");
  const max =
    mode === "share" ? 1 : Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="space-y-3">
      <p className="sr-only">{summary}</p>
      <svg width="0" height="0" aria-hidden className="absolute">
        <PatternDefs prefix={uid} />
      </svg>
      <ul className="space-y-2.5" role="list" aria-label={ariaLabel}>
        {points.map((point) => {
          const widthPct =
            mode === "share"
              ? Math.max(point.share * 100, point.count > 0 ? 2 : 0)
              : Math.max((point.count / max) * 100, point.count > 0 ? 2 : 0);
          const valueLabel = formatValue
            ? formatValue(point)
            : mode === "share"
              ? `${Math.round(point.share * 100)}% (${point.count})`
              : `${point.count}${valueSuffix ? ` ${valueSuffix}` : ""}`;
          const active = highlightedId === point.id;

          return (
            <li key={point.id}>
              <button
                type="button"
                onClick={() => onActivate(point)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onActivate(point);
                  }
                }}
                className={cn(
                  "group grid w-full grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-2 text-left outline-none",
                  "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                )}
                aria-label={`${point.label}: ${valueLabel}. Open matching shoes in the database.`}
              >
                <span
                  className={cn(
                    "truncate text-[12px] font-semibold",
                    active ? "text-foreground" : "text-muted",
                  )}
                >
                  {point.label}
                </span>
                <span className="relative h-5 overflow-hidden border border-border bg-[#f5f6f7]">
                  <span
                    className="absolute inset-y-0 left-0 text-foreground transition-[width] duration-300"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor:
                        point.pattern === "solid" || active
                          ? "var(--foreground)"
                          : "color-mix(in oklab, var(--foreground) 18%, white)",
                    }}
                    aria-hidden
                  >
                    {point.pattern !== "solid" && !active && (
                      <svg
                        className="absolute inset-0 size-full text-foreground"
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <rect
                          width="100%"
                          height="100%"
                          fill={fillFor(point.pattern, uid, false)}
                        />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="min-w-[4.5rem] text-right text-[12px] font-semibold tabular-nums text-foreground">
                  {valueLabel}
                  {point.secondary ? (
                    <span className="ml-1 font-normal text-muted">
                      {point.secondary}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CompositionBar({
  points,
  highlightedId,
  onActivate,
  ariaLabel,
  summary,
}: {
  points: ChartBarPoint[];
  highlightedId?: string | null;
  onActivate: (point: ChartBarPoint) => void;
  ariaLabel: string;
  summary: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <div>
      <p className="sr-only">{summary}</p>
      <svg width="0" height="0" aria-hidden className="absolute">
        <PatternDefs prefix={uid} />
      </svg>
      <div
        className="flex h-10 w-full overflow-hidden border border-border"
        role="group"
        aria-label={ariaLabel}
      >
        {points.map((point) => {
          const active = highlightedId === point.id;
          return (
            <button
              key={point.id}
              type="button"
              style={{ width: `${Math.max(point.share * 100, 0)}%` }}
              className={cn(
                "relative min-w-[2px] text-foreground outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                active ? "bg-foreground" : "bg-[#e8eaec]",
              )}
              onClick={() => onActivate(point)}
              aria-label={`${point.label}: ${point.count} shoes (${Math.round(point.share * 100)}%). Filter database.`}
            >
              {!active && point.pattern !== "solid" && (
                <svg
                  className="absolute inset-0 size-full text-foreground"
                  aria-hidden
                >
                  <rect
                    width="100%"
                    height="100%"
                    fill={fillFor(point.pattern, uid, false)}
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-3 text-[12px]">
        {points.map((point) => (
          <li key={point.id} className="flex items-center gap-2">
            <span
              className="inline-block size-3 border border-border"
              style={{
                background:
                  highlightedId === point.id
                    ? "var(--foreground)"
                    : "color-mix(in oklab, var(--foreground) 25%, white)",
              }}
              aria-hidden
            />
            <button
              type="button"
              className="font-semibold hover:underline"
              onClick={() => onActivate(point)}
            >
              {point.label} · {point.count}
              {point.secondary ? ` (${point.secondary})` : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

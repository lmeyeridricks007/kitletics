import { cn } from "@/lib/utils";
import type { ScoreBreakdownItem } from "@/domain/editorial/types";

/** Accessible score bars — text equivalents always present; not colour-only. */
export function ScoreBreakdownChart({
  items,
  className,
}: {
  items: ScoreBreakdownItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-3", className)} aria-label="Score breakdown">
      {items.map((item) => {
        const max = item.max ?? 100;
        const pct = Math.max(0, Math.min(100, (item.score / max) * 100));
        return (
          <li key={item.key}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-sm text-foreground">{item.label}</span>
              <span className="font-display text-sm font-semibold tabular-nums text-accent">
                {item.score}
                <span className="sr-only"> out of {max}</span>
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
            {item.note && (
              <p className="mt-1 text-xs text-subtle">{item.note}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function UseCaseScoreList({
  rows,
  className,
}: {
  rows: { label: string; score: number; bandLabel: string }[];
  className?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <ul className={cn("divide-y divide-border", className)}>
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex items-center justify-between gap-4 py-2.5 text-sm"
        >
          <span className="text-foreground">{row.label}</span>
          <span className="flex items-baseline gap-2">
            <span className="text-xs text-muted">{row.bandLabel}</span>
            <span className="font-display font-semibold tabular-nums text-accent">
              {row.score}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

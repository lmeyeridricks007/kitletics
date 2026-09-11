"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreBand } from "@/lib/product/score";

interface KitleticsScoreProps {
  score: number;
  factors?: { label: string; score: number; explanation: string }[];
  className?: string;
  compact?: boolean;
}

export function KitleticsScore({
  score,
  factors = [],
  className,
  compact,
}: KitleticsScoreProps) {
  const [open, setOpen] = useState(false);
  const band = getScoreBand(score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("flex items-end gap-3", compact && "gap-2")}>
        <span
          className={cn(
            "font-display font-semibold tabular-nums text-accent",
            compact ? "text-3xl" : "text-4xl sm:text-5xl",
          )}
        >
          {score}
        </span>
        <div className="pb-1">
          <p className="text-[10px] font-medium tracking-wide text-subtle uppercase">
            Kitletics score
          </p>
          <p className="text-sm font-medium text-foreground">{band.label}</p>
        </div>
      </div>
      {factors.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-accent hover:underline"
            aria-expanded={open}
          >
            {open ? "Hide score factors" : `Why ${score}?`}
          </button>
          {open && (
            <ul className="mt-3 space-y-2 rounded-xl border border-border bg-surface-muted/50 p-3">
              {factors.map((f) => (
                <li key={f.label} className="text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-foreground">{f.label}</span>
                    <span className="font-display font-semibold tabular-nums text-accent">
                      {f.score}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{f.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

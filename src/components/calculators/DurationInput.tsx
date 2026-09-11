"use client";

import { durationToParts } from "@/domain/calculators/units";
import { cn } from "@/lib/utils";

export function DurationInput({
  totalSeconds,
  onChange,
  idPrefix = "duration",
  variant = "light",
}: {
  totalSeconds: number;
  onChange: (seconds: number) => void;
  idPrefix?: string;
  variant?: "light" | "dark";
}) {
  const parts = durationToParts(totalSeconds || 0);

  function update(next: { hours: number; minutes: number; seconds: number }) {
    const h = Math.max(0, next.hours);
    const m = Math.min(59, Math.max(0, next.minutes));
    const s = Math.min(59, Math.max(0, next.seconds));
    onChange(h * 3600 + m * 60 + s);
  }

  return (
    <div className="flex items-end gap-2">
      <NumberField
        id={`${idPrefix}-hours`}
        label="HH"
        value={parts.hours}
        onChange={(hours) => update({ ...parts, hours })}
        min={0}
        max={99}
        variant={variant}
      />
      <span
        className={cn(
          "pb-3 text-lg",
          variant === "dark" ? "text-white/40" : "text-muted",
        )}
        aria-hidden
      >
        :
      </span>
      <NumberField
        id={`${idPrefix}-minutes`}
        label="MM"
        value={parts.minutes}
        onChange={(minutes) => update({ ...parts, minutes })}
        min={0}
        max={59}
        variant={variant}
      />
      <span
        className={cn(
          "pb-3 text-lg",
          variant === "dark" ? "text-white/40" : "text-muted",
        )}
        aria-hidden
      >
        :
      </span>
      <NumberField
        id={`${idPrefix}-seconds`}
        label="SS"
        value={parts.seconds}
        onChange={(seconds) => update({ ...parts, seconds })}
        min={0}
        max={59}
        variant={variant}
      />
    </div>
  );
}

export function PaceInput({
  paceSeconds,
  onChange,
  idPrefix = "pace",
  variant = "light",
}: {
  /** Total seconds for one unit (km or mile) */
  paceSeconds: number;
  onChange: (seconds: number) => void;
  idPrefix?: string;
  variant?: "light" | "dark";
}) {
  const minutes = Math.floor((paceSeconds || 0) / 60);
  const seconds = (paceSeconds || 0) % 60;

  return (
    <div className="flex items-end gap-2">
      <NumberField
        id={`${idPrefix}-min`}
        label="Minutes"
        value={minutes}
        onChange={(m) => onChange(Math.max(0, m) * 60 + seconds)}
        min={0}
        max={59}
        variant={variant}
      />
      <span
        className={cn(
          "pb-3 text-lg",
          variant === "dark" ? "text-white/40" : "text-muted",
        )}
        aria-hidden
      >
        :
      </span>
      <NumberField
        id={`${idPrefix}-sec`}
        label="Seconds"
        value={seconds}
        onChange={(s) =>
          onChange(minutes * 60 + Math.min(59, Math.max(0, s)))
        }
        min={0}
        max={59}
        variant={variant}
      />
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  variant,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  variant: "light" | "dark";
}) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={id}
        className={cn(
          "mb-1 block text-[10px] font-medium tracking-wide uppercase",
          variant === "dark" ? "text-white/45" : "text-subtle",
        )}
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={cn(
          "w-full rounded border px-2 py-2.5 text-center text-base tabular-nums outline-none focus:border-accent",
          variant === "dark"
            ? "border-white/20 bg-[#0d1216] text-white"
            : "border-border bg-surface text-foreground",
        )}
      />
    </div>
  );
}

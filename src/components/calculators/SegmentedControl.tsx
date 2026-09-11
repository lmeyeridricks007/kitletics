"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  variant = "light",
  columns,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  variant?: "light" | "dark";
  columns?: number;
}) {
  const cols =
    columns ??
    (options.length <= 2 ? 2 : options.length === 3 ? 3 : Math.min(4, options.length));

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <p
        className={cn(
          "text-[11px] font-medium tracking-wide uppercase",
          variant === "dark" ? "text-white/55" : "text-subtle",
        )}
      >
        {label}
      </p>
      <div
        className={cn(
          "grid gap-1.5",
          cols === 2 && "grid-cols-2",
          cols === 3 && "grid-cols-3",
          cols >= 4 && "grid-cols-2",
        )}
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded border px-2.5 py-2.5 text-[12px] font-semibold transition-colors",
                variant === "dark" &&
                  (selected
                    ? "border-accent bg-[#1a2228] text-white"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"),
                variant === "light" &&
                  (selected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-white text-muted hover:border-accent/50"),
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

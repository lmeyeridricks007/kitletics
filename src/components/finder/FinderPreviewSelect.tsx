"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FinderPreviewOption = {
  value: string;
  label: string;
};

export type FinderPreviewField = {
  label: string;
  name: string;
  /** Default selected option value */
  value: string;
  options: FinderPreviewOption[];
};

type Appearance = "light" | "dark";

/**
 * Styled select for homepage / hub “quick finder” previews.
 * Native <select> is opacity-0 over a visible label so the chevron styling stays.
 */
export function FinderPreviewSelect({
  field,
  appearance = "light",
  disabled = false,
  className,
  onValueChange,
}: {
  field: FinderPreviewField;
  appearance?: Appearance;
  disabled?: boolean;
  className?: string;
  onValueChange?: (name: string, value: string) => void;
}) {
  const id = useId();
  const options =
    field.options.length > 0
      ? field.options
      : [{ value: field.value, label: field.value }];
  const initial =
    options.find((o) => o.value === field.value)?.value ?? options[0]!.value;
  const [value, setValue] = useState(initial);
  const selected =
    options.find((o) => o.value === value) ?? options[0]!;

  const dark = appearance === "dark";

  return (
    <label htmlFor={id} className={cn("block min-w-0", className)}>
      <span
        className={cn(
          "mb-1.5 block font-medium tracking-wide uppercase",
          dark
            ? "text-[10px] text-white/55"
            : "text-[11px] text-muted",
        )}
      >
        {field.label}
      </span>
      <span
        className={cn(
          "relative flex items-center rounded-md border font-medium",
          dark
            ? "h-10 border-white/15 bg-black/25 px-2.5 text-[12px] text-white"
            : "h-11 border-border bg-surface px-3 text-sm text-foreground",
          disabled && "opacity-60",
        )}
      >
        <span className={cn("truncate", dark ? "pr-5" : "pr-6")}>
          {selected.label}
        </span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute size-4",
            dark
              ? "right-2 size-3.5 text-white/50"
              : "right-3 text-subtle",
          )}
          aria-hidden
        />
        <select
          id={id}
          name={field.name}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          value={value}
          disabled={disabled}
          aria-label={field.label}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            onValueChange?.(field.name, next);
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

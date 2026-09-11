"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { handleRovingRadioKeyDown } from "@/lib/a11y/use-modal-focus";
import {
  AUDIENCE_LABELS,
  type AudienceFit,
  writePreferredSizing,
} from "@/lib/product/audience";

export interface FitSizingOption {
  value: AudienceFit | "all";
  label: string;
  count?: number;
}

const DEFAULT_OPTIONS: FitSizingOption[] = [
  { value: "all", label: "All shoes" },
  { value: "men", label: "Men's" },
  { value: "women", label: "Women's" },
  { value: "unisex", label: "Unisex" },
];

/**
 * Prominent FIT / SIZING selector for footwear catalogs.
 * Uses existing `gender=` catalog param (maps to genderFit).
 */
export function ShopByFitChips({
  basePath,
  options = DEFAULT_OPTIONS,
  className,
  heading = "Shop by fit / sizing",
}: {
  basePath?: string;
  options?: FitSizingOption[];
  className?: string;
  heading?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = basePath ?? pathname;
  const active = (searchParams.get("gender") ?? "").toLowerCase();

  function hrefFor(value: AudienceFit | "all"): string {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("gender");
    } else {
      params.set("gender", value);
    }
    // Jump to catalog when selecting from hub sections
    const qs = params.toString();
    const hash = path.includes("#") ? "" : "";
    return qs ? `${path}?${qs}${hash}` : path;
  }

  return (
    <div className={cn("border-t border-border pt-5", className)}>
      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        {heading}
      </p>
      <div
        className="mt-2.5 flex flex-wrap gap-2"
        role="group"
        aria-label="Fit and sizing"
      >
        {options.map((opt) => {
          const selected =
            opt.value === "all"
              ? !active
              : active === opt.value ||
                active === `${opt.value}s` ||
                active === `${opt.value}'s`;
          return (
            <Link
              key={opt.value}
              href={hrefFor(opt.value)}
              aria-current={selected ? "true" : undefined}
              onClick={() => {
                if (opt.value !== "all") writePreferredSizing(opt.value);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[13px] font-medium transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-white text-foreground hover:border-foreground",
              )}
            >
              <span className="uppercase tracking-[0.04em]">
                {opt.label}
              </span>
              {opt.count !== undefined && (
                <span
                  className={cn(
                    "text-[12px] tabular-nums",
                    selected ? "text-accent-foreground/80" : "text-subtle",
                  )}
                >
                  {opt.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Product-detail FIT / SIZING control (button group, URL `?fit=` or callback).
 */
export function AudienceVariantSelector({
  options,
  value,
  onChange,
  className,
}: {
  options: AudienceFit[];
  value: AudienceFit;
  onChange: (next: AudienceFit) => void;
  className?: string;
}) {
  if (options.length <= 1) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        Fit / sizing
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Fit and sizing"
        onKeyDown={(event) =>
          handleRovingRadioKeyDown(event, options, value, onChange)
        }
      >
        {options.map((audience, index) => {
          const selected = value === audience;
          const noneSelected = !options.includes(value);
          return (
            <button
              key={audience}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (noneSelected && index === 0) ? 0 : -1}
              onClick={() => {
                writePreferredSizing(audience);
                onChange(audience);
              }}
              className={cn(
                "border px-3 py-1.5 text-[12px] font-bold tracking-[0.06em] uppercase transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-white text-foreground hover:border-foreground",
              )}
            >
              {AUDIENCE_LABELS[audience]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AudienceAvailability({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) return null;
  return (
    <p
      className={cn(
        "text-[11px] font-semibold tracking-[0.06em] text-muted uppercase",
        className,
      )}
    >
      {label}
    </p>
  );
}

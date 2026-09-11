"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";
import {
  REGION_COOKIE,
  allRegionsForSelector,
} from "@/lib/region/resolve";
import {
  regionCommerceCoverage,
  regionCommerceCoverageHint,
} from "@/lib/region/commerce-readiness";
import { trackCommercialEvent } from "@/domain/commerce/analytics";
import { cn } from "@/lib/utils";

const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function readCookieRegion(): RegionCode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REGION_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value && value in REGION_META ? (value as RegionCode) : null;
}

function writeCookieRegion(code: RegionCode): void {
  document.cookie = `${REGION_COOKIE}=${code};path=/;max-age=${MAX_AGE};samesite=lax`;
}

interface RegionSelectorProps {
  /** Server-resolved region used for initial paint */
  initialRegion: RegionCode;
  className?: string;
  /** Compact utility-bar style */
  variant?: "utility" | "panel";
}

export function RegionSelector({
  initialRegion,
  className,
  variant = "utility",
}: RegionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState<RegionCode>(initialRegion);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = allRegionsForSelector();

  useEffect(() => {
    const fromCookie = readCookieRegion();
    if (fromCookie && fromCookie !== region) setRegion(fromCookie);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from cookie once
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(code: RegionCode) {
    if (code === region) {
      setOpen(false);
      return;
    }
    writeCookieRegion(code);
    trackCommercialEvent("region_changed", { region: code });
    setRegion(code);
    setOpen(false);
    window.location.reload();
  }

  const meta = REGION_META[region];
  const label = `${meta.label} / ${meta.currency}`;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          variant === "utility" &&
            "inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white",
          variant === "panel" &&
            "inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
        )}
        aria-label="Shopping region and currency"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        {variant === "utility" ? (
          <>
            {region} / {meta.currency}
            <ChevronDown className="size-3" strokeWidth={2} aria-hidden />
          </>
        ) : (
          label
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[16rem] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <p className="border-b border-border px-3 py-2 text-[11px] leading-snug text-muted">
            Retailer coverage varies by region. Editorial guidance stays the
            same everywhere.
          </p>
          <ul role="listbox" aria-label="Select shopping region" className="py-1">
            {options.map((opt) => {
              const coverage = regionCommerceCoverage(opt.code);
              const hint = regionCommerceCoverageHint(opt.code);
              return (
                <li
                  key={opt.code}
                  role="option"
                  aria-selected={opt.code === region}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-surface-muted",
                      opt.code === region && "bg-surface-muted font-medium",
                    )}
                    onClick={() => select(opt.code)}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted">{opt.currency}</span>
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        coverage === "primary"
                          ? "text-muted"
                          : coverage === "partial"
                            ? "text-muted"
                            : "text-subtle",
                      )}
                    >
                      {hint}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

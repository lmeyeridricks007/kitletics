"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { ReviewType } from "@/domain/editorial/types";
import { REVIEW_TYPE_META } from "@/lib/review/get-review-page-data";

export function ReviewTypeBadge({
  reviewType,
  className,
}: {
  reviewType: ReviewType;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const meta = REVIEW_TYPE_META[reviewType];
  const variant =
    reviewType === "expert-research"
      ? "muted"
      : reviewType === "hybrid"
        ? "accent"
        : "accent";

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="group"
        aria-expanded={open}
        aria-describedby={open ? `review-type-${reviewType}` : undefined}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        <Badge variant={variant}>{meta.shortLabel}</Badge>
      </button>
      {open && (
        <span
          id={`review-type-${reviewType}`}
          role="tooltip"
          className="absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-border bg-surface p-3 text-left text-xs leading-relaxed text-muted shadow-md"
        >
          {meta.description}
        </span>
      )}
    </span>
  );
}

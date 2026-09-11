"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  guideCandidateStatusLabel,
  type GuideCandidateEvaluation,
} from "@/lib/best/guide-coverage-ui";
import { getAwardLabel } from "@/lib/best/awards";
import type { BestGuideRecommendation } from "@/domain/editorial/types";
import { cn } from "@/lib/utils";

interface GuideEvaluatedProductsDisclosureProps {
  consideredCount: number;
  productNoun: string;
  recommended: GuideCandidateEvaluation[];
  shortlisted: GuideCandidateEvaluation[];
  others: GuideCandidateEvaluation[];
  recommendations: BestGuideRecommendation[];
  categorySlug: string;
}

export function GuideEvaluatedProductsDisclosure({
  consideredCount,
  productNoun,
  recommended,
  shortlisted,
  others,
  recommendations,
  categorySlug,
}: GuideEvaluatedProductsDisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const awardByProduct = new Map(
    recommendations.map((r) => [
      r.productId,
      getAwardLabel(r.awardType, r.badge) ?? r.summary,
    ]),
  );

  return (
    <div className="mt-6 border-t border-border pt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-foreground hover:text-link"
      >
        View all {consideredCount} {productNoun} evaluated
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div id={panelId} className="mt-5 space-y-8">
          <EvaluatedGroup
            title="Recommended"
            count={recommended.length}
            rows={recommended}
            renderRow={(row) => {
              const award = awardByProduct.get(row.productId);
              const slug = row.product?.slug;
              return (
                <li
                  key={row.productId}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 py-2.5"
                >
                  <div>
                    {slug ? (
                      <Link
                        href={`#rec-${slug}`}
                        className="text-[14px] font-medium text-foreground hover:text-link"
                      >
                        {row.product?.fullName ?? row.productId}
                      </Link>
                    ) : (
                      <span className="text-[14px] font-medium">
                        {row.product?.fullName ?? row.productId}
                      </span>
                    )}
                    {award && (
                      <p className="mt-0.5 text-[12px] text-muted">{award}</p>
                    )}
                  </div>
                  {slug && (
                    <Link
                      href={`#rec-${slug}`}
                      className="text-[12px] font-medium text-link hover:underline"
                    >
                      Jump to pick →
                    </Link>
                  )}
                </li>
              );
            }}
          />

          <EvaluatedGroup
            title="Shortlisted"
            count={shortlisted.length}
            rows={shortlisted}
            renderRow={(row) => (
              <li
                key={row.productId}
                className="border-b border-border/70 py-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  {row.product ? (
                    <Link
                      href={`/products/${row.product.slug}`}
                      className="text-[14px] font-medium text-foreground hover:text-link"
                    >
                      {row.product.fullName}
                    </Link>
                  ) : (
                    <span className="text-[14px] font-medium">
                      {row.productId}
                    </span>
                  )}
                  <span className="text-[11px] font-medium tracking-wide text-subtle uppercase">
                    {guideCandidateStatusLabel(row.status)}
                  </span>
                </div>
                {row.publicReason && (
                  <p className="mt-1 text-[13px] leading-snug text-muted">
                    {row.publicReason}
                  </p>
                )}
              </li>
            )}
          />

          <EvaluatedGroup
            title="Also evaluated"
            count={others.length}
            rows={others}
            renderRow={(row) => (
              <li
                key={row.productId}
                className="border-b border-border/60 py-2"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {row.product ? (
                    <Link
                      href={`/products/${row.product.slug}`}
                      className="text-[13px] font-medium text-foreground hover:text-link"
                    >
                      {row.product.fullName}
                    </Link>
                  ) : (
                    <span className="text-[13px] font-medium">
                      {row.productId}
                    </span>
                  )}
                  {row.isPreviousGeneration && (
                    <span className="rounded-[2px] border border-border px-1 py-px text-[10px] font-bold tracking-wide text-subtle uppercase">
                      Previous generation
                    </span>
                  )}
                </div>
                {(row.publicReason || row.rejectionReason) && (
                  <p className="mt-0.5 text-[12px] leading-snug text-muted">
                    {row.publicReason ?? row.rejectionReason}
                  </p>
                )}
              </li>
            )}
          />

          <p className="text-[12px] text-subtle">
            Compare shortlisted options in the{" "}
            <Link
              href={`/compare?category=${categorySlug}`}
              className="text-link hover:underline"
            >
              Compare builder
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function EvaluatedGroup({
  title,
  count,
  rows,
  renderRow,
}: {
  title: string;
  count: number;
  rows: GuideCandidateEvaluation[];
  renderRow: (row: GuideCandidateEvaluation) => ReactNode;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        {title}{" "}
        <span className="tabular-nums text-foreground">{count}</span>
      </h3>
      <ul className="mt-2">{rows.map(renderRow)}</ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import {
  parseAudienceParam,
  type AudienceFit,
} from "@/lib/product/audience";
import { withRunningGender } from "@/lib/running/gender-links";
import { RunningFitLinksClient } from "@/components/sport-hub/RunningFitLinksClient";

/** Categories where genderFit filtering is meaningful. */
export const RUNNING_FIT_CATEGORIES: { label: string; href: string }[] = [
  { label: "Shoes", href: "/running/shoes" },
  { label: "Clothing", href: "/running/clothing" },
  { label: "Packs & Vests", href: "/running/packs" },
  { label: "Recovery", href: "/running/recovery" },
];

/**
 * Fit toggle on the Running hub — stays on /running and links straight into
 * gender-filtered category catalogs (not the All Gear index).
 */
export function RunningFitLinks() {
  const searchParams = useSearchParams();
  const gender = parseAudienceParam(searchParams.get("gender"));

  const fitOptions: {
    value: AudienceFit | "all";
    label: string;
    href: string;
  }[] = [
    { value: "men", label: "Men's", href: "/running?gender=men" },
    { value: "women", label: "Women's", href: "/running?gender=women" },
    { value: "all", label: "All", href: "/running" },
  ];

  return (
    <section className="border-b border-border bg-surface-muted/40">
      <Container size="wide" className="py-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
                Running
              </p>
              <p className="mt-1 text-[14px] text-muted">
                Filter by fit, then open a category — shoes, clothing, packs and
                recovery.
              </p>
            </div>
            <RunningFitLinksClient
              options={fitOptions}
              activeGender={gender}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-border/70 pt-3">
            <span className="mr-2 text-[12px] font-medium text-muted">
              {gender === "men"
                ? "Shop men's:"
                : gender === "women"
                  ? "Shop women's:"
                  : "Shop:"}
            </span>
            {RUNNING_FIT_CATEGORIES.map((cat, i) => (
              <span key={cat.href} className="inline-flex items-center">
                {i > 0 ? (
                  <span className="mx-1.5 text-border" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={withRunningGender(cat.href, gender)}
                  className="text-[13px] font-semibold text-link hover:underline"
                >
                  {cat.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

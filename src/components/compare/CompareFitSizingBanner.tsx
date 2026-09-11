import Link from "next/link";

/**
 * Fit / sizing context for shoe comparisons — confirms Men’s/Women’s availability
 * without inventing variant-specific weights or offers.
 */
export function CompareFitSizingBanner({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) {
  if (!show) return null;

  return (
    <aside
      className={
        className ??
        "rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-[13px] leading-relaxed text-muted"
      }
      aria-label="Fit and sizing context"
    >
      <p className="font-semibold text-foreground">Fit / sizing</p>
      <p className="mt-1">
        Most running shoes here are sold in Men&apos;s and Women&apos;s sizing.
        Confirm the fit on each product page before you buy. Catalog weights are
        usually a Men&apos;s US&nbsp;9 reference unless a Women&apos;s weight is
        verified — we do not invent Women&apos;s figures.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <Link
          href="/running/shoes?gender=women"
          className="font-medium text-accent-ink hover:underline"
        >
          Women&apos;s shoes
        </Link>
        <Link
          href="/running/shoes?gender=men"
          className="font-medium text-accent-ink hover:underline"
        >
          Men&apos;s shoes
        </Link>
        <Link
          href="/tools/running-shoe-finder"
          className="font-medium text-accent-ink hover:underline"
        >
          Shoe Finder
        </Link>
      </p>
    </aside>
  );
}

export function comparisonNeedsFitSizingBanner(
  categoryId: string | undefined,
  categorySlug: string | undefined,
): boolean {
  const hay = `${categoryId ?? ""} ${categorySlug ?? ""}`.toLowerCase();
  return /running-shoe|shoe/.test(hay) && !/sock|padel|tennis/.test(hay);
}

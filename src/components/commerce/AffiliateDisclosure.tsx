import Link from "next/link";
import { cn } from "@/lib/utils";

interface AffiliateDisclosureProps {
  className?: string;
  /** Compact one-liner near first commercial CTA */
  compact?: boolean;
}

/**
 * Reusable affiliate disclosure.
 * Place once near the first affiliate / retailer link on a page.
 */
export function AffiliateDisclosure({
  className,
  compact = true,
}: AffiliateDisclosureProps) {
  if (compact) {
    return (
      <p className={cn("text-xs text-muted", className)}>
        Kitletics may earn a commission when you buy through some retailer
        links. This does not affect our recommendations.{" "}
        <Link
          href="/affiliate-disclosure"
          className="font-medium text-link underline underline-offset-2 hover:text-link-hover"
        >
          Affiliate disclosure
        </Link>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-muted",
        className,
      )}
    >
      <p>
        Kitletics may earn a commission when you buy through some retailer
        links. Affiliate relationships never determine which products we
        recommend, score, or award.
      </p>
      <Link
        href="/affiliate-disclosure"
        className="mt-1 inline-block font-medium text-link underline underline-offset-2 hover:text-link-hover"
      >
        Read full affiliate disclosure
      </Link>
    </div>
  );
}

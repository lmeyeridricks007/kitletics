import Link from "next/link";
import {
  segmentCatalogMentions,
  type CatalogMentionOptions,
} from "@/lib/editorial/catalog-mentions";

const LINK_CLASS =
  "font-medium text-accent-ink underline decoration-accent/35 underline-offset-[3px] transition-colors hover:decoration-accent";

/**
 * Renders plain review copy with brand → /brands/… and product → /products/… links.
 */
export function LinkifiedText({
  text,
  options,
  className,
}: {
  text: string;
  options?: CatalogMentionOptions;
  className?: string;
}) {
  const segments = segmentCatalogMentions(text, options);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "link" ? (
          <Link
            key={`${seg.href}-${i}-${seg.value}`}
            href={seg.href}
            className={LINK_CLASS}
          >
            {seg.value}
          </Link>
        ) : (
          <span key={`t-${i}`}>{seg.value}</span>
        ),
      )}
    </span>
  );
}

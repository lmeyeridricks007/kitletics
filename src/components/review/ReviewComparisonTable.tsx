import Link from "next/link";
import Image from "next/image";
import { buildCompareHref } from "@/lib/comparison/selection";
import type { ComparisonTableRow } from "@/lib/review/get-review-page-data";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height)+3.25rem)]";

export function ReviewComparisonTable({
  rows,
  categorySlug,
}: {
  rows: ComparisonTableRow[];
  categorySlug?: string;
}) {
  if (rows.length < 2) return null;

  const columns = rows[0]?.cells ?? [];
  const compareHref = buildCompareHref({
    categorySlug,
    productSlugs: rows.map((r) => r.product.slug),
  });

  return (
    <section id="comparisons" className={SCROLL}>
      <h2 className="heading-section">How it compares</h2>

      {/* Desktop table */}
      <ScrollableTableRegion
        label="How this product compares"
        className="mt-6 hidden md:block"
      >
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] font-bold tracking-[0.08em] text-subtle uppercase">
              <th className="py-3 pr-4 font-bold">Product</th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-3 font-bold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.product.id}
                className={
                  row.current
                    ? "bg-accent-muted/80"
                    : "border-b border-border"
                }
              >
                <td className="py-3 pr-4">
                  <Link
                    href={row.href}
                    className="flex items-center gap-3 hover:opacity-90"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                      {row.image ? (
                        <Image
                          src={row.image.src}
                          alt={row.image.alt || row.product.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-muted">
                        {row.brandName}
                      </span>
                      <span className="block font-semibold text-foreground">
                        {row.product.name}
                        {row.current ? (
                          <span className="ml-1.5 text-[10px] font-bold tracking-wide text-accent-ink uppercase">
                            This review
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </td>
                {row.cells.map((cell) => (
                  <td
                    key={cell.key}
                    className="px-3 py-3 tabular-nums text-foreground"
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableRegion>

      {/* Mobile cards */}
      <ul className="mt-6 space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.product.id}
            className={
              row.current
                ? "rounded-lg border border-accent/40 bg-accent-muted/80 p-4"
                : "rounded-lg border border-border p-4"
            }
          >
            <Link href={row.href} className="flex items-center gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                {row.image ? (
                  <Image
                    src={row.image.src}
                    alt={row.image.alt || row.product.name}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                ) : null}
              </span>
              <span>
                <span className="block text-[12px] text-muted">
                  {row.brandName}
                </span>
                <span className="font-semibold text-foreground">
                  {row.product.name}
                </span>
              </span>
            </Link>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
              {row.cells.map((cell) => (
                <div key={cell.key}>
                  <dt className="text-[11px] text-subtle uppercase">{cell.label}</dt>
                  <dd className="font-medium text-foreground">{cell.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <p className="mt-5">
        <Link
          href={compareHref}
          className="text-[13px] font-semibold text-accent-ink hover:underline"
        >
          Compare these products →
        </Link>
      </p>
    </section>
  );
}

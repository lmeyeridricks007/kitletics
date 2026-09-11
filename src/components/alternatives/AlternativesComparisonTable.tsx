import Link from "next/link";
import type { AlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { cn } from "@/lib/utils";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";

interface AlternativesComparisonTableProps {
  data: AlternativesPageData;
}

export function AlternativesComparisonTable({
  data,
}: AlternativesComparisonTableProps) {
  const { comparisonRows, config, product } = data;
  if (comparisonRows.length < 2) return null;

  const columns = config.comparisonColumns;

  return (
    <section aria-labelledby="alts-compared-heading" className="min-w-0 max-w-full">
      <h2
        id="alts-compared-heading"
        className="text-[12px] font-bold tracking-[0.14em] text-foreground uppercase"
      >
        Alternatives compared
      </h2>
      <ScrollableTableRegion
        label={`Spec comparison of ${product.fullName} and alternatives`}
        className="mt-4 border border-border"
      >
        <table className="w-full min-w-[48rem] text-left text-[13px]">
          <caption className="sr-only">
            Spec comparison of {product.fullName} and alternatives
          </caption>
          <thead>
            <tr className="bg-charcoal-950 text-white">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="px-3 py-3 text-[11px] font-semibold tracking-wide uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => (
              <tr
                key={row.productId}
                className={cn(
                  row.isSource
                    ? "bg-accent/15 font-medium"
                    : i % 2 === 0
                      ? "bg-white"
                      : "bg-surface-muted/40",
                )}
              >
                {columns.map((col) => (
                  <td key={col.id} className="px-3 py-2.5">
                    {col.kind === "name" ? (
                      <Link
                        href={`/products/${row.slug}`}
                        className="font-semibold hover:underline"
                      >
                        {row.cells[col.id]}
                        {row.isSource && (
                          <span className="ml-1.5 text-[10px] font-normal tracking-wide text-muted uppercase">
                            Source
                          </span>
                        )}
                      </Link>
                    ) : col.kind === "score" ? (
                      <span className="tabular-nums font-semibold">
                        {row.cells[col.id]}
                      </span>
                    ) : (
                      <span className="tabular-nums">{row.cells[col.id]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTableRegion>
    </section>
  );
}

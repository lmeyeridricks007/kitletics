import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";
import type {
  BestGuidePageData,
  GuideTableProductRow,
} from "@/lib/best/get-best-guide-page-data";

export function BestGuideComparisonTable({
  data,
}: {
  data: BestGuidePageData;
}) {
  const {
    tableProductRows,
    compareHref,
    category,
    comparisonTitle,
    comparisonFootnote,
    tableColumns,
    config,
  } = data;
  const columns = tableColumns?.length ? tableColumns : config.tableColumns;
  if (tableProductRows.length === 0 || columns.length === 0) return null;

  const noun =
    config.productNoun ?? category?.name ?? "Products";
  const productHeader = noun.replace(/s$/i, "") || "Product";

  return (
    <section className="py-8">
      <Container size="wide">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="heading-section">
              {data.contextComparisonRows.length > 0
                ? "Raw product specs"
                : comparisonTitle}
            </h2>
            {data.contextComparisonRows.length > 0 && (
              <p className="mt-1 text-[13px] text-muted">
                Spec reference after the decision comparison above. Guide-specific
                differences come first.
              </p>
            )}
          </div>
          <Link href={compareHref} className="link-accent shrink-0">
            Compare all picks →
          </Link>
        </div>

        <ScrollableTableRegion
          label={`Comparison of recommended ${noun.toLowerCase()}`}
          className="rounded-md border border-border"
        >
          <table className="w-full min-w-[52rem] border-collapse text-left text-[13px]">
            <caption className="sr-only">
              Comparison of recommended products in this guide
            </caption>
            <caption className="sr-only">
              Comparison of recommended {noun.toLowerCase()}
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface-muted text-foreground">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-surface-muted px-3 py-3 text-left text-[11px] font-bold tracking-wide uppercase"
                >
                  {productHeader}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-3 py-3 text-left text-[11px] font-bold tracking-wide whitespace-nowrap uppercase"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {tableProductRows.map((row) => (
                <TableRow key={row.rec.product.id} row={row} columns={columns} />
              ))}
            </tbody>
          </table>
        </ScrollableTableRegion>

        <p className="mt-3 text-[12px] text-subtle">
          {comparisonFootnote ?? (
            <>
              Scores reflect Kitletics&apos; structured product assessment and
              supporting evidence.{" "}
              <Link
                href="/methodology"
                className="text-link underline underline-offset-2 hover:text-link-hover"
              >
                How we score →
              </Link>
            </>
          )}
        </p>
      </Container>
    </section>
  );
}

function TableRow({
  row,
  columns,
}: {
  row: GuideTableProductRow;
  columns: BestGuidePageData["config"]["tableColumns"];
}) {
  const { rec, image, cells, scoreDisplay } = row;
  const name = rec.brand?.name
    ? `${rec.brand.name} ${rec.product.name}`
    : rec.product.name;

  return (
    <tr className="hover:bg-surface-muted/40">
      <th
        scope="row"
        className="sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-normal"
      >
        <Link
          href={`/products/${rec.product.slug}`}
          className="flex min-w-[14rem] items-center gap-2.5 hover:text-link"
        >
          <span className="relative size-10 shrink-0 overflow-hidden bg-surface-muted">
            {image ? (
              <Image
                src={image.src}
                alt=""
                fill
                className="object-contain p-0.5"
                sizes="40px"
              />
            ) : null}
          </span>
          <span className="text-[13px] font-semibold leading-snug">{name}</span>
        </Link>
      </th>
      {columns.map((col) => {
        const value = cells[col.key] ?? "—";
        if (col.source === "score" && scoreDisplay) {
          return (
            <td key={col.key} className="px-3 py-2.5">
              <span className="inline-flex min-w-[2rem] items-center justify-center rounded-[4px] bg-score px-1.5 py-0.5 text-[12px] font-bold text-score-foreground tabular-nums">
                {scoreDisplay}
              </span>
            </td>
          );
        }
        return (
          <td
            key={col.key}
            className="px-3 py-2.5 whitespace-nowrap text-foreground tabular-nums"
          >
            {value}
          </td>
        );
      })}
    </tr>
  );
}

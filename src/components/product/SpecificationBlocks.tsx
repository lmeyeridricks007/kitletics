import { cn } from "@/lib/utils";
import type { SpecDisplayGroup, SpecDisplayRow } from "@/lib/product/get-product-page-data";

export function SpecificationSummary({
  rows,
  className,
}: {
  rows: SpecDisplayRow[];
  className?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.key}
          className="rounded-xl border border-border bg-surface px-3 py-3"
        >
          <dt className="text-[10px] font-medium tracking-wide text-subtle uppercase">
            {row.label}
          </dt>
          <dd className="mt-1 font-display text-base font-semibold text-foreground">
            {row.value}
            {row.unit ? (
              <span className="ml-1 text-xs font-normal text-muted">
                {row.unit}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SpecificationGroup({
  group,
}: {
  group: SpecDisplayGroup;
}) {
  if (group.rows.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-base font-semibold text-foreground">
        {group.label}
      </h3>
      <SpecificationTable rows={group.rows} />
    </div>
  );
}

export function SpecificationTable({
  rows,
  className,
}: {
  rows: SpecDisplayRow[];
  className?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border",
        className,
      )}
    >
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key}
              className={cn(
                i % 2 === 0 ? "bg-surface" : "bg-surface-muted/40",
              )}
            >
              <th
                scope="row"
                className="px-4 py-2.5 text-left font-medium text-muted"
              >
                {row.label}
              </th>
              <td className="px-4 py-2.5 text-right text-foreground">
                {row.value}
                {row.unit ? ` ${row.unit}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

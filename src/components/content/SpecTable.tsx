import { cn } from "@/lib/utils";

interface SpecTableProps {
  specs: Record<string, string | number | boolean | string[]>;
  className?: string;
}

function formatValue(value: string | number | boolean | string[]): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function SpecTable({ specs, className }: SpecTableProps) {
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  return (
    <dl
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl border border-border",
        className,
      )}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="grid grid-cols-2 gap-4 bg-surface px-4 py-3 sm:grid-cols-[12rem_1fr]"
        >
          <dt className="text-sm text-muted">{formatKey(key)}</dt>
          <dd className="text-sm font-medium text-foreground">
            {formatValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

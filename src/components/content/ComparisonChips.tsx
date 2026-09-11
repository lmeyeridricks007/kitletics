import { cn } from "@/lib/utils";
import Link from "next/link";

interface ComparisonChip {
  label: string;
  href?: string;
}

interface ComparisonChipsProps {
  items: ComparisonChip[];
  className?: string;
}

export function ComparisonChips({ items, className }: ComparisonChipsProps) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => {
        const chip = (
          <span className="inline-flex items-center rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent">
            {item.label}
          </span>
        );

        return (
          <li key={item.label}>
            {item.href ? <Link href={item.href}>{chip}</Link> : chip}
          </li>
        );
      })}
    </ul>
  );
}

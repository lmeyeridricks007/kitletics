"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ShopByTypeItem {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

/**
 * Category "Shop by type" chips — highlights the active `type=` filter from the URL.
 */
export function ShopByTypeChips({
  basePath,
  items,
}: {
  basePath: string;
  items: ShopByTypeItem[];
}) {
  const searchParams = useSearchParams();
  const activeTypes = (searchParams.get("type") ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
        Shop by type
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2" role="list">
        {items.map((sub) => {
          const selected = activeTypes.includes(sub.slug);
          return (
            <Link
              key={sub.id}
              role="listitem"
              href={
                selected
                  ? basePath
                  : `${basePath}?type=${encodeURIComponent(sub.slug)}`
              }
              aria-current={selected ? "true" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[13px] font-medium transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-white text-foreground hover:border-foreground",
              )}
            >
              {sub.name}
              <span
                className={cn(
                  "text-[12px] tabular-nums",
                  selected ? "text-accent-foreground/80" : "text-subtle",
                )}
              >
                {sub.productCount}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

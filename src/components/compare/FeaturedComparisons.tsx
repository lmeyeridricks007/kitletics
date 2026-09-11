import Link from "next/link";
import Image from "next/image";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { Comparison } from "@/domain/editorial/types";
import type { CompareProductIndexItem } from "@/lib/comparison/product-index";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import { cn } from "@/lib/utils";

type FeaturedGroup = {
  categoryId: string;
  categoryName: string;
  items: Comparison[];
};

/** Cap featured cards so empty /compare does not paint dozens of product thumbs. */
const MAX_FEATURED_PER_CATEGORY = 8;

function ProductThumb({
  product,
  size = "md",
  priority = false,
}: {
  product?: Pick<
    CompareProductIndexItem,
    "name" | "thumbnailSrc" | "thumbnailAlt"
  >;
  size?: "md" | "lg";
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 overflow-hidden border border-border bg-white",
        size === "lg" ? "size-16 sm:size-[4.5rem]" : "size-12",
      )}
    >
      {product?.thumbnailSrc ? (
        <Image
          src={product.thumbnailSrc}
          alt=""
          fill
          className="object-contain p-1.5"
          sizes={IMAGE_SIZES.compareFeaturedThumb}
          quality={IMAGE_QUALITY.thumb}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      ) : (
        <ProductImageFallback
          label={product?.name ?? "Product"}
          className="size-full p-0 [&_p]:hidden [&_svg]:size-5"
        />
      )}
    </span>
  );
}

export function FeaturedComparisons({
  groups,
  index,
  categoryId,
  nounPlural = "products",
}: {
  groups: FeaturedGroup[];
  index: CompareProductIndexItem[];
  /** When set, only show comparisons for this category */
  categoryId?: string;
  nounPlural?: string;
}) {
  const byId = new Map(index.map((item) => [item.id, item]));

  const visible = (
    categoryId ? groups.filter((g) => g.categoryId === categoryId) : groups
  )
    .map((group) => ({
      ...group,
      items: group.items
        .filter((cmp) => cmp.productIds.some((id) => byId.has(id)))
        .slice(0, MAX_FEATURED_PER_CATEGORY),
    }))
    .filter((g) => g.items.length > 0);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">
        Featured comparisons for this category will appear as more editorial
        side-by-sides are published. Use the sidebar to compare {nounPlural}{" "}
        yourself.
      </p>
    );
  }

  let thumbOrdinal = 0;

  return (
    <div className="space-y-8">
      {visible.map((group) => (
        <div key={group.categoryId}>
          {(!categoryId || visible.length > 1) && (
            <h3 className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
              {group.categoryName}
            </h3>
          )}
          <ul
            className={cn(
              "grid gap-3 sm:grid-cols-2",
              !categoryId || visible.length > 1 ? "mt-3" : undefined,
            )}
          >
            {group.items.map((cmp) => {
              const a = byId.get(cmp.productIds[0] ?? "");
              const b = byId.get(cmp.productIds[1] ?? "");
              const nameA = a?.name ?? "Product A";
              const nameB = b?.name ?? "Product B";
              const summary =
                cmp.shortDescription?.trim() ||
                cmp.summary?.trim() ||
                undefined;
              // First card pair may be near LCP on empty builder; rest lazy.
              const priorityA = thumbOrdinal === 0;
              const priorityB = thumbOrdinal === 0;
              thumbOrdinal += 1;

              return (
                <li key={cmp.id}>
                  <Link
                    href={`/compare/${cmp.slug}`}
                    className="group flex h-full flex-col border border-border bg-white p-3.5 transition-colors hover:border-accent hover:bg-surface-muted/40 sm:p-4"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 sm:gap-3">
                      <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                        <ProductThumb
                          product={a}
                          size="lg"
                          priority={priorityA}
                        />
                        <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-foreground sm:text-[13px]">
                          {a?.brandName ? (
                            <>
                              <span className="text-muted">{a.brandName}</span>{" "}
                              {nameA}
                            </>
                          ) : (
                            nameA
                          )}
                        </span>
                      </div>

                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-[10px] font-bold tracking-wide text-subtle uppercase"
                        aria-hidden
                      >
                        vs
                      </span>

                      <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                        <ProductThumb
                          product={b}
                          size="lg"
                          priority={priorityB}
                        />
                        <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-foreground sm:text-[13px]">
                          {b?.brandName ? (
                            <>
                              <span className="text-muted">{b.brandName}</span>{" "}
                              {nameB}
                            </>
                          ) : (
                            nameB
                          )}
                        </span>
                      </div>
                    </div>

                    {summary && (
                      <p className="mt-3 line-clamp-2 border-t border-border pt-3 text-[12px] leading-relaxed text-muted">
                        {summary}
                      </p>
                    )}

                    <span className="mt-3 text-[12px] font-bold tracking-[0.04em] text-link uppercase group-hover:underline">
                      Compare →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

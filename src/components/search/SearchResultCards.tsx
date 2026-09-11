import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveToolIcon } from "@/lib/tools/icons";
import type {
  SearchPageBrandCard,
  SearchPageCategoryCard,
  SearchPageComparisonCard,
  SearchPageGuideCard,
  SearchPageProductCard,
  SearchPageToolCard,
} from "@/lib/search/get-search-page-data";

export function SearchProductResultCard({
  product,
}: {
  product: SearchPageProductCard;
}) {
  return (
    <article className="group flex flex-col border border-border bg-white">
      <div className="relative aspect-[4/3] bg-[#f4f5f7]">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
        <img
          src={product.image.src}
          alt={product.image.alt}
          className="size-full object-contain p-3"
        />
        <span
          className="absolute top-2 right-2 inline-flex size-7 items-center justify-center text-subtle"
          aria-hidden
        >
          <Bookmark className="size-4" strokeWidth={1.5} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
          {product.brandName}
        </p>
        <h3 className="font-display text-[15px] leading-snug font-bold text-foreground">
          <Link href={product.href} className="hover:text-link">
            {product.name}
          </Link>
        </h3>
        {product.score !== undefined && (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-bold text-[#0b1220]">
            <span className="tabular-nums">{product.score.toFixed(1)}</span>
            {product.scoreLabel && (
              <span className="font-semibold">{product.scoreLabel}</span>
            )}
          </p>
        )}
        {product.role && (
          <p className="line-clamp-1 text-[12px] text-muted">{product.role}</p>
        )}
        <p className="mt-auto pt-1 text-[12px] text-foreground">
          {product.price ? (
            <>
              From {formatPrice(product.price.amount, product.price.currency)}
              {product.offerCount > 0 && (
                <span className="text-muted">
                  {" "}
                  | {product.offerCount}+ offer
                  {product.offerCount === 1 ? "" : "s"}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted">Check prices</span>
          )}
        </p>
        <Link
          href={product.href}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-link hover:underline"
        >
          View details
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function SearchCategoryResultCard({
  category,
}: {
  category: SearchPageCategoryCard;
}) {
  return (
    <Link
      href={category.href}
      className="group flex flex-col overflow-hidden border border-border bg-white"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[#f4f5f7]">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
        <img
          src={category.image.src}
          alt={category.image.alt}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-0.5 p-2.5">
        <h3 className="text-[13px] font-bold text-foreground group-hover:text-link">
          {category.title}
        </h3>
        <p className="text-[11px] text-muted">
          {category.productCount} product
          {category.productCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

export function SearchBrandResultCard({ brand }: { brand: SearchPageBrandCard }) {
  return (
    <Link
      href={brand.href}
      className="flex flex-col items-center justify-center gap-2 border border-border bg-white px-3 py-5 text-center transition-colors hover:border-foreground/30"
    >
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className="h-8 w-auto max-w-[120px] object-contain"
        />
      ) : (
        <span className="font-display text-sm font-bold tracking-wide uppercase">
          {brand.name}
        </span>
      )}
      <p className="text-[11px] text-muted">
        {brand.productCount} product{brand.productCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}

export function SearchGuideResultCard({ guide }: { guide: SearchPageGuideCard }) {
  return (
    <Link
      href={guide.href}
      className="group flex flex-col overflow-hidden border border-border bg-white"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f5f7]">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative/montage or list thumb; native img for absolute/contain layout */}
        <img
          src={guide.imageSrc}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-2 left-2 rounded-[2px] bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-foreground uppercase">
          {guide.eyebrow}
        </span>
      </div>
      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 text-[13px] leading-snug font-bold text-foreground group-hover:text-link">
          {guide.title}
        </h3>
        {guide.description && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
            {guide.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export function SearchComparisonResultCard({
  comparison,
}: {
  comparison: SearchPageComparisonCard;
}) {
  return (
    <article className="flex flex-col border border-border bg-white p-3">
      <div className="relative mb-3 flex items-center justify-center gap-2">
        <div className="flex size-16 items-center justify-center bg-[#f4f5f7]">
          {comparison.productA?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
            <img
              src={comparison.productA.image.src}
              alt={comparison.productA.image.alt}
              className="size-full object-contain p-1"
            />
          ) : (
            <span className="px-1 text-center text-[10px] text-muted">
              {comparison.productA?.name ?? "A"}
            </span>
          )}
        </div>
        <span className="absolute left-1/2 z-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-[#0b1220]">
          VS
        </span>
        <div className="flex size-16 items-center justify-center bg-[#f4f5f7]">
          {comparison.productB?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- list/card thumb; native img avoids next/image box constraints
            <img
              src={comparison.productB.image.src}
              alt={comparison.productB.image.alt}
              className="size-full object-contain p-1"
            />
          ) : (
            <span className="px-1 text-center text-[10px] text-muted">
              {comparison.productB?.name ?? "B"}
            </span>
          )}
        </div>
      </div>
      <h3 className="mb-2 line-clamp-2 text-[13px] font-bold text-foreground">
        {comparison.title}
      </h3>
      <Link
        href={comparison.href}
        className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-link hover:underline"
      >
        Compare
        <ArrowRight className="size-3" aria-hidden />
      </Link>
    </article>
  );
}

export function SearchToolResultCard({ tool }: { tool: SearchPageToolCard }) {
  const Icon = resolveToolIcon(tool.icon);
  return (
    <Link
      href={tool.href}
      className="group flex flex-col gap-2 border border-border bg-white p-3 transition-colors hover:border-foreground/30"
    >
      <Icon className="size-5 text-foreground" strokeWidth={1.5} aria-hidden />
      <h3 className="text-[13px] font-bold text-foreground group-hover:text-link">
        {tool.name}
      </h3>
      <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
        {tool.description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[12px] font-semibold text-link">
        Open
        <ArrowRight className="size-3" aria-hidden />
      </span>
    </Link>
  );
}

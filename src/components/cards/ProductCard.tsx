import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RatingBadge } from "@/components/content/RatingBadge";
import { PriceBadge } from "@/components/content/PriceBadge";
import { RecommendationPill } from "@/components/content/RecommendationPill";
import type { Product } from "@/domain/products/types";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { getProductCardSpecHighlights } from "@/lib/product/card-specs";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

interface ProductCardProps {
  product: Product;
  brandName?: string;
  categoryName?: string;
  lowestPrice?: { price: number; currency: string };
  recommendationLabel?: string;
  href?: string;
  className?: string;
  /** Above-fold cards only */
  priority?: boolean;
}

export function ProductCard({
  product,
  brandName,
  categoryName,
  lowestPrice,
  recommendationLabel,
  href,
  className,
  priority = false,
}: ProductCardProps) {
  const link = href ?? `/products/${product.slug}`;
  const image = product.images[0];
  const highlights = getProductCardSpecHighlights(product);
  const isRacket =
    product.categoryId.includes("racket") ||
    product.categoryId.includes("paddle");

  return (
    <Link
      href={link}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-surface-muted",
          isRacket ? "aspect-[3/4] p-4" : "aspect-[4/3]",
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={IMAGE_SIZES.productCard}
            quality={IMAGE_QUALITY.card}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={cn(
              "transition-transform duration-500 group-hover:scale-[1.03]",
              isRacket ? "object-contain" : "object-cover",
            )}
          />
        ) : (
          <ProductImageFallback
            label={product.name}
            categoryLabel={categoryName}
          />
        )}
        {recommendationLabel && (
          <div className="absolute top-3 left-3">
            <RecommendationPill label={recommendationLabel} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {brandName && (
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {brandName}
          </p>
        )}
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent">
          {product.fullName}
        </h3>
        {categoryName && (
          <p className="text-xs text-subtle">{categoryName}</p>
        )}
        {highlights.length > 0 && (
          <dl className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {highlights.map((h) => (
              <div key={h.label} className="flex gap-1">
                <dt className="text-subtle">{h.label}:</dt>
                <dd className="font-medium text-foreground">{h.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="line-clamp-2 text-sm text-muted">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {product.recommendationScore !== undefined && (
              <RatingBadge score={product.recommendationScore} />
            )}
            {recommendationLabel && (
              <span className="text-xs text-muted">Best for: {recommendationLabel}</span>
            )}
          </div>
          {lowestPrice && (
            <PriceBadge
              amount={lowestPrice.price}
              currency={lowestPrice.currency}
              from
            />
          )}
        </div>
        <span className="card-cta mt-auto opacity-0 transition-opacity group-hover:opacity-100">
          View product →
        </span>
      </div>
    </Link>
  );
}

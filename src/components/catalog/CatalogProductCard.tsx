import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getScoreBand } from "@/lib/product/score";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { CatalogFromPrice } from "@/components/commerce/CatalogPriceIsland";
import type { CatalogProductRow } from "@/lib/catalog/types";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

interface CatalogProductCardProps {
  row: CatalogProductRow;
  selected?: boolean;
  onToggleCompare?: (productId: string) => void;
  compareDisabled?: boolean;
  className?: string;
  compact?: boolean;
  /** Use-case listing cards match mockup density (specs only, no Best for). */
  hideBestFor?: boolean;
  /** First cards above the fold may set priority */
  priority?: boolean;
}

function humanBestFor(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw
    .replace(/^Huge protective stack$/i, "High cushioning")
    .replace(/^Soft energetic daily ride$/i, "Daily mileage")
    .replace(/^Best for:\s*/i, "");
  if (/^[A-Z_]+$/.test(cleaned)) return undefined;
  if (cleaned.length > 48) return cleaned.slice(0, 45).trimEnd() + "…";
  return cleaned;
}

export function CatalogProductCard({
  row,
  selected,
  onToggleCompare,
  compareDisabled,
  className,
  compact,
  hideBestFor,
  priority = false,
}: CatalogProductCardProps) {
  const {
    id,
    slug,
    name,
    brandName,
    badges,
    weight,
    drop,
    stability,
    price,
    audienceLabel,
    weightContext,
    image,
    score,
    bestFor: bestForRaw,
  } = row;
  const specs: string[] = [];
  if (weight !== undefined) {
    specs.push(
      weightContext ? `${weight}g (${weightContext})` : `${weight}g`,
    );
  }
  if (drop !== undefined) specs.push(`${drop}mm drop`);
  if (stability && !hideBestFor) {
    specs.push(
      stability
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" "),
    );
  }

  const band = score !== undefined ? getScoreBand(score) : undefined;
  const bestFor = hideBestFor ? undefined : humanBestFor(bestForRaw);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-white",
        selected && "ring-2 ring-accent",
        className,
      )}
    >
      <Link href={`/products/${slug}`} className="group block">
        <div
          className={cn(
            "relative overflow-hidden bg-white",
            compact ? "h-[190px]" : "aspect-[4/3]",
          )}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={
                compact
                  ? IMAGE_SIZES.productCardCompact
                  : IMAGE_SIZES.productCard
              }
              quality={IMAGE_QUALITY.card}
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <ProductImageFallback
              label="Image unavailable"
              categoryLabel={brandName}
            />
          )}
          {badges.length > 0 && (
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className="rounded-[3px] bg-charcoal-950/85 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5",
          compact ? "p-3" : "p-4",
        )}
      >
        {brandName && (
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
            {brandName}
          </p>
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="font-display text-[15px] leading-snug font-semibold text-foreground hover:text-link">
            {name}
          </h3>
        </Link>

        {audienceLabel && (
          <p className="text-[11px] text-subtle">{audienceLabel}</p>
        )}

        {specs.length > 0 && (
          <p className="text-[12px] text-muted">{specs.join(" · ")}</p>
        )}

        {bestFor && (
          <p className="text-[12px] text-muted">
            <span className="font-medium text-foreground">Best for:</span>{" "}
            {bestFor}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            {score !== undefined && band && (
              <span
                className="inline-flex size-8 items-center justify-center rounded-[4px] bg-score text-[13px] font-bold text-score-foreground tabular-nums"
                title={band.label}
              >
                {score.toFixed(1)}
              </span>
            )}
            <CatalogFromPrice
              slug={slug}
              fallback={
                price
                  ? { price: price.price, currency: price.currency }
                  : null
              }
            />
          </div>
          {onToggleCompare && (
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted">
              <input
                type="checkbox"
                checked={Boolean(selected)}
                disabled={compareDisabled && !selected}
                onChange={() => onToggleCompare(id)}
                className="size-3.5 rounded border-border"
              />
              Compare
            </label>
          )}
        </div>

        <Link
          href={`/products/${slug}`}
          className="pt-1 text-[13px] font-medium text-link hover:text-link-hover hover:underline"
        >
          View product →
        </Link>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RatingBadge } from "@/components/content/RatingBadge";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { Review, BestGuide, Comparison, BuyingGuide, GearSetup } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import { resolveBestGuideImage } from "@/lib/best/resolve-best-guide-image";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getProductById } from "@/repositories";

const cardBase =
  "group block overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent hover:shadow-md";

export function ReviewCard({
  title,
  review,
  href,
  brandName,
  displayScore,
  product,
  className,
}: {
  title: string;
  review: Review;
  href?: string;
  brandName?: string;
  displayScore?: number;
  product?: Product;
  className?: string;
}) {
  const score = displayScore ?? review.score;
  const typeLabel =
    review.reviewType === "first-hand-test"
      ? "Personally Tested"
      : review.reviewType === "hybrid"
        ? "Tested + Research"
        : "Expert Research";
  const resolved = product ?? getProductById(review.productId);
  const image = resolved ? getPrimaryProductMedia(resolved) : undefined;

  return (
    <Link href={href ?? `/reviews/${review.slug}`} className={cn(cardBase, className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ProductImageFallback
            label="Image unavailable"
            categoryLabel={brandName}
          />
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Review</Badge>
          <Badge variant="muted">{typeLabel}</Badge>
        </div>
        {brandName && (
          <p className="mt-3 text-[11px] font-medium tracking-[0.1em] text-subtle uppercase">
            {brandName}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{review.summary}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <RatingBadge score={score} />
          <span className="link-cta text-xs">Read review →</span>
        </div>
      </div>
    </Link>
  );
}

export function BestGuideCard({
  guide,
  className,
  imageOverride,
}: {
  guide: BestGuide;
  className?: string;
  /** When set (e.g. hub dedupe), overrides resolveBestGuideImage */
  imageOverride?: { src: string; alt: string };
}) {
  const desc = guide.shortDescription ?? guide.intro;
  const image = imageOverride ?? resolveBestGuideImage(guide);
  return (
    <Link href={`/best/${guide.slug}`} className={cn(cardBase, className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <Badge variant="accent">Best guide</Badge>
        <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-accent">
          {guide.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{desc}</p>
        <p className="mt-4 text-xs text-subtle">
          {guide.recommendations.length} recommendation
          {guide.recommendations.length === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

export function ComparisonCard({
  comparison,
  productNames,
  className,
}: {
  comparison: Comparison;
  productNames?: string[];
  className?: string;
}) {
  const pair = comparison.productIds.slice(0, 2).map((id, index) => {
    const product = getProductById(id);
    const media = product ? getPrimaryProductMedia(product) : undefined;
    return {
      id,
      name: productNames?.[index] ?? product?.name ?? "Product",
      imageSrc: media?.src,
      imageAlt: media?.alt ?? product?.fullName ?? product?.name,
    };
  });

  const summary =
    comparison.shortDescription?.trim() ||
    comparison.summary?.trim() ||
    undefined;

  return (
    <Link
      href={`/compare/${comparison.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent hover:shadow-md",
        className,
      )}
    >
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-end gap-2 bg-[radial-gradient(ellipse_at_center,#e8eaed_0%,#f5f6f7_72%)] px-4 pt-5 pb-3 sm:gap-3 sm:px-5">
        {pair[0] ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[9rem]">
            {pair[0].imageSrc ? (
              <Image
                src={pair[0].imageSrc}
                alt={pair[0].imageAlt ?? pair[0].name}
                fill
                className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="144px"
              />
            ) : (
              <ProductImageFallback
                label={pair[0].name}
                className="size-full p-2 [&_p]:hidden [&_svg]:size-6"
              />
            )}
          </div>
        ) : null}
        <span
          className="mb-6 flex size-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-white text-[10px] font-bold tracking-wide text-subtle uppercase"
          aria-hidden
        >
          vs
        </span>
        {pair[1] ? (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[9rem]">
            {pair[1].imageSrc ? (
              <Image
                src={pair[1].imageSrc}
                alt={pair[1].imageAlt ?? pair[1].name}
                fill
                className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="144px"
              />
            ) : (
              <ProductImageFallback
                label={pair[1].name}
                className="size-full p-2 [&_p]:hidden [&_svg]:size-6"
              />
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-border p-4 sm:p-5">
        <Badge variant="muted">Comparison</Badge>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-accent">
          {pair.length === 2 ? (
            <>
              {pair[0].name}
              <span className="mx-2 text-subtle">vs</span>
              {pair[1].name}
            </>
          ) : (
            comparison.title
          )}
        </h3>
        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{summary}</p>
        ) : null}
        <span className="mt-4 text-[12px] font-bold tracking-[0.04em] text-link uppercase group-hover:underline">
          Compare →
        </span>
      </div>
    </Link>
  );
}

export function BuyingGuideCard({
  guide,
  className,
}: {
  guide: BuyingGuide;
  className?: string;
}) {
  const image = resolveGuideImage(guide);
  const summary =
    guide.shortDescription?.trim() ||
    guide.sections[0]?.body?.trim() ||
    undefined;

  return (
    <Link href={`/guides/${guide.slug}`} className={cn(cardBase, className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <Badge variant="default">Buying guide</Badge>
        <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-accent">
          {guide.title}
        </h3>
        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{summary}</p>
        ) : null}
        <span className="mt-4 inline-block text-[12px] font-bold tracking-[0.04em] text-link uppercase group-hover:underline">
          Read guide →
        </span>
      </div>
    </Link>
  );
}

export function GearSetupCard({
  setup,
  className,
}: {
  setup: GearSetup;
  className?: string;
}) {
  return (
    <Link href={`/setups/${setup.slug}`} className={cn(cardBase, className)}>
      <Badge variant="muted">Setup</Badge>
      <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-accent">
        {setup.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{setup.description}</p>
    </Link>
  );
}

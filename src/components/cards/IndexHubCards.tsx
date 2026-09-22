import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RatingBadge } from "@/components/content/RatingBadge";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { ReviewType } from "@/domain/editorial/types";

const cardBase =
  "group block overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent hover:shadow-md";

export function IndexReviewCard({
  href,
  title,
  summary,
  brandName,
  reviewType,
  displayScore,
  image,
  className,
}: {
  href: string;
  title: string;
  summary: string;
  brandName?: string;
  reviewType: ReviewType;
  displayScore: number;
  image?: { src: string; alt: string };
  className?: string;
}) {
  const typeLabel =
    reviewType === "first-hand-test"
      ? "Personally Tested"
      : reviewType === "hybrid"
        ? "Tested + Research"
        : "Expert Research";

  return (
    <Link href={href} className={cn(cardBase, className)}>
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
        <p className="mt-2 line-clamp-2 text-sm text-muted">{summary}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <RatingBadge score={displayScore} />
          <span className="link-cta text-xs">Read review →</span>
        </div>
      </div>
    </Link>
  );
}

export function IndexBestGuideCard({
  href,
  title,
  description,
  recCount,
  image,
  className,
}: {
  href: string;
  title: string;
  description: string;
  recCount: number;
  image: { src: string; alt: string };
  className?: string;
}) {
  return (
    <Link href={href} className={cn(cardBase, className)}>
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
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{description}</p>
        <p className="mt-4 text-xs text-subtle">
          {recCount} recommendation{recCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

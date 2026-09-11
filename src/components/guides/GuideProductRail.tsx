import Image from "next/image";
import Link from "next/link";
import type { GuideProductCardData } from "@/lib/guides/get-long-form-guide-page-data";
import { formatPrice } from "@/lib/utils";

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function GuideProductRail({
  title,
  browseHref,
  browseLabel,
  products,
}: {
  title: string;
  browseHref?: string;
  browseLabel?: string;
  products: GuideProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section id="examples" className="scroll-mt-28 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[12px] font-bold tracking-[0.14em] text-foreground uppercase">
          {title}
        </h2>
        {browseHref && (
          <Link
            href={browseHref}
            className="text-[13px] font-medium text-link hover:underline"
          >
            {browseLabel ?? "View all →"}
          </Link>
        )}
      </div>
      <ul className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {products.map((item) => (
          <li
            key={item.product.id}
            className="w-[200px] shrink-0 border border-border bg-white p-3"
          >
            <div className="relative aspect-[5/3] overflow-hidden bg-surface-muted">
              {item.media ? (
                <Image
                  src={item.media.src}
                  alt={item.media.alt ?? item.product.fullName}
                  fill
                  className="object-contain p-1"
                  sizes="200px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[11px] text-subtle">
                  —
                </div>
              )}
            </div>
            <p className="mt-2 text-[10px] font-semibold tracking-wide text-subtle uppercase">
              {item.brand?.name}
            </p>
            <p className="text-[14px] font-bold leading-tight">
              {item.product.name}
            </p>
            {item.roleLabel && (
              <p className="mt-1 text-[12px] text-muted">{item.roleLabel}</p>
            )}
            {typeof item.score === "number" && item.scoreLabel && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-[3px] bg-score px-1.5 py-0.5 text-[10px] font-bold text-score-foreground tabular-nums">
                {displayScore(item.score)} {item.scoreLabel}
              </span>
            )}
            <p className="mt-2 text-[12px] tabular-nums">
              {item.price ? (
                <>From {formatPrice(item.price.price, item.price.currency)}</>
              ) : (
                <span className="text-subtle">Check prices</span>
              )}
            </p>
            <Link
              href={
                item.reviewSlug
                  ? `/reviews/${item.reviewSlug}`
                  : `/products/${item.product.slug}`
              }
              className="mt-2 inline-block text-[12px] font-medium text-link hover:underline"
            >
              {item.reviewSlug ? "View review →" : "View product →"}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

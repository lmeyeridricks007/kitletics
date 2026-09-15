"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { FinderPreviewSelect } from "@/components/finder/FinderPreviewSelect";
import { formatPrice } from "@/lib/utils";
import { runningShoeFinderDefinition } from "@/domain/finders/configs/running-shoe-finder";
import { encodeFinderShareStateBrowser } from "@/domain/finders/share-state";
import type { FinderResponses } from "@/domain/finders/types";
import type {
  SportHubFinderPreview,
  SportHubProductCard,
} from "@/lib/sport-hub/types";

type FinderData = SportHubFinderPreview;

function ProductCard({ product }: { product: SportHubProductCard }) {
  return (
    <article className="flex w-[180px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white lg:w-auto">
      <div className="relative px-2.5 pt-2.5">
        <span className="absolute top-2.5 left-2.5 z-10 rounded-[3px] bg-accent px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
          {product.badge}
        </span>
        <Link
          href={product.href}
          className="relative mt-4 flex aspect-[3/4] items-center justify-center bg-surface-muted/50"
        >
          {product.image ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              width={180}
              height={240}
              sizes="(max-width: 1024px) 180px, 20vw"
              loading="lazy"
              className="max-h-full max-w-full object-contain p-2"
            />
          ) : (
            <ProductImageFallback label={product.name} />
          )}
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-2.5 pb-3">
        <p className="text-[12px] leading-snug">
          <span className="font-bold text-foreground">{product.brandName}</span>{" "}
          <Link
            href={product.href}
            className="text-foreground hover:text-link"
          >
            {product.name}
          </Link>
        </p>
        {(product.score !== undefined || product.scoreLabel) && (
          <div className="flex items-center gap-1.5">
            {product.score !== undefined && (
              <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-[4px] bg-score px-1 text-[11px] font-bold text-score-foreground tabular-nums">
                {product.score.toFixed(1)}
              </span>
            )}
            {product.scoreLabel && (
              <span className="text-[12px] font-medium text-foreground">
                {product.scoreLabel}
              </span>
            )}
          </div>
        )}
        {product.price && (
          <p className="text-[13px] font-semibold text-foreground">
            From{" "}
            {formatPrice(product.price.amount, product.price.currency, "nl-NL")}
          </p>
        )}
        <Link
          href={product.href}
          className="mt-auto pt-0.5 text-[12px] font-medium text-link hover:underline"
        >
          View prices
          {product.offerCount > 0 ? ` (${product.offerCount})` : ""} →
        </Link>
      </div>
    </article>
  );
}

function defaultsFrom(finder: FinderData): Record<string, string> {
  return Object.fromEntries(finder.fields.map((f) => [f.name, f.value]));
}

function InlineFinder({ finder }: { finder: FinderData }) {
  const router = useRouter();
  const [values, setValues] = useState(() => defaultsFrom(finder));
  const isShoeFinder = finder.ctaHref.includes("running-shoe-finder");

  function hrefForSubmit(): string {
    if (isShoeFinder) {
      const responses: FinderResponses = {};
      for (const [key, value] of Object.entries(values)) {
        if (value) responses[key] = value;
      }
      const encoded = encodeFinderShareStateBrowser(
        runningShoeFinderDefinition,
        responses,
      );
      const sep = finder.ctaHref.includes("?") ? "&" : "?";
      return `${finder.ctaHref}${sep}s=${encodeURIComponent(encoded)}`;
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${finder.ctaHref}?${qs}` : finder.ctaHref;
  }

  return (
    <aside className="rounded-xl bg-[#0e2a2a] p-5 text-white sm:p-6">
      <h2 className="font-display text-[18px] leading-tight font-bold tracking-[0.04em] uppercase">
        {finder.title}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-white/65">
        {finder.description}
      </p>

      <form
        className="mt-5 grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(hrefForSubmit());
        }}
      >
        {finder.fields.map((field) => (
          <FinderPreviewSelect
            key={field.name}
            field={field}
            appearance="dark"
            onValueChange={(name, value) =>
              setValues((prev) => ({ ...prev, [name]: value }))
            }
          />
        ))}
        <button
          type="submit"
          className="col-span-2 mt-1 inline-flex h-11 items-center justify-center rounded-[4px] bg-accent text-[12px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
        >
          {finder.ctaLabel} →
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] text-white/55">
        Not sure yet? Start with the{" "}
        <Link
          href={finder.footnoteHref}
          className="font-medium text-[#7eb6ff] hover:underline"
        >
          {finder.footnoteLabel}
        </Link>
      </p>
    </aside>
  );
}

/**
 * Best-picks product strip with optional inline finder (same pattern as
 * Best Running Shoes + shoe finder on the Running hub).
 */
export function SportHubBestStrip({
  title,
  href,
  products,
  finder,
  hideEmptyProductColumn = false,
}: {
  title: string;
  href: string;
  products: SportHubProductCard[];
  finder?: FinderData;
  /** When true and products are empty, only render the finder (no blank left column). */
  hideEmptyProductColumn?: boolean;
}) {
  const productCols =
    products.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  const showProducts = !(hideEmptyProductColumn && products.length === 0);

  return (
    <div
      className={
        finder && showProducts
          ? "grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]"
          : finder
            ? "mx-auto max-w-md"
            : undefined
      }
    >
      {showProducts ? (
        <div className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="heading-section">{title}</h2>
            <Link href={href} className="link-accent shrink-0">
              View all best picks →
            </Link>
          </div>
          <div
            className={`flex gap-3 overflow-x-auto pb-1 lg:grid lg:overflow-visible ${productCols} [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : null}
      {finder ? <InlineFinder finder={finder} /> : null}
    </div>
  );
}

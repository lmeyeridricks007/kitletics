"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { formatPrice } from "@/lib/utils";
import type { HomepageProductCard } from "@/lib/home/types";

const CARD_GAP_PX = 16;

export function BestProductsSection({
  title,
  href,
  products,
  eyebrow,
}: {
  title: string;
  href: string;
  products: HomepageProductCard[];
  eyebrow?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const maxScroll = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 4);
    setCanScrollNext(node.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    updateScrollState();

    node.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [products.length, updateScrollState]);

  function scrollByDirection(direction: "prev" | "next") {
    const node = scrollerRef.current;
    if (!node) return;

    const firstCard = node.querySelector<HTMLElement>("[data-carousel-card]");
    const step = (firstCard?.offsetWidth ?? 240) + CARD_GAP_PX;

    node.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  }

  if (products.length === 0) return null;

  return (
    <section className="pb-12 sm:pb-14">
      <Container size="wide">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
                {eyebrow}
              </p>
            )}
            <h2 className="heading-section">{title}</h2>
          </div>
          <Link href={href} className="link-accent shrink-0">
            View best guide →
          </Link>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>

          {canScrollPrev && (
            <button
              type="button"
              onClick={() => scrollByDirection("prev")}
              aria-label="Show previous products"
              className="absolute top-1/2 left-1 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md transition hover:bg-surface-muted"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
          )}

          {canScrollNext && (
            <button
              type="button"
              onClick={() => scrollByDirection("next")}
              aria-label="Show more products"
              className="absolute top-1/2 right-1 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md transition hover:bg-surface-muted"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}

function HomeProductCard({ product }: { product: HomepageProductCard }) {
  return (
    <article
      data-carousel-card
      className="flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-white sm:w-[240px]"
    >
      <div className="relative px-3 pt-3">
        <span className="absolute top-3 left-3 z-10 rounded-[3px] bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
          {product.badge}
        </span>
        <Link
          href={product.href}
          className="relative mt-5 flex aspect-[3/4] items-center justify-center bg-surface-muted/40"
        >
          {product.image ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              width={240}
              height={320}
              sizes="240px"
              loading="lazy"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <ProductImageFallback
              label={product.name}
              categoryLabel={product.brandName}
              className="rounded-none"
            />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 pt-3 pb-4">
        <div>
          {product.brandName && (
            <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
              {product.brandName}
            </p>
          )}
          <Link
            href={product.href}
            className="mt-0.5 block font-display text-[15px] leading-snug font-semibold text-foreground hover:text-link"
          >
            {product.name}
          </Link>
        </div>

        {(product.score !== undefined || product.scoreLabel) && (
          <div className="flex items-center gap-2">
            {product.score !== undefined && (
              <span className="inline-flex size-8 items-center justify-center rounded-[4px] bg-score text-[13px] font-bold text-score-foreground tabular-nums">
                {product.score.toFixed(1)}
              </span>
            )}
            {product.scoreLabel && (
              <span className="text-[13px] font-medium text-foreground">
                {product.scoreLabel}
              </span>
            )}
          </div>
        )}

        {product.price && (
          <p className="text-sm font-semibold text-foreground">
            From{" "}
            {formatPrice(product.price.amount, product.price.currency, "nl-NL")}
          </p>
        )}

        <Link
          href={product.href}
          className="mt-auto pt-1 text-[13px] font-medium text-link hover:text-link-hover hover:underline"
        >
          View prices{product.offerCount > 0 ? ` (${product.offerCount})` : ""}{" "}
          →
        </Link>
      </div>
    </article>
  );
}

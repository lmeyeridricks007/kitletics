"use client";

import Image from "next/image";
import { useCallback, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { MediaAsset } from "@/domain/shared/types";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

interface ProductMediaGalleryProps {
  images: MediaAsset[];
  productName: string;
  categoryLabel?: string;
  imageFit?: "cover" | "contain";
  className?: string;
  /** Mockup layout: vertical thumbs on desktop left of main image */
  layout?: "default" | "pdp";
  /** Optional override for main image aspect (category-aware) */
  mainAspectClass?: string;
}

export function ProductMediaGallery({
  images,
  productName,
  categoryLabel,
  imageFit = "contain",
  className,
  layout = "default",
  mainAspectClass,
}: ProductMediaGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active];
  const fitClass =
    imageFit === "contain" ? "object-contain p-4 sm:p-6" : "object-cover";

  const go = useCallback(
    (dir: -1 | 1) => {
      if (images.length === 0) return;
      setActive((i) => (i + dir + images.length) % images.length);
    },
    [images.length],
  );

  function onGalleryKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (images.length < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-white",
          className,
        )}
      >
        <div className="aspect-[4/3]">
          <ProductImageFallback
            label={productName}
            categoryLabel={categoryLabel}
          />
        </div>
      </div>
    );
  }

  if (layout === "pdp") {
    const multi = images.length > 1;
    return (
      <div
        className={cn(
          multi
            ? "grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[80px_minmax(0,1fr)]"
            : "block",
          className,
        )}
        onKeyDown={onGalleryKeyDown}
      >
        {multi && (
          <div className="order-2 flex min-w-0 max-w-full gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white sm:h-[72px] sm:w-full",
                  index === active ? "border-foreground" : "border-border",
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes={IMAGE_SIZES.galleryThumb}
                  quality={IMAGE_QUALITY.thumb}
                  loading="lazy"
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}

        <div className={cn("relative", multi && "order-1 sm:order-2")}>
          <div
            className={cn(
              "relative overflow-hidden rounded-lg bg-[#f7f7f5]",
              mainAspectClass ?? "aspect-[4/3] sm:aspect-[5/4] lg:min-h-[420px]",
            )}
          >
            <Image
              src={current.src}
              alt={current.alt || productName}
              fill
              sizes={IMAGE_SIZES.pdpHero}
              quality={IMAGE_QUALITY.hero}
              priority={active === 0}
              loading={active === 0 ? "eager" : "lazy"}
              className={fitClass}
            />
            {multi && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-sm hover:bg-white"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-sm hover:bg-white"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)} onKeyDown={onGalleryKeyDown}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted">
        <div className="relative aspect-[4/3]">
          <Image
            src={current.src}
            alt={current.alt || productName}
            fill
            sizes={IMAGE_SIZES.pdpHero}
            quality={IMAGE_QUALITY.hero}
            priority={active === 0}
            loading={active === 0 ? "eager" : "lazy"}
            className={fitClass}
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 min-w-0 max-w-full">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border bg-surface-muted",
                index === active ? "border-accent" : "border-border",
              )}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes={IMAGE_SIZES.galleryThumb}
                quality={IMAGE_QUALITY.thumb}
                loading="lazy"
                className={
                  imageFit === "contain" ? "object-contain p-1" : "object-cover"
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

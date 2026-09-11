"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { formatPrice } from "@/lib/utils";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

export function ShoesBestAndFinder({
  bestSection,
  finder,
}: {
  bestSection?: ShoesCategoryPageData["bestSection"];
  finder: ShoesCategoryPageData["finder"];
}) {
  const router = useRouter();

  return (
    <section className="bg-white py-8 sm:py-9">
      <div className="mx-auto grid w-full max-w-[90rem] gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.72fr)_minmax(280px,0.68fr)] lg:gap-6 lg:px-8">
        <div className="min-w-0">
          <div className="mb-6">
            <p className="text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">
              Shop running shoes
            </p>
            <h2 className="mt-1 heading-section">Shop by fit / sizing</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link
                href="/running/shoes?gender=men#catalog"
                className="border border-border bg-surface px-4 py-4 transition-colors hover:border-foreground"
              >
                <p className="text-[12px] font-bold tracking-[0.08em] text-foreground uppercase">
                  Men&apos;s running shoes
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">
                  Find models available in men&apos;s sizing.
                </p>
                <p className="mt-3 text-[12px] font-bold tracking-wide text-link uppercase">
                  Shop men&apos;s →
                </p>
              </Link>
              <Link
                href="/running/shoes?gender=women#catalog"
                className="border border-border bg-surface px-4 py-4 transition-colors hover:border-foreground"
              >
                <p className="text-[12px] font-bold tracking-[0.08em] text-foreground uppercase">
                  Women&apos;s running shoes
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">
                  Find models available in women&apos;s sizing.
                </p>
                <p className="mt-3 text-[12px] font-bold tracking-wide text-link uppercase">
                  Shop women&apos;s →
                </p>
              </Link>
              <Link
                href="/running/shoes?gender=unisex#catalog"
                className="border border-border bg-surface px-4 py-4 transition-colors hover:border-foreground"
              >
                <p className="text-[12px] font-bold tracking-[0.08em] text-foreground uppercase">
                  Unisex running shoes
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">
                  Explore shoes sold in unisex sizing.
                </p>
                <p className="mt-3 text-[12px] font-bold tracking-wide text-link uppercase">
                  Shop unisex →
                </p>
              </Link>
            </div>
          </div>

          {bestSection && (
            <>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="heading-section">{bestSection.title}</h2>
                <Link href={bestSection.href} className="link-accent shrink-0 text-[12px]">
                  View all best picks →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {bestSection.products.map((product) => (
                  <article
                    key={product.id}
                    className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white lg:w-auto"
                  >
                    <div className="relative px-2 pt-2">
                      <span className="absolute top-2 left-2 z-10 rounded-[3px] bg-accent px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-accent-foreground uppercase">
                        {product.badge}
                      </span>
                      <Link
                        href={product.href}
                        className="relative mt-3 flex h-[140px] items-center justify-center bg-white"
                      >
                        {product.image ? (
                          <Image
                            src={product.image.src}
                            alt={product.image.alt}
                            fill
                            sizes={IMAGE_SIZES.brandCard}
                            quality={IMAGE_QUALITY.card}
                            loading="lazy"
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <ProductImageFallback label="Image unavailable" />
                        )}
                      </Link>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-2.5 pt-2 pb-2.5">
                      <p className="text-[11px] leading-snug">
                        <span className="font-bold text-foreground">
                          {product.brandName}
                        </span>{" "}
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
                            <span className="inline-flex h-5 min-w-6 items-center justify-center rounded-[4px] bg-score px-1 text-[10px] font-bold text-score-foreground tabular-nums">
                              {product.score.toFixed(1)}
                            </span>
                          )}
                          {product.scoreLabel && (
                            <span className="text-[11px] font-medium text-foreground">
                              {product.scoreLabel}
                            </span>
                          )}
                        </div>
                      )}
                      {product.price ? (
                        <p className="text-[12px] font-semibold text-foreground">
                          From{" "}
                          {formatPrice(
                            product.price.amount,
                            product.price.currency,
                            "nl-NL",
                          )}
                        </p>
                      ) : (
                        <p className="text-[12px] font-semibold text-foreground">
                          Check prices
                        </p>
                      )}
                      <Link
                        href={product.href}
                        className="mt-auto pt-0.5 text-[11px] font-medium text-link hover:underline"
                      >
                        View prices
                        {product.offerCount > 0
                          ? ` (${product.offerCount})`
                          : ""}{" "}
                        →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="rounded-xl bg-[#0e2a2a] p-5 text-white">
          <h2 className="font-display text-[17px] leading-tight font-bold tracking-[0.04em] uppercase">
            FIND YOUR PERFECT
            <br />
            RUNNING SHOE
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-white/65">
            {finder.description}
          </p>

          <form
            className="mt-4 grid grid-cols-2 gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const params = new URLSearchParams();
              for (const [key, value] of fd.entries()) {
                if (typeof value === "string" && value) params.set(key, value);
              }
              const qs = params.toString();
              router.push(qs ? `${finder.ctaHref}?${qs}` : finder.ctaHref);
            }}
          >
            {finder.fields.map((field) => (
              <label key={field.name} className="block min-w-0">
                <span className="mb-1 block text-[10px] font-medium tracking-wide text-white/55 uppercase">
                  {field.label}
                </span>
                <span className="relative flex h-9 items-center rounded-md border border-white/15 bg-black/25 px-2.5 text-[12px] font-medium text-white">
                  <span className="truncate pr-5">{field.value}</span>
                  <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-white/50" />
                  <select
                    name={field.name}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    defaultValue={
                      field.options.find((o) => o.label === field.value)
                        ?.value ?? field.options[0]?.value
                    }
                    aria-label={field.label}
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            ))}
            <button
              type="submit"
              className="col-span-2 mt-0.5 inline-flex h-10 items-center justify-center rounded-[4px] bg-accent text-[11px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
            >
              {finder.ctaLabel} →
            </button>
          </form>

          <p className="mt-3.5 text-center text-[11px] text-white/55">
            Not sure yet? Start with the{" "}
            <Link
              href={finder.footnoteHref}
              className="font-medium text-[#7eb6ff] hover:underline"
            >
              {finder.footnoteLabel}
            </Link>
          </p>
        </aside>
      </div>
    </section>
  );
}

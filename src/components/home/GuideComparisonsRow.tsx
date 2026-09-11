import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { HomepageData } from "@/lib/home/types";

export function GuideComparisonsRow({
  featuredGuide,
  comparisons,
}: {
  featuredGuide?: HomepageData["featuredGuide"];
  comparisons: HomepageData["comparisons"];
}) {
  return (
    <section className="pb-12 sm:pb-14">
      <Container size="wide">
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredGuide && (
            <Link
              href={featuredGuide.href}
              className="group relative min-h-[280px] overflow-hidden rounded-lg"
            >
              <Image
                src={featuredGuide.imageSrc}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
              <div className="relative flex h-full min-h-[280px] max-w-md flex-col justify-center gap-3 p-7 sm:p-9">
                <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
                  {featuredGuide.eyebrow}
                </p>
                <h3 className="font-display text-[28px] leading-tight font-bold text-white sm:text-[32px]">
                  {featuredGuide.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-white/75">
                  {featuredGuide.description}
                </p>
                <span className="mt-2 inline-flex h-10 w-fit items-center rounded-[4px] bg-white px-4 text-[12px] font-bold tracking-[0.06em] text-foreground uppercase">
                  {featuredGuide.ctaLabel} →
                </span>
              </div>
            </Link>
          )}

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="heading-section">{comparisons.title}</h2>
              <Link href={comparisons.href} className="link-accent shrink-0">
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {comparisons.items.map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="flex items-center gap-3 py-3.5 transition-colors hover:bg-surface-muted/60 sm:gap-4"
                  >
                    <ComparisonThumb product={row.productA} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                      {row.productA.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold tracking-wide text-subtle uppercase">
                      vs
                    </span>
                    <ComparisonThumb product={row.productB} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                      {row.productB.name}
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-subtle"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ComparisonThumb({
  product,
}: {
  product: HomepageData["comparisons"]["items"][number]["productA"];
}) {
  return (
    <span className="relative flex size-11 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
      {product.image ? (
        <Image
          src={product.image.src}
          alt=""
          fill
          sizes="44px"
          className="object-contain p-1"
          loading="lazy"
        />
      ) : (
        <ProductImageFallback
          label={product.brandName}
          className="rounded-none p-1 [&_p]:hidden [&_span]:size-6 [&_span]:rounded-md [&_span]:text-[9px]"
        />
      )}
    </span>
  );
}

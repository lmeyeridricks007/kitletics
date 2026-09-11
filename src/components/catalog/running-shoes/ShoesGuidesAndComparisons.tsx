import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, Layers, Scale } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

const TOOL_ICONS = [Search, Layers, Scale];

export function ShoesGuidesAndComparisons({
  guideBlock,
  featuredComparisons,
  toolsSection,
}: {
  guideBlock?: ShoesCategoryPageData["guideBlock"];
  featuredComparisons: ShoesCategoryPageData["featuredComparisons"];
  toolsSection: ShoesCategoryPageData["toolsSection"];
}) {
  return (
    <section className="border-t border-border bg-white py-10 sm:py-11">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.43fr)_minmax(0,0.25fr)] lg:gap-7">
          {/* How to choose */}
          <div>
            {guideBlock && (
              <Link
                href={guideBlock.href}
                className="group relative block min-h-[260px] overflow-hidden rounded-lg"
              >
                <Image
                  src={guideBlock.imageSrc}
                  alt=""
                  fill
                  sizes={IMAGE_SIZES.guideCover}
                  quality={IMAGE_QUALITY.card}
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
                <div className="relative flex h-full min-h-[260px] flex-col justify-end p-5 text-white">
                  <span className="mb-2 text-[10px] font-bold tracking-[0.14em] text-white/70 uppercase">
                    How to choose
                  </span>
                  <h2 className="font-display text-[20px] leading-tight font-bold">
                    {guideBlock.title}
                  </h2>
                  <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/75">
                    {guideBlock.description}
                  </p>
                  <span className="mt-4 text-[12px] font-bold tracking-[0.04em] text-accent uppercase">
                    Read the guide →
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Featured comparisons */}
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="heading-section">{featuredComparisons.title}</h2>
              <Link
                href={featuredComparisons.href}
                className="link-accent shrink-0 text-[12px]"
              >
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {featuredComparisons.items.slice(0, 3).map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="flex items-center gap-2.5 py-3 transition-colors hover:bg-surface-muted/50"
                  >
                    <Thumb product={row.productA} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                      {row.productA.name}
                    </span>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[9px] font-bold tracking-wide text-subtle uppercase">
                      vs
                    </span>
                    <Thumb product={row.productB} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                      {row.productB.name}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h2 className="heading-section mb-4">{toolsSection.title}</h2>
            <ul className="space-y-1">
              {toolsSection.items.map((tool, i) => {
                const Icon = TOOL_ICONS[i % TOOL_ICONS.length];
                return (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      className="flex items-start gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-surface-muted/60"
                    >
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-foreground"
                        strokeWidth={1.5}
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-foreground">
                          {tool.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-muted">
                          {tool.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Thumb({
  product,
}: {
  product: { name: string; image?: { src: string; alt: string } };
}) {
  return (
    <span className="relative flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-white">
      {product.image ? (
        <Image
          src={product.image.src}
          alt=""
          fill
          sizes={IMAGE_SIZES.compareThumb}
          quality={IMAGE_QUALITY.thumb}
          loading="lazy"
          className="object-contain p-1"
        />
      ) : (
        <ProductImageFallback
          label={product.name}
          className="size-full p-0 [&_p]:hidden [&_svg]:size-4"
        />
      )}
    </span>
  );
}

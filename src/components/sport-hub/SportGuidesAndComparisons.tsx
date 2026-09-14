import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportGuidesAndComparisons({
  guides,
  comparisons,
}: {
  guides: SportHubPageData["guides"];
  comparisons: SportHubPageData["comparisons"];
}) {
  return (
    <section className="py-10 sm:py-12">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="heading-section">{guides.title}</h2>
              <Link href={guides.href} className="link-accent shrink-0">
                View all guides →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {guides.items.map((guide) => (
                <Link
                  key={guide.id}
                  href={guide.href}
                  className="group overflow-hidden rounded-lg border border-border bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                    <Image
                      src={guide.imageSrc}
                      alt={guide.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-[3px] bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-[0.06em] text-accent-foreground uppercase">
                      Guide
                    </span>
                  </div>
                  <div className="space-y-1.5 p-3.5">
                    <h3 className="font-display text-[14px] leading-snug font-bold text-foreground group-hover:text-link">
                      {guide.title}
                    </h3>
                    <p className="line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {guide.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="heading-section">{comparisons.title}</h2>
              <Link href={comparisons.href} className="link-accent shrink-0">
                View all comparisons →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {comparisons.items.map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="flex items-center gap-3 py-3.5 transition-colors hover:bg-surface-muted/50"
                  >
                    <Thumb product={row.productA} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                      {row.productA.name}
                    </span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold tracking-wide text-subtle uppercase">
                      vs
                    </span>
                    <Thumb product={row.productB} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                      {row.productB.name}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-subtle" />
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

function Thumb({
  product,
}: {
  product: SportHubPageData["comparisons"]["items"][number]["productA"];
}) {
  return (
    <span className="relative flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
      {product.image ? (
        <Image
          src={product.image.src}
          alt={product.image.alt || product.name}
          fill
          sizes="40px"
          className="object-contain p-0.5"
          loading="lazy"
        />
      ) : (
        <ProductImageFallback className="rounded-none p-1 [&_p]:hidden [&_svg]:size-5" />
      )}
    </span>
  );
}

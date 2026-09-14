import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import type { SportHubPageData } from "@/lib/sport-hub/types";

export function SportLatestReviews({
  reviews,
}: {
  reviews: NonNullable<SportHubPageData["reviews"]>;
}) {
  if (reviews.items.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface-muted/30 py-10 sm:py-12">
      <Container size="wide">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase">
              Expert research
            </p>
            <h2 className="heading-section mt-1">{reviews.title}</h2>
          </div>
          <Link href={reviews.href} className="link-accent shrink-0">
            View all reviews →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col overflow-hidden border border-border bg-white transition-colors hover:border-accent/50"
            >
              <div className="relative aspect-[4/3] bg-surface-muted">
                {item.image ? (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <ProductImageFallback className="absolute inset-0" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-3.5">
                <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">
                  Review
                </p>
                <h3 className="font-display text-[15px] leading-snug font-bold text-foreground group-hover:text-link">
                  {item.productName}
                </h3>
                <p className="line-clamp-2 text-[12px] leading-relaxed text-muted">
                  {item.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

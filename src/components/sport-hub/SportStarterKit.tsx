import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProductImageFallback } from "@/components/media/ProductImageFallback";
import { formatPrice } from "@/lib/utils";
import type { SportHubPageData } from "@/lib/sport-hub/types";
import { IMAGE_QUALITY } from "@/lib/media/image-delivery";

export function SportStarterKit({
  starterKit,
}: {
  starterKit: NonNullable<SportHubPageData["starterKit"]>;
}) {
  return (
    <section className="pb-10 sm:pb-12">
      <Container size="wide">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="heading-section">{starterKit.title}</h2>
          <Link href={starterKit.href} className="link-accent shrink-0">
            View full starter kit guide →
          </Link>
        </div>

        <div className="flex flex-col gap-5 overflow-hidden rounded-lg border border-border bg-white p-5 lg:flex-row lg:items-center lg:gap-4 lg:p-6">
          <div className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto pb-1 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {starterKit.items.map((item, i) => (
              <div key={item.productId} className="flex items-center gap-2">
                {i > 0 && (
                  <Plus
                    className="mx-1 size-4 shrink-0 text-subtle"
                    strokeWidth={1.75}
                  />
                )}
                <Link
                  href={item.href}
                  className="flex w-[110px] shrink-0 flex-col items-center text-center sm:w-[120px]"
                >
                  <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
                    {item.image ? (
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="72px"
                        quality={IMAGE_QUALITY.thumb}
                        loading="lazy"
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <ProductImageFallback className="rounded-none p-2 [&_p]:hidden" />
                    )}
                  </span>
                  <span className="mt-2 text-[12px] font-semibold text-foreground">
                    {item.label}
                  </span>
                  {item.price ? (
                    <span className="mt-0.5 text-[11px] text-muted">
                      From{" "}
                      {formatPrice(
                        item.price.amount,
                        item.price.currency,
                        "nl-NL",
                      )}
                    </span>
                  ) : (
                    <span className="mt-0.5 text-[11px] text-muted">
                      Check price
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 flex-col justify-center border-t border-border pt-4 lg:w-[200px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
            {starterKit.total ? (
              <p className="text-[13px] text-muted">
                Kit from{" "}
                <span className="font-display text-lg font-bold text-foreground">
                  {formatPrice(
                    starterKit.total.amount,
                    starterKit.total.currency,
                    "nl-NL",
                  )}
                </span>
              </p>
            ) : (
              <p className="text-[13px] text-muted">
                {starterKit.missingPriceCount > 0
                  ? "Some kit prices vary by region"
                  : "See kit guide for current prices"}
              </p>
            )}
            <Link
              href={starterKit.href}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-[11px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:opacity-90"
            >
              View kit →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

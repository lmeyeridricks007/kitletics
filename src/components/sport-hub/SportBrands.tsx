"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { SportHubPageData } from "@/lib/sport-hub/types";
import { IMAGE_QUALITY } from "@/lib/media/image-delivery";

export function SportBrands({
  brands,
}: {
  brands: SportHubPageData["brands"];
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  return (
    <section className="overflow-x-hidden pb-12">
      <Container size="wide">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="heading-section">{brands.title}</h2>
          <Link href={brands.href} className="link-accent shrink-0">
            View all brands →
          </Link>
        </div>
        <div className="relative">
          <ul
            ref={scrollerRef}
            className="flex items-center gap-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-10"
          >
            {brands.items.map((brand) => (
              <li key={brand.id} className="shrink-0">
                <Link
                  href={brand.href}
                  className="flex h-10 items-center opacity-90 transition hover:opacity-100"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={120}
                      height={28}
                      sizes="120px"
                      quality={IMAGE_QUALITY.thumb}
                      loading="lazy"
                      className="h-7 w-auto max-w-[120px] object-contain"
                    />
                  ) : (
                    <span className="font-display text-sm font-bold tracking-wide text-foreground uppercase">
                      {brand.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-label="Scroll brands"
            onClick={() =>
              scrollerRef.current?.scrollBy({ left: 200, behavior: "smooth" })
            }
            className="absolute top-1/2 -right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-sm lg:inline-flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Container>
    </section>
  );
}

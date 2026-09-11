import Link from "next/link";
import Image from "next/image";
import { Package, CalendarDays, Flag } from "lucide-react";
import type { UseCaseListingPageData } from "@/lib/use-case-listing";
import type { ListingMetadataItem } from "@/lib/use-case-listing/types";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

export function UseCaseHero({ data }: { data: UseCaseListingPageData }) {
  const { config, breadcrumbs, productCount, verifiedLabel } = data;

  return (
    <section className="border-b border-border bg-[#f3f4f5]">
      <div className="mx-auto grid w-full max-w-[90rem] items-stretch lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
        <div className="flex flex-col justify-center px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          <nav aria-label="Breadcrumb" className="text-[12px] text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, i) => (
                <li
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {i > 0 && <span aria-hidden>›</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground/80">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <span className="mt-3 inline-flex w-fit text-[11px] font-bold tracking-[0.14em] text-accent uppercase">
            {config.eyebrow}
          </span>

          <h1 className="mt-2.5 font-display text-[clamp(2rem,3.6vw,2.65rem)] leading-[1.05] font-bold tracking-tight text-foreground">
            {config.title}
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">
            {config.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
            {config.metadata.map((item: ListingMetadataItem) => {
              if (item.kind === "count") {
                return (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Package
                      className="size-3.5 text-foreground/55"
                      strokeWidth={1.75}
                    />
                    <strong className="font-semibold text-foreground">
                      {productCount}
                    </strong>{" "}
                    {item.label}
                  </span>
                );
              }
              if (item.kind === "verified") {
                if (!verifiedLabel) return null;
                return (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5"
                  >
                    <CalendarDays
                      className="size-3.5 text-foreground/55"
                      strokeWidth={1.75}
                    />
                    {item.label} {verifiedLabel}
                  </span>
                );
              }
              return (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5"
                >
                  <Flag
                    className="size-3.5 text-foreground/55"
                    strokeWidth={1.75}
                  />
                  {item.label}{" "}
                  <strong className="font-semibold text-foreground">
                    {item.value}
                  </strong>
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-[200px] sm:min-h-[240px] lg:min-h-[300px]">
          <Image
            src={config.heroImageSrc}
            alt={config.heroImageAlt}
            fill
            className="object-cover object-center"
            sizes={IMAGE_SIZES.listingHero}
            quality={IMAGE_QUALITY.hero}
            priority
          />
        </div>
      </div>
    </section>
  );
}

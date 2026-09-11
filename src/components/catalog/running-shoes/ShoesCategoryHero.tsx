import Image from "next/image";
import Link from "next/link";
import { Package, Layers, CalendarDays } from "lucide-react";
import type { ShoesCategoryPageData } from "@/lib/catalog/get-running-shoes-category-page";
import { IMAGE_QUALITY } from "@/lib/media/image-delivery";
import { cn } from "@/lib/utils";

export function ShoesCategoryHero({
  breadcrumbs,
  sportName,
  title,
  description,
  primaryCta,
  secondaryCta,
  productCount,
  subcategoryCount,
  updatedLabel,
  heroProducts,
}: {
  breadcrumbs: ShoesCategoryPageData["breadcrumbs"];
  sportName: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  productCount: number;
  subcategoryCount: number;
  updatedLabel: string;
  heroProducts: ShoesCategoryPageData["heroProducts"];
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f3f4f5]">
      {/* Subtle lime diagonal graphic */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[62%] max-w-[720px]"
      >
        <div className="absolute top-[-10%] right-[8%] h-[140%] w-[38%] rotate-[-28deg] bg-gradient-to-b from-accent/35 via-accent/12 to-transparent blur-[1px]" />
        <div className="absolute top-[5%] right-[28%] h-[120%] w-[14%] rotate-[-28deg] bg-accent/20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[90rem] items-center gap-6 px-4 py-7 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:gap-8 lg:px-8 lg:py-9">
        <div className="relative z-10 min-w-0">
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

          <p className="mt-3 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            {sportName}
          </p>
          <h1 className="mt-1.5 font-display text-[clamp(2rem,3.8vw,2.75rem)] leading-[1.05] font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted sm:text-[15px]">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href={primaryCta.href}
              className="inline-flex h-10 items-center justify-center rounded-[4px] bg-accent px-4 text-[11px] font-bold tracking-[0.06em] text-accent-foreground uppercase transition-colors hover:bg-accent-hover"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-border-strong bg-white px-4 text-[11px] font-bold tracking-[0.06em] text-foreground uppercase transition-colors hover:border-foreground/40"
            >
              {secondaryCta.label}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5 text-foreground/55" strokeWidth={1.75} />
              <strong className="font-semibold text-foreground">
                {productCount}
              </strong>{" "}
              Current shoes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-3.5 text-foreground/55" strokeWidth={1.75} />
              <strong className="font-semibold text-foreground">
                {subcategoryCount}
              </strong>{" "}
              Shoe types
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="size-3.5 text-foreground/55"
                strokeWidth={1.75}
              />
              Updated {updatedLabel}
            </span>
          </div>
        </div>

        <div
          className="relative mx-auto flex h-[220px] w-full max-w-[560px] items-center justify-center overflow-hidden sm:h-[260px] lg:mx-0 lg:h-[300px] lg:max-w-none"
          aria-label="Featured running shoes"
        >
          {heroProducts.length === 0 ? (
            <Image
              src="/images/home/guide-running-shoes.jpg"
              alt="Running shoes"
              fill
              sizes="(max-width: 1024px) 90vw, 560px"
              quality={IMAGE_QUALITY.hero}
              priority
              className="object-contain object-center"
            />
          ) : (
            <>
              {heroProducts[1] && (
                <HeroShoe
                  product={heroProducts[1]}
                  className="absolute top-[8%] left-[2%] z-[1] w-[42%] -rotate-[18deg] sm:left-[4%]"
                />
              )}
              {heroProducts[2] && (
                <HeroShoe
                  product={heroProducts[2]}
                  className="absolute right-[0%] bottom-[4%] z-[2] w-[44%] rotate-[12deg] sm:right-[2%]"
                />
              )}
              {heroProducts[0] && (
                <HeroShoe
                  product={heroProducts[0]}
                  priority
                  className="absolute top-[12%] left-[28%] z-[3] w-[48%] rotate-[-6deg] sm:left-[30%]"
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroShoe({
  product,
  className,
  priority = false,
}: {
  product: { src: string; alt: string; href: string };
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href={product.href} className={cn("block", className)}>
      <span className="relative block aspect-square w-full">
        <Image
          src={product.src}
          alt={product.alt}
          fill
          sizes="(max-width: 1024px) 40vw, 280px"
          quality={IMAGE_QUALITY.card}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-contain drop-shadow-[0_18px_28px_rgba(11,15,19,0.18)] transition-transform duration-500 hover:scale-[1.03]"
        />
      </span>
    </Link>
  );
}

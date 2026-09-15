import Image from "next/image";
import Link from "next/link";
import { Package, Layers, CalendarDays } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { IMAGE_QUALITY } from "@/lib/media/image-delivery";
import { cn } from "@/lib/utils";

export type CategoryHeroProduct = {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  brandName?: string;
};

/**
 * Running-shoes-style category hero for shared CategoryPage surfaces.
 * Uses a dedicated editorial image when provided, otherwise a product collage
 * from listable catalog heroes — never empty placeholders.
 */
export function CategoryVisualHero({
  breadcrumbs,
  sportName,
  title,
  description,
  primaryCta,
  secondaryCta,
  productCount,
  typeCount,
  typeNoun = "types",
  updatedLabel,
  heroImageSrc,
  heroImageAlt,
  heroProducts,
}: {
  breadcrumbs: { label: string; href?: string }[];
  sportName: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  productCount: number;
  typeCount?: number;
  typeNoun?: string;
  updatedLabel: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  heroProducts: CategoryHeroProduct[];
}) {
  const collage = heroProducts.slice(0, 3);
  const showCollage = collage.length >= 2;
  const showSingle =
    !showCollage && (Boolean(heroImageSrc) || collage.length === 1);

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f3f4f5]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[62%] max-w-[720px]"
      >
        <div className="absolute top-[-10%] right-[8%] h-[140%] w-[38%] rotate-[-28deg] bg-gradient-to-b from-accent/35 via-accent/12 to-transparent blur-[1px]" />
        <div className="absolute top-[5%] right-[28%] h-[120%] w-[14%] rotate-[-28deg] bg-accent/20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[90rem] items-center gap-6 px-4 py-7 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:gap-8 lg:px-8 lg:py-9">
        <div className="relative z-10 min-w-0">
          <Breadcrumbs items={breadcrumbs} className="text-[12px]" />

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
            <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="outline">
              {secondaryCta.label}
            </ButtonLink>
          </div>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
            <li className="inline-flex items-center gap-1.5">
              <Package className="size-3.5 text-subtle" aria-hidden />
              <span>
                <strong className="font-medium text-foreground">
                  {productCount}
                </strong>{" "}
                products
              </span>
            </li>
            {typeof typeCount === "number" && typeCount > 0 ? (
              <li className="inline-flex items-center gap-1.5">
                <Layers className="size-3.5 text-subtle" aria-hidden />
                <span>
                  <strong className="font-medium text-foreground">
                    {typeCount}
                  </strong>{" "}
                  {typeNoun}
                </span>
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-subtle" aria-hidden />
              <span>Updated {updatedLabel}</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]">
          {showCollage ? (
            <div className="grid h-full grid-cols-2 gap-2 sm:gap-3">
              <Link
                href={collage[0]!.href}
                className="relative col-span-1 row-span-2 overflow-hidden rounded-[4px] bg-white shadow-sm ring-1 ring-border/60"
              >
                <Image
                  src={collage[0]!.imageSrc}
                  alt={collage[0]!.imageAlt}
                  fill
                  className="object-contain p-3 sm:p-4"
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  quality={IMAGE_QUALITY.hero}
                  priority
                />
              </Link>
              {collage.slice(1).map((p, i) => (
                <Link
                  key={p.id}
                  href={p.href}
                  className={cn(
                    "relative overflow-hidden rounded-[4px] bg-white shadow-sm ring-1 ring-border/60",
                    i === 0 ? "min-h-[110px]" : "min-h-[110px]",
                  )}
                >
                  <Image
                    src={p.imageSrc}
                    alt={p.imageAlt}
                    fill
                    className="object-contain p-2.5 sm:p-3"
                    sizes="(max-width: 1024px) 40vw, 20vw"
                    quality={IMAGE_QUALITY.card}
                    priority={i === 0}
                  />
                </Link>
              ))}
            </div>
          ) : showSingle ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-white shadow-sm ring-1 ring-border/60 sm:aspect-[16/11]">
              <Image
                src={
                  heroImageSrc ??
                  collage[0]?.imageSrc ??
                  "/images/padel/hero.jpg"
                }
                alt={
                  heroImageAlt ??
                  collage[0]?.imageAlt ??
                  title
                }
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={IMAGE_QUALITY.hero}
                priority
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

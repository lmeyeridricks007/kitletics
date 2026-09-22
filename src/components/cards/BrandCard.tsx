import Link from "next/link";
import { cn } from "@/lib/utils";
import { brandAccentCss, brandAccentHex } from "@/lib/brands/brand-colors";

interface BrandCardProps {
  brand: { name: string; slug: string; logo?: string; country?: string; description?: string };
  href?: string;
  productCount?: number;
  className?: string;
}

export function BrandCard({
  brand,
  href,
  productCount,
  className,
}: BrandCardProps) {
  const link = href ?? `/brands/${brand.slug}`;
  const accent = brandAccentHex(brand.slug);
  const well = brandAccentCss(brand.slug, 0.14) ?? "#f4f5f7";
  const bar = accent ? `#${accent}` : undefined;

  return (
    <Link
      href={link}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent hover:shadow-md",
        className,
      )}
    >
      {bar && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: bar }}
        />
      )}
      <div
        className="flex h-28 items-center justify-center px-6 pt-1"
        style={{ background: well }}
      >
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- compact brand mark; native img avoids layout boxing
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="max-h-12 w-auto max-w-[160px] object-contain"
          />
        ) : (
          <span
            className="font-display text-lg font-semibold tracking-tight"
            style={{ color: bar ?? undefined }}
          >
            {brand.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent">
            {brand.name}
          </h3>
          {brand.country && (
            <span className="shrink-0 text-xs text-subtle">{brand.country}</span>
          )}
        </div>
        {brand.description && (
          <p className="line-clamp-2 text-sm text-muted">{brand.description}</p>
        )}
        {productCount !== undefined && (
          <p className="mt-auto pt-2 text-[12px] font-medium text-subtle tabular-nums">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </Link>
  );
}

import { brandAccentCss, brandAccentHex } from "@/lib/brands/brand-colors";
import { cn } from "@/lib/utils";

type BrandMarkBrand = {
  name: string;
  slug: string;
  logo?: string;
};

function monogram(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\s-]/g, " ").trim();
  const parts = cleaned.split(/[\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || "?";
}

export function BrandMark({
  brand,
  size = "md",
  className,
}: {
  brand: BrandMarkBrand;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const accent = brandAccentHex(brand.slug);
  const well = brandAccentCss(brand.slug, 0.12) ?? "#f4f5f7";
  const box =
    size === "lg" ? "size-14" : size === "sm" ? "size-10" : "size-12";
  // Constrain intrinsic logo dimensions — h-auto/w-auto can blow out flex rows
  const img =
    size === "lg"
      ? "max-h-10 max-w-10"
      : size === "sm"
        ? "max-h-7 max-w-7"
        : "max-h-9 max-w-9";
  const initials =
    size === "lg" ? "text-sm" : size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg p-1.5",
        box,
        className,
      )}
      style={{ background: well }}
    >
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small brand logo; next/image overkill for monogram well
        <img
          src={brand.logo}
          alt=""
          className={cn("size-full object-contain", img)}
        />
      ) : (
        <span
          className={cn("font-bold tracking-wide uppercase", initials)}
          style={{ color: accent ? `#${accent}` : undefined }}
        >
          {monogram(brand.name)}
        </span>
      )}
    </span>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Footprints,
  Watch,
  Shirt,
  Droplets,
  HeartPulse,
  Headphones,
  Sun,
  Sparkles,
  Backpack,
  Lightbulb,
  Shield,
  Apple,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "@/domain/sports/types";
import { Badge } from "@/components/ui/Badge";
import { getCategoryHref } from "@/lib/navigation/category-href";

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  Watch,
  Shirt,
  Droplets,
  HeartPulse,
  Headphones,
  Sun,
  Sparkles,
  Backpack,
  Lightbulb,
  Shield,
  Apple,
};

interface CategoryCardProps {
  category: ProductCategory;
  href?: string;
  productCount?: number;
  sportLabel?: string;
  featured?: boolean;
  comingSoon?: boolean;
  className?: string;
}

export function CategoryCard({
  category,
  href,
  productCount,
  sportLabel,
  featured,
  comingSoon = false,
  className,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? Sparkles;
  const link = href ?? getCategoryHref(category);

  const content = (
    <div
      className={cn(
        "group flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-all",
        !comingSoon && "hover:border-accent hover:shadow-md",
        comingSoon && "opacity-80",
        featured && "ring-1 ring-accent/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-accent-muted text-accent">
          <Icon className="size-5" aria-hidden />
        </div>
        {comingSoon && <Badge variant="muted">Coming soon</Badge>}
      </div>
      <div className="space-y-1.5">
        {sportLabel && (
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">
            {sportLabel}
          </p>
        )}
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground uppercase group-hover:text-accent">
          {category.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{category.description}</p>
      </div>
      {!comingSoon && productCount !== undefined && productCount > 0 && (
        <span className="link-cta mt-auto text-sm">
          {productCount} product{productCount === 1 ? "" : "s"} →
        </span>
      )}
      {!comingSoon && (productCount === undefined || productCount === 0) && (
        <span className="link-cta mt-auto text-sm">Explore →</span>
      )}
    </div>
  );

  if (comingSoon) return content;
  return <Link href={link}>{content}</Link>;
}

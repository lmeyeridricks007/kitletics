"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import { Button } from "@/components/ui/Button";
import { buildCompareHref } from "@/lib/comparison/selection";
import { useRouter } from "next/navigation";

interface AddToCompareButtonProps {
  product: {
    slug: string;
    name: string;
    brandName?: string;
    categoryId: string;
    categorySlug: string;
  };
  source?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Navigate to compare after add when 2+ selected */
  goWhenReady?: boolean;
  /** Compact PDP label matching mockup ("Compare") */
  labelStyle?: "default" | "compact";
}

export function AddToCompareButton({
  product,
  source = "product",
  variant = "outline",
  size = "md",
  className,
  goWhenReady = false,
  labelStyle = "default",
}: AddToCompareButtonProps) {
  const tray = useCompareTray();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const selected = tray.isSelected(product.slug);

  function onClick() {
    if (selected) {
      tray.removeProduct(product.slug, source);
      setMessage("Removed from compare");
      return;
    }

    const result = tray.addProduct(
      {
        slug: product.slug,
        name: product.name,
        brandName: product.brandName,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
      },
      { source },
    );

    if (!result.ok && result.reason === "category-conflict") {
      const ok = window.confirm(result.message);
      if (!ok) return;
      tray.addProduct(
        {
          slug: product.slug,
          name: product.name,
          brandName: product.brandName,
          categoryId: product.categoryId,
          categorySlug: product.categorySlug,
        },
        { source, forceCategoryReset: true },
      );
      setMessage("Started a new comparison");
      return;
    }

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("Added to compare");
    if (goWhenReady) {
      const nextCount = selected ? tray.count - 1 : tray.count + 1;
      if (nextCount >= 2) {
        router.push(
          buildCompareHref({
            categorySlug: product.categorySlug,
            productSlugs: [
              ...tray.productSlugs.filter((s) => s !== product.slug),
              product.slug,
            ],
          }),
        );
      }
    }
  }

  const idleLabel =
    labelStyle === "compact" ? "Compare" : "Add to Compare";
  const activeLabel =
    labelStyle === "compact" ? "In compare" : "Remove from compare";

  return (
    <div className={className}>
      <Button type="button" variant={variant} size={size} onClick={onClick}>
        {labelStyle === "compact" && (
          <ArrowLeftRight className="mr-1.5 size-3.5" aria-hidden />
        )}
        {selected ? activeLabel : idleLabel}
      </Button>
      {message && (
        <p className="mt-1 text-xs text-muted" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

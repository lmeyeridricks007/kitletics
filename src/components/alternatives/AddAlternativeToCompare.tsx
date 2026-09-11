"use client";

import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import { buildCompareHref } from "@/lib/comparison/selection";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AddAlternativeToCompareProps {
  source: {
    slug: string;
    name: string;
    brandName?: string;
    categoryId: string;
    categorySlug: string;
  };
  alternative: {
    slug: string;
    name: string;
    brandName?: string;
    categoryId: string;
    categorySlug: string;
  };
  className?: string;
  /** Navigate to compare builder after adding the pair */
  goToCompare?: boolean;
}

/** Adds source + alternative to Compare tray (same category). */
export function AddAlternativeToCompare({
  source,
  alternative,
  className,
  goToCompare = true,
}: AddAlternativeToCompareProps) {
  const tray = useCompareTray();
  const router = useRouter();

  function onClick() {
    tray.setFromSlugs({
      categoryId: source.categoryId,
      categorySlug: source.categorySlug,
      items: [
        {
          slug: source.slug,
          name: source.name,
          brandName: source.brandName,
          categoryId: source.categoryId,
          categorySlug: source.categorySlug,
        },
        {
          slug: alternative.slug,
          name: alternative.name,
          brandName: alternative.brandName,
          categoryId: alternative.categoryId,
          categorySlug: alternative.categorySlug,
        },
      ],
    });

    if (goToCompare) {
      router.push(
        buildCompareHref({
          categorySlug: source.categorySlug,
          productSlugs: [source.slug, alternative.slug],
        }),
      );
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[12px] font-medium text-link hover:underline",
        className,
      )}
    >
      + Add to compare
    </button>
  );
}

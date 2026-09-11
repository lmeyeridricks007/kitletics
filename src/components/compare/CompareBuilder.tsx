"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface CompareBuilderProps {
  categories: { slug: string; name: string }[];
  products: { slug: string; name: string; categorySlug: string }[];
  selectedCategorySlug?: string;
  /** Preselected product slugs from ?products= */
  initialProductSlugs?: string[];
}

export function CompareBuilder({
  categories,
  products,
  selectedCategorySlug,
  initialProductSlugs = [],
}: CompareBuilderProps) {
  const router = useRouter();
  const [category, setCategory] = useState(
    selectedCategorySlug ?? categories[0]?.slug ?? "",
  );
  const [productA, setProductA] = useState(initialProductSlugs[0] ?? "");
  const [productB, setProductB] = useState(initialProductSlugs[1] ?? "");
  const [productC, setProductC] = useState(initialProductSlugs[2] ?? "");
  const [productD, setProductD] = useState(initialProductSlugs[3] ?? "");

  const filtered = useMemo(
    () => products.filter((p) => p.categorySlug === category || !category),
    [products, category],
  );

  function onCategoryChange(slug: string) {
    setCategory(slug);
    setProductA("");
    setProductB("");
    setProductC("");
    setProductD("");
    router.push(`/compare?category=${encodeURIComponent(slug)}`);
  }

  function onCompare() {
    const selected = [productA, productB, productC, productD].filter(Boolean);
    if (selected.length < 2) return;
    const unique = [...new Set(selected)];
    if (unique.length < 2) return;
    router.push(
      `/compare?category=${encodeURIComponent(category)}&products=${unique.join(",")}`,
    );
  }

  const selects = [
    { label: "Product 1", value: productA, set: setProductA },
    { label: "Product 2", value: productB, set: setProductB },
    { label: "Product 3 (optional)", value: productC, set: setProductC },
    { label: "Product 4 (optional)", value: productD, set: setProductD },
  ];

  const selectedCount = [productA, productB, productC, productD].filter(
    Boolean,
  ).length;

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-surface p-6">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium tracking-wide text-subtle uppercase">
          Category
        </span>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {selects.map((row) => (
        <label key={row.label} className="block space-y-1.5">
          <span className="text-xs font-medium tracking-wide text-subtle uppercase">
            {row.label}
          </span>
          <select
            value={row.value}
            onChange={(e) => row.set(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">Select…</option>
            {filtered.map((p) => (
              <option
                key={p.slug}
                value={p.slug}
                disabled={
                  [productA, productB, productC, productD].includes(p.slug) &&
                  p.slug !== row.value
                }
              >
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ))}

      <Button
        type="button"
        onClick={onCompare}
        disabled={selectedCount < 2}
        className="w-full"
      >
        Compare {selectedCount >= 2 ? selectedCount : ""} products
      </Button>
      <p className="text-xs text-subtle">
        Same-category products only. Curated pairs open the editorial comparison;
        other pairs use structured data (noindex).
      </p>
    </div>
  );
}

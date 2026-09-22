"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResultsPage } from "@/components/search/SearchResultsPage";
import type { SearchPageData } from "@/lib/search/get-search-page-data";
import { useRegionPreference } from "@/components/region/RegionPreferenceProvider";

function parseFeatures(feature: string | null): string[] {
  if (!feature) return [];
  return feature
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const { region } = useRegionPreference();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const minPrice = searchParams.get("minPrice") ?? undefined;
  const maxPrice = searchParams.get("maxPrice") ?? undefined;
  const feature = searchParams.get("feature");
  const [data, setData] = useState<SearchPageData | null>(null);

  useEffect(() => {
    const query = q.trim();
    const params = new URLSearchParams();
    if (query.length >= 2) params.set("q", query);
    if (type) params.set("type", type);
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    for (const f of parseFeatures(feature)) params.append("feature", f);
    params.set("region", region);

    const controller = new AbortController();
    void fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("search_failed");
        return (await res.json()) as SearchPageData;
      })
      .then((payload) => {
        setData(payload);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
    return () => controller.abort();
  }, [q, type, brand, minPrice, maxPrice, feature, region]);

  if (!data) {
    return (
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Search Kitletics
        </h1>
        <p className="mt-2 text-sm text-muted">Loading search…</p>
      </div>
    );
  }

  return <SearchResultsPage data={data} />;
}

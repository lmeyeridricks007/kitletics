"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { TrustRow } from "@/components/home/TrustRow";
import { AlternativesHero } from "@/components/alternatives/AlternativesHero";
import { AlternativeReasonNav } from "@/components/alternatives/AlternativeReasonNav";
import { AlternativeRecommendationList } from "@/components/alternatives/AlternativeRecommendationList";
import { AlternativesComparisonTable } from "@/components/alternatives/AlternativesComparisonTable";
import { AlternativesFinderCTA } from "@/components/alternatives/AlternativesFinderCTA";
import type { AlternativesPageData } from "@/lib/product/get-alternatives-page-data";

interface ProductAlternativesPageProps {
  data: AlternativesPageData;
}

export function ProductAlternativesPage({ data }: ProductAlternativesPageProps) {
  const [activeReasonId, setActiveReasonId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("relevance");

  const filtered = useMemo(() => {
    let list = data.alternatives;
    if (activeReasonId) {
      list = list.filter((a) => a.reasonId === activeReasonId);
    }
    const sorted = [...list];
    if (sortBy === "score") {
      sorted.sort(
        (a, b) => (b.score ?? -1) - (a.score ?? -1),
      );
    } else if (sortBy === "price") {
      sorted.sort((a, b) => {
        const pa = a.price?.price ?? Number.POSITIVE_INFINITY;
        const pb = b.price?.price ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    } else {
      sorted.sort((a, b) => b.relevance - a.relevance);
    }
    return sorted;
  }, [data.alternatives, activeReasonId, sortBy]);

  function selectReason(reasonId: string | null) {
    setActiveReasonId(reasonId);
    if (reasonId) {
      document
        .getElementById("alternatives-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      <AlternativesHero data={data} />

      <Container className="space-y-12 py-10 pb-16 sm:space-y-14 sm:py-12">
        <AlternativeReasonNav
          groups={data.reasonGroups}
          activeReasonId={activeReasonId}
          onSelect={selectReason}
        />

        <AlternativeRecommendationList
          data={data}
          items={filtered}
          reasonGroups={data.reasonGroups}
          activeReasonId={activeReasonId}
          onReasonChange={selectReason}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
          <AlternativesComparisonTable data={data} />
          <AlternativesFinderCTA data={data} />
        </div>
      </Container>

      <TrustRow />
    </>
  );
}

"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GuidesHubPage } from "@/components/guides-hub/GuidesHubPage";
import type { GuidesIndexShellData } from "@/lib/guides/guides-index-shared";

export function GuidesIndexClient({ data }: { data: GuidesIndexShellData }) {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain");
  const sportSlug = searchParams.get("sport");
  const topic = searchParams.get("topic");

  const hub = useMemo(() => {
    if (domain === "shoes") return data.shoes;
    if (sportSlug && data.bySport[sportSlug]) return data.bySport[sportSlug];
    return data.all;
  }, [data, domain, sportSlug]);

  const filtered = useMemo(() => {
    if (!topic || !hub.topics.some((t) => t.topic.slug === topic)) return hub;
    return {
      ...hub,
      topics: hub.topics.filter((t) => t.topic.slug === topic),
    };
  }, [hub, topic]);

  return <GuidesHubPage data={filtered} />;
}

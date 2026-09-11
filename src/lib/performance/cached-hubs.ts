import { unstable_cache } from "next/cache";
import { getGuidesHubData } from "@/lib/guides/get-guides-hub-data";
import { getBrandsHubData } from "@/lib/brands/get-brands-hub-data";
import { getHomepageData } from "@/lib/home";

export const getCachedHomepageData = unstable_cache(
  async () => getHomepageData({ region: "NL" }),
  ["homepage-nl"],
  { revalidate: 3600 },
);

export function getCachedGuidesHubData(input: {
  sportSlug?: string;
  domain?: "shoes";
}) {
  const key = JSON.stringify({
    sportSlug: input.sportSlug ?? "",
    domain: input.domain ?? "",
  });
  return unstable_cache(
    async () => getGuidesHubData(input),
    ["guides-hub", key],
    { revalidate: 3600 },
  )();
}

export function getCachedBrandsHubData(input: {
  sportSlug?: string;
  query?: string;
  domain?: "shoes";
}) {
  const key = JSON.stringify({
    sportSlug: input.sportSlug ?? "",
    query: input.query ?? "",
    domain: input.domain ?? "",
  });
  return unstable_cache(
    async () => getBrandsHubData(input),
    ["brands-hub", key],
    { revalidate: 3600 },
  )();
}

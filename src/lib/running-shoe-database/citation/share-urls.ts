import { siteConfig } from "@/content/config";
import { RUNNING_SHOE_DATASET_META } from "@/lib/running-shoe-database/citation/dataset-meta";

export function runningShoeDatabaseShareUrls(pageUrl: string): {
  copyUrl: string;
  linkedIn: string;
  x: string;
  reddit: string;
} {
  const encoded = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(
    "Kitletics Running Shoe Database — structured specs for journalists and researchers",
  );
  return {
    copyUrl: pageUrl,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    reddit: `https://www.reddit.com/submit?url=${encoded}&title=${text}`,
  };
}

export function runningShoeDatabaseCanonicalShareUrl(
  search = "",
): string {
  const path = RUNNING_SHOE_DATASET_META.path;
  const qs = search.startsWith("?")
    ? search
    : search
      ? `?${search}`
      : "";
  return `${siteConfig.url}${path}${qs}`;
}

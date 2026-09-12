"use server";

import type { FinderResponses } from "@/domain/finders/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getFinderResultsData } from "@/lib/finder/get-finder-results-data";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getScoreBand } from "@/lib/product/score";
import { toSituationLabel } from "@/lib/decision-copy";

export interface FinderPreviewMatch {
  productId: string;
  slug: string;
  name: string;
  brandName?: string;
  score?: number;
  scoreLabel?: string;
  matchScore: number;
  roleLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  href: string;
}

export interface FinderPreviewPayload {
  matchQuality: number;
  matchQualityLabel: string;
  analysedCount: number;
  eligibleCount: number;
  matches: FinderPreviewMatch[];
  ready: boolean;
  message?: string;
}

function countAnsweredRequired(
  responses: FinderResponses,
  requiredKeys: string[],
): number {
  let n = 0;
  for (const key of requiredKeys) {
    const v = responses[key];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    n += 1;
  }
  return n;
}

export async function previewFinderMatches(input: {
  finderSlug: string;
  responses: FinderResponses;
  region?: RegionCode;
  requiredKeys: string[];
  previewMinAnswered: number;
}): Promise<FinderPreviewPayload> {
  const region = input.region ?? DEFAULT_REGION;
  const answered = countAnsweredRequired(
    input.responses,
    input.requiredKeys,
  );
  const completeness =
    input.requiredKeys.length > 0
      ? answered / input.requiredKeys.length
      : 0;

  if (answered < input.previewMinAnswered) {
    return {
      matchQuality: Math.round(completeness * 55),
      matchQualityLabel: "Match quality",
      analysedCount: 0,
      eligibleCount: 0,
      matches: [],
      ready: false,
      message: "Answer a few more questions to preview your matches.",
    };
  }

  const data = getFinderResultsData({
    finderSlug: input.finderSlug,
    responses: input.responses,
    region,
    options: { isDev: false },
  });

  if (!data || data.rows.length === 0) {
    return {
      matchQuality: Math.round(completeness * 65),
      matchQualityLabel: "Match quality",
      analysedCount: data?.run.analysedCount ?? 0,
      eligibleCount: data?.run.eligibleCount ?? 0,
      matches: [],
      ready: false,
      message:
        data?.run.eligibleCount === 0
          ? "No strong matches yet with these answers. Try adjusting preferences."
          : "Answer a few more questions to preview your matches.",
    };
  }

  const top = data.rows.slice(0, 3);
  const avgMatch =
    top.reduce((s, r) => s + r.evaluation.matchScore, 0) / top.length;
  const matchQuality = Math.round(
    Math.min(98, completeness * 35 + (avgMatch / 100) * 65),
  );

  return {
    matchQuality,
    matchQualityLabel: "Match quality",
    analysedCount: data.run.analysedCount,
    eligibleCount: data.run.eligibleCount,
    ready: true,
    matches: top.map((row) => {
      const media = getPrimaryProductMedia(row.product);
      const score = row.product.recommendationScore;
      return {
        productId: row.product.id,
        slug: row.product.slug,
        name: row.product.fullName,
        brandName: row.brand?.name,
        score,
        scoreLabel:
          typeof score === "number" ? getScoreBand(score).label : undefined,
        matchScore: row.evaluation.matchScore,
        roleLabel: row.evaluation.strengths[0]
          ? toSituationLabel(
              row.evaluation.strengths[0],
              "buy",
              row.product.name,
            )
          : row.rankLabel,
        imageSrc: media?.src,
        imageAlt: media?.alt,
        href: `/products/${row.product.slug}`,
      };
    }),
  };
}

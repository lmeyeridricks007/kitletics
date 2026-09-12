import { siteConfig } from "@/content/config";
import { RUNNING_SHOE_DATASET_META } from "@/lib/running-shoe-database/citation/dataset-meta";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import type { RegionCode } from "@/domain/shared/types";

export interface RunningShoeDatasetAboutModel {
  title: string;
  shoeCount: number;
  brandCount: number;
  brandNames: string[];
  region: RegionCode;
  /** Shown only when meta.updatedOn is set intentionally */
  datasetUpdatedOn: string | null;
  version: string;
  canonicalUrl: string;
  citationText: string;
  researchCsvHref: string;
  contact: {
    email: string;
    dataQuestionsHref: string;
    correctionsHref: string;
    pressHref: string;
  };
  sections: Array<{
    id: string;
    heading: string;
    body: string;
  }>;
}

function mailto(subject: string, body?: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body) params.set("body", body);
  return `mailto:hello@kitletics.com?${params.toString()}`;
}

/**
 * Editorial “About the dataset” payload — numbers from live eligible cohort.
 */
export function buildRunningShoeDatasetAbout(
  records: RunningShoeDatabaseRecord[],
  region: RegionCode,
): RunningShoeDatasetAboutModel {
  const brands = new Map<string, string>();
  for (const r of records) brands.set(r.brandSlug, r.brandName);
  const brandNames = [...brands.values()].sort((a, b) =>
    a.localeCompare(b),
  );
  const shoeCount = records.length;
  const brandCount = brandNames.length;
  const canonicalUrl = `${siteConfig.url}${RUNNING_SHOE_DATASET_META.path}`;
  const version = RUNNING_SHOE_DATASET_META.version;
  const datasetUpdatedOn = RUNNING_SHOE_DATASET_META.updatedOn;

  const citationText = datasetUpdatedOn
    ? `Kitletics Running Shoe Database (version ${version}, updated ${datasetUpdatedOn}), Kitletics, ${canonicalUrl}`
    : `Kitletics Running Shoe Database (version ${version}), Kitletics, ${canonicalUrl}`;

  return {
    title: "About the Kitletics Running Shoe Dataset",
    shoeCount,
    brandCount,
    brandNames,
    region,
    datasetUpdatedOn,
    version,
    canonicalUrl,
    citationText,
    researchCsvHref: RUNNING_SHOE_DATASET_META.researchCsvPath,
    contact: {
      email: "hello@kitletics.com",
      dataQuestionsHref: mailto(
        "Running Shoe Database — data question",
        "Page: https://kitletics.com/running/shoes/database\n\nQuestion:\n",
      ),
      correctionsHref: mailto(
        "Running Shoe Database — product data correction",
        "Product URL:\nWhat looks wrong:\nSuggested correction (if known):\nSource (optional):\n",
      ),
      pressHref: mailto(
        "Running Shoe Database — press / research enquiry",
        "Organisation:\nPublication / project:\nDeadline (if any):\nEnquiry:\n",
      ),
    },
    sections: [
      {
        id: "included",
        heading: "What is included",
        body: `This dataset is the public Running Shoe Database view of Kitletics’ running-shoe catalog: ${shoeCount} current product models across ${brandCount} brands. It powers the explorer and charts on this page and is derived from the same product records used on product pages, reviews and finders — not a parallel spreadsheet.`,
      },
      {
        id: "eligibility",
        heading: "Eligibility criteria",
        body: "A shoe appears only when it is published, launch-listable under Kitletics’ Running publication policy, and has authentic product media. Draft, held, blocked and media-gated products are excluded. Counts above use that eligible cohort.",
      },
      {
        id: "specs",
        heading: "How specifications are sourced",
        body: "Weight, stack, drop, plate status, cushioning, terrain and related fields come from the product’s stored specifications (manufacturer / verified catalog research). Values are shown only when present on that product record.",
      },
      {
        id: "missing",
        heading: "Missing-data handling",
        body: "Missing specs and prices are left blank. They are never treated as zero and never inferred from peers, previous generations or marketing copy. Charts and averages publish sample size and coverage so gaps stay visible.",
      },
      {
        id: "variants",
        heading: "Product vs variant treatment",
        body: "The unit of analysis is one Kitletics product model. Men’s and women’s ProductVariant rows are not counted as separate models, so market averages are not double-counted across gender cuts unless a calculator explicitly says otherwise.",
      },
      {
        id: "updates",
        heading: "Update process",
        body: "The page recalculates from the live eligible catalog when content changes. Citation version labels are bumped only when we intentionally refresh the public dataset stamp — not on every deploy. Historical year-trend claims are withheld until release-year coverage meets published thresholds.",
      },
      {
        id: "prices",
        heading: "Regional price handling",
        body: `Prices shown in the explorer are the lowest verified offer in the site default region (${region}), when a displayable offer exists. That is not launch/MSRP — Kitletics does not currently store a canonical launch-price field for most shoes.`,
      },
      {
        id: "independence",
        heading: "Recommendation independence",
        body: "Recommended sort and Kitletics scores use editorial recommendation logic. Affiliate commission and retailer payout never determine ranking or inclusion.",
      },
      {
        id: "affiliate",
        heading: "Affiliate disclosure",
        body: "Some retailer links elsewhere on Kitletics may be affiliate links. Commission does not change which shoes appear in this database or how they are sorted.",
      },
    ],
  };
}

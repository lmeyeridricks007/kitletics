import { siteConfig } from "@/content/config";
import { PADEL_RACKET_DATASET_META } from "@/lib/padel-racket-database/citation/dataset-meta";
import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";
import type { RegionCode } from "@/domain/shared/types";

export interface PadelRacketDatasetAboutModel {
  title: string;
  racketCount: number;
  brandCount: number;
  brandNames: string[];
  region: RegionCode;
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

export function buildPadelRacketDatasetAbout(
  records: PadelRacketDatabaseRecord[],
  region: RegionCode,
): PadelRacketDatasetAboutModel {
  const brands = new Map<string, string>();
  for (const r of records) brands.set(r.brandSlug, r.brandName);
  const brandNames = [...brands.values()].sort((a, b) => a.localeCompare(b));
  const racketCount = records.length;
  const brandCount = brandNames.length;
  const canonicalUrl = `${siteConfig.url}${PADEL_RACKET_DATASET_META.path}`;
  const version = PADEL_RACKET_DATASET_META.version;
  const datasetUpdatedOn = PADEL_RACKET_DATASET_META.updatedOn;

  const citationText = datasetUpdatedOn
    ? `Kitletics Padel Racket Database (version ${version}, updated ${datasetUpdatedOn}), Kitletics, ${canonicalUrl}`
    : `Kitletics Padel Racket Database (version ${version}), Kitletics, ${canonicalUrl}`;

  return {
    title: "About the Kitletics Padel Racket Dataset",
    racketCount,
    brandCount,
    brandNames,
    region,
    datasetUpdatedOn,
    version,
    canonicalUrl,
    citationText,
    researchCsvHref: PADEL_RACKET_DATASET_META.researchCsvPath,
    contact: {
      email: "hello@kitletics.com",
      dataQuestionsHref: mailto(
        "Padel Racket Database — data question",
        "Page: https://kitletics.com/padel/rackets/database\n\nQuestion:\n",
      ),
      correctionsHref: mailto(
        "Padel Racket Database — product data correction",
        "Product URL:\nWhat looks wrong:\nSuggested correction (if known):\nSource (optional):\n",
      ),
      pressHref: mailto(
        "Padel Racket Database — press / research enquiry",
        "Organisation:\nPublication / project:\nDeadline (if any):\nEnquiry:\n",
      ),
    },
    sections: [
      {
        id: "included",
        heading: "What is included",
        body: `This dataset is the public Padel Racket Database view of Kitletics’ padel-racket catalog: ${racketCount} current product models across ${brandCount} brands. It is derived from the same product records used elsewhere on Kitletics — not a parallel spreadsheet.`,
      },
      {
        id: "eligibility",
        heading: "Eligibility criteria",
        body: "A racket appears when it is in category cat-padel-rackets, tagged sport-padel, published, not discontinued, and has authentic product media (canFeatureProduct). Soft-gated empty categories (accessories/clothing) are excluded until ready — this cohort is catalog-eligible with authentic media.",
      },
      {
        id: "specs",
        heading: "How specifications are sourced",
        body: "Shape, balance, minimum/maximum weight, core, face material and related fields come from stored product specifications (manufacturer / verified catalog research). Decision scores (power, control, comfort, maneuverability) come from editorial decision attributes with provenance — not laboratory measurements.",
      },
      {
        id: "missing",
        heading: "Missing-data handling",
        body: "Missing specs and prices are left blank. They are never treated as zero and never inferred from peers. Weight midpoints are never invented from minimum/maximum ranges — published minimum weight is used for filters and sorts; ranges are shown when a maximum exists.",
      },
      {
        id: "updates",
        heading: "Update process",
        body: "The page recalculates from the live eligible catalog when content changes. We only show a dataset refresh date after an intentional public update — routine deploys do not invent a freshness stamp. If no refresh date is shown, treat coverage as current to the live catalog without a separate dated release.",
      },
      {
        id: "prices",
        heading: "Regional price handling",
        body: `Prices shown are the lowest verified offer in the site default region (${region}), when a displayable offer exists. That is not launch/MSRP.`,
      },
      {
        id: "independence",
        heading: "Recommendation independence",
        body: "Recommended sort and Kitletics scores use editorial recommendation logic. Affiliate commission and retailer payout never determine ranking or inclusion.",
      },
      {
        id: "affiliate",
        heading: "Affiliate disclosure",
        body: "Some retailer links elsewhere on Kitletics may be affiliate links. Commission does not change which rackets appear in this database or how they are sorted.",
      },
      {
        id: "coverage",
        heading: "Dataset coverage",
        body: "Statistics describe only this eligible Kitletics cohort. They are not industry-wide market-share claims for the global padel racket market.",
      },
    ],
  };
}

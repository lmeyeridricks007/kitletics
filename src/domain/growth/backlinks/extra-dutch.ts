import type { BacklinkOpportunity, BacklinkProspect } from "./types";

const NOW = "2026-09-13T08:00:00.000Z";

export function extraDutchProspects(): BacklinkProspect[] {
  return [
    {
      id: "prospect-hardlopen-nl",
      name: "Hardlopen.nl",
      domain: "hardlopen.nl",
      homepageUrl: "https://www.hardlopen.nl/",
      category: "RUNNING_MEDIA",
      country: "NL",
      language: "nl",
      market: "NL",
      whyRelevant:
        "Atletiekunie running platform with Dutch gear explainers (drop, pronation, shoe types).",
      contactStatus: "CONFIRMED",
      contactRole: "editor",
      contactEmail: "info@hardlopen.nl",
      contactUrl: "https://www.hardlopen.nl/contact/",
      contactSource: "https://www.hardlopen.nl/contact/",
      notes: "Official contact: samenwerking / vragen → info@hardlopen.nl.",
    },
  ];
}

function dutchOpp(
  partial: Pick<
    BacklinkOpportunity,
    | "id"
    | "url"
    | "topic"
    | "opportunityType"
    | "targetAssetId"
    | "targetUrl"
    | "whyTheyMightLink"
    | "whyThisSite"
    | "whyThisAsset"
    | "pitchAngle"
    | "evidence"
    | "overallScore"
    | "campaignId"
  >,
): BacklinkOpportunity {
  return {
    prospectId: "prospect-hardlopen-nl",
    siteName: "Hardlopen.nl",
    domain: "hardlopen.nl",
    contactRole: "editor",
    country: "NL",
    language: "nl",
    market: "NL",
    sport: "running",
    authorityScore: 70,
    relevanceScore: 90,
    likelihoodScore: 62,
    assetFitScore: 88,
    relationshipScore: 18,
    editorialQualityScore: 80,
    scoreReasons: ["Dutch Atletiekunie platform", "Specific education URL"],
    recommendedAnchorContext: "lookup van actuele stack/drop/gewicht",
    whyThisAngle: partial.pitchAngle,
    risk: "SAFE",
    riskReasons: [],
    sourceType: "seed",
    discoveredAt: NOW,
    status: "CANDIDATE",
    priority: "HIGH",
    outreachStatus: "not_contacted",
    responseStatus: "none",
    metricSource: "editorial_judgment",
    ...partial,
  };
}

export function extraDutchOpportunities(): BacklinkOpportunity[] {
  return [
    dutchOpp({
      id: "opp-hardlopen-jargon",
      url: "https://www.hardlopen.nl/artikelen/training/hardloopjargon/",
      topic: "Hardloopjargon — drop uitgelegd",
      opportunityType: "DATA_CITATION",
      targetAssetId: "asset-shoe-database",
      targetUrl: "/running/shoes/database",
      whyTheyMightLink:
        "Het jargon-stuk legt drop al uit, maar wijst niet naar een actuele modellookup.",
      whyThisSite: "Hardlopen.nl is the Atletiekunie consumer running desk in Dutch.",
      whyThisAsset: "De schoendatabase maakt de millimetervoorbeelden checkbaar per huidig model.",
      pitchAngle: "Catalogus als lookup onder de drop-definitie.",
      evidence: "Live jargon page defines drop vs stack in Dutch.",
      overallScore: 84,
      campaignId: "campaign-database",
    }),
    dutchOpp({
      id: "opp-hardlopen-schoenen",
      url: "https://www.hardlopen.nl/artikelen/gear/hardloopschoenen/",
      topic: "Hardloopschoenen kiezen",
      opportunityType: "RESOURCE_PAGE",
      targetAssetId: "asset-shoe-finder",
      targetUrl: "/tools/running-shoe-finder",
      whyTheyMightLink:
        "Het gear-stuk stuurt naar speciaalzaken; een NL-bruikbare finder is de online vervolgstap.",
      whyThisSite: "Same Hardlopen.nl gear section as the jargon piece — one desk, this URL as the choose-shoes hook.",
      whyThisAsset: "Finder + database instead of another Top-10.",
      pitchAngle: "Finder onder het kopje over schoentypes / heel drop.",
      evidence: "Gear guide discusses heel drop, cushioning and trail vs road.",
      overallScore: 82,
      campaignId: "campaign-finder",
    }),
  ];
}

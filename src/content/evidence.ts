import type { Evidence } from "@/domain/recommendations/types";
import { SEED_DATES } from "@/content/config";
import { fitnessEvidence } from "@/content/fitness";
import { hyroxCompetitionEvidence } from "@/content/hyrox/competition";
import { wave25Evidence } from "@/content/padel";
import { racketEvidence } from "@/content/racket";

export const evidence: Evidence[] = [
  {
    id: "ev-nb5-mfr",
    type: "manufacturer",
    source: "ASICS product specifications",
    sourceUrl: "https://www.asics.com",
    summary: "Stack, drop and foam naming taken from manufacturer materials.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-nb5-editorial",
    type: "editorial-research",
    source: "Kitletics editorial synthesis",
    summary:
      "Strengths/weaknesses synthesised from public independent reviews and category norms. Not a personal wear-test.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-nb5-independent",
    type: "independent-review",
    source: "Independent running-shoe press synthesis",
    summary:
      "Cross-checked published lab and reviewer notes on ride softness, rocker and daily-trainer placement.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-nb5-user",
    type: "user-feedback",
    source: "Retailer and community sizing feedback",
    summary:
      "Aggregated public sizing and width feedback — not Kitletics personal wear-testing.",
    verifiedAt: SEED_DATES.verified,
    confidence: "low",
  },
  {
    id: "ev-nimbus-mfr",
    type: "manufacturer",
    source: "ASICS GEL-NIMBUS 27 product specifications",
    sourceUrl: "https://www.asics.com/nz/en-nz/gel-nimbus-27-mens-1011b958-403",
    summary:
      "Men’s stack 43.5/35.5 mm, drop 8 mm, max cushion, neutral; FF BLAST PLUS ECO + PureGEL; engineered jacquard mesh; HYBRID ASICSGRIP outsole — ASICS materials. Weight ~305 g men’s US 9 from independent lab-typical listings aligned with manufacturer class.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-nimbus-editorial",
    type: "editorial-research",
    source: "Kitletics editorial synthesis",
    summary:
      "Ride character, energy return, flexibility and surface/weather suitability synthesised from manufacturer tech notes plus reputable independent coverage (e.g. Doctors of Running). Not a personal wear-test. Pace and runner-weight ranges omitted — ASICS does not publish them.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-speed-editorial",
    type: "editorial-research",
    source: "Kitletics editorial synthesis",
    summary: "Plated tempo positioning from manufacturer and category research.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-boston-editorial",
    type: "editorial-research",
    source: "Kitletics editorial synthesis",
    summary:
      "Running + HYROX dual-use noted from athlete use patterns and category overlap — not a personal test claim.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-boston-mfr",
    type: "manufacturer",
    source: "adidas Adizero Boston 12 specifications",
    sourceUrl: "https://www.adidas.com",
    summary: "Plate, stack and intended use from manufacturer materials.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-fr965-mfr",
    type: "manufacturer",
    source: "Garmin Forerunner 965 specifications",
    sourceUrl: "https://www.garmin.com",
    summary: "Feature flags sourced from manufacturer spec sheet.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-hrm-mfr",
    type: "manufacturer",
    source: "Garmin HRM-Pro Plus specifications",
    sourceUrl: "https://www.garmin.com",
    summary: "Connectivity and dynamics features from manufacturer docs.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-catalog-mfr",
    type: "manufacturer",
    source: "Official product specifications",
    summary:
      "Used to verify identity, published measurements, materials and official features. Field-level gaps remain null rather than invented.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-catalog-editorial",
    type: "editorial-research",
    source: "Independent expert reviews & Kitletics editorial analysis",
    summary:
      "Category placement, strengths/compromises and recommendation contexts synthesised from manufacturer specs plus reputable independent coverage. Not personal wear-testing.",
    verifiedAt: SEED_DATES.verified,
    confidence: "medium",
  },
  {
    id: "ev-novablast-6-mfr",
    type: "manufacturer",
    source: "ASICS NOVABLAST 6 product specifications",
    sourceUrl: "https://www.asics.com",
    summary:
      "Weight ~253 g (men’s reference), stack 41.5/33.5 mm, drop 8 mm, FF BLAST MAX + FF TURBO SQUARED, ASICSGRIP forefoot — manufacturer materials; release July 2026.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  {
    id: "ev-fr970-mfr",
    type: "manufacturer",
    source: "Garmin Forerunner 970 / 570 press release and specs",
    sourceUrl: "https://www.garmin.com",
    summary:
      "AMOLED Forerunner 970/570 announced May 2025; smartwatch battery claims up to 15/11 days and GPS mode figures from Garmin materials.",
    verifiedAt: SEED_DATES.verified,
    confidence: "high",
  },
  ...fitnessEvidence,
  ...hyroxCompetitionEvidence,
  ...wave25Evidence,
  ...racketEvidence,
];

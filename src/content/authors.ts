import type { Author } from "@/domain/editorial/types";

/**
 * Editorial authors / reviewers.
 * Bios stay factual — no exaggerated expertise claims.
 * Do not invent named experts; desk attribution is transparent.
 */
export const authors: Author[] = [
  {
    id: "author-kitletics-editorial",
    name: "Kitletics Editorial",
    slug: "kitletics-editorial",
    title: "Editorial desk",
    bio: "Kitletics Editorial is the byline for Kitletics product guidance. We assess gear using manufacturer specifications, retailer offer data, independent public sources, and structured recommendation models. We do not invent a team of celebrity testers. Personal wear-testing is labelled First-Hand only when personal-test evidence exists — and Kitletics currently publishes none.",
    sportIds: ["sport-running", "sport-hyrox", "sport-training"],
    expertise: [
      "Running shoes & gear",
      "GPS watches & HRMs",
      "Training equipment",
      "Structured product comparison",
      "Expert Research Reviews",
    ],
    disclosure:
      "Attribution is an editorial desk, not a named individual expert. Recommendations are independent of affiliate relationships. Product scores follow documented methodology. Review type defaults to Expert Research unless first-hand evidence is present.",
  },
];

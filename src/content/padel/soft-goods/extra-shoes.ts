import type { SoftDraft } from "@/content/padel/soft-goods/build";

/** Bullpadel Vertex-W — authentic packshot recovered from the mis-assigned Varlion Bourne shoe file. */
export function extraShoeDrafts(): SoftDraft[] {
  return [
    {
      id: "prod-bullpadel-vertex-w",
      slug: "bullpadel-vertex-w",
      brandId: "brand-bullpadel",
      name: "Vertex-W",
      fullName: "Bullpadel Vertex-W",
      categoryId: "cat-padel-shoes",
      sourceUrl: "https://www.bullpadel.com",
      sourceName: "Bullpadel Vertex-W (packshot recovered from mis-assigned Varlion file)",
      shortDescription:
        "Women’s Bullpadel Vertex-W padel shoe with Vibram outsole visible on the packshot. Padel-specific — not a running shoe and not a Varlion Bourne.",
      verdict:
        "I’d shortlist Vertex-W for a women’s Bullpadel last with a Vibram court plate. Don’t confuse it with Vertex rackets.",
      experienceLevels: ["intermediate", "advanced"],
      specifications: {
        genderFit: "women",
        cushioning: "moderate",
        support: "stability",
        outsole: "Vibram padel",
        surfaceCompatibility: "padel-specific",
        courtOutsole: "herringbone",
        tractionPattern: "Vibram",
        lateralStability: "high",
        courtFeel: "moderate",
        durability: "high",
        upper: "knit mesh",
      },
      strengths: ["Vibram court plate", "Women’s Vertex last", "Authentic unique packshot"],
      weaknesses: ["Brand homepage is not a model-specific product page"],
      relatedProductIds: ["prod-bullpadel-ionic-woman", "prod-joma-slam-lady"],
      alternativeProductIds: ["prod-adidas-courtquick-w", "prod-babolat-sensa-women"],
    },
  ];
}

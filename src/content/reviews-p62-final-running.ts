import type { Review, ContentSection, ScoreBreakdownItem } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const ev = ["ev-catalog-mfr", "ev-catalog-editorial"] as const;

const testingContext =
  "We put this guide together from published manufacturer specs and similar products in the same job. We have not personally tested this product unless the page says we did. Scores are meant to help you decide — affiliate links do not change the verdict.";

const disclosure =
  "No brand-supplied product or sponsored testing applied to this review unless stated. Affiliate availability does not affect scores or verdict.";

function sec(id: string, heading: string, body: string): ContentSection {
  return { id, heading, body, evidenceIds: [...ev] };
}

function scores(items: ScoreBreakdownItem[]): ScoreBreakdownItem[] {
  return items.map((s) => ({ max: 100, ...s }));
}

/**
 * Fix 62 — genuine Expert Research overlays for the last five Running products.
 * Wins over P53 uniqueness-token reviews and unique-rewrite scaffolds (see reviews.ts).
 */
export const reviewsP62FinalRunning: Review[] = [
  {
    id: "review-buff-coolnet-uv",
    slug: "buff-coolnet-uv",
    productId: "prod-buff-coolnet-uv",
    title: "BUFF CoolNet UV+ Review",
    subtitle:
      "The hot-weather Buff — UPF 50 CoolNet fabric, not a winter tube.",
    reviewType: "expert-research",
    bottomLine:
      "I'd shortlist CoolNet UV+ when most of your miles are hot, bright road or trail and you want a ~37 g tube with a manufacturer UPF 50 fabric rating. I'd pause if the week is cold — Lightweight Merino or Polar own that job.",
    verdict:
      "I'd shortlist CoolNet UV+ for hot, bright sessions when you want the lightest Buff in this family and a published UPF 50 fabric rating (AS/NZS 4399). That is a fabric rating, not a medical sun-protection claim, and coverage still depends on how you wear the tube. Skip it for winter insulation — Original is the versatile default, merino is the cool-weather fibre, Polar is the fleece.",
    score: 82,
    summary:
      "Hot-weather Buff tube for sweat, dust and sun. I'd shortlist it when UPF 50 CoolNet fabric and pack weight matter more than warmth. I'd pause if you need Polar or merino for cold starts.",
    reviewerId: "author-kitletics-editorial",
    testingContext,
    editorialDisclosure: disclosure,
    sections: [
      sec(
        "sec-overview",
        "What it is",
        "CoolNet UV+ is Buff’s hot-weather multifunctional tube: recycled polyester/elastane CoolNet fabric, about 37 g, roughly 53 × 22.5 cm, sold as unisex one-size stretch tubular.\n\nIts job is sweat, dust and sun on bright road and trail — not a beanie, not Polar fleece. I'd rotate it when Original EcoStretch is already in the kit but summer glare and pack weight are the weekly filter. I'd keep merino and Polar for cool and cold weeks instead of asking CoolNet to insulate.",
      ),
      sec(
        "sec-verified-specs",
        "Key specs",
        "Manufacturer-backed fields we treat as filters:\n• Material: 95% recycled polyester / 5% elastane (CoolNet)\n• Weight: ~37 g\n• Fit: fitted stretch tubular, unisex one-size (~53 × 22.5 cm)\n• Weather: hot, mild · Season: spring, summer\n• Breathability: high · Packability: packable\n• Wind: none · Water resistance: none\n• UPF: 50 (AS/NZS 4399) on CoolNet UV+ fabric\n• Care: machine wash 40°C; do not tumble dry\n\nUPF 50 here is a fabric rating. How much skin you cover still depends on whether you wear it as a neck gaiter, face cover or headband.",
      ),
      sec(
        "sec-fit",
        "Fit & ways to wear",
        "This is a stretch tubular, not a sized hat. Fitted means it hugs neck or head without a visor brim — useful as neck gaiter, face cover, wrist wipe or thin headband.\n\nUnisex one-size is the Buff default. If you want a structured cap with a brim, Ciele-class run caps are a different product. If you need winter face coverage with fleece, Polar’s longer ~76 cm tube is the family step-up.",
      ),
      sec(
        "sec-performance",
        "Running use",
        "On hot road longs and exposed trail, the brief is moisture management and a light always-pack layer. High breathability and ~37 g are why it beats merino once the climb is warm.\n\nIt will not replace a shell in wind, and it will not replace Polar when the start is below freezing. I'd use it as the summer tube and keep Original if you only want one Buff for mixed seasons.",
      ),
      sec(
        "sec-tech",
        "Materials & UV rating",
        "CoolNet is the recycled polyester/elastane knit Buff names for this SKU. The published UPF 50 rating (AS/NZS 4399) is why this tube exists versus Original EcoStretch, which is the versatile microfiber without that UPF 50 claim in our catalog.\n\nWe do not claim CoolNet prevents sunburn or skin damage. Wear sunscreen as you already would; treat the rating as a fabric filter for bright days.",
      ),
      sec(
        "sec-durability",
        "Care & durability",
        "Machine wash at 40°C and skip the tumble dryer — same synthetic care story as Original, easier than merino hand-wash.\n\nWe have not logged a wear diary. Expect a thin summer knit to pill or bag if it lives in a grit-filled vest pocket; replace when the stretch is gone, not when the print still looks new.",
      ),
      sec(
        "sec-strengths",
        "Where it is strongest",
        "I'd buy CoolNet UV+ when these outcomes match most weeks:\n• Lightest Buff in this family for hot miles\n• Manufacturer UPF 50 fabric rating on CoolNet UV+\n• Packs into a pocket and still covers neck, face or head\n\nThe standout is summer pack weight plus a rated fabric. If your week is cool or cold, those strengths do not apply.",
      ),
      sec(
        "sec-tradeoffs",
        "Trade-offs",
        "No warmth story for winter. Polar and Lightweight Merino exist because CoolNet is a heat tool.\n\nUPF 50 coverage depends on wear style — a wrist wrap does not cover your neck. Skip CoolNet if you wanted a brimmed cap, a fleece tube, or a medical sun claim we will not make.",
      ),
      sec(
        "sec-usecase",
        "Who it's for",
        "Best for runners who train in heat and want a rated CoolNet tube they can stow in a pocket, plus trail runners who use it against dust without adding Polar bulk.\n\nNot ideal if most of your week is below-freezing commuting, if you refuse merino hand-wash but still need cool-weather fibre (Original stays the synthetic default), or if you expected a structured cap.",
      ),
      sec(
        "sec-value",
        "Value",
        "You are paying for a specialist summer Buff, not a do-everything EcoStretch. That is good value when heat is weekly. If you only buy one tube, Original is usually the clearer default and CoolNet is the heat add-on.\n\nCheck live offers rather than assuming list price. Polar is the wrong comparison if you never run in the cold.",
      ),
    ],
    pros: [
      "Lightest Buff in this family (~37 g) for hot miles",
      "Manufacturer UPF 50 fabric rating on CoolNet UV+",
      "Packs into a pocket and still covers neck, face or head",
    ],
    cons: [
      "No warmth story for winter or freezing starts",
      "UPF 50 is a fabric rating — coverage depends on how you wear it",
    ],
    whoShouldBuy: [
      "You run most weeks in heat or bright sun and want a ~37 g Buff with a published UPF 50 fabric rating rather than Original’s year-round EcoStretch",
      "You already own or considered Polar or merino and need a separate summer tube so those stay in the cold-weather drawer",
      "You want neck, face or head coverage that packs smaller than a jacket hood on hot road and trail days",
    ],
    whoShouldAvoid: [
      "Your week is cold or freezing — Lightweight Merino or Polar will do the job CoolNet was never built for",
      "You need a brimmed run cap or a medical-grade sun claim; this is a stretch tube with a fabric UPF rating",
      "You only want one Buff for all seasons — Original EcoStretch is the versatile default in this family",
    ],
    scoreBreakdown: scores([
      { key: "breathability", label: "Breathability", score: 90 },
      { key: "packability", label: "Packability", score: 92 },
      { key: "warmth", label: "Warmth", score: 52, note: "Hot-weather brief" },
      { key: "value", label: "Value", score: 86 },
    ]),
    evidenceIds: [...ev],
    alternativeProductIds: ["prod-buff-original", "prod-buff-merino-lightweight"],
    comparisonIds: [],
    faqIds: [],
    seoTitle: "BUFF CoolNet UV+ Review: UPF 50 Tube, Who It's For | Kitletics",
    seoDescription:
      "BUFF CoolNet UV+ review — hot-weather tubular neckwear with UPF 50 fabric rating versus Original, merino and Polar. Fabric rating, not a medical claim.",
    ...pub,
  },
  {
    id: "review-buff-merino-lightweight",
    slug: "buff-merino-lightweight",
    productId: "prod-buff-merino-lightweight",
    title: "BUFF Lightweight Merino Review",
    subtitle:
      "Cool-weather merino Buff — odor control without Polar fleece.",
    reviewType: "expert-research",
    bottomLine:
      "I'd shortlist Lightweight Merino when cool mornings and odor resistance matter more than Polar’s fleece, and CoolNet would feel chilly. I'd pause on hot climbs and if you want 40°C machine-wash synthetics.",
    verdict:
      "I'd shortlist Lightweight Merino for cool and shoulder-season running when you want 100% merino (125 g/m², ~48 g tube, ~57 cm) instead of CoolNet’s heat fabric or Polar’s PrimaLoft lining. Skip it when the session is hot, or when Original EcoStretch’s machine-wash synthetic is the only care you'll actually do.",
    score: 80,
    summary:
      "Merino Buff tube for cool starts. I'd shortlist it when odor and mid-cold warmth beat CoolNet. I'd pause if Polar’s fleece is what winter actually requires.",
    reviewerId: "author-kitletics-editorial",
    testingContext,
    editorialDisclosure: disclosure,
    sections: [
      sec(
        "sec-overview",
        "What it is",
        "Lightweight Merino is the natural-fibre Buff in this family: 100% merino, 125 g/m², about 48 g, slightly longer than Original at ~57 cm, unisex fitted tubular.\n\nIts job is cool mornings, autumn/spring trail and odor control on multi-day kits. It is not CoolNet (heat + UPF 50 fabric rating) and it is not Polar (fleece for freezing wind). I'd shortlist it when you want wool’s odor story without carrying Polar’s extra length and lining.",
      ),
      sec(
        "sec-verified-specs",
        "Key specs",
        "• Material: 100% merino wool (125 g/m² Lightweight Merino)\n• Weight: ~48 g\n• Fit: fitted stretch tubular, unisex one-size (~57 cm)\n• Weather: mild, cold · Season: autumn, winter, spring\n• Breathability: moderate · Packability: packable\n• Wind: none · Water resistance: none\n• Care: hand wash; do not tumble dry\n\nNo UPF 50 claim on this SKU in our catalog. Do not treat merino as CoolNet’s sun-rated fabric.",
      ),
      sec(
        "sec-fit",
        "Fit & ways to wear",
        "Same Buff multi-wear idea as Original — neck, face, headband — in a slightly longer tube. Fitted stretch, not a sized beanie.\n\nMerino next to the face can feel warmer than EcoStretch at the same configuration. If you overheat with wool on tempo, drop to Original or CoolNet rather than stretching Polar over a hard session.",
      ),
      sec(
        "sec-performance",
        "Running use",
        "I'd use merino for cool easy miles, shoulder-season trail and travel weeks where you rewear a tube. Odor resistance is the fibre’s catalog story versus polyester CoolNet/Original.\n\nOn a hot climb with the tube over your mouth, it will feel like the wrong Buff. Polar still wins when the forecast is wind plus freezing and you want fleece lining.",
      ),
      sec(
        "sec-tech",
        "Fibre & care",
        "125 g/m² merino is Buff’s lightweight wool knit, not a heavy expedition weight. That is why it sits between CoolNet and Polar on warmth.\n\nHand wash, no tumble dry. If you will not hand-wash, Original EcoStretch (40°C machine wash) is the honest synthetic alternative — not a lesser merino.",
      ),
      sec(
        "sec-durability",
        "Care & durability",
        "Wool pills and needs gentler care than CoolNet. We have not wear-logged this SKU. Treat holes at the hem and lost elasticity as replacement signals.\n\nIf care friction is the reason you skip merino, that is a real skip — Original exists for that buyer.",
      ),
      sec(
        "sec-strengths",
        "Where it is strongest",
        "• Merino odor resistance on multi-day cool-weather trips\n• Warmer than CoolNet without Polar’s fleece bulk\n• Same multi-wear tube as Original\n\nBest when cool weather is the default, not an occasional morning.",
      ),
      sec(
        "sec-tradeoffs",
        "Trade-offs",
        "Too warm as a face cover on hot climbs. CoolNet is the heat tool.\n\nHand-wash care. Polar is warmer, longer, and still machine-wash 40°C in Buff’s published care for that SKU — different job, not a merino upgrade.",
      ),
      sec(
        "sec-usecase",
        "Who it's for",
        "Best for cool-weather road and trail runners who want wool odor control and already know CoolNet would be chilly.\n\nNot ideal if Polar’s fleece is what your winter commute actually needs, if summer is your season, or if merino care is a deal-breaker.",
      ),
      sec(
        "sec-value",
        "Value",
        "Merino usually costs more than Original EcoStretch. That premium is for fibre and odor, not for Polar-level warmth.\n\nI'd pay it for cool multi-day use. I'd buy Original if you want one cheap always-pack synthetic, and Polar if winter wind is the weekly problem.",
      ),
    ],
    pros: [
      "Merino odor resistance on multi-day cool-weather trips",
      "Warmer than CoolNet without Polar’s fleece bulk",
      "Same multi-wear tube (neck, face, headband) as Original",
    ],
    cons: [
      "Too warm as a face cover on hot climbs",
      "Hand-wash care vs 40°C machine-wash synthetics",
    ],
    whoShouldBuy: [
      "You run cool mornings and shoulder-season trail and want merino odor resistance without Polar’s fleece lining and extra length",
      "You already know CoolNet UV+ is too thin for your typical start temperature",
      "You will actually hand-wash wool rather than destroy it in a hot dryer",
    ],
    whoShouldAvoid: [
      "Your sessions run hot — CoolNet UV+ or Original EcoStretch will feel better over the face",
      "Winter wind and freezing starts are the weekly problem — Polar is the warmer Buff in this family",
      "You want 40°C machine-wash care only — Original EcoStretch is the synthetic default",
    ],
    scoreBreakdown: scores([
      { key: "warmth", label: "Warmth", score: 78, note: "Mid-cold, not Polar" },
      { key: "odor", label: "Odor resistance", score: 88 },
      { key: "care", label: "Care ease", score: 62 },
      { key: "value", label: "Value", score: 78 },
    ]),
    evidenceIds: [...ev],
    alternativeProductIds: [
      "prod-buff-polar",
      "prod-buff-coolnet-uv",
      "prod-buff-original",
    ],
    comparisonIds: [],
    faqIds: [],
    seoTitle: "BUFF Lightweight Merino Review: Cool Weather Tube | Kitletics",
    seoDescription:
      "BUFF Lightweight Merino Wool review — cool-weather merino neckwear versus CoolNet UV+, Original EcoStretch and Polar.",
    ...pub,
  },
  {
    id: "review-buff-original",
    slug: "buff-original",
    productId: "prod-buff-original",
    title: "BUFF Original EcoStretch Review",
    subtitle:
      "The default Buff — year-round EcoStretch, not CoolNet or Polar.",
    reviewType: "expert-research",
    bottomLine:
      "I'd shortlist Original EcoStretch when you want one always-pack tube for mixed weather. I'd pause if winter insulation or a UPF 50 fabric rating is the weekly job — those are Polar and CoolNet.",
    verdict:
      "I'd shortlist Original EcoStretch as the versatile ~40 g recycled-polyester/elastane tube for sweat, dust and cool starts. Choose CoolNet UV+ when heat and a published UPF 50 fabric rating are the point; Lightweight Merino for cool-weather wool; Polar when fleece and a longer tube are required. Original is the one-Buff default, not the specialist at either temperature extreme.",
    score: 79,
    summary:
      "Year-round EcoStretch Buff. I'd shortlist it as the always-pack default. I'd pause if you need Polar warmth or CoolNet’s UPF 50 rating every week.",
    reviewerId: "author-kitletics-editorial",
    testingContext,
    editorialDisclosure: disclosure,
    sections: [
      sec(
        "sec-overview",
        "What it is",
        "Original EcoStretch is Buff’s baseline multifunctional tube: 95% recycled polyester / 5% elastane, about 40 g, ~53 cm, unisex fitted stretch.\n\nIt is the family default — more versatile than CoolNet’s summer brief, less insulating than Polar, less odor-focused than merino. I'd shortlist it when you will actually wear one Buff across mixed weeks rather than owning the specialist SKUs.",
      ),
      sec(
        "sec-verified-specs",
        "Key specs",
        "• Material: 95% recycled polyester / 5% elastane (Original EcoStretch)\n• Weight: ~40 g\n• Fit: fitted stretch tubular, unisex one-size (~53 cm)\n• Weather: hot, mild, cold · Season: all-season\n• Breathability: high · Packability: packable\n• Wind: none · Water resistance: none\n• Care: machine wash 40°C; do not tumble dry\n\nNo UPF 50 field in our catalog for Original. Do not copy CoolNet’s sun rating onto this SKU.",
      ),
      sec(
        "sec-fit",
        "Fit & ways to wear",
        "Classic Buff configurations: neck gaiter, face cover, headband, wrist. Fitted one-size stretch, not a brimmed cap.\n\nSlightly heavier than CoolNet (~40 g vs ~37 g) and much shorter than Polar (~53 cm vs ~76 cm). If you need more face coverage in wind, Polar’s extra length is the point of that SKU.",
      ),
      sec(
        "sec-performance",
        "Running use",
        "I'd use Original for mixed road and trail: sweaty summer easy days, dusty trail, cool starts that are not Polar-cold.\n\nIt will feel thin in a freeze and it will not carry CoolNet’s UPF 50 claim on bright high-altitude days. That is why the other three Buffs exist.",
      ),
      sec(
        "sec-tech",
        "EcoStretch vs the family",
        "EcoStretch is the recycled polyester/elastane knit for Original. CoolNet uses a similar fibre mix with a different fabric program and a published UPF 50 rating. Polar adds PrimaLoft Bio fleece and length. Merino is a different fibre entirely.\n\nPick by season and care, not by which listing looks most like a hat.",
      ),
      sec(
        "sec-durability",
        "Care & durability",
        "Machine wash 40°C, no tumble — easier than merino. Thin tubes wear at hems and lose snap; we have not logged mileage.\n\nIf you destroy accessories in the dryer, this still fails — care is the same constraint as CoolNet.",
      ),
      sec(
        "sec-strengths",
        "Where it is strongest",
        "• Most versatile Buff tube if you want one always-pack layer\n• Machine-wash EcoStretch vs merino hand-wash\n• Same multi-wear configurations without Polar bulk\n\nBest as the default, not as a fake Polar.",
      ),
      sec(
        "sec-tradeoffs",
        "Trade-offs",
        "Not as warm as Polar on freezing starts. No manufacturer UPF 50 rating like CoolNet UV+.\n\nIf those two jobs dominate your week, Original is the wrong Buff even though it is the famous name.",
      ),
      sec(
        "sec-usecase",
        "Who it's for",
        "Best for runners who want one inexpensive, washable tube for mixed weather and already know they will not buy Polar and CoolNet.\n\nNot ideal if summer sun rating is the purchase reason, if merino odor is the point, or if winter commute wind needs fleece.",
      ),
      sec(
        "sec-value",
        "Value",
        "Original is usually the value play in this family. I'd buy it first. Add CoolNet or Polar only when the specialist job shows up most weeks, not because the name Buff implies one SKU covers everything.",
      ),
    ],
    pros: [
      "Most versatile Buff tube if you want one always-pack layer",
      "Machine-wash EcoStretch vs merino hand-wash",
      "Same multi-wear configurations without Polar bulk",
    ],
    cons: [
      "Not as warm as Polar on freezing starts",
      "No manufacturer UPF 50 rating like CoolNet UV+",
    ],
    whoShouldBuy: [
      "You want one Buff for mixed road and trail weather and will actually pack Original more often than a specialist CoolNet or Polar",
      "You prefer 40°C machine-wash synthetics over merino hand-wash",
      "You need neck, face or head coverage without buying Polar’s extra length and fleece",
    ],
    whoShouldAvoid: [
      "Bright, hot weeks where you specifically want CoolNet’s published UPF 50 fabric rating",
      "Freezing, windy commutes — Polar is the warmer, longer tube in this family",
      "You want merino odor control as the main reason to buy — that is Lightweight Merino",
    ],
    scoreBreakdown: scores([
      { key: "versatility", label: "Versatility", score: 88 },
      { key: "packability", label: "Packability", score: 90 },
      { key: "warmth", label: "Warmth", score: 68 },
      { key: "value", label: "Value", score: 88 },
    ]),
    evidenceIds: [...ev],
    alternativeProductIds: [
      "prod-buff-coolnet-uv",
      "prod-buff-merino-lightweight",
      "prod-buff-polar",
    ],
    comparisonIds: [],
    faqIds: [],
    seoTitle: "BUFF Original EcoStretch Review: Default Tube vs CoolNet | Kitletics",
    seoDescription:
      "BUFF Original EcoStretch review — year-round tubular neckwear versus CoolNet UV+, Lightweight Merino and Polar.",
    ...pub,
  },
  {
    id: "review-buff-polar",
    slug: "buff-polar",
    productId: "prod-buff-polar",
    title: "BUFF Polar Review",
    subtitle:
      "The winter Buff — fleece lining and extra length, not CoolNet.",
    reviewType: "expert-research",
    bottomLine:
      "I'd shortlist Polar when winter wind and freezing starts are the weekly problem. I'd pause once the day is mild or the workout is hard — that warmth becomes a sauna.",
    verdict:
      "I'd shortlist Polar for cold road and trail when CoolNet and Lightweight Merino are not enough: Original EcoStretch plus PrimaLoft Bio fleece, about 66 g, ~76 cm tube, wind-resistant lining. Skip it for mild or hot sessions. Original remains the year-round default; merino is the cool-weather wool step; CoolNet is summer.",
    score: 78,
    summary:
      "Fleece-backed winter Buff. I'd shortlist it for freezing, windy starts. I'd pause if merino or Original already covers your typical temperatures.",
    reviewerId: "author-kitletics-editorial",
    testingContext,
    editorialDisclosure: disclosure,
    sections: [
      sec(
        "sec-overview",
        "What it is",
        "Polar is the winter Buff: EcoStretch on the outside, PrimaLoft Bio fleece lining, about 66 g, longer ~76 cm tube so you can cover face and neck without a separate balaclava.\n\nI'd shortlist it when the problem is cold and wind, not dust on a July trail. CoolNet and Original will feel like nothing in that weather. Merino is warmer than CoolNet but still not this fleece sandwich.",
      ),
      sec(
        "sec-verified-specs",
        "Key specs",
        "• Material: Original EcoStretch + PrimaLoft Bio fleece lining\n• Weight: ~66 g\n• Fit: fitted stretch tubular, unisex one-size (~76 cm)\n• Weather: cold · Temperature: cold, frigid · Season: winter\n• Breathability: moderate · Packability: pocket-stow (bulkier)\n• Wind resistance: wind-resistant (not a windproof shell)\n• Care: machine wash 40°C; do not tumble dry\n\nWind-resistant lining is not a jacket. Pair with a shell when precip and gale are the session.",
      ),
      sec(
        "sec-fit",
        "Fit & ways to wear",
        "Longer than Original, so face + neck coverage is the Polar trick. Still a stretch tube, still unisex one-size — not a sized balaclava with eye holes.\n\nBulk is real in a vest pocket versus CoolNet. If you only need a thin neck layer under a jacket, merino or Original may pack better.",
      ),
      sec(
        "sec-performance",
        "Running use",
        "I'd use Polar for easy cold mornings, windy commutes and winter trail where you want face coverage without a separate fleece gaiter.\n\nOn tempo once you are warm, peel it to the neck or swap to Original. Polar is the wrong tube for a mild 10K.",
      ),
      sec(
        "sec-tech",
        "Fleece construction",
        "Buff builds Polar as a two-part tube: EcoStretch plus PrimaLoft Bio fleece. That is the warmth and wind-resistant story versus a single merino knit.\n\nIt is still neckwear, not a hooded shell. Reflectivity is not a verified default on every colourway in our catalog — don’t assume night-run conspicuity.",
      ),
      sec(
        "sec-durability",
        "Care & durability",
        "Machine wash 40°C, no tumble. Fleece can pill; we have not wear-logged it.\n\nHeavier than CoolNet, so it will feel more substantial in a pack — durability is still a catalog estimate, not a lab result.",
      ),
      sec(
        "sec-strengths",
        "Where it is strongest",
        "• Warmest tube in this Buff family for winter mornings\n• Fleece lining plus longer tube for face and neck coverage\n• Still a stretch tubular — not a bulky balaclava\n\nBest when cold is the default, not a rare snap.",
      ),
      sec(
        "sec-tradeoffs",
        "Trade-offs",
        "Too warm once the day is mild or the workout is hard. Bulkier in a pocket than CoolNet or Original.\n\nIf you wanted UPF 50 summer fabric, you opened the wrong Buff page.",
      ),
      sec(
        "sec-usecase",
        "Who it's for",
        "Best for winter road and trail runners who want face/neck coverage and already found merino not warm enough.\n\nNot ideal if Original already covers your climate, if you overheat easily, or if you wanted CoolNet for heat.",
      ),
      sec(
        "sec-value",
        "Value",
        "Polar usually costs more than Original because of fleece and length. I'd pay it for a real winter problem.\n\nI'd skip it as a second Buff if you only get three cold weeks a year — Original plus gloves may be the honest kit.",
      ),
    ],
    pros: [
      "Warmest tube in this Buff family for winter mornings",
      "Fleece lining plus longer tube for face and neck coverage",
      "Still a stretch tubular — not a bulky balaclava",
    ],
    cons: [
      "Too warm once the day is mild or the workout is hard",
      "Bulkier in a pocket than CoolNet or Original",
    ],
    whoShouldBuy: [
      "You run through freezing or windy mornings and want a longer fleece-backed Buff instead of stacking CoolNet or Original",
      "Lightweight Merino is in the rotation but still feels thin when the wind is the problem",
      "You want face and neck coverage without buying a separate winter balaclava",
    ],
    whoShouldAvoid: [
      "Most of your week is mild or hot — Polar will overheat you compared with Original or CoolNet UV+",
      "You only needed a packable summer tube with a UPF 50 fabric rating — that is CoolNet UV+",
      "You want the cheapest always-pack Buff for mixed seasons — Original EcoStretch is the default",
    ],
    scoreBreakdown: scores([
      { key: "warmth", label: "Warmth", score: 88 },
      { key: "wind", label: "Wind coverage", score: 82 },
      { key: "packability", label: "Packability", score: 64 },
      { key: "value", label: "Value", score: 80 },
    ]),
    evidenceIds: [...ev],
    alternativeProductIds: [
      "prod-buff-merino-lightweight",
      "prod-buff-original",
      "prod-buff-coolnet-uv",
    ],
    comparisonIds: [],
    faqIds: [],
    seoTitle: "BUFF Polar Review: Winter Fleece Tube vs Merino | Kitletics",
    seoDescription:
      "BUFF Polar review — fleece-backed winter neckwear versus Lightweight Merino and Original EcoStretch.",
    ...pub,
  },
  {
    id: "review-rebel-4",
    slug: "new-balance-fuelcell-rebel-v4",
    productId: "prod-rebel-4",
    title: "New Balance FuelCell Rebel v4 Review",
    subtitle:
      "Previous-generation FuelCell uptempo trainer — not a max-cushion daily.",
    reviewType: "expert-research",
    bottomLine:
      "I'd shortlist leftover Rebel v4 when you want a light unplated FuelCell road shoe for mixed easy-to-tempo weeks and New Balance widths. I'd pause if you need long-run protection, a plated Speed, or the current Rebel v5.",
    verdict:
      "I'd shortlist Rebel v4 as a previous-generation FuelCell uptempo trainer (~199 g men's US 9, 30/24 mm stack, 6 mm drop, no plate) for mixed easy and faster road sessions. It is not a Nimbus-class long-run shoe and it is not Endorphin Speed’s nylon plate. Skip it if Rebel v5 is the platform you actually want, or if Pegasus-class daily protection is the week.",
    score: 81,
    summary:
      "Previous-gen FuelCell uptempo trainer. I'd shortlist it for mixed road speed with widths. I'd pause for max-cushion longs, plated workouts, or if you can buy v5.",
    reviewerId: "author-kitletics-editorial",
    testingContext,
    editorialDisclosure: disclosure,
    sections: [
      sec(
        "sec-overview",
        "What it is",
        "Rebel v4 is New Balance’s previous FuelCell Rebel: an unplated, medium-cushion uptempo trainer for road tempo, strides and mixed weeks — not a max-cushion daily and not a carbon racer.\n\nGeneration 4 sits behind Rebel v5 in the same family. I'd shortlist v4 when leftover pricing and widths matter. I'd buy v5 when you want the current platform rather than a clearance last.",
      ),
      sec(
        "sec-verified-specs",
        "Key specs",
        "• Weight: ~199 g (men's US 9 reference in catalog fill)\n• Stack: 30 mm heel / 24 mm forefoot · Drop: 6 mm\n• Cushion: medium · Feel: balanced · Ride: responsive\n• Stability: neutral · Plate: none\n• Midsole: FuelCell · Upper: engineered mesh · Outsole: blown rubber\n• Terrain: road · Widths: standard, wide\n• Distances in catalog: 5k, 10k, daily · Training: easy, tempo, intervals\n• Sizing: men and women variants\n\nThese numbers describe an uptempo trainer, not a 40 mm recovery shoe. Do not read the stack as Nimbus.",
      ),
      sec(
        "sec-fit",
        "Fit & width",
        "Catalog widths include standard and wide — a real Rebel advantage versus Mach 6’s standard-only listing in our catalog.\n\nStart with your usual New Balance length and judge volume on an easy jog. This is a lower, livelier last than a max-cushion daily; if you wanted plush volume for long easy days, Pegasus 41 is the more protective peer, not a Rebel in disguise.",
      ),
      sec(
        "sec-cushioning",
        "Cushioning",
        "FuelCell here is medium, balanced — enough for mixed easy miles, not a recovery tank. 30/24 mm is protective for tempo and shorter days, thinner than Speed 4’s taller plated stack in our catalog.\n\nHeel strikers who want isolation on 90-minute easy runs often bounce off this brief. That is the documented trade-off, not a defect.",
      ),
      sec(
        "sec-ride",
        "Ride",
        "Responsive, high energy return, flexible, no plate. I'd use Rebel v4 for tempo, strides, and days you want the shoe to feel light without a nylon plate snapping you forward.\n\nI'd keep marathon-prep longs in a higher-cushion daily and race day in a plated racer. Speed 4 is the plated workout alternative; Mach 6 is the closer unplated uptempo peer.",
      ),
      sec(
        "sec-stability",
        "Stability",
        "Neutral — no guidance post. Fine if you already run happily in neutrals at this stack.\n\nA lighter, lower uptempo can feel less planted than a tall daily when you are tired. That is geometry, not a hidden stability feature. If you need GuideRails or a medial post, this aisle is wrong.",
      ),
      sec(
        "sec-upper",
        "Upper & lockdown",
        "Engineered mesh, high breathability in catalog — a training upper, not a winter boot.\n\nUse width to fix volume. Lockdown should be secure for strides without race-day snugness. If heel slip shows up on the first easy run, change size or last — don’t wait for break-in to rewrite New Balance geometry.",
      ),
      sec(
        "sec-grip",
        "Grip & outsole",
        "Blown rubber, road grip — pavement, paths, treadmill. Not trail lugs.\n\nWet paint and metal covers are the usual road-rubber caveat. If most miles are mud, buy a trail shoe.",
      ),
      sec(
        "sec-durability",
        "Durability",
        "I'd treat FuelCell as a rotate-not-daily-forever foam. Blown rubber on abrasive city routes wears at heel and forefoot pods.\n\nPrevious-generation leftovers can still be good value if the midsole is not already dead from shop display. We have not wear-logged v4.",
      ),
      sec(
        "sec-strengths",
        "Where it is strongest",
        "• Light FuelCell pop for tempo, strides and mixed road weeks\n• Official New Balance wide options alongside standard\n• Unplated so easy miles stay in play unlike Speed-class nylon plates\n\nBest when that mixed week is the point of the shoe.",
      ),
      sec(
        "sec-tradeoffs",
        "Trade-offs",
        "Less protective on long easy and marathon-prep days. Previous generation — Rebel v5 is current.\n\nNot a plated race or Speed-class workout shoe. Pegasus 41 exists if you wanted a daily instead.",
      ),
      sec(
        "sec-performance",
        "Pace & distance",
        "Catalog training types are easy, tempo, intervals; recommended distances 5k, 10k, daily. That is an uptempo mixed week, not a 32 km long-run brief.\n\nI'd pair it with a daily if volume is high. I'd look at Speed 4 when the workout needs a plate.",
      ),
      sec(
        "sec-usecase",
        "Who it's for",
        "Best for intermediate and advanced road runners who want a light FuelCell trainer with widths, and who can live with previous-gen stock.\n\nNot ideal as a first and only shoe for high-mileage easy volume, for stability needs, or if you specifically want v5’s current updates.",
      ),
      sec(
        "sec-value",
        "Value",
        "Previous-generation Rebels often undercut v5. That is the honest reason to still look at v4.\n\nI'd pay leftover pricing when the job matches. I'd pay current-gen money for v5 or Mach 6 if v4 stock is picked over. Check live offers — we do not invent street price.",
      ),
      sec(
        "sec-assessment",
        "How I'd decide",
        "I'd shortlist v4 on sale for mixed uptempo weeks with a wide option. I'd skip it for max-cushion longs (Pegasus 41), plated workouts (Endorphin Speed 4), or if the shop still has Rebel v5 in your width.\n\nBest current-gen appearance in our Best tempo guide is Rebel v5, not v4 — we are not stuffing a previous generation into that list.",
      ),
    ],
    pros: [
      "Light FuelCell pop for tempo, strides and mixed road weeks",
      "Official New Balance wide options alongside standard",
      "Unplated so easy miles stay in play unlike Speed-class nylon plates",
    ],
    cons: [
      "Less protective on long easy and marathon-prep days",
      "Previous generation — Rebel v5 is the current platform",
    ],
    whoShouldBuy: [
      "You want a light unplated FuelCell road shoe for tempo, strides and mixed easy days, and New Balance wide options matter versus Mach 6’s standard-only catalog listing",
      "You are shopping leftover Rebel v4 rather than paying current-gen Rebel v5 money for the same family job",
      "You will keep long easy miles in a more protective daily such as Pegasus 41 instead of forcing Rebel to do Nimbus work",
    ],
    whoShouldAvoid: [
      "Your week is mostly long easy or marathon-prep volume — Rebel v4 is less protective than a dedicated daily",
      "You want a nylon-plated workout shoe — Endorphin Speed 4 is the closer specialist",
      "You specifically want the current Rebel platform — that is Rebel v5, not this previous generation",
    ],
    scoreBreakdown: scores([
      { key: "ride", label: "Ride", score: 86 },
      { key: "weight", label: "Weight", score: 88 },
      { key: "fit", label: "Fit / widths", score: 84 },
      { key: "longRun", label: "Long-run protection", score: 68 },
      { key: "value", label: "Value", score: 85, note: "Previous-gen pricing" },
    ]),
    evidenceIds: [...ev],
    alternativeProductIds: [
      "prod-mach-6",
      "prod-endorphin-speed-4",
      "prod-pegasus-41",
    ],
    comparisonIds: [],
    faqIds: [],
    seoTitle: "New Balance FuelCell Rebel v4 Review: Uptempo Verdict | Kitletics",
    seoDescription:
      "New Balance FuelCell Rebel v4 review — previous-generation FuelCell uptempo trainer versus Mach 6, Endorphin Speed 4 and Rebel v5.",
    ...pub,
  },
];

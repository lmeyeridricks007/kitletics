/**
 * Pre-launch enrichment for Running Shoes that were NEEDS_MINOR_WORK / THIN.
 * Evidence-backed editorial fields only — unknown specs stay null via PRODUCT_SPEC_FILL.
 * Does not touch already LAUNCH_READY flagships unless listed here.
 */

import type { Product } from "@/domain/products/types";
import { NEW_PRICING_OFFERS } from "@/content/offers-pricing-refresh";

export type ShoeLaunchPatch = {
  familyId?: string;
  generation?: string;
  reviewId?: string;
  offerIds?: string[];
  verdict: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription?: string;
  strengths?: string[];
  weaknesses?: string[];
  alternativeProductIds?: string[];
  relatedProductIds?: string[];
  /** Short Brand Hub / PDP positioning line (e.g. tempo trainer). */
  positioningLabel: string;
};

const SEED_OFFER_IDS: Record<string, string[]> = {
  "prod-novablast-4": ["offer-nb4-nl"],
  "prod-pegasus-41": ["offer-pegasus41-nl"],
  "prod-clifton-9": ["offer-clifton9-nl"],
  "prod-endorphin-speed-4": ["offer-speed4-nl"],
};

const OFFER_BY_PRODUCT = new Map<string, string[]>();
for (const [id, offers] of Object.entries(SEED_OFFER_IDS)) {
  OFFER_BY_PRODUCT.set(id, [...offers]);
}
for (const o of NEW_PRICING_OFFERS) {
  const list = OFFER_BY_PRODUCT.get(o.productId) ?? [];
  if (!list.includes(o.id)) list.push(o.id);
  OFFER_BY_PRODUCT.set(o.productId, list);
}

function offersFor(productId: string): string[] | undefined {
  const ids = OFFER_BY_PRODUCT.get(productId);
  return ids?.length ? ids : undefined;
}

/**
 * Patches keyed by product id. Verdicts name the shoe’s job and who should skip it.
 */
export const RUNNING_SHOE_LAUNCH_PATCHES: Record<string, ShoeLaunchPatch> = {
  "prod-adizero-boston-13": {
    familyId: "fam-adizero-boston",
    generation: "13",
    reviewId: "review-adizero-boston-13",
    offerIds: offersFor("prod-adizero-boston-13"),
    positioningLabel: "tempo trainer",
    verdict:
      "A tempo-capable Adidas road trainer for runners who mix daily miles with faster sessions — Lightstrike Pro snap without a full race-day plate. Skip it if you want max-cushion easy-day softness or pure marathon racing geometry.",
    seoTitle: "Adidas Adizero Boston 13: Specs, Tempo Fit & Alternatives",
    seoDescription:
      "Adidas Adizero Boston 13 specs, strengths, trade-offs and alternatives — when this tempo trainer fits your week and when to choose a softer daily or race shoe instead.",
  },
  "prod-terrex-agravic-3": {
    familyId: "fam-terrex-agravic",
    generation: "3",
    reviewId: "review-terrex-agravic-3",
    offerIds: offersFor("prod-terrex-agravic-3"),
    positioningLabel: "trail shoe",
    weaknesses: [
      "Not a technical alpine scramble shoe",
      "Heavier than minimal trail racers",
    ],
    verdict:
      "A Contagrip trail shoe for mixed singletrack and adventure days when you want Adidas Terrex grip with everyday trail cushioning. Skip it for steep technical scrambling or if you want a dedicated road trainer.",
    seoTitle: "Adidas Terrex Agravic 3: Trail Specs, Grip & Alternatives",
    seoDescription:
      "Adidas Terrex Agravic 3 trail specs, who it suits, trade-offs versus Cascadia/Sense Ride peers, and when to look elsewhere.",
  },
  "prod-ultraboost-5": {
    familyId: "fam-ultraboost",
    generation: "5",
    reviewId: "review-ultraboost-5",
    offerIds: offersFor("prod-ultraboost-5"),
    positioningLabel: "max-cushion long-run trainer",
    verdict:
      "A soft Boost daily/recovery trainer for easy miles when cushion comfort matters more than tempo snap. Skip it for race day or if you want a lighter, firmer uptempo shoe.",
    seoTitle: "Adidas Ultraboost 5: Cushion Specs, Fit & Alternatives",
    seoDescription:
      "Adidas Ultraboost 5 soft daily-trainer specs, strengths, trade-offs and softer/firmer alternatives for easy and recovery miles.",
  },
  "prod-experience-flow": {
    familyId: "fam-altra-experience",
    generation: "Flow",
    reviewId: "review-experience-flow",
    offerIds: offersFor("prod-experience-flow"),
    positioningLabel: "daily trainer",
    verdict:
      "An approachable Altra road shoe with a roomy foot-shaped toe box and a modest drop — useful if you want Altra geometry without full zero-drop. Skip it if you need max stack or true zero-drop adaptation work.",
    seoTitle: "Altra Experience Flow: Specs, Fit & Who It’s For",
    seoDescription:
      "Altra Experience Flow specs, wide-fit story, strengths and trade-offs versus other Altra and traditional-drop daily trainers.",
  },
  "prod-paradigm-7": {
    familyId: "fam-altra-paradigm",
    generation: "7",
    reviewId: "review-paradigm-7",
    offerIds: offersFor("prod-paradigm-7"),
    positioningLabel: "max-cushion long-run trainer",
    verdict:
      "A zero-drop max-cushion Altra for high-mileage road days when you want stack plus a wide toe box. Skip it if you are new to zero-drop or want a plated race shoe.",
    seoTitle: "Altra Paradigm 7: Zero-Drop Cushion Specs & Alternatives",
    seoDescription:
      "Altra Paradigm 7 max-cushion zero-drop specs, who should buy or avoid it, and alternatives in stability and trail lines.",
  },
  "prod-trabuco-13": {
    familyId: "fam-trabuco",
    generation: "13",
    reviewId: "review-trabuco-13",
    offerIds: offersFor("prod-trabuco-13"),
    positioningLabel: "trail shoe",
    verdict:
      "An ASICS Gel-Trabuco trail shoe for rocky and mixed trails when you want familiar ASICS cushioning with trail outsole grip. Skip it for road-only weeks or ultra-minimal trail racing.",
    seoTitle: "ASICS Gel-Trabuco 13: Trail Specs, Grip & Alternatives",
    seoDescription:
      "ASICS Gel-Trabuco 13 trail specs, strengths, trade-offs and alternatives like Peregrine and Hierro.",
  },
  "prod-gt-1000-13": {
    familyId: "fam-gt-1000",
    generation: "13",
    reviewId: "review-gt-1000-13",
    offerIds: offersFor("prod-gt-1000-13"),
    positioningLabel: "stable daily trainer",
    verdict:
      "An entry-to-mid ASICS stability daily trainer for runners who want guidance without Kayano-level complexity. Skip it if you are fully neutral or need max-cushion plushness.",
    seoTitle: "ASICS GT-1000 13: Stability Specs & Alternatives",
    seoDescription:
      "ASICS GT-1000 13 stability daily-trainer specs, who it fits, trade-offs versus Guide and 860 peers.",
  },
  "prod-novablast-4": {
    familyId: "fam-novablast",
    generation: "4",
    reviewId: "review-novablast-4",
    offerIds: offersFor("prod-novablast-4"),
    positioningLabel: "daily trainer",
    shortDescription:
      "Previous-generation FF BLAST+ Novablast daily trainer — still a strong clearance pick for bouncy easy and long road miles.",
    strengths: [
      "Bouncy FF BLAST+ ride",
      "Strong clearance value vs Novablast 5/6",
      "Proven daily/long-run role",
    ],
    weaknesses: [
      "Superseded by newer Novablast generations",
      "Not a race-day plated shoe",
    ],
    alternativeProductIds: ["prod-novablast-5", "prod-novablast-6"],
    verdict:
      "A previous-gen Novablast daily trainer I’d shortlist on clearance when you want bouncy road cushioning without buying current MSRP. Skip it if you want the latest Novablast geometry or a firm tempo shoe.",
    seoTitle: "ASICS Novablast 4: Specs, Clearance Fit & vs Newer Generations",
    seoDescription:
      "ASICS Novablast 4 previous-gen daily-trainer specs, strengths, trade-offs and when to choose Novablast 5 or 6 instead.",
  },
  "prod-cascadia-18": {
    familyId: "fam-cascadia",
    generation: "18",
    reviewId: "review-cascadia-18",
    offerIds: offersFor("prod-cascadia-18"),
    positioningLabel: "trail shoe",
    verdict:
      "A Brooks Cascadia trail workhorse for mixed singletrack when you want durable trail geometry and predictable cushioning. Skip it for road racing or highly technical alpine days.",
    seoTitle: "Brooks Cascadia 18: Trail Specs, Fit & Alternatives",
    seoDescription:
      "Brooks Cascadia 18 trail specs, strengths, trade-offs and alternatives in the Sense Ride and Lone Peak lanes.",
  },
  "prod-glycerin-gts-22": {
    familyId: "fam-glycerin-gts",
    generation: "22",
    reviewId: "review-glycerin-gts-22",
    offerIds: offersFor("prod-glycerin-gts-22"),
    positioningLabel: "stable daily trainer",
    verdict:
      "A plush Brooks Glycerin GTS stability daily for easy and long road miles when you want soft cushioning with GuideRails support. Skip it for tempo/race days or if you run fully neutral.",
    seoTitle: "Brooks Glycerin GTS 22: Stability Cushion Specs & Alternatives",
    seoDescription:
      "Brooks Glycerin GTS 22 soft stability-trainer specs, who it’s for, trade-offs versus Gaviota and Kayano.",
  },
  "prod-arahi-7": {
    familyId: "fam-arahi",
    generation: "7",
    reviewId: "review-arahi-7",
    offerIds: offersFor("prod-arahi-7"),
    positioningLabel: "stable daily trainer",
    verdict:
      "A HOKA Arahi stability daily with J-Frame guidance for road miles when you want HOKA stack plus mild support. Skip it if you want maximal plush Bondi softness or a race plate.",
    seoTitle: "HOKA Arahi 7: Stability Specs, Fit & Alternatives",
    seoDescription:
      "HOKA Arahi 7 stability daily-trainer specs, strengths, trade-offs and peers like Guide and Gaviota.",
  },
  "prod-clifton-9": {
    familyId: "fam-clifton",
    generation: "9",
    reviewId: "review-clifton-9",
    offerIds: offersFor("prod-clifton-9"),
    positioningLabel: "daily trainer",
    shortDescription:
      "Previous-generation HOKA Clifton daily trainer — light, rockered road cushioning still common on clearance versus Clifton 10.",
    weaknesses: [
      "Superseded by Clifton 10 for current catalog picks",
      "Less max stack than Bondi",
    ],
    verdict:
      "A prior-gen Clifton daily I’d still shortlist on sale for light, rockered easy miles. Skip it if you want the latest Clifton 10 updates or Bondi-level max cushion.",
    seoTitle: "HOKA Clifton 9: Specs, Clearance Fit & vs Clifton 10",
    seoDescription:
      "HOKA Clifton 9 previous-gen daily-trainer specs, strengths, trade-offs and when to choose Clifton 10 or Nimbus instead.",
  },
  "prod-gaviota-5": {
    familyId: "fam-gaviota",
    generation: "5",
    reviewId: "review-gaviota-5",
    offerIds: offersFor("prod-gaviota-5"),
    positioningLabel: "stable daily trainer",
    verdict:
      "A HOKA Gaviota stability shoe for runners who want thicker HOKA cushioning with stronger guidance than Arahi. Skip it if you prefer a lighter stability daily or neutral max-cushion.",
    seoTitle: "HOKA Gaviota 5: Max-Stability Specs & Alternatives",
    seoDescription:
      "HOKA Gaviota 5 stability specs, who should buy or avoid it, and alternatives in Adrenaline and Kayano lanes.",
  },
  "prod-860-v14": {
    familyId: "fam-860",
    generation: "v14",
    reviewId: "review-860-v14",
    offerIds: offersFor("prod-860-v14"),
    positioningLabel: "stable daily trainer",
    weaknesses: [
      "Less plush than Fresh Foam max-cushion neutrals",
      "Not a race-day shoe",
    ],
    verdict:
      "A New Balance Fresh Foam X 860 stability daily for guided road miles with familiar Fresh Foam cushioning. Skip it for racing or if you want a softer neutral 1080-style ride.",
    seoTitle: "New Balance Fresh Foam X 860 v14: Stability Specs & Alternatives",
    seoDescription:
      "New Balance 860 v14 stability daily-trainer specs, trade-offs versus Adrenaline and GT-2000 peers.",
  },
  "prod-hierro-v9": {
    familyId: "fam-hierro",
    generation: "v9",
    reviewId: "review-hierro-v9",
    offerIds: offersFor("prod-hierro-v9"),
    positioningLabel: "trail shoe",
    weaknesses: [
      "Heavier than aggressive trail racers",
      "Not ideal as a pure road shoe",
    ],
    verdict:
      "A Fresh Foam Hierro trail shoe for longer trail days when you want New Balance cushioning and trail grip. Skip it for road-only training or minimalist trail racing.",
    seoTitle: "New Balance Fresh Foam X Hierro v9: Trail Specs & Alternatives",
    seoDescription:
      "New Balance Hierro v9 trail specs, strengths, trade-offs and alternatives like Speedgoat and Trabuco.",
  },
  "prod-pegasus-41": {
    familyId: "fam-pegasus",
    generation: "41",
    reviewId: "review-pegasus-41",
    offerIds: offersFor("prod-pegasus-41"),
    positioningLabel: "daily trainer",
    shortDescription:
      "Nike’s high-volume ReactX daily trainer for easy and steady road miles — versatile, not a max-cushion or race specialist.",
    verdict:
      "A do-most-things Nike daily trainer for steady road mileage when you want familiar Pegasus versatility. Skip it if you need max cushion, strong stability, or a plated racer.",
    seoTitle: "Nike Pegasus 41: Daily Trainer Specs, Fit & Alternatives",
    seoDescription:
      "Nike Pegasus 41 daily-trainer specs, strengths, trade-offs and alternatives like Ghost and Novablast.",
  },
  "prod-pegasus-trail-5": {
    familyId: "fam-pegasus-trail",
    generation: "5",
    reviewId: "review-pegasus-trail-5",
    offerIds: offersFor("prod-pegasus-trail-5"),
    positioningLabel: "trail shoe",
    verdict:
      "A Nike Pegasus Trail shoe for road-to-trail and moderate singletrack when you want Pegasus-like cushioning with trail outsole. Skip it for steep technical terrain or pure road racing.",
    seoTitle: "Nike Pegasus Trail 5: Trail Specs, Fit & Alternatives",
    seoDescription:
      "Nike Pegasus Trail 5 specs, who it suits, trade-offs versus Sense Ride and Aero Glide trail peers.",
  },
  "prod-react-infinity-4": {
    familyId: "fam-react-infinity",
    generation: "4",
    reviewId: "review-react-infinity-4",
    offerIds: offersFor("prod-react-infinity-4"),
    positioningLabel: "stable daily trainer",
    verdict:
      "A Nike React Infinity stability-leaning daily for runners who want React cushioning with a more guided platform than Pegasus. Skip it for aggressive tempo days or max trail grip.",
    seoTitle: "Nike React Infinity Run 4: Stability Specs & Alternatives",
    seoDescription:
      "Nike React Infinity Run 4 specs, stability role, trade-offs versus Arahi and Guide.",
  },
  "prod-cloudmonster-hyper": {
    familyId: "fam-cloudmonster",
    generation: "Hyper",
    reviewId: "review-cloudmonster-hyper",
    offerIds: offersFor("prod-cloudmonster-hyper"),
    positioningLabel: "tempo trainer",
    verdict:
      "A faster Cloudmonster variant for tempo and long efforts when you want On geometry with more snap than the standard Cloudmonster. Skip it if you dislike On fit quirks or want a traditional daily soft shoe.",
    seoTitle: "On Cloudmonster Hyper: Tempo Specs, Fit & Alternatives",
    seoDescription:
      "On Cloudmonster Hyper specs, tempo role, trade-offs versus Superblast and Endorphin Speed peers.",
  },
  "prod-cloudsurfer-2": {
    familyId: "fam-cloudsurfer",
    generation: "2",
    reviewId: "review-cloudsurfer-2",
    offerIds: offersFor("prod-cloudsurfer-2"),
    positioningLabel: "daily trainer",
    verdict:
      "A soft On Cloudsurfer daily for easy and long road miles with CloudTec Phase cushioning. Skip it for firm tempo work or if you want a wider traditional last.",
    seoTitle: "On Cloudsurfer 2: Soft Daily Specs & Alternatives",
    seoDescription:
      "On Cloudsurfer 2 soft daily-trainer specs, strengths, trade-offs versus Clifton and Ultraboost.",
  },
  "prod-genesis-salomon": {
    familyId: "fam-salomon-genesis",
    generation: "1",
    reviewId: "review-genesis-salomon",
    offerIds: offersFor("prod-genesis-salomon"),
    positioningLabel: "trail shoe",
    weaknesses: [
      "Less plush than max-cushion trail tanks",
      "Not a road daily trainer",
    ],
    verdict:
      "A Salomon Genesis trail shoe for agile trail days when you want Salomon fit and grip without an ultra-max stack. Skip it for road weeks or deep mud-specialist outsoles.",
    seoTitle: "Salomon Genesis: Trail Specs, Fit & Alternatives",
    seoDescription:
      "Salomon Genesis trail specs, who it’s for, trade-offs versus Sense Ride and Cascadia.",
  },
  "prod-ultra-glide-2": {
    familyId: "fam-ultra-glide",
    generation: "2",
    reviewId: "review-ultra-glide-2",
    offerIds: offersFor("prod-ultra-glide-2"),
    positioningLabel: "trail shoe",
    weaknesses: [
      "Less protective than tank-like ultra trail shoes",
      "Not designed as a road trainer",
    ],
    verdict:
      "A Salomon Ultra Glide trail shoe for longer trail efforts when you want cushioned glide underfoot with Salomon trail DNA. Skip it for short technical races or road-only blocks.",
    seoTitle: "Salomon Ultra Glide 2: Trail Specs & Alternatives",
    seoDescription:
      "Salomon Ultra Glide 2 trail specs, strengths, trade-offs versus Speedgoat and Hierro.",
  },
  "prod-endorphin-pro-3": {
    familyId: "fam-endorphin-pro",
    generation: "3",
    reviewId: "review-endorphin-pro-3",
    offerIds: offersFor("prod-endorphin-pro-3"),
    positioningLabel: "race shoe",
    shortDescription:
      "Previous-generation Saucony Endorphin Pro carbon race shoe — still relevant on clearance versus Endorphin Pro 4.",
    weaknesses: [
      "Superseded by Endorphin Pro 4 for current catalog picks",
      "Demanding for easy daily miles",
    ],
    alternativeProductIds: ["prod-endorphin-pro-4", "prod-adios-pro-4"],
    verdict:
      "A prior-gen carbon Endorphin Pro race shoe I’d consider on clearance for goal races. Skip it if you want the latest Pro 4 updates or a nylon-plate tempo daily like Speed.",
    seoTitle: "Saucony Endorphin Pro 3: Race Specs & vs Pro 4",
    seoDescription:
      "Saucony Endorphin Pro 3 carbon race-shoe specs, clearance role, trade-offs versus Endorphin Pro 4 and Adios Pro.",
  },
  "prod-endorphin-speed-4": {
    familyId: "fam-endorphin-speed",
    generation: "4",
    reviewId: "review-endorphin-speed-4",
    offerIds: offersFor("prod-endorphin-speed-4"),
    positioningLabel: "tempo trainer",
    shortDescription:
      "Previous-generation Saucony Endorphin Speed nylon-plate tempo trainer — still a strong uptempo option on clearance versus Speed 5.",
    weaknesses: [
      "Superseded by Endorphin Speed 5 for current picks",
      "Less soft than max-cushion dailies",
    ],
    alternativeProductIds: ["prod-endorphin-speed-5", "prod-boston-12"],
    verdict:
      "A prior-gen Endorphin Speed tempo trainer for faster sessions and long runs with snap. Skip it if you want Speed 5 updates or a soft recovery daily.",
    seoTitle: "Saucony Endorphin Speed 4: Tempo Specs & vs Speed 5",
    seoDescription:
      "Saucony Endorphin Speed 4 nylon-plate tempo specs, clearance fit, trade-offs versus Speed 5 and Boston.",
  },
  "prod-guide-18": {
    familyId: "fam-guide",
    generation: "18",
    reviewId: "review-guide-18",
    offerIds: offersFor("prod-guide-18"),
    positioningLabel: "stable daily trainer",
    verdict:
      "A Saucony Guide stability daily for road miles when you want PWRRUN cushioning with guidance. Skip it for race day or if you run fully neutral.",
    seoTitle: "Saucony Guide 18: Stability Specs & Alternatives",
    seoDescription:
      "Saucony Guide 18 stability daily-trainer specs, strengths, trade-offs versus Kayano and GT-2000.",
  },
  "prod-xodus-ultra-3": {
    familyId: "fam-xodus",
    generation: "3",
    reviewId: "review-xodus-ultra-3",
    offerIds: offersFor("prod-xodus-ultra-3"),
    positioningLabel: "trail shoe",
    verdict:
      "A Saucony Xodus Ultra trail shoe for longer, protective trail days when you want deep lugs and cushioned trail stack. Skip it for short road loops or featherweight trail racing.",
    seoTitle: "Saucony Xodus Ultra 3: Trail Specs & Alternatives",
    seoDescription:
      "Saucony Xodus Ultra 3 protective trail specs, who it suits, trade-offs versus Trabuco and Cascadia.",
  },
  "prod-terraventure-4": {
    familyId: "fam-terraventure",
    generation: "5",
    reviewId: "review-terraventure-4",
    offerIds: offersFor("prod-terraventure-4"),
    positioningLabel: "trail shoe",
    weaknesses: [
      "Less max stack than ultra-cushion trail tanks",
      "Wide fit not for everyone",
    ],
    verdict:
      "A Topo Terraventure trail shoe for runners who want a roomy toe box and trail grip with Topo geometry. Skip it if you prefer a narrow traditional last or road-only shoes.",
    seoTitle: "Topo Athletic Terraventure 5: Trail Specs & Alternatives",
    seoDescription:
      "Topo Terraventure 5 trail specs, wide-fit story, trade-offs versus Cascadia and Sense Ride.",
  },
  "prod-rebel-4": {
    familyId: "fam-rebel",
    generation: "4",
    reviewId: "review-rebel-4",
    offerIds: offersFor("prod-rebel-4"),
    positioningLabel: "uptempo trainer",
    verdict:
      "I'd shortlist Rebel v4 as a previous-generation FuelCell uptempo trainer when you want a light unplated road shoe for mixed easy-to-tempo weeks, and New Balance widths matter. Skip it if you need max-cushion long-run protection, a nylon-plated Speed-class workout shoe, or the current Rebel v5 platform.",
    seoTitle: "New Balance FuelCell Rebel v4: Specs, Uptempo Fit & Alternatives",
    seoDescription:
      "New Balance FuelCell Rebel v4 specs, who it suits versus Mach 6 and Endorphin Speed 4, and when to buy leftover v4 instead of Rebel v5.",
    shortDescription:
      "Previous-generation FuelCell uptempo trainer (~199 g men's US 9) for mixed easy and faster road sessions — unplated, 6 mm drop, not a max-cushion long-run shoe.",
    strengths: [
      "Light FuelCell pop for tempo, strides and mixed road weeks",
      "Official New Balance wide options alongside standard",
      "Unplated so easy miles stay in play unlike Speed-class nylon plates",
    ],
    weaknesses: [
      "Less protective on long easy and marathon-prep days",
      "Previous generation — Rebel v5 is the current platform",
    ],
    alternativeProductIds: [
      "prod-mach-6",
      "prod-endorphin-speed-4",
      "prod-pegasus-41",
    ],
    relatedProductIds: ["prod-rebel-v5", "prod-mach-6", "prod-endorphin-speed-4"],
  },
  "prod-nnormal-kjerag-02": {
    familyId: "fam-nnormal-kjerag",
    generation: "02",
    positioningLabel: "technical race-trail shoe",
    verdict:
      "I'd shortlist Kjerag 02 when you want NNormal’s race-trail last for fast technical ground — 20/26 mm, 6 mm drop, 3.5 mm Megagrip Litebase. Skip it if you want Tomir’s long-mountain protection, Cadí easy-terrain stack, or a road trainer.",
    seoTitle: "NNormal Kjerag 02: Race-Trail Specs, Fit & Alternatives",
    seoDescription:
      "NNormal Kjerag 02 specs (20/26 mm, 6 mm drop, 230 g UK 8.5), how it differs from Tomir 02, and when to pick Peregrine or Sense Ride instead.",
  },
  "prod-nnormal-tomir-02": {
    familyId: "fam-nnormal-tomir",
    generation: "02",
    positioningLabel: "long-technical trail shoe",
    verdict:
      "I'd shortlist Tomir 02 for long technical mountain days when you want more stack and 5 mm Megagrip than Kjerag — 25/33 mm, 8 mm drop. Skip it for Kjerag-pace racing or Cadí-style easy gravel/fireroad cushioning.",
    seoTitle: "NNormal Tomir 02: Trail Specs, Grip & Alternatives",
    seoDescription:
      "NNormal Tomir 02 specs (25/33 mm, 8 mm drop, 264 g UK 8.5), how it differs from Kjerag 02, and when Speedgoat or Cascadia is the better trail daily.",
  },
};

export function applyRunningShoesLaunchReadyEnrichment(
  products: Product[],
): Product[] {
  return products.map((product) => {
    const patch = RUNNING_SHOE_LAUNCH_PATCHES[product.id];
    if (!patch) return product;

    const offerIds = [
      ...new Set([
        ...(patch.offerIds ?? []),
        ...(product.offerIds ?? []),
        ...(offersFor(product.id) ?? []),
      ]),
    ];

    const alternativeProductIds = [
      ...new Set([
        ...(patch.alternativeProductIds ?? []),
        ...(product.alternativeProductIds ?? []),
      ]),
    ];

    return {
      ...product,
      familyId: patch.familyId ?? product.familyId,
      generation: patch.generation ?? product.generation,
      reviewId: patch.reviewId ?? product.reviewId,
      offerIds: offerIds.length ? offerIds : product.offerIds,
      positioning: patch.positioningLabel,
      verdict: patch.verdict,
      seoTitle: patch.seoTitle,
      seoDescription: patch.seoDescription,
      shortDescription: patch.shortDescription ?? product.shortDescription,
      strengths: patch.strengths ?? product.strengths,
      weaknesses: patch.weaknesses ?? product.weaknesses,
      alternativeProductIds: alternativeProductIds.length
        ? alternativeProductIds
        : product.alternativeProductIds,
      relatedProductIds: patch.relatedProductIds ?? product.relatedProductIds,
    };
  });
}

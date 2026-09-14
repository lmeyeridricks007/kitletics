/**
 * Soft-goods AlternativeRelationship edges for the padel decision graph.
 * Uses only domain relationshipType enum values (cheaper|premium|faster|…).
 */

import type { AlternativeRelationship } from "@/domain/recommendations/types";

export const padelSoftGoodsAlternatives: AlternativeRelationship[] = [
  // —— Balls ——
  {
    id: "alt-pro-s-to-pro-plus",
    sourceProductId: "prod-head-padel-pro-s",
    alternativeProductId: "prod-head-padel-pro-plus",
    similarityScore: 90,
    reasons: [
      "Same HEAD competition family",
      "Pro+ sits longer for control-first match play",
    ],
    relationshipType: "more-stable",
  },
  {
    id: "alt-pro-plus-to-pro-s",
    sourceProductId: "prod-head-padel-pro-plus",
    alternativeProductId: "prod-head-padel-pro-s",
    similarityScore: 90,
    reasons: [
      "Same HEAD competition family",
      "Pro S is the faster pace sibling",
    ],
    relationshipType: "faster",
  },
  {
    id: "alt-pro-s-to-kuikma-speed",
    sourceProductId: "prod-head-padel-pro-s",
    alternativeProductId: "prod-kuikma-pb-speed",
    similarityScore: 84,
    reasons: [
      "Both speed-oriented pressurized competition cans",
      "Kuikma is the value FIP fast-can path",
    ],
    relationshipType: "cheaper",
  },
  {
    id: "alt-kuikma-speed-to-pro-s",
    sourceProductId: "prod-kuikma-pb-speed",
    alternativeProductId: "prod-head-padel-pro-s",
    similarityScore: 84,
    reasons: [
      "Both fast competition cans",
      "HEAD Pro S is the common club/match reference",
    ],
    relationshipType: "premium",
  },
  {
    id: "alt-kuikma-speed-to-control",
    sourceProductId: "prod-kuikma-pb-speed",
    alternativeProductId: "prod-kuikma-pb-control",
    similarityScore: 88,
    reasons: [
      "Same Kuikma competition pair",
      "Control sits longer than Speed",
    ],
    relationshipType: "more-stable",
  },
  {
    id: "alt-kuikma-control-to-speed",
    sourceProductId: "prod-kuikma-pb-control",
    alternativeProductId: "prod-kuikma-pb-speed",
    similarityScore: 88,
    reasons: [
      "Same Kuikma competition pair",
      "Speed is the livelier sibling",
    ],
    relationshipType: "faster",
  },
  {
    id: "alt-pro-s-to-head-team",
    sourceProductId: "prod-head-padel-pro-s",
    alternativeProductId: "prod-head-padel-team",
    similarityScore: 72,
    reasons: [
      "Training / practice crate path once match bounce is gone",
      "Not a match-night substitute for Pro S",
    ],
    relationshipType: "cheaper",
  },
  {
    id: "alt-pro-s-to-premier-speed",
    sourceProductId: "prod-head-padel-pro-s",
    alternativeProductId: "prod-wilson-padel-premier-speed",
    similarityScore: 80,
    reasons: [
      "Both fast competition cans",
      "Premier Speed targets cold/slow-court conditions",
    ],
    relationshipType: "faster",
  },
  {
    id: "alt-kuikma-speed-to-club",
    sourceProductId: "prod-kuikma-pb-speed",
    alternativeProductId: "prod-kuikma-pb-club",
    similarityScore: 70,
    reasons: [
      "Bulk / club crate economics inside Kuikma",
      "Club cans are for volume practice, not league night identity",
    ],
    relationshipType: "better-value",
  },

  // —— Bags ——
  {
    id: "alt-at10-team-to-tour-endurance",
    sourceProductId: "prod-nox-at10-team-bag",
    alternativeProductId: "prod-tecnifibre-tour-endurance-backpack",
    similarityScore: 78,
    reasons: [
      "Smaller commute / hands-free day pack alternative",
      "Shoe well without club paletero bulk",
    ],
    relationshipType: "lighter",
  },
  {
    id: "alt-tour-endurance-to-at10-team",
    sourceProductId: "prod-tecnifibre-tour-endurance-backpack",
    alternativeProductId: "prod-nox-at10-team-bag",
    similarityScore: 78,
    reasons: [
      "Club thermo paletero when backpack heat storage is a problem",
      "~42 L organised racket tunnels",
    ],
    relationshipType: "premium",
  },
  {
    id: "alt-at10-team-to-rh-pro",
    sourceProductId: "prod-nox-at10-team-bag",
    alternativeProductId: "prod-babolat-rh-pro-padel",
    similarityScore: 82,
    reasons: [
      "Larger tournament volume (~62 L / multi-racket)",
      "Weekend kit step-up from club paletero",
    ],
    relationshipType: "premium",
  },
  {
    id: "alt-rh-pro-to-at10-team",
    sourceProductId: "prod-babolat-rh-pro-padel",
    alternativeProductId: "prod-nox-at10-team-bag",
    similarityScore: 82,
    reasons: [
      "Smaller daily club carry",
      "Right-sized when you do not pack tournament caverns",
    ],
    relationshipType: "lighter",
  },
  {
    id: "alt-rh-pro-to-xxl",
    sourceProductId: "prod-babolat-rh-pro-padel",
    alternativeProductId: "prod-nox-at10-xxl-bag",
    similarityScore: 85,
    reasons: [
      "Larger tournament travel volume (~90 L)",
      "When RH Pro already overflows",
    ],
    relationshipType: "premium",
  },
  {
    id: "alt-xxl-to-rh-pro",
    sourceProductId: "prod-nox-at10-xxl-bag",
    alternativeProductId: "prod-babolat-rh-pro-padel",
    similarityScore: 85,
    reasons: [
      "Smaller tournament bag when 90 L is empty weight",
      "~62 L still covers most draws",
    ],
    relationshipType: "lighter",
  },
  {
    id: "alt-at10-team-to-kuikma-paletero",
    sourceProductId: "prod-nox-at10-team-bag",
    alternativeProductId: "prod-kuikma-paletero",
    similarityScore: 74,
    reasons: [
      "Cheaper club carry path",
      "Accept less published thermo clarity for budget",
    ],
    relationshipType: "cheaper",
  },

  // —— Grips ——
  {
    id: "alt-wilson-to-hac",
    sourceProductId: "prod-wilson-overgrip",
    alternativeProductId: "prod-bullpadel-gb1200",
    similarityScore: 86,
    reasons: [
      "Absorption-first when sweat kills Wilson tack",
      "Same overgrip consumable job, different moisture personality",
    ],
    relationshipType: "more-cushioned",
  },
  {
    id: "alt-hac-to-wilson",
    sourceProductId: "prod-bullpadel-gb1200",
    alternativeProductId: "prod-wilson-overgrip",
    similarityScore: 86,
    reasons: [
      "Thin tack default when absorption feels mushy",
      "Feel-first overgrip personality",
    ],
    relationshipType: "lighter",
  },
  {
    id: "alt-wilson-to-kuikma-og",
    sourceProductId: "prod-wilson-overgrip",
    alternativeProductId: "prod-kuikma-overgrip",
    similarityScore: 80,
    reasons: [
      "Bulk / value overgrip packs",
      "Replace often on a budget",
    ],
    relationshipType: "cheaper",
  },
  {
    id: "alt-wilson-to-hesacore",
    sourceProductId: "prod-wilson-overgrip",
    alternativeProductId: "prod-hesacore-padel",
    similarityScore: 55,
    reasons: [
      "Different mechanism: structured ergonomic cushion system vs thin overgrip",
      "Try when handle shape/comfort is the problem, not just tack",
    ],
    relationshipType: "more-cushioned",
  },
  {
    id: "alt-hesacore-to-wilson",
    sourceProductId: "prod-hesacore-padel",
    alternativeProductId: "prod-wilson-overgrip",
    similarityScore: 55,
    reasons: [
      "Return to thin consumable wraps when Hesacore channels feel wrong",
      "Cheaper frequent refresh path",
    ],
    relationshipType: "cheaper",
  },

  // —— Accessories (same problem, different mechanism) ——
  {
    id: "alt-pascal-to-more-balls",
    sourceProductId: "prod-bullpadel-pascal-box",
    alternativeProductId: "prod-head-padel-pro-s",
    similarityScore: 40,
    reasons: [
      "Different mechanism for dead-ball pain: buy fresh cans more often",
      "Skip pressurizer clutter if every match already opens a new can",
    ],
    relationshipType: "better-value",
  },
  {
    id: "alt-x3-to-more-balls",
    sourceProductId: "prod-head-x3-pressurizer",
    alternativeProductId: "prod-kuikma-pb-speed",
    similarityScore: 40,
    reasons: [
      "Value cans instead of a travel pressurizer when bounce fade is rare",
      "Same problem class, consumable solution",
    ],
    relationshipType: "cheaper",
  },
  {
    id: "alt-bullpadel-to-nox-protector",
    sourceProductId: "prod-bullpadel-frame-protector",
    alternativeProductId: "prod-nox-frame-protector",
    similarityScore: 92,
    reasons: [
      "Same rim-protection job",
      "Transparent finish alternative to coloured 3-pack",
    ],
    relationshipType: "lighter",
  },
  {
    id: "alt-nox-to-bullpadel-protector",
    sourceProductId: "prod-nox-frame-protector",
    alternativeProductId: "prod-bullpadel-frame-protector",
    similarityScore: 92,
    reasons: [
      "Same rim-protection job",
      "Coloured 3-pack spares",
    ],
    relationshipType: "better-value",
  },
  {
    id: "alt-protector-to-custom-weight",
    sourceProductId: "prod-bullpadel-frame-protector",
    alternativeProductId: "prod-bullpadel-custom-weight",
    similarityScore: 70,
    reasons: [
      "Protection plus small tip-mass customization",
      "Only when you intentionally want balance shift",
    ],
    relationshipType: "premium",
  },
];

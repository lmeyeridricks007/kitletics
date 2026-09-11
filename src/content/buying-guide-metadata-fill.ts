/**
 * P2 editorial metadata fill for buying guides missing shortDescription / quickAnswer.
 * Merged onto guides in `src/content/editorial.ts` without rewriting every seed blob.
 */
export const buyingGuideMetadataFill: Record<
  string,
  { shortDescription: string; quickAnswer: string; relatedProductIds?: string[] }
> = {
  "guide-choose-padel-racket": {
    shortDescription:
      "Level, power vs control, shape, weight and balance — without treating K-count as a ranking.",
    quickAnswer:
      "Start with your level and whether you need control, balance, or power — then use shape, weight, and balance as secondary filters. Carbon K-count alone is not a quality ranking.",
  },
  "guide-choose-padel-shoes": {
    shortDescription:
      "Court shoe traits that matter for lateral movement, grip and durability on padel surfaces.",
    quickAnswer:
      "Prioritise lateral stability and a padel/court outsole over running shoes. Fit and cushioning come next; fashion colourways last.",
  },
  "guide-padel-grips": {
    shortDescription:
      "When to use overgrips vs replacement grips, and how they change handle feel.",
    quickAnswer:
      "Most players refresh overgrips often for sweat and tack; replace the base grip when the handle diameter or underlayer is worn.",
  },
  "guide-choose-tennis-racket": {
    shortDescription:
      "Head size, weight, power vs control vs spin, and grip sizing for club and competitive players.",
    quickAnswer:
      "Match head size and weight to your timing first, then pick a power, control or spin bias that matches how you already play — finish with grip size and strings.",
  },
  "guide-build-home-gym": {
    shortDescription:
      "Room constraints, buy order and what to prioritise when building a home strength setup.",
    quickAnswer:
      "Measure ceiling and footprint first, then buy in layers: flooring → safe squat/bench setup → bar/plates → conditioning. Skip accessory clutter until the basics work.",
  },
  "guide-choose-training-shoes": {
    shortDescription:
      "Match trainers to lifting, metcons, HYROX and mixed gym sessions.",
    quickAnswer:
      "Weightlifting shoes for heavy squats/Olympic lifts; cross-trainers for mixed gym days; HYROX-oriented shoes when run legs matter as much as stations.",
  },
  "guide-adjustable-vs-fixed": {
    shortDescription:
      "Space, change speed and progression trade-offs between adjustable and fixed dumbbells.",
    quickAnswer:
      "Choose adjustable when a full rack will not fit; choose fixed when you want the fastest pair changes and commercial-style durability.",
  },
  "guide-hyrox-home-setup": {
    shortDescription:
      "Which HYROX stations transfer at home — and what gear actually matters.",
    quickAnswer:
      "Prioritise RowErg/SkiErg specificity, a versatile race shoe and realistic sled alternatives for your surface — then add carries and wall-ball practice.",
  },
  "guide-pull-up-bar-mounting": {
    shortDescription:
      "Doorway, wall and free-standing options — and the structural limits that matter.",
    quickAnswer:
      "Pick mounting type from your building constraints first: doorway for rentals with low load, wall mount for solid structure, free-standing when you cannot drill.",
  },
  "guide-power-rack-sizing": {
    shortDescription:
      "Upright height, depth, hole spacing and clearance checks before you buy a rack.",
    quickAnswer:
      "Confirm upright height vs ceiling + pull-up clearance, then check depth and hole spacing for your bench and bar path — not brand marketing.",
  },
  "guide-choose-power-rack": {
    shortDescription:
      "Half rack vs full rack vs squat stand for home and garage strength.",
    quickAnswer:
      "Choose the smallest footprint that still gives safe squat/bench height, J-cup adjustability and pull-up capability for your room.",
  },
  "guide-choose-bench": {
    shortDescription:
      "Flat vs FID vs zero-gap benches for home pressing and accessory work.",
    quickAnswer:
      "Pick a stable FID or zero-gap bench if you press often; a flat bench is enough when space and budget are tight and you mainly need a press platform.",
  },
  "guide-choose-adb": {
    shortDescription:
      "Selector dials, plate-load and expander kits — what matters in adjustable dumbbells.",
    quickAnswer:
      "Match max load and change mechanism to your progression, then check footprint, stand storage and how securely plates lock under use.",
  },
  "guide-choose-treadmill": {
    shortDescription:
      "Motorised vs curved, folding needs and apartment constraints for home cardio.",
    quickAnswer:
      "Decide walking vs running first, then folding vs dedicated footprint. Curved/self-powered suits sprint conditioning; motorised suits paced easy miles.",
  },
  "guide-choose-rower": {
    shortDescription:
      "Air vs magnetic rowers, footprint and HYROX transfer for home conditioning.",
    quickAnswer:
      "Prefer a Concept2-class air rower when race-familiar meters matter; choose magnetic when noise and fold/storage dominate.",
  },
  "guide-home-gym-space": {
    shortDescription:
      "How much length, width and ceiling height you need for racks, bars and conditioning.",
    quickAnswer:
      "Plan around bar path clearance and rack depth first — ceiling height for pull-ups is the most common deal-breaker, not floor square metres alone.",
  },
  "guide-bumper-vs-iron": {
    shortDescription:
      "When bumper plates beat iron (and when iron is the smarter buy).",
    quickAnswer:
      "Bumpers for Olympic lifts and drops on home floors; iron when you mainly load presses/squats and need denser storage per kilo.",
  },
  "guide-choose-hyrox-shoes": {
    shortDescription:
      "Balance 8 km of running with station stability — without marketing hype.",
    quickAnswer:
      "Decide whether run legs or stations limit you first, then pick a versatile trainer (or a two-shoe setup only if you will rotate it).",
  },
  "guide-hyrox-race-vs-training-shoes": {
    shortDescription:
      "When race-day efficiency beats training durability — and when it does not.",
    quickAnswer:
      "Race shoes can be lighter if you stay stable on stations; training shoes should prioritise weekly volume, mixed gym work and durability.",
  },
  "guide-rowerg-vs-skierg-hyrox": {
    shortDescription:
      "Which Concept2 station to buy first for HYROX home practice.",
    quickAnswer:
      "Buy the machine you cannot access elsewhere. Rowers need length; SkiErgs need height and a clear wall/floor mount plan.",
  },
  "guide-hyrox-sled": {
    shortDescription:
      "Sled choices for HYROX-style push/pull practice — and why surface changes everything.",
    quickAnswer:
      "Pick a sled that fits your surface and storage first. Do not assume training load equals race equivalence without a validated methodology.",
  },
  "guide-hyrox-equipment-standards": {
    shortDescription:
      "Season 26/27 singles format, station order and loaded-station differences.",
    quickAnswer:
      "Expect 8× (1 km run + station). Loaded stations differ by division; SkiErg, row and burpee broad jump have no external load — verify against the current rulebook.",
    relatedProductIds: [
      "prod-tyr-cxt-2",
      "prod-concept2-rowerg",
      "prod-concept2-skierg",
      "prod-rogue-echo-bike",
      "prod-rogue-dog-sled",
      "prod-rogue-wall-ball",
      "prod-forerunner-965",
      "prod-hrm-pro-plus",
    ],
  },
  "guide-hyrox-race-checklist": {
    shortDescription:
      "What to wear and pack for HYROX race day without overpacking.",
    quickAnswer:
      "Race shoes and chafe-free kit first; optional watch/chest strap, warm-up and post-race layers, nutrition per event rules, and registration materials.",
  },
  "guide-hyrox-hr": {
    shortDescription:
      "When a chest strap beats wrist optical HR for HYROX movement patterns.",
    quickAnswer:
      "Wrist optical is convenient; a chest strap is often more consistent during carries, sled and burpees when paired correctly — not medical advice.",
  },
  "guide-what-gear-hyrox": {
    shortDescription:
      "Minimum race kit vs useful training gear for first and returning HYROX athletes.",
    quickAnswer:
      "You need race-capable shoes and event-legal clothing first. Add watch/HR, home station practice tools and recovery gear only after that baseline is solid.",
  },
  "guide-build-hyrox-home-gym": {
    shortDescription:
      "A practical HYROX-capable home gym without buying every station.",
    quickAnswer:
      "Start with shoes + rower/ski specificity, then add carries/wall-ball and a sled solution that fits your space — use Home Gym Builder for footprint constraints.",
  },
  "guide-choose-hyrox-watch": {
    shortDescription:
      "What watch features matter for HYROX pacing vs general training.",
    quickAnswer:
      "Reliable multi-sport tracking and HR pairing matter more than HYROX marketing. Prefer a watch you already trust for running/gym days over a second specialised device.",
  },
};

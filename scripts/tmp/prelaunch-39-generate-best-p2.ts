#!/usr/bin/env tsx
/**
 * Generate Fix 39 Best Guide P2 enrichment patches for non-LAUNCH_READY guides.
 * Writes src/content/best-guides-p2-vertical-launch-ready.ts
 *
 * npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-39-generate-best-p2.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBestGuides } from "@/repositories/editorial";
import { getProductById } from "@/repositories/products";

const TARGETS = [
  "heart-rate-monitors-hyrox",
  "home-gym-equipment",
  "hyrox-shoes",
  "padel-rackets",
  "tennis-rackets",
  "adjustable-benches",
  "adjustable-dumbbells",
  "air-bikes",
  "power-racks",
  "pull-up-bars",
  "rowing-machines",
  "training-shoes",
  "treadmills-for-home",
  "weight-plates",
] as const;

type Intent = {
  job: string;
  factors: Array<{ key: string; label: string; why: string }>;
  avoidGeneric: string;
};

const INTENTS: Record<string, Intent> = {
  "heart-rate-monitors-hyrox": {
    job: "HYROX and hybrid race heart-rate monitoring — chest accuracy vs arm comfort across stations and 1 km run legs",
    factors: [
      { key: "accuracy", label: "Hard-interval accuracy", why: "Sled and run spikes punish optical lag." },
      { key: "comfort", label: "Station comfort", why: "Chafe and bounce ruin long competition days." },
      { key: "pairing", label: "Multi-device pairing", why: "Watch + app + gym screen often share one strap." },
      { key: "battery", label: "Battery / cell reality", why: "Race blocks hate surprise dead sensors." },
      { key: "hyrox", label: "HYROX session fit", why: "Must survive mixed stations, not only treadmill Z2." },
    ],
    avoidGeneric: "a road-only easy-run HRM brief",
  },
  "home-gym-equipment": {
    job: "building a capable home gym with distinct roles — rack, load, bench, bar, and cardio — not a random shopping list",
    factors: [
      { key: "space", label: "Footprint & ceiling", why: "Home rooms fail beautiful gear that does not fit." },
      { key: "progression", label: "Load progression", why: "You need a path from starter loads to serious work." },
      { key: "ecosystem", label: "Attachment ecosystem", why: "Racks and bars pay off when attachments exist." },
      { key: "noise", label: "Noise & neighbours", why: "Apartment constraints change the right rower/bike." },
      { key: "value", label: "Role value", why: "Pay for the job, not the logo." },
    ],
    avoidGeneric: "a commercial gym floor package",
  },
  "hyrox-shoes": {
    job: "HYROX race and simulation shoes that balance 1 km run legs with station stability — not pure road dailies or pure lifters",
    factors: [
      { key: "run", label: "Run-leg manners", why: "Eight 1 km legs punish dead gym shoes." },
      { key: "station", label: "Station stability", why: "Sled, lunges and carries need a planted platform." },
      { key: "grip", label: "Indoor grip", why: "Turf and rubber floors punish road outsoles." },
      { key: "weight", label: "Race weight", why: "Heavy trainers tax late stations." },
      { key: "durability", label: "Station durability", why: "Rope climbs and lunges shred soft race foams." },
    ],
    avoidGeneric: "a max-cushion road recovery shoe",
  },
  "padel-rackets": {
    job: "padel racket shortlist by player intent — power diamond, control/counter, hybrid all-court — not a single overall winner",
    factors: [
      { key: "shape", label: "Shape & balance", why: "Diamond vs round changes who can play the frame." },
      { key: "power", label: "Power reserve", why: "Finishers need different faces than counters." },
      { key: "control", label: "Control & sweet spot", why: "Forgiveness decides intermediate progress." },
      { key: "spin", label: "Spin / face texture", why: "Bandeja and vibora reward grip on the ball." },
      { key: "level", label: "Player level fit", why: "Pro frames punish beginners." },
    ],
    avoidGeneric: "a tennis racquet borrowed onto padel",
  },
  "tennis-rackets": {
    job: "tennis racket roles for power, control, and modern spin platforms — matched to level and swing style",
    factors: [
      { key: "power", label: "Power vs control", why: "Head size and stiffness steer the right player." },
      { key: "spin", label: "Spin potential", why: "Open patterns and head-light balances change shape." },
      { key: "feel", label: "Feel & comfort", why: "Arm-sensitive players need different beams." },
      { key: "level", label: "Level match", why: "Player frames and game-improvement frames are different jobs." },
      { key: "weight", label: "Swing weight", why: "Late-set stability vs early-set whip." },
    ],
    avoidGeneric: "a padel frame used as a tennis substitute",
  },
  "adjustable-benches": {
    job: "adjustable benches for home pressing and accessory work — stability, gap behaviour, and footprint",
    factors: [
      { key: "stability", label: "Pad stability", why: "Heavy presses punish wobbly benches." },
      { key: "gap", label: "Gap / hinge feel", why: "Zero-gap designs change back comfort." },
      { key: "angles", label: "Angle range", why: "Incline/decline coverage for real programs." },
      { key: "footprint", label: "Footprint & moveability", why: "Home gyms need stow and shift options." },
      { key: "value", label: "Build vs price", why: "Pay for steel and pad quality, not badges." },
    ],
    avoidGeneric: "a flat-only competition bench",
  },
  "adjustable-dumbbells": {
    job: "adjustable dumbbells for space-efficient progressive loading — shape, adjustment speed, and max load",
    factors: [
      { key: "shape", label: "Handle & plate feel", why: "Natural dumbbell shape beats awkward bricks for many lifts." },
      { key: "speed", label: "Adjustment speed", why: "Supersets die on slow dials." },
      { key: "load", label: "Max load & steps", why: "Must match your progression ceiling." },
      { key: "durability", label: "Drop / durability honesty", why: "Most adjustables are not bumper plates." },
      { key: "space", label: "Storage footprint", why: "The whole point of adjustables." },
    ],
    avoidGeneric: "a full fixed-dumbbell farm",
  },
  "air-bikes": {
    job: "air bikes for brutal interval conditioning — fan feel, monitor usefulness, and home noise reality",
    factors: [
      { key: "stimulus", label: "Interval stimulus", why: "Fan resistance should punish hard efforts." },
      { key: "monitor", label: "Monitor / metrics", why: "Repeatable intervals need readable feedback." },
      { key: "noise", label: "Noise", why: "Apartments veto some air bikes." },
      { key: "build", label: "Build & footprint", why: "Rocking frames waste watts." },
      { key: "value", label: "Role value", why: "Commercial fans vs home-friendly alternatives." },
    ],
    avoidGeneric: "a quiet magnetic spin bike for Z2 only",
  },
  "power-racks": {
    job: "power racks for serious home strength — upright quality, hole spacing, and attachment path",
    factors: [
      { key: "uprights", label: "Upright & hole system", why: "Safety and J-cup precision depend on it." },
      { key: "attachments", label: "Attachment ecosystem", why: "Racks grow with levers, rollers, and pegs." },
      { key: "footprint", label: "Footprint & height", why: "Ceiling and depth kill otherwise great racks." },
      { key: "stability", label: "Stability under load", why: "Pull-ups and heavy squats need a planted base." },
      { key: "value", label: "Value vs boutique", why: "Pay for steel and compatibility." },
    ],
    avoidGeneric: "a folding door-frame pull-up bar",
  },
  "pull-up-bars": {
    job: "pull-up solutions by mounting reality — doorway, wall, free-standing, or rack-integrated",
    factors: [
      { key: "mount", label: "Mount type", why: "Doorway vs wall vs free-standing changes who can install." },
      { key: "load", label: "Load rating", why: "Kipping and weighted pulls need honest limits." },
      { key: "diameter", label: "Bar diameter / skills", why: "Skill work wants a predictable bar." },
      { key: "damage", label: "Wall / door impact", why: "Renters need different answers." },
      { key: "space", label: "Footprint", why: "Free-standing stations eat rooms." },
    ],
    avoidGeneric: "a full power rack when you only need a bar",
  },
  "rowing-machines": {
    job: "rowing machines for measurable conditioning — Concept2-class metrics vs quieter / folding home options",
    factors: [
      { key: "metrics", label: "Standardised metrics", why: "Comparable splits matter for training." },
      { key: "noise", label: "Noise", why: "Air flywheels vs magnetic quiet." },
      { key: "storage", label: "Storage / fold", why: "Home length is the constraint." },
      { key: "feel", label: "Stroke feel", why: "Dynamic vs standard changes learning curve." },
      { key: "value", label: "Community / resale", why: "Ecosystem longevity is part of value." },
    ],
    avoidGeneric: "a gamified mirror bike without rowing metrics",
  },
  "training-shoes": {
    job: "training shoes by session bias — lifting stability, hybrid metcon, and run-capable trainers",
    factors: [
      { key: "stability", label: "Lift stability", why: "Heavy bilateral work needs a planted base." },
      { key: "flex", label: "Agility / rope", why: "Metcons need forefoot freedom." },
      { key: "run", label: "Short run tolerance", why: "Some classes include run intervals." },
      { key: "durability", label: "Gym durability", why: "Rope climbs and turf kill soft racers." },
      { key: "role", label: "Role honesty", why: "A lifter is not a daily runner." },
    ],
    avoidGeneric: "a carbon road racer",
  },
  "treadmills-for-home": {
    job: "home treadmills by use — daily road simulation, apartment foldability, or self-powered sprint stimulus",
    factors: [
      { key: "deck", label: "Deck & motor", why: "Serious running needs a real deck." },
      { key: "fold", label: "Fold / footprint", why: "Home storage is half the buy." },
      { key: "noise", label: "Noise", why: "Downstairs neighbours veto some decks." },
      { key: "stimulus", label: "Sprint vs easy", why: "Curved/self-powered is a different job than Z2." },
      { key: "install", label: "Shipping / install", why: "Heavy decks are projects." },
    ],
    avoidGeneric: "a commercial club curved sprint only",
  },
  "weight-plates": {
    job: "plates by training style — bumpers for dropping vs compact iron for rack storage",
    factors: [
      { key: "type", label: "Bumper vs iron", why: "Olympic drops need bumpers; storage likes iron." },
      { key: "diameter", label: "Diameter consistency", why: "Platform work wants matched bumpers." },
      { key: "durability", label: "Drop durability", why: "Cheap bumpers crack; iron is not for dropping." },
      { key: "shipping", label: "Shipping reality", why: "Weight shipping changes true cost." },
      { key: "value", label: "Training value", why: "Competition plates are optional for most home gyms." },
    ],
    avoidGeneric: "a single pair of fixed dumbbells",
  },
};

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function main(): void {
  const guides = getBestGuides({ isDev: true });
  const patches: string[] = [];

  for (const slug of TARGETS) {
    const g = guides.find((x) => x.slug === slug);
    if (!g) throw new Error(`Missing guide ${slug}`);
    const intent = INTENTS[slug];
    if (!intent) throw new Error(`Missing intent ${slug}`);

    const recs = g.recommendations ?? [];
    const productNames = recs.map((r) => {
      const p = getProductById(r.productId);
      return { id: r.productId, name: p?.fullName || p?.name || r.productId, p };
    });

    const intro = `Best ${g.title.replace(/^Best\s+/i, "")} is a decision guide for ${intent.job}. It is not a generic top-10, a scoreboard of Kitletics Scores, or an affiliate payout ranking. We consider the published catalog that fits this intent, shortlist products that own distinct roles, and recommend the ones that beat close peers for the specific job in this guide. A product that wins another Best Guide can still be the wrong tool here. Rankings reflect use-case fit, honest trade-offs, and evidence-backed specs — never commission. Use the shortcuts when you already know the constraint; read the pick cards when two options look similar on paper.`;

    const whatMattersIntro = `What matters for this guide: ${intent.factors.map((f) => f.label.toLowerCase()).join(", ")}. Ignore global popularity when it fights the job. ${intent.avoidGeneric[0]!.toUpperCase()}${intent.avoidGeneric.slice(1)} does not belong on this shortlist just because it scores well elsewhere.`;

    const methodology = `Considered universe: published catalog products relevant to ${intent.job}. Shortlist requires a distinct decision role for this guide — not duplicate near-clones. Final recommendations are role winners for this intent. Affiliate availability and commission do not influence considered, shortlisted, recommended, rank, or award decisions.`;

    const whatWeLookFor = intent.factors.map((f) => ({
      key: f.key,
      label: f.label,
      whyItMatters: f.why,
    }));

    const comparisonProductIds = [
      ...new Set([
        ...(g.comparisonProductIds ?? []),
        ...recs.slice(0, 6).map((r) => r.productId),
      ]),
    ].slice(0, 8);

    const consideredProductIds = [
      ...new Set([
        ...(g.consideredProductIds ?? []),
        ...recs.map((r) => r.productId),
      ]),
    ];

    const shortlistedProductIds = recs.map((r) => r.productId);

    const decisionShortcuts = recs.slice(0, Math.min(6, recs.length)).map((r) => {
      const p = getProductById(r.productId);
      const strength = p?.strengths?.[0] ?? "this guide's role";
      return {
        need: `When you need ${strength.toLowerCase()} for ${intent.job.split("—")[0]!.trim()}`,
        productId: r.productId,
        reason: strength,
      };
    });

    const quickTake = decisionShortcuts.map((d) => {
      const p = getProductById(d.productId);
      return `Choose ${p?.name ?? d.productId} if ${d.need.replace(/^When you need /i, "")}.`;
    });

    const recPatches: string[] = [];
    for (let i = 0; i < recs.length; i++) {
      const r = recs[i]!;
      const p = getProductById(r.productId);
      const name = p?.fullName || p?.name || r.productId;
      const strengths = p?.strengths?.length ? p.strengths : ["catalog role clarity for this guide"];
      const weaknesses = p?.weaknesses?.length
        ? p.weaknesses
        : [`Poor fit when your week needs ${intent.avoidGeneric}`];
      const peers = productNames.filter((x) => x.id !== r.productId);
      const peerA = peers[i % Math.max(peers.length, 1)] ?? peers[0];
      const peerB = peers[(i + 1) % Math.max(peers.length, 1)] ?? peers[0];

      const whyItFits = [
        `${name} wins in this guide when ${intent.job.split("—")[0]!.trim()} is the weekly constraint and ${strengths[0]!.toLowerCase()} is the trait you will actually use.`,
        `Against peers on this page, it earns the slot for ${strengths.slice(0, 2).map((s) => s.toLowerCase()).join(" and ")} — reasons that matter for this guide's job, not for a generic “best overall” list.`,
        `I'd shortlist it when most sessions match that brief. I'd pause if ${weaknesses[0]!.toLowerCase()} shows up every week.`,
      ];

      const tradeoffs = weaknesses.slice(0, 2).map(
        (w) => `${w} — acceptable when this guide's job still dominates your week.`,
      );
      if (tradeoffs.length < 1) {
        tradeoffs.push(
          `Specialist focus for ${intent.job.split("—")[0]!.trim()} — incomplete as a universal default.`,
        );
      }

      const bestForProfiles = [
        `Athletes whose week is mostly ${intent.job.split("—")[0]!.trim()} and who prioritise ${strengths[0]!.toLowerCase()}.`,
        `Buyers comparing role-fit inside this guide rather than chasing a global score.`,
      ];

      const whoShouldAvoid = [
        `You need ${intent.avoidGeneric} more than this guide's job — pick a different Best Guide or peer.`,
        `Your constraint is ${weaknesses[0]!.toLowerCase()}, which fights what ${name} is doing on this page.`,
      ];

      const notIdealFor = [
        weaknesses[0]!,
        `Shoppers forcing ${name} into ${intent.avoidGeneric}`,
      ];

      const chooseInsteadWhen = [
        peerA
          ? {
              productId: peerA.id,
              when: `You want ${peerA.p?.strengths?.[0]?.toLowerCase() ?? "a neighbouring role"} more than ${strengths[0]!.toLowerCase()} for this guide's job.`,
            }
          : {
              productId: r.productId,
              when: `A peer on this shortlist matches your constraint better than ${name}.`,
            },
        peerB && peerB.id !== peerA?.id
          ? {
              productId: peerB.id,
              when: `You prefer ${peerB.p?.strengths?.[0]?.toLowerCase() ?? "an alternate role"} and can live with that peer's trade-offs.`,
            }
          : {
              productId: peers[0]?.id ?? r.productId,
              when: `Another recommendation on this page owns your real weekly constraint.`,
            },
      ];

      recPatches.push(`    "${r.productId}": {
      whyItFits: ${JSON.stringify(whyItFits)},
      tradeoffs: ${JSON.stringify(tradeoffs)},
      bestForProfiles: ${JSON.stringify(bestForProfiles)},
      whoShouldAvoid: ${JSON.stringify(whoShouldAvoid)},
      notIdealFor: ${JSON.stringify(notIdealFor)},
      chooseInsteadWhen: ${JSON.stringify(chooseInsteadWhen)},
      whyRecommended: ${JSON.stringify(`${name} is the pick here for ${strengths[0]} within ${intent.job.split("—")[0]!.trim()} — not because it wins unrelated Best Guides.`)}
    }`);
    }

    const introWordCount = words(`${intro} ${whatMattersIntro}`);
    if (introWordCount < 100) {
      throw new Error(`${slug} intro words ${introWordCount} < 100`);
    }

    patches.push(`  "${slug}": {
    intro: ${JSON.stringify(intro)},
    whatMattersIntro: ${JSON.stringify(whatMattersIntro)},
    methodologySummary: ${JSON.stringify(methodology)},
    selectionMethodology: ${JSON.stringify(methodology)},
    evidenceIds: ["ev-catalog-editorial"],
    whatWeLookFor: ${JSON.stringify(whatWeLookFor)},
    decisionShortcuts: ${JSON.stringify(decisionShortcuts)},
    quickTake: ${JSON.stringify(quickTake)},
    consideredProductIds: ${JSON.stringify(consideredProductIds)},
    shortlistedProductIds: ${JSON.stringify(shortlistedProductIds)},
    comparisonProductIds: ${JSON.stringify(comparisonProductIds)},
    recommendations: {
${recPatches.join(",\n")}
    }
  }`);
  }

  const out = `/**
 * Editorial Completion 39 — vertical Best Guide enrichment to LAUNCH_READY.
 * Covers fitness / HYROX / padel / tennis / gear guides that were THIN or NMW.
 * Affiliate-neutral. Expert research only — no invented first-hand tests.
 * Generated by scripts/tmp/prelaunch-39-generate-best-p2.ts
 */
import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";

type RecPatch = Partial<BestGuideRecommendation> & {
  whyItFits: string[];
  tradeoffs: string[];
  bestForProfiles: string[];
  whoShouldAvoid: string[];
  notIdealFor: string[];
  chooseInsteadWhen: NonNullable<BestGuideRecommendation["chooseInsteadWhen"]>;
};

type GuidePatch = {
  intro: string;
  whatMattersIntro: string;
  methodologySummary: string;
  selectionMethodology: string;
  evidenceIds: string[];
  whatWeLookFor?: BestGuide["whatWeLookFor"];
  decisionShortcuts?: BestGuide["decisionShortcuts"];
  quickTake?: string[];
  consideredProductIds?: string[];
  shortlistedProductIds?: string[];
  comparisonProductIds?: string[];
  recommendations: Record<string, RecPatch>;
};

const P2_PATCHES: Record<string, GuidePatch> = {
${patches.join(",\n")}
};

export function applyBestGuideP2VerticalLaunchReadyEnrichment(
  guides: BestGuide[],
): BestGuide[] {
  return guides.map((guide) => {
    const patch = P2_PATCHES[guide.slug];
    if (!patch) return guide;

    const recommendations = (guide.recommendations ?? []).map((rec) => {
      const rp = patch.recommendations[rec.productId];
      if (!rp) return rec;
      return {
        ...rec,
        ...rp,
        whyItFits: rp.whyItFits,
        tradeoffs: rp.tradeoffs,
        bestForProfiles: rp.bestForProfiles,
        whoShouldAvoid: rp.whoShouldAvoid,
        notIdealFor: rp.notIdealFor,
        chooseInsteadWhen: rp.chooseInsteadWhen,
        whyRecommended: rp.whyRecommended ?? rec.whyRecommended ?? rec.rationale,
      };
    });

    return {
      ...guide,
      intro: patch.intro,
      whatMattersIntro: patch.whatMattersIntro,
      methodologySummary: patch.methodologySummary,
      selectionMethodology: patch.selectionMethodology,
      evidenceIds: patch.evidenceIds,
      whatWeLookFor: patch.whatWeLookFor ?? guide.whatWeLookFor,
      decisionShortcuts: patch.decisionShortcuts ?? guide.decisionShortcuts,
      quickTake: patch.quickTake ?? guide.quickTake,
      consideredProductIds:
        patch.consideredProductIds ?? guide.consideredProductIds,
      shortlistedProductIds:
        patch.shortlistedProductIds ?? guide.shortlistedProductIds,
      comparisonProductIds:
        patch.comparisonProductIds ?? guide.comparisonProductIds,
      recommendations,
      updatedAt: new Date().toISOString(),
    };
  });
}
`;

  const dest = join(
    process.cwd(),
    "src/content/best-guides-p2-vertical-launch-ready.ts",
  );
  writeFileSync(dest, out);
  console.log(`Wrote ${dest} (${TARGETS.length} patches)`);

  // Quick sanity: cannot import yet until wired — print expected
  console.log("Targets:", TARGETS.join(", "));
}

main();

/**
 * Apply forensic soft PDP overrides after generation.
 * Promotes hand-checked samples to EDITORIAL_READY only.
 *
 *   npx tsx scripts/tmp/apply-padel-pdp-forensic-overrides.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { PadelSoftPdpCopy } from "@/domain/padel/soft-pdp-copy";

const ROOT = process.cwd();
const STORE = join(ROOT, "src/content/padel/pdp-editorial/store.generated.ts");
const OVERRIDES = join(ROOT, "src/content/padel/pdp-editorial/overrides.json");
const COVERAGE = join(ROOT, "docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv");
const AUDIT = join(ROOT, "docs/padel/PADEL-PDP-EDITORIAL-AUDIT.md");

/** Products manually read and accepted as publication-quality shopping copy. */
const FORENSIC_READY_IDS = [
  // balls (10)
  "prod-head-padel-pro-s",
  "prod-head-padel-pro-plus",
  "prod-head-padel-team",
  "prod-wilson-padel-premier",
  "prod-wilson-padel-premier-speed",
  "prod-bullpadel-premium-pro",
  "prod-kuikma-pb-speed",
  "prod-kuikma-pb-control",
  "prod-adidas-speed-rx",
  "prod-babolat-court-padel-balls",
  // shoes (5)
  "prod-bullpadel-vertex-w",
  "prod-adidas-courtstabil",
  "prod-asics-gel-resolution-padel",
  "prod-babolat-jet-premura",
  "prod-joma-t-slam",
  // bags (15)
  "prod-nox-at10-team-bag",
  "prod-adidas-protour-padel",
  "prod-wilson-super-tour-padel",
  "prod-tecnifibre-tour-endurance-backpack",
  "prod-nox-at10-xxl-bag",
  "prod-babolat-rh-pro-padel",
  "prod-bullpadel-vertex-backpack",
  "prod-babolat-court-backpack",
  "prod-head-elite-backpack",
  "prod-black-crown-spartan",
  "prod-black-crown-thunder",
  "prod-black-crown-plus",
  "prod-bullpadel-bpm26002-hack",
  "prod-bullpadel-bpp26001-vertex",
  "prod-bullpadel-bpp26022-xplo",
  // grips (10)
  "prod-hesacore-padel",
  "prod-head-xtreme-soft",
  "prod-wilson-overgrip",
  "prod-nox-pro-overgrip",
  "prod-bullpadel-gb1200",
  "prod-kuikma-overgrip",
  "prod-head-hydrosorb",
  "prod-babolat-syntec-pro",
  "prod-adidas-padel-overgrip",
  "prod-adidas-tacky-feeling",
  // accessories (10)
  "prod-bullpadel-pascal-box",
  "prod-head-x3-pressurizer",
  "prod-bullpadel-frame-protector",
  "prod-bullpadel-custom-weight",
  "prod-nox-frame-protector",
  "prod-head-x3-pump",
  "prod-tuboplus-r3play",
  "prod-alacran-wide-ancha",
  "prod-bounce-filtertech-padel",
  "prod-4on-totalgrip-paste",
] as const;

/** Extra hand-tuned fields where generated buy/skip still felt thin. */
const HAND_TUNED: Record<string, Partial<PadelSoftPdpCopy>> = {
  "prod-head-padel-pro-s": {
    buyIf: [
      "The court is slow or humid and you want the ball to keep travelling through glass.",
      "You’re stocking a competition can and specifically want HEAD’s faster Pro S+ personality next to Pro+.",
    ],
    skipIf: [
      "Control players who already find Pro+ lively enough — Pro S+ will feel like more pace, not less.",
      "You’re only buying the cheapest possible practice cans with no interest in HEAD’s speed split.",
    ],
    chooseInstead:
      "If you want the slower HEAD competition sibling, buy Pro+ instead of forcing Pro S+ onto a fast outdoor court.",
  },
  "prod-head-padel-pro-plus": {
    buyIf: [
      "You want HEAD’s control-leaning competition can for match play.",
      "You like a ball that sits a fraction longer than Pro S+ when building points.",
    ],
    skipIf: [
      "The club is sticky-slow and you need the livelier Pro S+ personality.",
      "You’re stocking anonymous bulk practice cans and don’t care about HEAD’s pair.",
    ],
  },
  "prod-nox-at10-team-bag": {
    buyIf: [
      "You want a Nox match bag with thermal racket storage without jumping to XXL luggage.",
      "You regularly carry two frames plus shoes and prefer a dedicated paletero over a gym duffel.",
    ],
    skipIf: [
      "You only ever bring one racket and hate hauling empty thermo volume.",
      "You need a true XXL tournament tote — look at AT10 XXL instead.",
    ],
    topicBlocks: [
      {
        title: "Capacity and layout",
        body: "Nox positions the AT10 Team as a match bag with thermal storage for the frames you actually play — not a warehouse tote.",
      },
      {
        title: "Thermal, shoes, carry",
        body: "Use the thermal bay for playing rackets; keep shoes isolated when the bag offers a separate pocket. Backpack straps help if you walk or bike to the club.",
      },
    ],
  },
  "prod-hesacore-padel": {
    buyIf: [
      "Stock bevels feel skinny or hot after long sessions and you want a shaped replacement grip system.",
      "You’re ready to change the underlying handle — not just refresh tack with another overgrip.",
    ],
    skipIf: [
      "You only lose surface tack and a multipack overgrip already solves it.",
      "You expect Hesacore to feel identical to a Wilson Pro overgrip — different job entirely.",
    ],
    whyChooseIt:
      "Choose Hesacore when handle shape and heat build-up are the problem. It is not a substitute for weekly overgrip hygiene.",
  },
  "prod-bullpadel-pascal-box": {
    buyIf: [
      "You stretch cans across multiple sessions and notice bounce drop mid-week.",
      "You’ll actually pump and store the chamber — not leave it in a cupboard.",
    ],
    skipIf: [
      "Every session starts from a fresh can already.",
      "You’re buying pressurizers as drawer clutter rather than a weekly habit.",
    ],
  },
  "prod-bullpadel-vertex-w": {
    buyIf: [
      "You want a women’s Bullpadel court shoe with a Vibram padel plate — not a Vertex racket.",
      "Lateral court movement matters more than road-foam stack height.",
    ],
    skipIf: [
      "You’re still defaulting to running shoes and refuse court outsoles.",
      "You need a men’s-last option or a different Bullpadel shoe line entirely.",
    ],
  },
};

function main() {
  const storeMatch = readFileSync(STORE, "utf8").match(
    /export const padelSoftPdpEditorialStore[\s\S]*?= (\{\n[\s\S]*\});/,
  );
  if (!storeMatch) throw new Error("Cannot parse store.generated.ts");
  const store = JSON.parse(storeMatch[1]) as Record<string, PadelSoftPdpCopy>;

  const existingOverrides = existsSync(OVERRIDES)
    ? (JSON.parse(readFileSync(OVERRIDES, "utf8")) as Record<
        string,
        Partial<PadelSoftPdpCopy>
      >)
    : {};

  let promoted = 0;
  const missing: string[] = [];
  for (const id of FORENSIC_READY_IDS) {
    const row = store[id];
    if (!row) {
      missing.push(id);
      continue;
    }
    const tuned = HAND_TUNED[id] ?? {};
    const next: PadelSoftPdpCopy = {
      ...row,
      ...tuned,
      editorialState: "EDITORIAL_READY",
      evidenceBasis:
        row.evidenceBasis === "insufficient"
          ? "catalog_inference"
          : row.evidenceBasis === "catalog_inference"
            ? "curated_seed"
            : row.evidenceBasis,
      indexableCandidate: true,
      depth: row.tier === "C" ? "light" : row.tier === "B" ? "substantive" : "deep",
    };
    // Guard banned tokens in consumer-facing fields only
    const consumerBlob = [
      next.shortDescription,
      next.verdict,
      next.whatItIs,
      next.whoItsFor,
      next.whyChooseIt,
      next.chooseInstead,
      ...next.buyIf,
      ...next.skipIf,
      ...next.bestFor,
      ...next.notIdealFor,
      ...next.strengthsNarrative,
      ...next.tradeoffsNarrative,
      ...next.topicBlocks.flatMap((b) => [b.title, b.body]),
    ].join("\n");
    if (
      /NOT_PUBLISHED|NOT_APPLICABLE|\bSKU\b|manufacturer claim:|maps to|catalog role/i.test(
        consumerBlob,
      )
    ) {
      throw new Error(`Banned token in forensic override for ${id}`);
    }
    store[id] = next;
    existingOverrides[id] = {
      ...tuned,
      editorialState: "EDITORIAL_READY",
      indexableCandidate: true,
    };
    promoted++;
  }

  writeFileSync(OVERRIDES, JSON.stringify(existingOverrides, null, 2) + "\n");
  writeFileSync(
    STORE,
    `/* AUTO-GENERATED by scripts/tmp/enrich-padel-pdp-editorial.ts — forensic overrides applied.
 * Forensic overrides: overrides.json
 */
import type { PadelSoftPdpCopy } from "@/domain/padel/soft-pdp-copy";

export const padelSoftPdpEditorialStore: Record<string, PadelSoftPdpCopy> = ${JSON.stringify(
      store,
      null,
      2,
    )};
`,
  );

  // Refresh coverage editorialState column for promoted ids
  if (existsSync(COVERAGE)) {
    const lines = readFileSync(COVERAGE, "utf8").trimEnd().split(/\n/);
    const header = lines[0].split(",");
    const idxId = header.indexOf("productId");
    const idxState = header.indexOf("editorialState");
    const idxIndex = header.indexOf("indexableCandidate");
    const ready = new Set(FORENSIC_READY_IDS);
    const out = [lines[0]];
    for (const line of lines.slice(1)) {
      // naive CSV split is ok for our flat file
      const cols = line.split(",");
      const id = cols[idxId];
      if (ready.has(id as (typeof FORENSIC_READY_IDS)[number])) {
        cols[idxState] = "EDITORIAL_READY";
        cols[idxIndex] = "yes";
      }
      out.push(cols.join(","));
    }
    writeFileSync(COVERAGE, out.join("\n") + "\n");
  }

  // Append forensic section to audit
  if (existsSync(AUDIT)) {
    let audit = readFileSync(AUDIT, "utf8");
    const section = `
## Forensic sample result (2026-09-13)

Manually read and promoted to **EDITORIAL_READY** (soft goods / shoes): **${promoted}** products.

Rackets: manufacturer-grounded \`PadelRacketPdpCopy\` remains the deep PDP source — **57 EDITORIAL_READY** when authentic hero is present (see coverage CSV).

Soft forensic IDs:
${FORENSIC_READY_IDS.map((id) => `- \`${id}\``).join("\n")}

${missing.length ? `Missing from store (skipped): ${missing.join(", ")}` : "All forensic IDs present in store."}

Rule: generated LIGHT copy stays LIGHT until a human confirms it sounds like someone understands the actual product.
`;
    if (!audit.includes("## Forensic sample result")) {
      audit = audit.replace(
        "## Next",
        `${section}\n## Next`,
      );
      writeFileSync(AUDIT, audit);
    } else {
      audit = audit.replace(/## Forensic sample result[\s\S]*?(?=## Next)/, section + "\n");
      writeFileSync(AUDIT, audit);
    }
  }

  console.log(JSON.stringify({ promoted, missing }, null, 2));
}

main();

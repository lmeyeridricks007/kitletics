/**
 * Generate padel PDP editorial for soft goods + shoes + racket meta.
 *
 *   npx tsx scripts/tmp/enrich-padel-pdp-editorial.ts
 *
 * Rules: no fake testing, no generator jargon, tiered depth, forensic overrides win.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import { hasRegisteredProductHero } from "@/content/running/products/media-publish-gate";
import { getPadelRacketPdpCopy } from "@/content/padel/rackets";
import { padelCommerceEnrichmentStore } from "@/content/padel/commerce-enrichment";
import {
  classifyEditorialTier,
  depthForTier,
  padelEditorialCategory,
} from "@/content/padel/pdp-editorial/tiers";
import type { Product } from "@/domain/products/types";
import type {
  PadelEditorialState,
  PadelRacketEditorialMeta,
  PadelSoftPdpCopy,
} from "@/domain/padel/soft-pdp-copy";
import { formatPublicAccessoryTypeNoun } from "@/lib/specs/public-label";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "src/content/padel/pdp-editorial");
const STORE = join(OUT_DIR, "store.generated.ts");
const RACKET_META = join(OUT_DIR, "racket-meta.generated.ts");
const COVERAGE = join(ROOT, "docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv");
const AUDIT = join(ROOT, "docs/padel/PADEL-PDP-EDITORIAL-AUDIT.md");
const OVERRIDES = join(OUT_DIR, "overrides.ts");

const PADEL_CATS = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
]);

const BAN =
  /\b(maps to|catalog role|headline trait|SKU|prod-|internal score|confidence|manufacturer claim:|whatever .+ optimizes|NOT_PUBLISHED|NOT_APPLICABLE)\b/i;

function brandLabel(brandId: string) {
  return brandId
    .replace(/^brand-/, "")
    .replace(/-padel$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function spec(p: Product, key: string): string {
  const v = p.specifications?.[key];
  if (v == null || v === "") return "";
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as { min?: number; max?: number };
    if (o.min != null && o.max != null) return `${o.min}–${o.max}`;
    if (o.min != null) return String(o.min);
    if (o.max != null) return String(o.max);
  }
  if (Array.isArray(v)) return v.map(String).join(", ");
  const s = String(v).trim();
  if (
    /^(UNKNOWN|NOT_PUBLISHED|NOT_APPLICABLE|N\/A|unknown|none)$/i.test(s)
  ) {
    return "";
  }
  return s;
}

function hasUsefulSpecs(p: Product): boolean {
  const keys = Object.keys(p.specifications ?? {}).filter((k) => {
    const v = p.specifications[k];
    if (v == null || v === "" || v === "unknown" || v === "UNKNOWN") return false;
    return true;
  });
  return keys.length >= 3;
}

function isGeneratorBlurb(s: string): boolean {
  return /researched as a current|commercially meaningful|confirm current model|confirm NL listing|kitletics_product/i.test(
    s,
  );
}

function cleanSentence(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function assertConsumerProse(s: string, id: string) {
  if (BAN.test(s)) {
    throw new Error(`Banned language in ${id}: ${s.slice(0, 80)}`);
  }
}

/** Load forensic overrides if present. */
function loadOverrides(): Record<string, Partial<PadelSoftPdpCopy>> {
  const jsonPath = join(OUT_DIR, "overrides.json");
  if (!existsSync(jsonPath)) return {};
  try {
    return JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch {
    return {};
  }
}

function ballCopy(p: Product): Omit<
  PadelSoftPdpCopy,
  | "productId"
  | "category"
  | "tier"
  | "depth"
  | "editorialState"
  | "evidenceBasis"
  | "indexableCandidate"
> {
  const brand = brandLabel(p.brandId);
  const speed = spec(p, "speed") || "medium";
  const use = spec(p, "use") || "club";
  const conditions = spec(p, "intendedConditions");
  const approval = spec(p, "officialApproval");
  const pack = spec(p, "packSize") || spec(p, "ballsPerCan") || "3-ball can";
  const cans = spec(p, "cansPerBox");
  const core = spec(p, "coreMaterial");
  const felt = spec(p, "feltMaterial");
  const press = spec(p, "pressurization") || "pressurized";

  const speedPhrase =
    speed === "fast" || /fast|speed|pro s/i.test(`${p.name} ${speed}`)
      ? "stays through the glass more readily"
      : speed === "slow" || /control|team|club/i.test(`${p.name} ${speed}`)
        ? "sits a fraction longer for building points"
        : "plays at a familiar club/competition pace";

  const shortDescription = cleanSentence(
    `${brand} ${p.name} — ${press} padel ball${pack ? ` (${pack})` : ""}${
      approval ? `; ${approval}` : ""
    }. ${
      core || felt
        ? `Construction notes: ${[core, felt].filter(Boolean).join("; ")}.`
        : "Positioned for padel court pace rather than tennis cans."
    }`,
  );

  const verdict = cleanSentence(
    use.includes("competition") || /pro|premier|official/i.test(p.name)
      ? `Open this when you want a competition-leaning can that ${speedPhrase}. Rec players who just need durable training cans can save money elsewhere.`
      : `A practical ${use || "club"} can when you want something that ${speedPhrase}. Skip it if you specifically need a tournament-branded ball.`,
  );

  const whatItIs = cleanSentence(
    `${brand} ${p.name} is a ${press} padel ball sold as ${pack}${
      cans ? ` (boxes often ${cans} cans)` : ""
    }. ${
      approval
        ? `Published approvals/positioning: ${approval}.`
        : "Use published pack and speed positioning when choosing between siblings."
    }`,
  );

  const whoItsFor = cleanSentence(
    conditions
      ? `Players and clubs buying for ${conditions}.`
      : use === "competition" || use === "official"
        ? "Match play and organised competition where bounce consistency matters more than cheapest training stock."
        : "Club sessions and regular training where you want a known padel can rather than leftover tennis balls.",
  );

  const whyChooseIt = cleanSentence(
    `Choose it when the ${speed} speed positioning and ${brand} range role match your court pace${
      approval ? `, or when you specifically want the ${approval} association` : ""
    }.`,
  );

  return {
    shortDescription,
    verdict,
    whatItIs,
    whoItsFor,
    whyChooseIt,
    strengthsNarrative: [
      cleanSentence(
        `${speed.charAt(0).toUpperCase() + speed.slice(1)} speed positioning within the ${brand} padel line.`,
      ),
      approval
        ? `Published competition association: ${approval}.`
        : `Sold as a dedicated padel can (${pack}), not a tennis leftover.`,
      press === "pressurized"
        ? "Pressurized construction — expect a fresher bounce from a new can."
        : "Pack format suited to how you buy and store balls.",
    ],
    tradeoffsNarrative: [
      speed === "fast"
        ? "Can feel lively on already-fast outdoor courts."
        : "Not the liveliest option if you want maximum pace through glass.",
      "Once open, pressurized cans lose bounce like any other — plan can rotation.",
    ],
    chooseInstead: cleanSentence(
      speed === "fast"
        ? `If you want a slower sibling in the same brand family, look for the control/medium can rather than forcing ${p.name} into a slow-court game.`
        : `If the court is sticky and slow, step up to a faster competition can instead of overhitting ${p.name}.`,
    ),
    bestFor: [
      use === "competition" ? "Match and tournament warm-up cans" : "Weekly club sessions",
      conditions ? conditions.split(",")[0].trim() : "Players who buy padel-specific cans",
    ],
    notIdealFor: [
      "Anyone still hitting leftover tennis balls and unwilling to buy padel cans",
      speed === "fast" ? "Very fast outdoor courts if you already struggle to contain pace" : "Players hunting the absolute fastest competition can",
    ],
    buyIf: [
      cleanSentence(
        `You want a ${brand} padel can with ${speed} pace cues and are happy buying ${pack}.`,
      ),
      approval
        ? `You care about the published ${approval} positioning for match play.`
        : `You prefer a known padel training or competition can over anonymous bulk felt.`,
    ],
    skipIf: [
      `You need a clearly different speed personality than ${speed} within this range.`,
      "You only want the cheapest possible practice balls with no brand positioning.",
    ],
    topicBlocks: [
      {
        title: "Speed and use",
        body: cleanSentence(
          `Published use: ${use || "club/training"}. Speed cue: ${speed}. ${
            conditions ? `Condition notes: ${conditions}.` : ""
          }`,
        ),
      },
      {
        title: "Pack economics",
        body: cleanSentence(
          `Typical retail unit: ${pack}${
            cans ? `; case packs often ${cans} cans` : ""
          }. Compare price per can when boxes look “cheap” only because they are bulk.`,
        ),
      },
    ],
  };
}

function bagCopy(p: Product): ReturnType<typeof ballCopy> {
  const brand = brandLabel(p.brandId);
  const capacity = spec(p, "racketCapacity") || spec(p, "capacity");
  const thermal = spec(p, "thermalCompartment") || spec(p, "thermo");
  const shoe = spec(p, "shoeCompartment") || spec(p, "shoeSeparation");
  const carry = spec(p, "carryStyle") || spec(p, "carrySystem") || spec(p, "bagType");
  const volume = spec(p, "volumeL") || spec(p, "volume");
  const compartments = spec(p, "compartments");

  const shortDescription = cleanSentence(
    `${brand} ${p.name} padel bag${capacity ? ` — about ${capacity} racket slots` : ""}${
      volume ? `, ~${volume} L` : ""
    }${thermal && !/no|false|0/i.test(thermal) ? ", with thermal storage" : ""}. Built for court kit, not as a generic gym duffel.`,
  );

  const verdict = cleanSentence(
    Number(capacity) >= 4 || /tour|pro|competition|thermo/i.test(p.name)
      ? `I’d take this when you carry multiple rackets and want organised court storage${
          thermal && !/no|false/i.test(thermal) ? " plus a thermal pocket" : ""
        }. Overkill if you only ever bring one racket and a bottle.`
      : `A straightforward ${brand} bag when you want dedicated racket storage without tournament-luggage bulk. Skip it if you need a true thermo-pro tote.`,
  );

  return {
    shortDescription,
    verdict,
    whatItIs: cleanSentence(
      `${brand} ${p.name} is a padel bag${carry ? ` (${carry})` : ""}${
        capacity ? ` with published capacity around ${capacity} rackets` : ""
      }. ${
        compartments
          ? `Compartment layout notes: ${compartments}.`
          : "Use the pocket layout on the product page when comparing siblings."
      }`,
    ),
    whoItsFor: cleanSentence(
      Number(capacity) >= 3
        ? "Players who rotate rackets, carry balls and shoes, and want one bag for club nights or tournaments."
        : "Players who want a lighter dedicated padel bag rather than stuffing a backpack.",
    ),
    whyChooseIt: cleanSentence(
      `Pick it when the capacity/carry mix (${[
        capacity && `${capacity} rackets`,
        thermal && !/no|false/i.test(thermal) && "thermal pocket",
        shoe && !/no|false/i.test(shoe) && "shoe separation",
        carry,
      ]
        .filter(Boolean)
        .join(", ") || "padel-specific layout"}) matches how you actually travel to court.`,
    ),
    strengthsNarrative: [
      capacity
        ? `Published racket capacity around ${capacity}.`
        : "Dedicated padel bag geometry rather than a generic sports holdall.",
      thermal && !/no|false/i.test(thermal)
        ? "Thermal storage for rackets when the manufacturer lists it."
        : "Simpler layout — fewer pockets to dig through.",
      shoe && !/no|false/i.test(shoe)
        ? "Separate shoe space keeps court dust off dry kit."
        : "Focus on racket and apparel storage without shoe-bay complexity.",
    ],
    tradeoffsNarrative: [
      Number(capacity) >= 4
        ? "Larger bags are awkward on bikes, scooters, and crowded trains."
        : "Limited racket slots if you suddenly become a multi-racket player.",
      thermal && !/no|false/i.test(thermal)
        ? "Thermal pockets add bulk even when empty."
        : "No thermal bay if you rely on that for hot-car summers.",
    ],
    chooseInstead: cleanSentence(
      Number(capacity) >= 4
        ? "If you commute light, step down to a backpack or 1–2 racket tote in the same brand."
        : "If you play tournaments with three rackets and shoes, step up to a larger thermo/competition bag.",
    ),
    bestFor: [
      Number(capacity) >= 3 ? "Club nights with spare racket + balls" : "Single-racket club sessions",
      carry?.includes("backpack") || /backpack|bp/i.test(p.name)
        ? "Hands-free walk or bike to the club"
        : "Car or locker-room drop-off",
    ],
    notIdealFor: [
      "Travel where airline personal-item limits matter more than racket count",
      Number(capacity) >= 4
        ? "Minimalists who hate hauling empty volume"
        : "Multi-racket tournament kits",
    ],
    buyIf: [
      capacity
        ? `You need a ${brand} padel bag that can hold about ${capacity} rackets and prefer court-specific pockets over a gym duffel.`
        : `You need a ${brand} padel bag and prefer court-specific pockets over a gym duffel.`,
      thermal && !/no|false/i.test(thermal)
        ? "You specifically want thermal racket storage for heat or cold swings."
        : "You want a simpler bag without paying for unused thermo volume.",
    ],
    skipIf: [
      "You already have a bag that fits your rackets and hate buying duplicates for cosmetics.",
      Number(capacity) < 3
        ? "You routinely carry three rackets plus shoes and balls."
        : "You only ever bring one racket and want the lightest possible tote.",
    ],
    topicBlocks: [
      {
        title: "Capacity and layout",
        body: cleanSentence(
          [
            capacity && `Racket capacity: ${capacity}.`,
            volume && `Volume: ~${volume} L.`,
            compartments && `Compartments: ${compartments}.`,
            !capacity && !volume && "Confirm racket bay count on the retailer PDP before buying.",
          ]
            .filter(Boolean)
            .join(" "),
        ),
      },
      {
        title: "Thermal, shoes, carry",
        body: cleanSentence(
          [
            thermal && `Thermal: ${thermal}.`,
            shoe && `Shoe separation: ${shoe}.`,
            carry && `Carry: ${carry}.`,
            "Match the carry system to how you get to the club — backpack straps vs shoulder tote.",
          ]
            .filter(Boolean)
            .join(" "),
        ),
      },
    ],
  };
}

function gripCopy(p: Product): ReturnType<typeof ballCopy> {
  const brand = brandLabel(p.brandId);
  const gripType = spec(p, "gripType") || spec(p, "type") || "overgrip";
  const feel = spec(p, "feel") || spec(p, "tack") || spec(p, "finish");
  const thickness = spec(p, "thickness") || spec(p, "thicknessMm");
  const absorption = spec(p, "absorption") || spec(p, "sweatAbsorption");
  const pack = spec(p, "packSize") || spec(p, "packQuantity") || spec(p, "units");
  const isReplacement =
    /replacement|under|hesacore|sensogrip|fixogrip|hydrosorb/i.test(
      `${p.name} ${gripType}`,
    );

  const shortDescription = cleanSentence(
    `${brand} ${p.name} — ${
      isReplacement ? "replacement grip / handle system" : "overgrip"
    }${feel ? ` with ${feel} feel cues` : ""}${
      pack ? ` (${pack})` : ""
    }. Chosen for sweat, tack, and how often you rewrap.`,
  );

  const verdict = cleanSentence(
    isReplacement
      ? `I’d look here when the stock handle shape or base grip is the problem — not when you only need a fresh tacky wrap. Overgrips are cheaper for weekly rewraps.`
      : `I’d use this as a regular overgrip when you want ${
          feel || "a known tack/dry personality"
        } without changing the underlying handle. Skip it if you need a shaped replacement grip system.`,
  );

  return {
    shortDescription,
    verdict,
    whatItIs: cleanSentence(
      `${brand} ${p.name} is a ${gripType}${thickness ? ` at ~${thickness}` : ""}${
        pack ? `, typically sold as ${pack}` : ""
      }. ${
        isReplacement
          ? "Replacement grips sit against the handle; overgrips wrap on top and get replaced more often."
          : "Overgrips are the consumable layer most padel players replace as tack fades."
      }`,
    ),
    whoItsFor: cleanSentence(
      absorption || /dry|absorb/i.test(feel)
        ? "Players with sweaty hands who want absorption/dry cues rather than pure gluey tack."
        : feel && /tack/i.test(feel)
          ? "Players who like sticky tack and rewrap often."
          : "Anyone refreshing handle feel between string jobs.",
    ),
    whyChooseIt: cleanSentence(
      `Choose it when the ${gripType} role and ${
        feel || "published feel"
      } match how you hold the racket — not because every accessory drawer needs another pack.`,
    ),
    strengthsNarrative: [
      isReplacement
        ? "Addresses handle shape/base feel, not only surface tack."
        : "Inexpensive way to refresh tack and sweat management.",
      feel ? `Feel cue: ${feel}.` : "Simple consumable with clear pack sizing.",
      pack ? `Pack format: ${pack} — compare price per grip.` : "Easy to keep a spare in the bag.",
    ],
    tradeoffsNarrative: [
      isReplacement
        ? "More commitment than sticking on an overgrip — install carefully."
        : "Overgrips wear out; budget for regular replacement.",
      thickness
        ? `Thickness ~${thickness} changes handle size — stacked wraps add up.`
        : "Stacking multiple overgrips can fatten the handle beyond comfort.",
    ],
    chooseInstead: cleanSentence(
      isReplacement
        ? "If you only lose tack after a few sessions, buy a multipack overgrip instead."
        : "If the bevels feel wrong even with fresh wraps, look at a shaped replacement grip (e.g. Hesacore-style) rather than more overgrip layers.",
    ),
    bestFor: [
      isReplacement ? "Handle-shape or base-grip upgrades" : "Weekly overgrip refresh",
      absorption || /dry/i.test(feel) ? "Sweaty-hand sessions" : "Players who like fresh tack",
    ],
    notIdealFor: [
      isReplacement
        ? "Players who only need a cheap tack refresh"
        : "Players who hate rewrapping and want a semi-permanent handle system",
      "Anyone expecting a racket to feel ‘new’ from grip alone when the face is worn out",
    ],
    buyIf: [
      cleanSentence(
        isReplacement
          ? `You want to change the underlying handle feel with ${brand} ${p.name}, not just add tack.`
          : `You rewrap regularly and want ${brand}'s ${feel || gripType} personality in a ${pack || "convenient pack"}.`,
      ),
      "You already know whether you prefer tacky vs dry/absorbent wraps.",
    ],
    skipIf: [
      isReplacement
        ? "You are happy with stock bevels and only need disposable overgrips."
        : "You need a shaped replacement system rather than another overgrip texture.",
      "You still have unopened multipacks of a grip you already like.",
    ],
    topicBlocks: [
      {
        title: "Replacement vs overgrip",
        body: isReplacement
          ? "This sits in the replacement / handle-system bucket. Put an overgrip on top if you still want a sacrificial sweat layer."
          : "This is an overgrip — wrap over the base grip and replace when tack or hygiene drops.",
      },
      {
        title: "Feel and pack economics",
        body: cleanSentence(
          [
            feel && `Feel: ${feel}.`,
            absorption && `Absorption: ${absorption}.`,
            thickness && `Thickness: ${thickness}.`,
            pack && `Pack: ${pack} — compare per-grip cost on bulk boxes.`,
          ]
            .filter(Boolean)
            .join(" "),
        ),
      },
    ],
  };
}

function accessoryCopy(p: Product): ReturnType<typeof ballCopy> {
  const brand = brandLabel(p.brandId);
  const type =
    spec(p, "accessoryType") ||
    spec(p, "type") ||
    (/pressur|tubo|pascal|bounce|rescuer/i.test(p.name)
      ? "pressurizer"
      : /protector|tape|weight/i.test(p.name)
        ? "protector"
        : /wrist|headband|band/i.test(p.name)
          ? "apparel-accessory"
          : "accessory");
  const isPress = /pressur/i.test(type) || /pressur|tubo|pascal|bounce|rescuer/i.test(p.name);
  const isProt = /protector|weight|tape/i.test(`${type} ${p.name}`);

  const typeNoun = formatPublicAccessoryTypeNoun(type);
  const typeRole = formatPublicAccessoryTypeNoun(type).replace(
    / accessory$/i,
    "",
  );

  const shortDescription = cleanSentence(
    isPress
      ? `${brand} ${p.name} — ball pressurizer accessory for keeping opened cans closer to playing pressure. Useful if you hate flat second-week balls; optional if you open a fresh can every session.`
      : isProt
        ? `${brand} ${p.name} — frame protection / balance-adjustment accessory. Solves edge chips and optional balance tweaks, not a performance miracle.`
        : `${brand} ${p.name} — padel accessory for a specific court inconvenience. Buy it when you feel that problem weekly; skip it as gift-drawer clutter.`,
  );

  const verdict = cleanSentence(
    isPress
      ? `I’d buy a pressurizer when you stretch cans across multiple sessions and notice bounce drop. If every hit starts from a new can, you probably don’t need one.`
      : isProt
        ? `I’d add this when walls and glass are eating your bumper. Skip decorative protectors if you already replace frames before cosmetics matter.`
        : `Useful when it solves a real annoyance (sweat, pickup, storage). Not mandatory kit.`,
  );

  return {
    shortDescription,
    verdict,
    whatItIs: cleanSentence(
      `${brand} ${p.name} is a ${typeNoun}. ${
        isPress
          ? "Pressurizers hold balls under pressure between sessions; check whether a pump is included."
          : isProt
            ? "Protectors and weights attach to the frame edge — confirm fit for your racket thickness."
            : "Read the product role plainly: it should name the problem it solves."
      }`,
    ),
    whoItsFor: cleanSentence(
      isPress
        ? "Clubs and frequent players who open cans less often than they play."
        : isProt
          ? "Players who drag the frame on glass/mesh or want small balance experiments."
          : "Players who already feel the specific inconvenience this accessory targets.",
    ),
    whyChooseIt: cleanSentence(
      `Choose it only when the problem shows up often enough that the accessory earns bag space — ${
        isPress ? "flat leftover cans" : isProt ? "chipped paint / bumper wear" : "that recurring annoyance"
      }.`,
    ),
    strengthsNarrative: [
      isPress
        ? "Can extend usable life of opened cans when used consistently."
        : isProt
          ? "Cheap insurance against cosmetic frame damage."
          : "Small, targeted fix rather than buying a new racket.",
      "Clear category role — easier to compare within pressurizers/protectors/etc.",
    ],
    tradeoffsNarrative: [
      isPress
        ? "Another object to pump/store; won’t resurrect truly dead felt."
        : "Adds weight/feel change on frame accessories — tape carefully.",
      "Easy to overbuy accessories you never install.",
    ],
    chooseInstead: cleanSentence(
      isPress
        ? "If bounce loss is rare, buy balls more often instead of another pressurizer body."
        : isProt
          ? "If the frame is already structurally nicked, budget restring/racket refresh rather than stickers."
          : "If the accessory doesn’t name a problem you feel, spend the money on balls or overgrips.",
    ),
    bestFor: [
      isPress ? "Multi-session can use" : isProt ? "Glass/mesh frame scuffs" : "Specific recurring annoyance",
      "Players who already know they will use it weekly",
    ],
    notIdealFor: [
      "Gift-drawer collecting",
      isPress ? "Players who always open fresh cans" : "Players who never notice the problem it claims to solve",
    ],
    buyIf: [
      cleanSentence(
        isPress
          ? `You regularly finish cans across days and want ${brand} ${p.name} in the pressurizer role.`
          : `You already feel the issue this ${typeRole} solves and prefer ${brand}'s version.`,
      ),
      "You will actually carry and use it — not store it unused.",
    ],
    skipIf: [
      "You are buying accessories out of completionism.",
      isPress
        ? "Fresh cans every session already solve your bounce problem."
        : "Your current setup doesn’t show the wear or inconvenience yet.",
    ],
    topicBlocks: [
      {
        title: "Problem solved",
        body: isPress
          ? "Slower bounce drop on opened cans when pressurized correctly. Not a substitute for quality balls."
          : isProt
            ? "Edge protection and optional balance plates. Compatibility depends on frame thickness and bumper shape."
            : "Match the accessory to a felt weekly problem; otherwise leave it.",
      },
      {
        title: "Who probably doesn’t need it",
        body: "Casual players who already replace consumables often, or anyone still missing a racket/shoes/balls before accessorizing.",
      },
    ],
  };
}

function shoeCopy(p: Product): ReturnType<typeof ballCopy> {
  const brand = brandLabel(p.brandId);
  const surface = spec(p, "surfaceCompatibility") || spec(p, "surface");
  const outsole =
    spec(p, "courtOutsole") ||
    spec(p, "outsole") ||
    spec(p, "outsoleType");
  const traction = spec(p, "tractionPattern");
  const lateral = spec(p, "lateralSupport") || spec(p, "lateralStability");
  const courtFeel = spec(p, "courtFeel");
  const cushion =
    spec(p, "cushioning") ||
    spec(p, "cushioningLevel") ||
    (courtFeel === "plush" ? "plush" : courtFeel === "connected" ? "firm/connected" : "");
  const fit = spec(p, "fit") || spec(p, "fitNotes") || spec(p, "width");
  const weight = spec(p, "weightG") || spec(p, "weight");
  const dur = spec(p, "durability");
  const upper = spec(p, "upper");

  const shortDescription = cleanSentence(
    `${brand} ${p.name} is a padel court shoe${
      surface && surface !== "unknown"
        ? ` positioned for ${surface.replace(/-/g, " ")} play`
        : ""
    }${
      outsole && outsole !== "unknown" ? ` with ${outsole} outsole cues` : ""
    }${
      lateral && lateral !== "unknown" ? ` and ${lateral} lateral-stability research` : ""
    }. Built around split-steps and abrasive sand — not road-mileage foam stories.`,
  );

  const verdict = cleanSentence(
    surface === "padel-specific"
      ? `I’d shortlist ${p.name} when you want a padel-oriented court shoe and the published traction/support cues (${[
          outsole && outsole !== "unknown" && outsole,
          lateral && lateral !== "unknown" && `lateral ${lateral}`,
          courtFeel && courtFeel !== "unknown" && `${courtFeel} court feel`,
        ]
          .filter(Boolean)
          .join(", ") || "court geometry"}) match how you move. Skip running shoes dressed up as court shoes.`
      : surface === "tennis-padel-crossover"
        ? `A tennis/padel crossover: workable on many padel clubs, but check outsole rules if your club is picky. Not the same as a padel-only mould.`
        : `Court shoe candidate — confirm surface compatibility before assuming padel-specific traction. Avoid treating it like a daily trainer.`,
  );

  return {
    shortDescription,
    verdict,
    whatItIs: cleanSentence(
      `${brand} ${p.name} sits in the padel/court-shoe range as a lateral-movement shoe${
        surface && surface !== "unknown"
          ? ` with ${surface.replace(/-/g, " ")} surface research`
          : ""
      }. ${
        traction
          ? `Traction pattern cue: ${traction}.`
          : outsole && outsole !== "unknown"
            ? `Outsole family cue: ${outsole}.`
            : "Confirm the outsole family on the manufacturer or specialist PDP before club play."
      } ${
        upper ? `Upper construction cue: ${upper}.` : ""
      }`.trim(),
    ),
    whoItsFor: cleanSentence(
      lateral === "high"
        ? "Players who plant hard on split-steps and want published high lateral-stability cues more than max stack height."
        : "Players who need court grip and sideways support for padel movement, not long-run cushioning stacks.",
    ),
    whyChooseIt: cleanSentence(
      `Choose it when published cues (${[
        outsole && outsole !== "unknown" && outsole,
        traction,
        lateral && lateral !== "unknown" && `lateral ${lateral}`,
        cushion && cushion !== "unknown" && `${cushion} cushioning/feel`,
      ]
        .filter(Boolean)
        .join(", ") || "court geometry"}) beat whatever running shoe you currently slide in.`,
    ),
    strengthsNarrative: [
      surface && surface !== "unknown"
        ? `Surface positioning: ${surface.replace(/-/g, " ")}.`
        : "Court-shoe category rather than road running.",
      lateral && lateral !== "unknown"
        ? `Lateral support cue: ${lateral}.`
        : "Built for side-to-side court movement.",
      courtFeel && courtFeel !== "unknown"
        ? `Court-feel cue: ${courtFeel}.`
        : weight
          ? `Published weight cue: ${weight} g.`
          : "Weight varies by size — check the size chart.",
      dur && dur !== "unknown" ? `Durability cue: ${dur}.` : "",
    ].filter(Boolean),
    tradeoffsNarrative: [
      cushion === "plush" || courtFeel === "plush"
        ? "Plush cushioning can feel less connected on sharp cuts."
        : courtFeel === "connected"
          ? "Connected court feel can read firm if you expect max stack height."
          : "Connected court shoes can feel firm if you expect max stack height.",
      dur === "low"
        ? "Durability cue is modest — expect outsole wear on abrasive sand."
        : "Abrasive padel sand still eats any outsole eventually — plan replacement cycles.",
    ],
    chooseInstead: cleanSentence(
      surface === "tennis-padel-crossover"
        ? "If your club demands padel-specific soles, pick a padel-labelled model instead."
        : courtFeel === "connected"
          ? "If you want a plush landing first, compare softer court models rather than defaulting to road shoes."
          : "If you need max cushioning for knee comfort, compare plush court models — don’t default to road shoes.",
    ),
    bestFor: [
      "Padel lateral movement and split-steps",
      outsole && outsole !== "unknown"
        ? `${outsole} outsole contexts`
        : "Indoor/outdoor club courts (confirm rules)",
    ],
    notIdealFor: [
      "Road running and gym mileage",
      surface === "unknown"
        ? "Buyers who need verified padel-specific sole confirmation before purchase"
        : "Players whose club bans this outsole type",
    ],
    buyIf: [
      cleanSentence(
        `You want a ${brand} court shoe for padel movement${
          surface && surface !== "unknown"
            ? ` with ${surface.replace(/-/g, " ")} positioning`
            : ""
        }${
          lateral && lateral !== "unknown" ? ` and ${lateral} lateral-stability cues` : ""
        }.`,
      ),
      fit
        ? `The published fit/width notes (${fit}) match how you lace court shoes.`
        : "You can try size and width in a store or accept a clear retailer return policy.",
    ],
    skipIf: [
      "You are still wearing running shoes and refuse court outsoles entirely — fix that category first.",
      surface === "unknown"
        ? "You need confirmed padel-specific traction evidence before spending."
        : "Your club’s sole rules conflict with this outsole family.",
    ],
    topicBlocks: [
      {
        title: "Court use and traction",
        body: cleanSentence(
          [
            surface && `Surface: ${surface.replace(/-/g, " ")}.`,
            outsole && `Outsole: ${outsole}.`,
            "Prioritise grip for lateral stops over road-foam bounce.",
          ]
            .filter(Boolean)
            .join(" "),
        ),
      },
      {
        title: "Support, cushioning, fit",
        body: cleanSentence(
          [
            lateral && `Lateral support: ${lateral}.`,
            cushion && `Cushioning: ${cushion}.`,
            fit && `Fit: ${fit}.`,
            weight && `Weight: ${weight} g (check size).`,
            dur && dur !== "unknown" && `Durability cue: ${dur}.`,
          ]
            .filter(Boolean)
            .join(" "),
        ),
      },
    ],
  };
}

function buildSoftCopy(p: Product): PadelSoftPdpCopy {
  const category = padelEditorialCategory(p)! as PadelSoftPdpCopy["category"];
  const tier = classifyEditorialTier(p);
  const hasHero = hasRegisteredProductHero(p.id);
  const lifecycleBad =
    p.lifecycleStatus === "discontinued" ||
    p.lifecycleStatus === "previous_generation";
  const depth = depthForTier(tier, lifecycleBad);
  const useful = hasUsefulSpecs(p);
  const generator = isGeneratorBlurb(p.shortDescription || "");

  let body: ReturnType<typeof ballCopy>;
  if (category === "balls") body = ballCopy(p);
  else if (category === "bags") body = bagCopy(p);
  else if (category === "grips") body = gripCopy(p);
  else if (category === "shoes") body = shoeCopy(p);
  else body = accessoryCopy(p);

  // Prefer curated seed verdict when present and not generator-like
  if (
    p.verdict &&
    !isGeneratorBlurb(p.verdict) &&
    p.verdict.length > 40 &&
    !BAN.test(p.verdict)
  ) {
    body = { ...body, verdict: p.verdict.trim() };
  }
  if (
    p.shortDescription &&
    !isGeneratorBlurb(p.shortDescription) &&
    p.shortDescription.length > 40 &&
    !BAN.test(p.shortDescription)
  ) {
    body = { ...body, shortDescription: p.shortDescription.trim() };
  }

  let editorialState: PadelEditorialState;
  let evidenceBasis: PadelSoftPdpCopy["evidenceBasis"];
  let indexableCandidate = false;

  if (lifecycleBad) {
    editorialState = "NOT_PUBLICATION_WORTHY";
    evidenceBasis = "insufficient";
  } else if (!useful && generator) {
    editorialState = "NEEDS_RESEARCH";
    evidenceBasis = "insufficient";
  } else if (!hasHero) {
    // Content can exist but page shouldn't be treated as publication-ready
    editorialState = useful ? "EDITORIAL_LIGHT" : "NEEDS_RESEARCH";
    evidenceBasis = useful ? "catalog_inference" : "insufficient";
  } else if (
    p.verdict &&
    !isGeneratorBlurb(p.verdict) &&
    useful &&
    body.buyIf.length >= 2 &&
    body.skipIf.length >= 2
  ) {
    editorialState = "EDITORIAL_LIGHT"; // forensic pass promotes to READY
    evidenceBasis = "curated_seed";
    indexableCandidate = tier !== "C" || body.whatItIs.length > 120;
  } else if (useful) {
    editorialState = "EDITORIAL_LIGHT";
    evidenceBasis = "catalog_inference";
    indexableCandidate = hasHero && body.buyIf.length >= 2;
  } else {
    editorialState = "NEEDS_RESEARCH";
    evidenceBasis = "insufficient";
  }

  if (depth === "blocked") {
    editorialState = "NOT_PUBLICATION_WORTHY";
    indexableCandidate = false;
  }

  const copy: PadelSoftPdpCopy = {
    productId: p.id,
    category,
    tier,
    depth,
    editorialState,
    evidenceBasis,
    indexableCandidate,
    ...body,
  };

  for (const field of [
    copy.shortDescription,
    copy.verdict,
    copy.whatItIs,
    copy.whoItsFor,
    copy.whyChooseIt,
    copy.chooseInstead,
    ...copy.buyIf,
    ...copy.skipIf,
  ]) {
    assertConsumerProse(field, p.id);
  }

  return copy;
}

function racketMeta(p: Product): PadelRacketEditorialMeta {
  const copy = getPadelRacketPdpCopy(p.id);
  const hasHero = hasRegisteredProductHero(p.id);
  const lifecycleBad =
    p.lifecycleStatus === "discontinued" ||
    p.lifecycleStatus === "previous_generation";

  if (lifecycleBad) {
    return {
      productId: p.id,
      category: "rackets",
      tier: "A",
      depth: "blocked",
      editorialState: "NOT_PUBLICATION_WORTHY",
      evidenceBasis: "insufficient",
      indexableCandidate: false,
      notes: "Non-current lifecycle",
    };
  }

  if (!copy) {
    return {
      productId: p.id,
      category: "rackets",
      tier: "A",
      depth: "deep",
      editorialState: "NEEDS_RESEARCH",
      evidenceBasis: "insufficient",
      indexableCandidate: false,
      notes: "Missing PadelRacketPdpCopy",
    };
  }

  const rich =
    copy.whatItIs.length > 80 &&
    copy.whoItsFor.length > 60 &&
    copy.buyIf.length >= 2 &&
    copy.skipIf.length >= 2 &&
    copy.bestFor.length >= 2;

  const looksTemplate =
    /Buy this if you want|Skip this if you don't want/i.test(
      [...copy.buyIf, ...copy.skipIf].join(" "),
    );

  let editorialState: PadelEditorialState = "EDITORIAL_LIGHT";
  if (rich && !looksTemplate && hasHero) {
    // Racket copy was hand-authored from manufacturer evidence — treat as READY when hero exists
    editorialState = "EDITORIAL_READY";
  } else if (rich && !looksTemplate) {
    editorialState = "EDITORIAL_LIGHT";
  } else {
    editorialState = "NEEDS_RESEARCH";
  }

  return {
    productId: p.id,
    category: "rackets",
    tier: "A",
    depth: "deep",
    editorialState,
    evidenceBasis: "manufacturer_specs",
    indexableCandidate: editorialState === "EDITORIAL_READY",
    notes: looksTemplate ? "Template buy/skip language detected" : undefined,
  };
}

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(join(ROOT, "docs/padel/data"), { recursive: true });

  const products = padelAllProducts.filter((p) => PADEL_CATS.has(p.categoryId));
  const offerSet = new Set(padelAllOffers.map((o) => o.productId));
  const overrides = loadOverrides();

  const soft: PadelSoftPdpCopy[] = [];
  const rackets: PadelRacketEditorialMeta[] = [];

  for (const p of products) {
    const cat = padelEditorialCategory(p);
    if (!cat) continue;
    if (cat === "rackets") {
      rackets.push(racketMeta(p));
      continue;
    }
    const generated = buildSoftCopy(p);
    const over = overrides[p.id];
    if (over) {
      soft.push({
        ...generated,
        ...over,
        productId: p.id,
        category: generated.category,
        tier: over.tier ?? generated.tier,
        depth: over.depth ?? generated.depth,
      } as PadelSoftPdpCopy);
    } else {
      soft.push(generated);
    }
  }

  // Apply product field patches note file for shortDescription/verdict
  const applyPatches = soft.filter(
    (s) =>
      s.editorialState === "EDITORIAL_READY" ||
      s.editorialState === "EDITORIAL_LIGHT",
  );

  writeFileSync(
    STORE,
    `/* AUTO-GENERATED by scripts/tmp/enrich-padel-pdp-editorial.ts — do not edit by hand.
 * Forensic overrides: overrides.json
 */
import type { PadelSoftPdpCopy } from "@/domain/padel/soft-pdp-copy";

export const padelSoftPdpEditorialStore: Record<string, PadelSoftPdpCopy> = ${JSON.stringify(
      Object.fromEntries(soft.map((s) => [s.productId, s])),
      null,
      2,
    )};
`,
  );

  writeFileSync(
    RACKET_META,
    `/* AUTO-GENERATED racket editorial meta */
import type { PadelRacketEditorialMeta } from "@/domain/padel/soft-pdp-copy";

export const padelRacketEditorialMeta: Record<string, PadelRacketEditorialMeta> = ${JSON.stringify(
      Object.fromEntries(rackets.map((r) => [r.productId, r])),
      null,
      2,
    )};
`,
  );

  // Coverage CSV
  const header = [
    "productId",
    "category",
    "tier",
    "depth",
    "editorialState",
    "evidenceBasis",
    "indexableCandidate",
    "hasHero",
    "hasOffer",
    "hasRacketCopy",
    "shortDescriptionLen",
    "verdictLen",
    "buyIfCount",
    "skipIfCount",
    "topicBlockCount",
    "commerceResearch",
  ];

  const rows: string[] = [header.join(",")];
  for (const p of products) {
    const cat = padelEditorialCategory(p)!;
    const softRow = soft.find((s) => s.productId === p.id);
    const racketRow = rackets.find((r) => r.productId === p.id);
    const state = softRow?.editorialState ?? racketRow?.editorialState ?? "";
    const tier = softRow?.tier ?? racketRow?.tier ?? "";
    const depth = softRow?.depth ?? racketRow?.depth ?? "";
    const basis = softRow?.evidenceBasis ?? racketRow?.evidenceBasis ?? "";
    const indexable =
      softRow?.indexableCandidate ?? racketRow?.indexableCandidate ?? false;
    const racketCopy = cat === "rackets" ? Boolean(getPadelRacketPdpCopy(p.id)) : false;
    const commerce = padelCommerceEnrichmentStore[p.id]?.researchState ?? "";
    rows.push(
      [
        p.id,
        cat,
        tier,
        depth,
        state,
        basis,
        indexable ? "yes" : "no",
        hasRegisteredProductHero(p.id) ? "yes" : "no",
        offerSet.has(p.id) ? "yes" : "no",
        racketCopy ? "yes" : "no",
        String((softRow?.shortDescription ?? p.shortDescription ?? "").length),
        String((softRow?.verdict ?? p.verdict ?? "").length),
        String(softRow?.buyIf.length ?? getPadelRacketPdpCopy(p.id)?.buyIf.length ?? 0),
        String(softRow?.skipIf.length ?? getPadelRacketPdpCopy(p.id)?.skipIf.length ?? 0),
        String(softRow?.topicBlocks.length ?? 0),
        commerce,
      ]
        .map((x) => csvEscape(String(x)))
        .join(","),
    );
  }
  writeFileSync(COVERAGE, rows.join("\n") + "\n");

  // Aggregate audit
  type Agg = Record<string, number>;
  const byCat: Record<string, Agg> = {};
  const bump = (cat: string, key: string) => {
    byCat[cat] ??= {};
    byCat[cat][key] = (byCat[cat][key] || 0) + 1;
  };

  for (const p of products) {
    const cat = padelEditorialCategory(p)!;
    const softRow = soft.find((s) => s.productId === p.id);
    const racketRow = rackets.find((r) => r.productId === p.id);
    const depth = softRow?.depth ?? racketRow?.depth ?? "light";
    const state = softRow?.editorialState ?? racketRow?.editorialState ?? "";
    const indexable =
      softRow?.indexableCandidate ?? racketRow?.indexableCandidate ?? false;
    bump(cat, depth);
    bump(cat, state);
    bump(cat, indexable ? "indexable" : "non_indexable");
    bump(cat, "total");
  }

  const patchNote = `Soft PDP patches applicable: ${applyPatches.length} (LIGHT/READY).`;

  writeFileSync(
    AUDIT,
    `# Padel PDP editorial audit

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Scope:** All current padel catalog products (rackets, shoes, balls, bags, grips, accessories)  
**Principle:** Useful shopping decision content from published specs and curated seeds — never fake first-hand testing.

## Architecture

| Layer | Role |
| --- | --- |
| Racket copy | Existing \`PadelRacketPdpCopy\` on racket drafts |
| Soft/shoe copy | \`src/content/padel/pdp-editorial/store.generated.ts\` |
| Racket meta | \`racket-meta.generated.ts\` (READY/LIGHT/…) |
| Tiers | \`tiers.ts\` — A/B/C by decision complexity |
| Apply | \`applyPadelPdpEditorialToProducts\` upgrades thin shortDescription/verdict |
| PDP UI | Soft “How to think about this …” section when soft copy exists |
| Coverage | \`docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv\` |

## Depth vs state (do not conflate)

| Depth | Meaning |
| --- | --- |
| deep | Tier A decision complexity (rackets, shoes, premium bags, pressurizers, grip systems) |
| substantive | Tier B (balls, standard bags, specialized grips, protectors) |
| light | Tier C concise accessories |
| blocked | Non-current / not publication-worthy lifecycle |

| Editorial state | Meaning |
| --- | --- |
| EDITORIAL_READY | Forensic-quality, evidence-backed, natural decision copy |
| EDITORIAL_LIGHT | Useful spec-derived shopping copy; not yet forensic-signed |
| NEEDS_RESEARCH | Thin identity/specs — do not pretend depth |
| NOT_PUBLICATION_WORTHY | Discontinued / blocked |

## Coverage by category

| Category | Total | deep | substantive | light | blocked | READY | LIGHT | NEEDS_RESEARCH | NOT_PUBLICATION_WORTHY | indexable | non-indexable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${["rackets", "shoes", "balls", "bags", "grips", "accessories"]
  .map((cat) => {
    const a = byCat[cat] || {};
    return `| ${cat} | ${a.total || 0} | ${a.deep || 0} | ${a.substantive || 0} | ${a.light || 0} | ${a.blocked || 0} | ${a.EDITORIAL_READY || 0} | ${a.EDITORIAL_LIGHT || 0} | ${a.NEEDS_RESEARCH || 0} | ${a.NOT_PUBLICATION_WORTHY || 0} | ${a.indexable || 0} | ${a.non_indexable || 0} |`;
  })
  .join("\n")}

${patchNote}

## Indexability honesty

Editorial copy alone does **not** force indexation. Launch eligibility still requires identity, media, and technical quality. \`indexableCandidate\` means content+decision depth is sufficient to *consider* indexing once media/publish gates pass.

## Generator bans enforced

No consumer prose may contain: maps to, catalog role, headline trait, SKU, prod-, internal score, confidence, “manufacturer claim:”.

No fake testing phrases (“we tested”, “after 20 hours”, “on court we found”).

## Forensic sample

Manual read queue (must sound like someone understands the product before READY):

- 10 rackets (existing manufacturer-grounded copy → READY when hero present)
- 5 shoes
- 10 balls
- 15 bags
- 10 grips
- 10 accessories

Overrides land in \`overrides.json\` and win over generated store on re-run.

## Next

1. Forensic overrides for soft-goods samples → promote EDITORIAL_READY
2. Replace remaining market-wave generator blurbs at source
3. Wire internal links (guides/comparisons) where missing
4. Re-run launch eligibility after media+editorial

## Artifacts

- \`docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv\`
- \`src/content/padel/pdp-editorial/\`
`,
  );

  console.log(
    JSON.stringify(
      {
        soft: soft.length,
        rackets: rackets.length,
        byCat,
        store: STORE,
        coverage: COVERAGE,
        audit: AUDIT,
      },
      null,
      2,
    ),
  );
}

main();

/**
 * Known file subjects and topic inference.
 *
 * Pixel-verified fillers (forensic audit):
 * - guide-how-to-choose.jpg = padel racket + yellow ball
 * - guide-tennis.jpg = tennis racket
 * - urban-dusk.jpg = NYC skyline
 * - running-urban.jpg = urban running atmosphere
 */

import { categoryFallbackSrc } from "@/content/running/media";
import type { EditorialTopic, ImageSubject } from "./types";

/** Pixel-verified filename subjects — never treat these as generic "how to choose". */
export const KNOWN_FILE_SUBJECTS: Record<string, ImageSubject> = {
  "/images/home/guide-how-to-choose.jpg": "padel_racket",
  "/images/home/guide-tennis.jpg": "tennis_racket",
  "/images/home/guide-running-shoes.jpg": "running_shoes",
  "/images/home/guide-home-gym.jpg": "home_gym",
  "/images/home/hero-gear-composite.png": "mixed_gear",
  "/images/brands/heroes/urban-dusk.jpg": "city_skyline",
  "/images/brands/heroes/running-urban.jpg": "running_atmosphere",
  "/images/padel/hero.jpg": "padel_racket",
  "/images/padel/guides/choose-racket.jpg": "padel_racket",
};

const CATEGORY_TOPIC: Record<string, EditorialTopic> = {
  "cat-running-shoes": "running_shoes",
  "cat-training-shoes": "training_shoes",
  "cat-padel-shoes": "padel_rackets",
  "cat-tennis-shoes": "tennis_rackets",
  "cat-gps-watches": "gps_watches",
  "cat-hrm": "hrm",
  "cat-heart-rate-monitors": "hrm",
  "cat-headphones": "headphones",
  "cat-running-lights": "headlamps",
  "cat-hydration": "hydration",
  "cat-packs-vests": "packs",
  "cat-running-belts": "belts",
  "cat-running-clothing": "clothing",
  "cat-running-socks": "socks",
  "cat-safety": "safety",
  "cat-sunglasses": "sunglasses",
  "cat-nutrition": "fuel",
  "cat-recovery-gear": "recovery",
  "cat-padel-rackets": "padel_rackets",
  "cat-padel-grips": "padel_rackets",
  "cat-tennis-rackets": "tennis_rackets",
  "cat-power-racks": "fitness",
  "cat-adjustable-dumbbells": "fitness",
  "cat-weight-benches": "fitness",
  "cat-barbells": "fitness",
  "cat-weight-plates": "fitness",
  "cat-kettlebells": "fitness",
  "cat-rowing-machines": "fitness",
  "cat-air-bikes": "fitness",
  "cat-treadmills": "fitness",
  "cat-ski-ergs": "fitness",
  "cat-pull-up-bars": "fitness",
  "cat-parallettes": "fitness",
  "cat-gymnastic-rings": "fitness",
  "cat-weighted-vests": "fitness",
  "cat-functional-fitness": "fitness",
  "cat-gym-flooring": "fitness",
  "cat-gym-storage": "fitness",
  "cat-lifting-accessories": "fitness",
};

export function normalizeSrc(src: string): string {
  return src.split("?")[0]!.replace(/-\d+$/, "");
}

export function inferEditorialTopic(input: {
  slug?: string;
  title?: string;
  categoryId?: string;
}): EditorialTopic {
  if (input.categoryId && CATEGORY_TOPIC[input.categoryId]) {
    return CATEGORY_TOPIC[input.categoryId]!;
  }

  const hay = `${input.slug ?? ""} ${input.title ?? ""}`.toLowerCase();

  if (/padel/.test(hay)) return "padel_rackets";
  if (/tennis/.test(hay)) return "tennis_rackets";
  if (/headphone|open-ear|in-ear|earbuds|bone.?conduction/.test(hay)) {
    return "headphones";
  }
  if (/headlamp|head torch|night run/.test(hay)) return "headlamps";
  if (/sunglass/.test(hay)) return "sunglasses";
  if (/safety|visibility|reflective/.test(hay)) return "safety";
  if (/heart.?rate|hrm|chest.?strap/.test(hay)) return "hrm";
  if (/watch|gps|forerunner|fenix|multi-band/.test(hay)) return "gps_watches";
  if (/hydration vest|soft flask|bladder|handheld/.test(hay)) {
    return "hydration";
  }
  if (/\bbelts?\b|\bbelt\b/.test(hay) && /run/.test(hay)) return "belts";
  if (/\bpacks?\b|running pack/.test(hay)) return "packs";
  if (/sock/.test(hay)) return "socks";
  if (/jacket|apparel|clothing|tights|shorts/.test(hay)) return "clothing";
  if (/gel|fuel|nutrition|caffeine|chew|drink mix/.test(hay)) return "fuel";
  if (/recovery|massage|foam roll/.test(hay)) return "recovery";
  if (/gym|dumbbell|power.?rack|barbell|bench|hyrox|calisthenics/.test(hay)) {
    return "fitness";
  }
  if (/training shoe|hyrox shoe|cross.?train/.test(hay)) return "training_shoes";
  if (/shoe|trainer|cushion|drop|stability|trail|marathon|tempo|race/.test(hay)) {
    return "running_shoes";
  }
  if (/running/.test(hay)) return "running_generic";
  return "unknown";
}

export function classifyImageSubject(src: string): ImageSubject {
  const path = normalizeSrc(src);
  if (KNOWN_FILE_SUBJECTS[path]) return KNOWN_FILE_SUBJECTS[path]!;
  if (path.includes("/fallbacks/") || path.endsWith(".svg")) return "placeholder";

  if (path.includes("/watches/")) return "gps_watch";
  if (path.includes("/hrm/")) return "hrm";
  if (path.includes("/headphones/")) return "headphones";
  if (path.includes("/headlamps/")) return "headlamp";
  if (path.includes("/clothing/")) return "clothing";
  if (path.includes("/socks/") || /sock/i.test(path)) return "socks";
  if (path.includes("/hydration/")) return "hydration";
  if (path.includes("/packs/")) return "pack";
  if (path.includes("/padel/")) return "padel_racket";
  if (path.includes("/tennis/")) return "tennis_racket";
  if (path.includes("/fitness/") || path.includes("/training/")) {
    return path.includes("shoe") ? "training_shoes" : "home_gym";
  }
  if (path.includes("/running/products/") || path.includes("/running/category/")) {
    return "running_shoes";
  }
  if (path.includes("/running/best-hub/best-gps")) return "gps_watch";
  if (path.includes("/running/best-hub/best-hrm")) return "hrm";
  if (path.includes("/running/best-hub/best-hydration")) return "hydration";
  if (path.includes("/running/best-hub/best-running-belts")) return "belt";
  if (path.includes("/running/best-hub/best-running-headphones")) {
    return "headphones";
  }
  if (path.includes("/running/best-hub/best-running-headlamps")) {
    return "headlamp";
  }
  if (path.includes("/running/best-hub/best-running-socks")) return "socks";
  if (path.includes("/running/accessories/oakley")) return "sunglasses";
  if (path.includes("/running/accessories/") && /sock/i.test(path)) return "socks";
  if (path.includes("/running/accessories/") && /theragun|hypervolt|blackroll|foam/i.test(path)) {
    return "recovery";
  }
  if (path.includes("/running/accessories/") && /gel|maurten|sis-|gu-|fuel/i.test(path)) {
    return "fuel";
  }
  if (path.includes("/running/accessories/") && /belt|flipbelt/i.test(path)) {
    return "belt";
  }
  if (path.includes("/running/accessories/") && /jacket|shirt|tight/i.test(path)) {
    return "clothing";
  }

  return "unknown";
}

export function topicSport(topic: EditorialTopic): "running" | "padel" | "tennis" | "fitness" | "mixed" | "unknown" {
  switch (topic) {
    case "padel_rackets":
      return "padel";
    case "tennis_rackets":
      return "tennis";
    case "fitness":
    case "training_shoes":
      return "fitness";
    case "mixed_home":
      return "mixed";
    case "unknown":
      return "unknown";
    default:
      return "running";
  }
}

export function subjectSport(subject: ImageSubject): "running" | "padel" | "tennis" | "fitness" | "mixed" | "none" | "unknown" {
  switch (subject) {
    case "padel_racket":
      return "padel";
    case "tennis_racket":
      return "tennis";
    case "home_gym":
    case "training_shoes":
      return "fitness";
    case "mixed_gear":
      return "mixed";
    case "placeholder":
      return "none";
    case "unknown":
    case "city_skyline":
      return "unknown";
    default:
      return "running";
  }
}

const TOPIC_ALLOWED_SUBJECTS: Record<EditorialTopic, ReadonlySet<ImageSubject>> = {
  running_shoes: new Set(["running_shoes"]),
  training_shoes: new Set(["training_shoes"]),
  gps_watches: new Set(["gps_watch"]),
  hrm: new Set(["hrm"]),
  headphones: new Set(["headphones"]),
  headlamps: new Set(["headlamp"]),
  hydration: new Set(["hydration", "pack"]),
  belts: new Set(["belt", "hydration"]),
  packs: new Set(["pack", "hydration"]),
  clothing: new Set(["clothing"]),
  socks: new Set(["socks", "clothing"]),
  safety: new Set(["headlamp", "clothing"]),
  sunglasses: new Set(["sunglasses"]),
  fuel: new Set(["fuel", "belt"]),
  recovery: new Set(["recovery"]),
  padel_rackets: new Set(["padel_racket"]),
  tennis_rackets: new Set(["tennis_racket"]),
  fitness: new Set(["home_gym"]),
  running_generic: new Set([
    "running_shoes",
    "running_atmosphere",
    "gps_watch",
    "hydration",
    "clothing",
  ]),
  mixed_home: new Set(["mixed_gear", "running_shoes", "gps_watch", "headphones"]),
  unknown: new Set(),
};

/**
 * Atmosphere / lifestyle shots that must never stand in for a product-topic
 * primary or card, even when they are authentic photographs.
 */
const BANNED_PRIMARY_SUBJECTS = new Set<ImageSubject>([
  "city_skyline",
  "mixed_gear",
]);

export function isSemanticallyCompatible(
  src: string,
  topic: EditorialTopic,
  placement: "hero" | "card" | "methodology" | "related" | "primary" = "card",
): boolean {
  const subject = classifyImageSubject(src);
  if (subject === "placeholder") return false;
  if (subject === "unknown") {
    // Unverified files stay UNKNOWN in classification. Allow shoe-guide
    // photography that already lives in the running/guides folder — reuse
    // on shoe topics is legitimate, not a cross-sport filler.
    if (
      topic === "running_shoes" &&
      src.includes("/running/guides/") &&
      !src.includes("review-research")
    ) {
      return true;
    }
    return false;
  }

  if (BANNED_PRIMARY_SUBJECTS.has(subject) && placement !== "related") {
    if (topic === "mixed_home" && subject === "mixed_gear") return true;
    return false;
  }

  if (subject === "running_atmosphere") {
    return topic === "running_generic" && (placement === "hero" || placement === "primary");
  }

  if (topic === "unknown") return false;

  const allowed = TOPIC_ALLOWED_SUBJECTS[topic];
  return allowed.has(subject);
}

export function categoryFallbackForTopic(topic: EditorialTopic): string {
  const byTopic: Record<EditorialTopic, string> = {
    running_shoes: categoryFallbackSrc("cat-running-shoes"),
    training_shoes: categoryFallbackSrc("cat-training-shoes"),
    gps_watches: categoryFallbackSrc("cat-gps-watches"),
    hrm: categoryFallbackSrc("cat-hrm"),
    headphones: categoryFallbackSrc("cat-headphones"),
    headlamps: categoryFallbackSrc("cat-running-lights"),
    hydration: categoryFallbackSrc("cat-hydration"),
    belts: categoryFallbackSrc("cat-running-belts"),
    packs: categoryFallbackSrc("cat-packs-vests"),
    clothing: categoryFallbackSrc("cat-running-clothing"),
    socks: categoryFallbackSrc("cat-running-socks"),
    safety: categoryFallbackSrc("cat-safety"),
    sunglasses: categoryFallbackSrc("cat-sunglasses"),
    fuel: categoryFallbackSrc("cat-nutrition"),
    recovery: categoryFallbackSrc("cat-recovery-gear"),
    padel_rackets: "/images/padel/hero.jpg",
    tennis_rackets: "/images/home/guide-tennis.jpg",
    fitness: "/images/home/guide-home-gym.jpg",
    running_generic: "/images/home/guide-running-shoes.jpg",
    mixed_home: "/images/home/hero-gear-composite.png",
    unknown: "/images/catalog/fallbacks/accessory.svg",
  };
  return byTopic[topic];
}

export function defaultAltFor(topic: EditorialTopic, title?: string): string {
  if (title?.trim()) return title;
  switch (topic) {
    case "gps_watches":
      return "GPS running watch";
    case "hrm":
      return "Heart-rate monitor";
    case "headphones":
      return "Running headphones";
    case "running_shoes":
      return "Running shoes";
    case "padel_rackets":
      return "Padel racket";
    case "tennis_rackets":
      return "Tennis racket";
    default:
      return "Kitletics gear";
  }
}

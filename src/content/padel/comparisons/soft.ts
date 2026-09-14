import type { Comparison } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  biggestDiff,
  choose,
  dim,
  keyDiff,
} from "@/content/padel/comparisons/build";

const pub = publishedMeta();

const PRO_S = "prod-head-padel-pro-s";
const PRO_PLUS = "prod-head-padel-pro-plus";
const PREMIER = "prod-wilson-padel-premier";
const PREMIER_SPEED = "prod-wilson-padel-premier-speed";
const WILSON_OG = "prod-wilson-overgrip";
const HAC = "prod-bullpadel-gb1200";
const AT10 = "prod-nox-at10-team-bag";
const RH_PRO = "prod-babolat-rh-pro-padel";
const PASCAL = "prod-bullpadel-pascal-box";
const X3 = "prod-head-x3-pressurizer";
const TOUR_BP = "prod-tecnifibre-tour-endurance-backpack";
const XXL = "prod-nox-at10-xxl-bag";
const KUIKMA_SPEED = "prod-kuikma-pb-speed";
const BP_PROT = "prod-bullpadel-frame-protector";
const NOX_PROT = "prod-nox-frame-protector";

function softCmp(
  partial: Omit<
    Comparison,
    | "status"
    | "publishedAt"
    | "lastUpdatedAt"
    | "lastVerifiedAt"
    | "comparisonType"
    | "faqIds"
    | "createdAt"
    | "updatedAt"
  > &
    Partial<Pick<Comparison, "comparisonType" | "faqIds">>,
): Comparison {
  return {
    comparisonType: "editorial",
    faqIds: [],
    ...pub,
    ...partial,
  };
}

/** Soft-goods comparisons — only pairs with distinct shopper jobs. */
export const padelSoftComparisons: Comparison[] = [
  softCmp({
    id: "cmp-head-pro-s-vs-pro-plus",
    slug: "head-padel-pro-s-vs-pro-plus",
    title: "HEAD Padel Pro S+ vs Pro+",
    shortDescription:
      "Same-brand competition cans: faster Pro S+ versus control-first Pro+.",
    productIds: [PRO_S, PRO_PLUS],
    categoryId: "cat-padel-balls",
    summary:
      "Pro S+ and Pro+ are the current HEAD competition pair. Pro S+ uses a thicker natural-rubber core for faster pace; Pro+ uses a thinner synthetic core positioned for control and pressure retention. Neither is universally better — pick by court speed and how long you want the ball to sit.",
    verdict:
      "Choose Pro S+ when the court is slow and you want pace through the glass. Choose Pro+ when you want the ball to sit longer for control-first match play.",
    criteria: [
      dim("feel", PRO_S, "Pro S+ plays the livelier HEAD competition personality."),
      dim("control", PRO_PLUS, "Pro+ is the control-oriented sibling."),
      dim("power", PRO_S, "Faster bounce / pace positioning on Pro S+."),
      dim("price", undefined, "Live single-can offers decide — compare per can and per ball."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "pace vs sit",
        { productId: PRO_S, impact: "Faster match pace" },
        { productId: PRO_PLUS, impact: "Longer sit / control" },
        "This is a speed/control fork inside one brand — not a quality ranking.",
      ),
      keyDiff(
        "core",
        "Core construction",
        { productId: PRO_S, impact: "Thicker natural rubber" },
        { productId: PRO_PLUS, impact: "Thinner synthetic rubber" },
        "Manufacturer core stories explain the pace personalities.",
      ),
    ],
    chooseProductReasons: [
      choose(PRO_S, "Cold or slow courts where you want the ball to stay lively."),
      choose(PRO_PLUS, "You already find Pro S+ too hot and want more control."),
    ],
  }),
  softCmp({
    id: "cmp-wilson-premier-vs-speed",
    slug: "wilson-premier-vs-premier-padel-speed",
    title: "Wilson Premier vs Premier Padel Speed",
    shortDescription:
      "Wilson’s standard Premier can versus the cold/slow-court Speed can.",
    productIds: [PREMIER, PREMIER_SPEED],
    categoryId: "cat-padel-balls",
    summary:
      "Premier is the standard Wilson competition can. Premier Padel Speed adds Dura-Wave felt and a faster core positioned for slower courts, cold climates, and lower altitudes. Speed is not a universal upgrade over standard Premier.",
    verdict:
      "Choose Premier Speed for cold Dutch evenings and dead-slow glass. Choose standard Premier when the court already plays fast or you want a calmer Wilson match can.",
    criteria: [
      dim("feel", PREMIER_SPEED, "Speed is the livelier Wilson Premier personality."),
      dim("control", PREMIER, "Standard Premier is the calmer sibling."),
      dim("price", undefined, "Live offers decide — both are single-can EU listings."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "condition fit",
        { productId: PREMIER_SPEED, impact: "Cold / slow-court pace" },
        { productId: PREMIER, impact: "Standard match pace" },
        "Manufacturer condition guidance is the decision — not a quality score.",
      ),
    ],
    chooseProductReasons: [
      choose(PREMIER_SPEED, "Slow courts, cold nights, altitude below ~600 m."),
      choose(PREMIER, "Standard club pace or already-fast outdoor courts."),
    ],
  }),
  softCmp({
    id: "cmp-wilson-vs-hac-overgrip",
    slug: "wilson-pro-vs-bullpadel-hac-overgrip",
    title: "Wilson Pro vs Bullpadel HaC Overgrip",
    shortDescription:
      "Thin tack default versus absorption-first padel overgrip.",
    productIds: [WILSON_OG, HAC],
    categoryId: "cat-padel-grips",
    summary:
      "Wilson Pro is the thin, lightly tacky padel-length default wrap. Bullpadel HaC prioritises absorption when sweat kills tack. They are different jobs — not interchangeable with Hesacore cushion systems or replacement grips.",
    verdict:
      "Start with Wilson Pro for feel and tack. Switch to HaC when humidity turns Wilson slippery mid-set.",
    criteria: [
      dim("feel", WILSON_OG, "Thin tack / feel-first wrap."),
      dim("comfort", HAC, "Absorption-first when moisture is the problem."),
      dim("price", undefined, "Both are 3-packs — compare cost per wrap."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "tack vs absorption",
        { productId: WILSON_OG, impact: "Thin tack default" },
        { productId: HAC, impact: "Absorption when sweaty" },
        "Pick by hand moisture, not brand loyalty.",
      ),
    ],
    chooseProductReasons: [
      choose(WILSON_OG, "You want a thin tacky default wrap."),
      choose(HAC, "Wilson feels like soap mid-set and you need absorption."),
    ],
  }),
  softCmp({
    id: "cmp-at10-team-vs-rh-pro",
    slug: "nox-at10-team-vs-babolat-rh-pro",
    title: "Nox AT10 Team vs Babolat RH Pro",
    shortDescription:
      "42 L club thermo paletero versus 62 L tournament volume bag.",
    productIds: [AT10, RH_PRO],
    categoryId: "cat-padel-bags",
    summary:
      "AT10 Team is the published 42 L club paletero with ThermoTech and a shoe slot. RH Pro is the 62 L / four-racket tournament bag. Bigger is not better for a bike commute or a one-racket club night.",
    verdict:
      "Choose AT10 Team for weekly club nights. Choose RH Pro when you pack multiple frames for a tournament weekend.",
    criteria: [
      dim("comfort", AT10, "Lighter daily carry for club nights."),
      dim("stability", RH_PRO, "More volume for weekend kit."),
      dim("price", undefined, "Live offers decide."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "club vs tournament volume",
        { productId: AT10, impact: "42 L club thermo" },
        { productId: RH_PRO, impact: "62 L / 4-racket tournament" },
        "Carry job first — do not buy RH Pro for two rackets because it is larger.",
      ),
    ],
    chooseProductReasons: [
      choose(AT10, "One or two frames, shoes, and thermo for club night."),
      choose(RH_PRO, "Tournament weekend volume and four-racket capacity."),
    ],
  }),
  softCmp({
    id: "cmp-pascal-box-vs-head-x3",
    slug: "bullpadel-pascal-box-vs-head-x3",
    title: "Pascal Box 3B vs HEAD X3 Pressurizer",
    shortDescription:
      "Manometer-regulated Pascal Box versus compact HEAD X3 pump canister.",
    productIds: [PASCAL, X3],
    categoryId: "cat-padel-accessories",
    summary:
      "Both are manual 3-ball pressurizers. Pascal Box emphasises a precision manometer and hermetic cup. HEAD X3 is the more compact travel canister. Neither restores shredded felt — they maintain chamber pressure between sessions for frequent players.",
    verdict:
      "Choose Pascal Box when you want regulated manometer control at home. Choose X3 when portability matters more than gauge precision.",
    criteria: [
      dim("feel", PASCAL, "Manometer regulation is the clearer control story."),
      dim("maneuverability", X3, "More compact travel form."),
      dim("price", undefined, "Live offers decide — economics only for frequent players."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "regulation vs portability",
        { productId: PASCAL, impact: "Manometer + hermetic cup" },
        { productId: X3, impact: "Compact travel canister" },
        "Same job class — pick by home regulation vs packability.",
      ),
    ],
    chooseProductReasons: [
      choose(PASCAL, "You open multiple cans weekly and want regulated pressure at home."),
      choose(X3, "You want a lighter pressurizer to travel with."),
    ],
  }),
  softCmp({
    id: "cmp-tour-endurance-vs-at10-team",
    slug: "tecnifibre-tour-endurance-vs-nox-at10-team",
    title: "Tecnifibre Tour Endurance Backpack vs Nox AT10 Team",
    shortDescription:
      "Commute backpack with shoe well versus 42 L club thermo paletero.",
    productIds: [TOUR_BP, AT10],
    categoryId: "cat-padel-bags",
    summary:
      "Tour Endurance is a hands-free day backpack for desk-to-court and bike commutes. AT10 Team is the published ~42 L ThermoTech club paletero. Same sport, different carry jobs — backpacks are not automatically “smaller paleteros.”",
    verdict:
      "Choose Tour Endurance when hands-free commute leads. Choose AT10 Team when thermo organisation and club shoe/racket tunnels matter more than backpack form.",
    criteria: [
      dim("maneuverability", TOUR_BP, "Hands-free backpack commute form."),
      dim("comfort", AT10, "Thermo racket organisation for club nights."),
      dim("price", undefined, "Live offers decide."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "commute backpack vs club paletero",
        { productId: TOUR_BP, impact: "Hands-free day pack + shoe well" },
        { productId: AT10, impact: "42 L thermo club paletero" },
        "Pick by commute vs club thermo — not by which logo is louder.",
      ),
    ],
    chooseProductReasons: [
      choose(TOUR_BP, "Bike, tram, or desk-to-court days with one or two frames."),
      choose(AT10, "Weekly club nights where thermo tunnels and shoe slots matter."),
    ],
  }),
  softCmp({
    id: "cmp-rh-pro-vs-at10-xxl",
    slug: "babolat-rh-pro-vs-nox-at10-xxl",
    title: "Babolat RH Pro vs Nox AT10 XXL",
    shortDescription:
      "62 L tournament bag versus 90 L AT10 XXL travel volume.",
    productIds: [RH_PRO, XXL],
    categoryId: "cat-padel-bags",
    summary:
      "RH Pro is the published ~62 L / four-racket tournament bag. AT10 XXL steps to ~90 L / five-racket travel volume with ThermoTech. Bigger is not automatically better — XXL wins when you pack a weekend cavern; RH Pro wins when 62 L already covers the draw.",
    verdict:
      "Choose RH Pro for typical tournament weekends. Choose AT10 XXL when you routinely overflow 62 L with frames, shoes, and kit.",
    criteria: [
      dim("stability", XXL, "More published litre / racket capacity."),
      dim("comfort", RH_PRO, "Lighter empty volume for most draws."),
      dim("price", undefined, "Live offers decide."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "62 L vs 90 L tournament volume",
        { productId: RH_PRO, impact: "~62 L / 4-racket class" },
        { productId: XXL, impact: "~90 L / 5-racket ThermoTech" },
        "Volume job first — do not buy XXL because the number is larger.",
      ),
    ],
    chooseProductReasons: [
      choose(RH_PRO, "Tournament weekends that fit in ~62 L."),
      choose(XXL, "You already overflow RH Pro with multi-racket travel kit."),
    ],
  }),
  softCmp({
    id: "cmp-kuikma-speed-vs-head-pro-s",
    slug: "kuikma-pb-speed-vs-head-padel-pro-s",
    title: "Kuikma PB Speed vs HEAD Padel Pro S",
    shortDescription:
      "Value FIP fast can versus HEAD’s faster competition reference.",
    productIds: [KUIKMA_SPEED, PRO_S],
    categoryId: "cat-padel-balls",
    summary:
      "Both are speed-oriented pressurized competition cans. HEAD Pro S is the widely recognised club/match reference; Kuikma PB Speed is the value FIP fast can. This is a price-and-availability fork inside the fast-ball job — not a quality ladder.",
    verdict:
      "Choose HEAD Pro S when your club standard or feel preference is HEAD. Choose Kuikma PB Speed when you want a cheaper fast competition can for practice crates or value match play.",
    criteria: [
      dim("feel", PRO_S, "HEAD competition reference feel for many clubs."),
      dim("price", KUIKMA_SPEED, "Value fast-can economics."),
      dim("power", undefined, "Both speed-positioned — no invented pace crown."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "reference HEAD vs value Kuikma fast can",
        { productId: PRO_S, impact: "HEAD Pro S club/match reference" },
        { productId: KUIKMA_SPEED, impact: "Value FIP fast can" },
        "Same fast-ball job class — pick by club mandate, feel preference, and can price.",
      ),
    ],
    chooseProductReasons: [
      choose(PRO_S, "Your league or partners expect HEAD competition cans."),
      choose(KUIKMA_SPEED, "You want pressurized fast cans without HEAD pricing."),
    ],
  }),
  softCmp({
    id: "cmp-bullpadel-vs-nox-protector",
    slug: "bullpadel-vs-nox-frame-protector",
    title: "Bullpadel vs Nox Frame Protector",
    shortDescription:
      "Coloured 3-pack rim tape versus transparent Nox protection tape.",
    productIds: [BP_PROT, NOX_PROT],
    categoryId: "cat-padel-accessories",
    summary:
      "Both are adhesive frame protectors for glass/mesh scrapes. Bullpadel’s black 3-pack emphasises spares; Nox transparent stays discrete on light faces. Neither changes foam power — both add a little tip mass.",
    verdict:
      "Choose Bullpadel when you want coloured tape and spare strips. Choose Nox when you want a transparent finish on a light face.",
    criteria: [
      dim("feel", undefined, "Both add slight tip mass — no feel crown."),
      dim("price", undefined, "Compare pack quantity vs single strips on live offers."),
      dim("comfort", NOX_PROT, "Transparent finish when cosmetics matter."),
    ],
    recommendationsByUseCase: [],
    keyDifferences: [
      biggestDiff(
        "coloured 3-pack vs transparent finish",
        { productId: BP_PROT, impact: "Coloured 3-pack spares" },
        { productId: NOX_PROT, impact: "Transparent discrete tape" },
        "Same protection job — cosmetics and pack count decide.",
      ),
    ],
    chooseProductReasons: [
      choose(BP_PROT, "You want black tape and a 3-pack of spares."),
      choose(NOX_PROT, "You want transparent protection on a light racket face."),
    ],
  }),
];

/**
 * Generates padel knowledge-center BuyingGuides + explainer unique copy/plans.
 * Run: node scripts/tmp/generate-padel-knowledge-center.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");

/** @typedef {{
 *  id: string;
 *  slug: string;
 *  title: string;
 *  guideType: "buying"|"explainer"|"comparison"|"setup"|"decision"|"technical";
 *  categoryId: string;
 *  subject: string;
 *  outcome: string;
 *  factors: string[];
 *  comparison: [string, string];
 *  products: string[];
 *  tool?: string;
 *  bestHref: string;
 *  browseHref: string;
 *  relatedBest: string[];
 *  relatedGuides: string[];
 *  relatedCompare?: string[];
 *  relatedTools?: string[];
 *  relatedUseCases?: string[];
 *  quickAnswer: string;
 *  sections: {id:string;heading:string;body:string}[];
 *  unique: any;
 *  startHere?: boolean;
 *  featured?: boolean;
 *  priority?: number;
 * }} GuideDef
 */

const racketGuides = [
  "guide-choose-padel-racket",
  "guide-padel-racket-shapes",
  "guide-round-vs-teardrop-vs-diamond",
  "guide-padel-racket-balance",
  "guide-padel-racket-weight",
  "guide-padel-racket-materials",
  "guide-carbon-vs-fiberglass-padel",
  "guide-padel-racket-cores-eva",
  "guide-soft-vs-hard-padel-rackets",
  "guide-padel-racket-sweet-spots",
];
const shoeGuides = [
  "guide-choose-padel-shoes",
  "guide-padel-vs-tennis-shoes",
  "guide-padel-shoe-outsoles",
];
const accessoryGuides = [
  "guide-how-long-padel-balls-last",
  "guide-choose-padel-balls",
  "guide-choose-padel-bag",
  "guide-padel-grips",
  "guide-padel-grip-vs-overgrip",
  "guide-how-often-replace-padel-overgrip",
];
const beginnerGuides = [
  "guide-beginner-padel-gear",
  "guide-complete-padel-gear-checklist",
];

function peers(id, clusters) {
  for (const c of clusters) {
    if (c.includes(id)) return c.filter((x) => x !== id).slice(0, 6);
  }
  return [];
}

const clusters = [racketGuides, shoeGuides, accessoryGuides, beginnerGuides];

/** @type {GuideDef[]} */
const GUIDES = [];

function u(partial) {
  return partial;
}

function add(def) {
  def.relatedGuides = peers(def.id, clusters);
  GUIDES.push(def);
}

add({
  id: "guide-choose-padel-racket",
  slug: "how-to-choose-a-padel-racket",
  title: "How to Choose a Padel Racket",
  guideType: "buying",
  categoryId: "cat-padel-rackets",
  subject: "a padel racket",
  outcome: "match forgiveness, handling and power to your current level and playing style",
  factors: ["Player level", "Shape and sweet spot", "Weight and balance", "Core and face feel", "Playing style", "Budget"],
  comparison: ["Forgiving control frame", "Power-focused frame"],
  products: ["prod-bullpadel-indiga-ctr", "prod-nox-ml10-pro-cup", "prod-bullpadel-vertex-05", "prod-bullpadel-hack-04"],
  tool: "padel-racket-finder",
  bestHref: "/best/padel-rackets",
  browseHref: "/padel/gear?category=padel-rackets",
  relatedBest: ["best-padel-rackets", "best-padel-rackets-beginners", "best-padel-rackets-control", "best-padel-rackets-power", "best-padel-rackets-all-round"],
  relatedCompare: ["cmp-vertex05-vs-hack04", "cmp-vertex05-vs-at10-12k"],
  relatedTools: ["padel-racket-finder"],
  relatedUseCases: ["uc-padel-beginner", "uc-padel-control", "uc-padel-balanced", "uc-padel-power"],
  startHere: true,
  featured: true,
  priority: 10,
  quickAnswer:
    "Start with your level and whether you need control, balance, or power — then filter by shape, weight, and balance. Carbon K-count alone is not a quality ranking.",
  sections: [
    { id: "s-quick", heading: "Clear answer", body: "Beginners usually win more points with a lighter, forgiving round or soft teardrop (Indiga CTR, Comfort Soft class) than with a stiff diamond. Intermediates can move toward hybrid/teardrop all-court frames (Vertex Hybrid, AT10 Genius). Advanced attackers can justify Hack 04 / Metalbone 3.5 / Attack diamonds only when preparation already supports head weight." },
    { id: "s-why", heading: "Why it matters", body: "Padel points are decided by repeated on-time contact at the glass and net. A frame that matches today’s timing compounds faster than a pro smash tool that punishes late preparation." },
    { id: "s-level", heading: "Decision framework: level first", body: "Level is the strongest filter. If bandejas still spray, stay round/soft. If you place viboras under fatigue, open hybrid/all-round. If you already generate racket-head speed and finish overheads cleanly, then evaluate power molds." },
    { id: "s-shape", heading: "Shape, weight, balance, core", body: "Round → centred sweet spot. Teardrop/hybrid → middle ground. Diamond → higher sweet spot and power potential. Pair shape with published weight ranges (~350–380 g adult band) and low vs high balance. Soft EVA forgives; harder EVA returns energy more abruptly." },
    { id: "s-examples", heading: "Catalog examples", body: "Beginner/control: Bullpadel Indiga CTR, Nox ML10 Pro Cup, Equation Soft. All-round: Vertex 05 / Vertex 05 Hybrid, AT10 Genius 12K. Power: Hack 04, Metalbone 3.5, Technical Viper, Coello Pro, AT10 Attack 18K. Do not treat Genius 12K as Attack or Metalbone 3.3 as current." },
    { id: "s-tradeoffs", heading: "Trade-offs", body: "Forgiveness trades peak smash authority. Head-heavy power trades recovery speed between balls. Stiff carbon faces can feel lively and less kind on mishits." },
    { id: "s-mistakes", heading: "Common mistakes", body: "Buying a pro’s diamond as a beginner; treating 12K/18K as a quality ladder; ignoring weight ranges; assuming shape equals balance; attaching previous-gen listings (Vertex 04, Hack 03, Metalbone 3.3) as current awards." },
    { id: "s-next", heading: "What to do next", body: "Run the Padel Racket Finder for an explainable shortlist, then open Best Padel Rackets (or beginners / control / power) and compare Vertex 05 vs Hack 04 when you are deciding all-court vs attack." },
  ],
  unique: u({
    deck: "Match padel frame shape, balance and face response to your level — forgiveness first, smash power second.",
    quickAnswerBullets: [
      "Round/soft frames usually forgive developing contact better than stiff diamonds.",
      "Weight and balance decide whether you can prepare the bandeja on time.",
      "Carbon K-count is not a quality ladder — core and mass distribution matter more.",
      "Demo when you can; buy the frame you can place repeatedly, not the pro’s smash tool.",
    ],
    definitionTitle: "What a padel racket decision really is",
    definitionIntro: "You are matching geometry and response to how you already play — not copying a World Padel Tour bag.",
    definitionParas: [
      "A padel racket is a foam-cored face with a shape (round, hybrid, diamond) that moves the sweet spot and balance. Glass and carbon faces change how the ball leaves the racket, but they do not create technique.",
      "Beginners and intermediates usually lose more points to late preparation and off-centre hits than to a lack of peak smash speed. That is why accessible handling often beats a stiff attacking diamond early.",
      "Treat catalog examples as role illustrations. Confirm the exact model generation, weight range and whether you can return or demo before locking in.",
    ],
    whyTitle: "Why forgiveness usually compounds faster",
    whyParas: [
      "Points are won with repeated, on-time contact at the glass and net. A frame you can position under fatigue supports better decisions than one that only rewards perfect timing.",
      "Overgrips, shoe grip and foam faces still interact. Judge the racket as part of the court system you actually play with — not as an isolated lab object.",
    ],
    factorWhat: [
      "Current consistency and how often you miss the sweet zone.",
      "Round vs hybrid vs diamond sweet-spot placement.",
      "Static weight and head-light vs head-heavy feel.",
      "Soft vs firm core/face response on blocks and viboras.",
      "Attacking vs counterpunch preferences.",
      "Street price versus a frame you will actually use twice a week.",
    ],
    factorChanges: [
      "Improving players can graduate shapes; jumping early often stalls confidence.",
      "Higher sweet spots reward attacking play but punish late preparation.",
      "Heavier or head-heavy frames stabilise pace but slow recovery between balls.",
      "Firmer faces can feel lively and less kind on mishits.",
      "Style should follow your real point patterns, not Instagram highlights.",
      "Budget matters after the role is clear — not before.",
    ],
    factorNotices: [
      "Whether you still trust the frame after a long third set.",
      "How often mishits still produce a usable ball.",
      "Arm fatigue on the non-dominant shoulder after overheads.",
      "Comfort on soft blocks at the glass.",
      "Whether you default to defence or finishers in matches.",
      "Whether price anxiety makes you overprotect a fragile choice.",
    ],
    comparisonRows: [
      { label: "Sweet spot", values: ["Lower/centred, more margin", "Higher, more finishing reward", "Your mishit rate this month"] },
      { label: "Preparation", values: ["Easier to get into position", "Needs earlier footwork", "Your average recovery time"] },
      { label: "Best stage", values: ["Learning & consolidating", "Clear attacking identity", "The problem you must solve now"] },
    ],
    tradeoffs: {
      gains: ["More usable mishits", "Faster preparation", "Confidence under pressure", "A frame matched to today"],
      giveUps: ["Some peak smash authority", "Pro-style diamond prestige", "Ultra-stiff face feedback", "The urge to copy a sponsor bag"],
      footnote: "Progression can justify a more demanding frame later — not on day one.",
    },
    callout: {
      title: "Carbon count is not a ranking",
      body: "12K or 18K labels do not form a universal quality ladder. Shape, core, balance and the player determine the ball. Treat material claims as one input among many.",
    },
    decisionSteps: [
      { id: "level", title: "Honest level filter", body: "If you still spray bandejas, start round/hybrid before diamond power frames." },
      { id: "problem", title: "Name the recurring miss", body: "Late preparation, soft finishing, or arm fatigue each point to different shapes." },
      { id: "weight", title: "Set a weight window", body: "Define a wearable range before comparing carbon marketing." },
      { id: "shortlist", title: "Shortlist two roles", body: "Keep one forgiving control frame and one more attacking option only if technique supports it." },
      { id: "demo", title: "Demo decisive balls", body: "Test blocks, viboras and overheads — not only open-court winners." },
      { id: "buy", title: "Buy the repeatable one", body: "Choose the frame you place under fatigue, then check live offers." },
    ],
    branchQuestion: "What is the main problem in your matches right now?",
    branchOptions: [
      { label: "Mishits and late preparation", result: "Prioritise Indiga CTR / Comfort Soft / Equation Soft class round-soft frames." },
      { label: "I place balls but lack finishers", result: "Look at Vertex Hybrid / AT10 Genius all-round before jumping to Hack diamonds." },
      { label: "I already finish overheads cleanly", result: "Evaluate Hack 04, Metalbone 3.5, Technical Viper, Coello Pro, or Attack 18K." },
    ],
    exampleLabels: ["Beginner round", "Classic control cup", "All-court hybrid/diamond", "Attacking diamond"],
    exampleWhys: [
      "Indiga CTR is the clearest published beginner round job in catalog — SoftEva, low balance, centred contact.",
      "ML10 Pro Cup illustrates classic control-cup geometry for players who place more than they smash.",
      "Vertex 05 shows a current all-court flagship role without pretending every player needs Hack head weight.",
      "Hack 04 is the current attacking diamond when smash authority is the job — not a beginner shortcut.",
    ],
    exampleTradeoffs: [
      "Less peak smash authority than flagship diamonds.",
      "Less finishing reward than modern attack molds.",
      "More demanding than soft rounds if contact is still inconsistent.",
      "Punishes late preparation harder than round/control frames.",
    ],
    mistakes: [
      { id: "pro-copy", title: "Copying a pro diamond early", body: "Coello Pro and Hack 04 reward timing you may not have yet." },
      { id: "kcount", title: "Ranking by K-count", body: "12K vs 18K is not a quality ladder — Genius 12K is teardrop all-round, Attack 18K is the diamond job." },
      { id: "prevgen", title: "Buying previous gen as current", body: "Vertex 04, Hack 03 and Metalbone 3.3 are not current award tools." },
      { id: "shape-only", title: "Choosing by shape stereotype alone", body: "Balance, core and weight can override a round/diamond label." },
    ],
    faqs: [
      { question: "What padel racket should a beginner buy?", answer: "A forgiving round or soft frame with accessible weight — Indiga CTR or Comfort Soft class — not a stiff power diamond." },
      { question: "Is carbon better than fiberglass?", answer: "Not automatically. Carbon can feel firmer and more precise; fiberglass often feels softer and more accessible. Core and balance matter as much as face material." },
      { question: "Round, teardrop or diamond?", answer: "Round for forgiveness, teardrop/hybrid for balance, diamond for attackers with reliable timing. Confirm balance and core rather than trusting the silhouette alone." },
      { question: "How important is weight?", answer: "Very. A few grams and balance shift change whether you prepare bandejas on time. Use published ranges, not a single marketing midpoint." },
    ],
  }),
});

// Continue adding remaining guides in the same file via a second write appended...
console.log("Base guide 1 defined, continuing...");

const more = [
  {
    id: "guide-padel-racket-shapes",
    slug: "padel-racket-shapes-explained",
    title: "Padel Racket Shapes Explained",
    guideType: "explainer",
    categoryId: "cat-padel-rackets",
    subject: "padel racket shapes",
    outcome: "map round, teardrop and diamond silhouettes to sweet-spot and play roles without treating shape as the whole decision",
    factors: ["Sweet-spot location", "Balance tendency", "Forgiveness on mishits", "Attacking reward", "Your preparation speed"],
    comparison: ["Round control shape", "Diamond attack shape"],
    products: ["prod-bullpadel-indiga-ctr", "prod-bullpadel-vertex-05-hybrid", "prod-bullpadel-hack-04", "prod-nox-at10-12k-2026"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets", "best-padel-rackets-control", "best-padel-rackets-power", "best-padel-rackets-all-round"],
    relatedCompare: ["cmp-vertex05-vs-hack04"],
    relatedTools: ["padel-racket-finder"],
    priority: 20,
    quickAnswer: "Round shapes usually centre forgiveness; teardrop/hybrid sit in the middle; diamond raises the sweet spot for attackers. Shape is a strong signal — not a complete racket decision without weight, balance and core.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Manufacturers label molds as round, teardrop (hybrid), or diamond. Round frames like Indiga CTR tend to keep contact easier. Hybrid/teardrop frames like Vertex 05 Hybrid or AT10 Genius sit between. Diamonds like Hack 04 raise the sweet spot for finishing — and punish late swings harder." },
      { id: "s-why", heading: "Why shape matters", body: "Shape moves where mass and the usable sweet zone sit. That changes how often a mishit still produces a usable ball and how early you must prepare for bandejas and viboras." },
      { id: "s-framework", heading: "Decision framework", body: "Ask: (1) How often do I miss the centre? (2) Do I already finish overheads? (3) Is my problem power or placement? If mishits dominate, stay round/soft. If you place well but need finishers, open hybrid before diamond." },
      { id: "s-tech", heading: "Technical explanation", body: "A round outline typically places more foam area around a lower/centred sweet zone. Diamond outlines push usable mass and sweet-spot diagrams higher toward the tip. Hybrids blend the silhouette so the racket can attack without fully committing to tip-heavy geometry — still verify published balance." },
      { id: "s-examples", heading: "Catalog examples", body: "Round: Indiga CTR, Comfort Soft, Equation Soft. Hybrid/teardrop: Vertex 05 Hybrid, AT10 Genius 12K/18K. Diamond attack: Hack 04, Metalbone 3.5, Technical Viper, Coello Pro, AT10 Attack 18K. Do not call Genius 12K an Attack diamond." },
      { id: "s-trade", heading: "Trade-offs", body: "Round forgiveness costs some tip leverage. Diamond leverage costs mishit margin. Hybrid is a compromise — not automatically “best of both” for every player." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Assuming every teardrop is mid-balance; equating diamond with quality; ignoring SoftEva vs hard cores inside the same silhouette family." },
      { id: "s-next", heading: "Related reading", body: "Continue with Round vs Teardrop vs Diamond for a direct comparison, then Balance Explained and the Finder." },
    ],
  },
  {
    id: "guide-round-vs-teardrop-vs-diamond",
    slug: "round-vs-teardrop-vs-diamond-padel-rackets",
    title: "Round vs Teardrop vs Diamond Padel Rackets",
    guideType: "comparison",
    categoryId: "cat-padel-rackets",
    subject: "round vs teardrop vs diamond padel rackets",
    outcome: "pick the silhouette family that matches your mishit rate and finishing ability",
    factors: ["Mishit rate", "Finishing need", "Preparation timing", "Core softness", "Balance confirmation"],
    comparison: ["Round / soft control", "Diamond attack"],
    products: ["prod-bullpadel-indiga-ctr", "prod-nox-at10-12k-2026", "prod-bullpadel-hack-04"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-all-round",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-beginners", "best-padel-rackets-all-round", "best-padel-rackets-power"],
    relatedCompare: ["cmp-vertex05-vs-hack04", "cmp-at10-12k-vs-metalbone"],
    relatedTools: ["padel-racket-finder"],
    priority: 25,
    quickAnswer: "Choose round when contact consistency is the weekly problem, teardrop/hybrid when you need all-court coverage, and diamond only when overhead finishing already works. Confirm balance and core — silhouette alone lies sometimes.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Round vs teardrop vs diamond is a role comparison, not a brand ranking. Indiga CTR represents the round forgiveness job; AT10 Genius 12K the teardrop all-round job; Hack 04 the diamond attack job." },
      { id: "s-why", heading: "Why the comparison matters", body: "Players often jump silhouettes because a pro uses one. The useful question is whether your contact quality supports the sweet-spot move that silhouette implies." },
      { id: "s-framework", heading: "Decision framework", body: "Score yourself honestly: mishits per set, bandeja timing under fatigue, and whether unfinished overheads are a technique or power problem. Technique problems rarely get fixed by a stiffer diamond." },
      { id: "s-tech", heading: "Technical explanation", body: "As the outline lengthens toward the tip, usable mass and marketing sweet-spot diagrams climb. That raises smash potential and reduces the area that forgives late or off-centre contact — especially with firm cores." },
      { id: "s-examples", heading: "Catalog examples", body: "Round path: Indiga CTR → Equation Soft → ML10 Pro Cup. Teardrop path: Vertex 05 Hybrid / AT10 Genius. Diamond path: Hack 04 / Metalbone 3.5 / Attack 18K. Compare Vertex 05 vs Hack 04 when deciding all-court vs attack." },
      { id: "s-trade", heading: "Trade-offs", body: "Moving toward diamond gains finishing reward and loses forgiveness. Moving toward round gains usable mishits and loses tip authority." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Calling every hybrid “perfectly balanced”; buying diamond for status; treating Siux Diablo as a beginner round." },
      { id: "s-next", heading: "Next steps", body: "Read Shapes Explained for geometry detail, then open Best Beginners or Best Power depending on your branch." },
    ],
  },
  {
    id: "guide-padel-racket-balance",
    slug: "padel-racket-balance-explained",
    title: "Padel Racket Balance Explained",
    guideType: "technical",
    categoryId: "cat-padel-rackets",
    subject: "padel racket balance",
    outcome: "use low vs high balance as a handling filter instead of inferring it from shape marketing alone",
    factors: ["Balance point", "Swing preparation", "Stability on hard contact", "Arm fatigue", "Shape vs measured balance"],
    comparison: ["Low / mid-low balance", "Mid-high / high balance"],
    products: ["prod-bullpadel-indiga-ctr", "prod-head-extreme-motion-2026", "prod-bullpadel-hack-04", "prod-adidas-metalbone-3-5-2026"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-maneuverability",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-maneuverability", "best-padel-rackets-lightweight", "best-padel-rackets-power"],
    relatedTools: ["padel-racket-finder"],
    priority: 30,
    quickAnswer: "Low or mid-low balance helps defence and net recovery; higher balance adds smash leverage and slows late preparation. Never assume balance from silhouette alone — verify manufacturer or measured balance when available.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Balance describes where mass sits along the racket. Head-light/low balance frames like many Motions and beginner rounds feel quicker to position. Head-heavy/high balance attack frames feel more authoritative on overheads and more demanding between balls." },
      { id: "s-why", heading: "Why balance matters", body: "Padel is a recovery sport as much as a smash sport. Balance decides whether you can get the face organised for the next glass ball after a defensive stretch." },
      { id: "s-framework", heading: "Decision framework", body: "If you lose points to late preparation, bias low/mid balance. If overheads die because you cannot load the tip, consider higher balance only after timing is honest. Pair with weight — a light high-balance frame feels different from a heavy high-balance frame." },
      { id: "s-tech", heading: "Technical explanation", body: "Balance is often discussed as low / medium / high relative to the handle. Static weight and balance together approximate how heavy the tip feels in motion (a rough swingweight idea without claiming lab numbers we have not measured)." },
      { id: "s-examples", heading: "Catalog examples", body: "Handling-first: Indiga CTR, Extreme Motion, Ionic Light class. Attack leverage: Hack 04, Metalbone 3.5, Coello Pro. Adjustable systems like Metalbone plates can shift feel — treat that as a setup choice, not magic." },
      { id: "s-trade", heading: "Trade-offs", body: "Lower balance gains recovery and costs some tip leverage. Higher balance gains finishing potential and costs forgiveness when you are late." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Inferring balance only from diamond vs round art; ignoring that soft cores change perceived tip weight; stacking overgrips and thinking you “fixed” head-heavy balance." },
      { id: "s-next", heading: "Related", body: "Read Weight Explained next, then Maneuverability and Lightweight Best Guides." },
    ],
  },
  {
    id: "guide-padel-racket-weight",
    slug: "padel-racket-weight-explained",
    title: "Padel Racket Weight Explained",
    guideType: "technical",
    categoryId: "cat-padel-rackets",
    subject: "padel racket weight",
    outcome: "choose a wearable published weight range before comparing carbon marketing",
    factors: ["Published weight range", "Balance interaction", "Session length", "Shoulder/elbow comfort", "Light vs stable preference"],
    comparison: ["Lighter handling frame", "Heavier stable frame"],
    products: ["prod-bullpadel-ionic-light", "prod-head-extreme-motion-2026", "prod-bullpadel-vertex-05", "prod-adidas-metalbone-3-5-2026"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-lightweight",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-lightweight", "best-padel-rackets-maneuverability", "best-padel-rackets-women"],
    relatedTools: ["padel-racket-finder"],
    priority: 30,
    quickAnswer: "Adult padel rackets commonly sit around the 350–380 g band. Prefer published ranges over a single invented midpoint. Lighter helps recovery; heavier can stabilise hard contact if you can still accelerate the tip.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Weight is a primary handling filter. Ionic Light and Motion-class frames illustrate lighter handling. Flagships like Vertex 05 and Metalbone 3.5 sit in typical adult bands where stability and authority rise — if you can swing them on time." },
      { id: "s-why", heading: "Why weight matters", body: "A few grams change whether the third-set bandeja arrives early or late. Arm comfort and match length make weight a health decision as well as a performance one." },
      { id: "s-framework", heading: "Decision framework", body: "Set a wearable window first (for many club players mid-360s with balance awareness). Then choose shape/core inside that window. Do not buy a stiff diamond that only fits if you ignore the weight range." },
      { id: "s-tech", heading: "Technical explanation", body: "Manufacturers usually publish ranges because foam and layup vary. Static grams are not swingweight. Balance and distribution decide how heavy the tip feels in motion." },
      { id: "s-examples", heading: "Catalog examples", body: "Lightweight / handling: Ionic Light, Extreme Motion, Match Light. Standard adult flagships: Vertex 05, AT10 Genius, Hack 04. Women’s-named models are not automatically light — Vertex 05 W is a women’s mold story, not a synonym for Ionic Light." },
      { id: "s-trade", heading: "Trade-offs", body: "Lighter frames recover faster and can feel less planted on heavy contact. Heavier frames can feel more stable and more fatiguing." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Treating a single gram number as exact; equating women = light; adding wristbands/overgrips without reassessing tip feel." },
      { id: "s-next", heading: "Related", body: "Pair with Balance Explained and Best Lightweight / Maneuverability guides." },
    ],
  },
  {
    id: "guide-padel-racket-materials",
    slug: "padel-racket-materials-explained",
    title: "Padel Racket Materials Explained",
    guideType: "technical",
    categoryId: "cat-padel-rackets",
    subject: "padel racket materials",
    outcome: "read face and frame materials as feel inputs rather than a prestige ladder",
    factors: ["Face material", "Frame construction", "Core pairing", "Durability expectations", "Marketing weave claims"],
    comparison: ["Accessible glass face", "Stiffer carbon face"],
    products: ["prod-kuikma-pr-comfort-soft", "prod-bullpadel-hack-04-comfort", "prod-nox-at10-12k-2026", "prod-bullpadel-hack-04"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets", "best-padel-rackets-comfort", "best-padel-rackets-beginners"],
    relatedTools: ["padel-racket-finder"],
    priority: 35,
    quickAnswer: "Fiberglass faces often feel softer and more accessible; carbon faces vary widely by weave and resin. Materials matter through the core pairing — not as a 3K→24K quality scoreboard.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Padel faces are typically fiberglass, carbon, or hybrids (e.g. Fibrix comfort constructions). Comfort Soft and Hack 04 Comfort illustrate accessible/comfort material stories; AT10 Genius 12K and Hack 04 illustrate carbon attack/all-round constructions." },
      { id: "s-why", heading: "Why materials matter", body: "Face stiffness changes how abruptly the ball leaves and how kind mishits feel. Players often over-index on weave numbers and under-index on core and balance." },
      { id: "s-framework", heading: "Decision framework", body: "Choose feel goal first (comfort vs precision). Then shortlist materials that support that goal. Only then compare weave marketing inside the shortlist." },
      { id: "s-tech", heading: "Technical explanation", body: "Glass fibres generally flex more for a given construction; carbon can be laid up stiffer. Hybrid faces try to blend. Resin systems and layer counts change outcomes as much as the fibre name on the box." },
      { id: "s-examples", heading: "Catalog examples", body: "Accessible/comfort: Comfort Soft, Equation Soft, Hack 04 Comfort. Carbon flagships: Genius 12K, Hack 04 18K, Metalbone 3.5. Treat Alum/XTREM and plate systems as construction details, not automatic upgrades." },
      { id: "s-trade", heading: "Trade-offs", body: "Softer accessible faces forgive and can feel less explosive. Stiffer carbon faces can feel precise and harsher on off-centre hits." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Buying higher K-count as “better”; ignoring core; assuming fiberglass means low quality." },
      { id: "s-next", heading: "Related", body: "Continue with Carbon vs Fiberglass and Cores / EVA Foam Explained." },
    ],
  },
  {
    id: "guide-carbon-vs-fiberglass-padel",
    slug: "carbon-vs-fiberglass-padel-rackets",
    title: "Carbon vs Fiberglass Padel Rackets",
    guideType: "comparison",
    categoryId: "cat-padel-rackets",
    subject: "carbon vs fiberglass padel rackets",
    outcome: "choose face fibre for feel and forgiveness goals instead of prestige",
    factors: ["Desired face feel", "Mishit kindness", "Precision preference", "Core pairing", "Budget"],
    comparison: ["Fiberglass-accessible face", "Carbon performance face"],
    products: ["prod-kuikma-pr-comfort-soft", "prod-nox-equation-soft-2026", "prod-nox-at10-12k-2026", "prod-babolat-technical-viper"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-comfort",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-comfort", "best-padel-rackets-beginners", "best-padel-rackets-power"],
    relatedTools: ["padel-racket-finder"],
    priority: 35,
    quickAnswer: "Fiberglass-leaning constructions often suit developing players and comfort seekers; carbon constructions suit players who already control contact and want a firmer, more precise reply. Neither fibre wins universally.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Comfort Soft and Equation Soft represent accessible soft-round jobs often associated with more forgiving face/core packages. Genius 12K and Technical Viper represent carbon performance constructions for players with clearer timing." },
      { id: "s-why", heading: "Why the comparison matters", body: "Retail copy treats carbon as an upgrade. On court, the wrong stiff carbon package amplifies mishits for players who needed forgiveness." },
      { id: "s-framework", heading: "Decision framework", body: "If contact is inconsistent, bias accessible glass/soft packages. If you already place viboras and want a firmer exit, open carbon flagships. Always read core class alongside fibre." },
      { id: "s-tech", heading: "Technical explanation", body: "Fiberglass typically allows more face flex in entry constructions. Carbon weaves (3K–24K and hybrids) can raise stiffness and change vibration, but weave count is not a linear power scale." },
      { id: "s-examples", heading: "Catalog examples", body: "Fiberglass/soft accessible: Comfort Soft, Equation Soft. Carbon all-round/attack: AT10 Genius 12K, Hack 04, Technical Viper. Comfort carbon hybrids: Hack 04 Comfort (Fibrix story) — still an advanced geometry." },
      { id: "s-trade", heading: "Trade-offs", body: "Glass/soft packages forgive and may feel less explosive. Carbon packages can feel sharper and less kind off-centre." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Equating carbon with “pro quality”; ignoring SoftEva vs hard EVA inside carbon frames; chasing 18K because a YouTuber said so." },
      { id: "s-next", heading: "Related", body: "Read Materials Explained and Soft vs Hard next." },
    ],
  },
  {
    id: "guide-padel-racket-cores-eva",
    slug: "padel-racket-cores-eva-foam-explained",
    title: "Padel Racket Cores / EVA Foam Explained",
    guideType: "technical",
    categoryId: "cat-padel-rackets",
    subject: "padel racket cores and EVA foam",
    outcome: "treat soft vs hard EVA (and multi-density cores) as feel and forgiveness filters",
    factors: ["Core hardness", "Ball exit feel", "Arm comfort", "Temperature sensitivity", "Marketing core names"],
    comparison: ["Soft EVA package", "Harder EVA package"],
    products: ["prod-nox-equation-soft-2026", "prod-kuikma-pr-comfort-soft", "prod-bullpadel-vertex-05", "prod-bullpadel-hack-04"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-comfort",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-comfort", "best-padel-rackets-beginners", "best-padel-rackets-power"],
    relatedTools: ["padel-racket-finder"],
    priority: 35,
    quickAnswer: "Softer EVA cores usually feel more cushioned and forgiving; harder EVA returns energy more abruptly. Manufacturer core names are marketing labels — use Kitletics normalized soft/medium/hard classes when comparing.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Equation Soft and Comfort Soft illustrate soft-round comfort jobs. Vertex 05 and Hack 04 illustrate firmer performance cores aimed at players who already generate racket-head speed." },
      { id: "s-why", heading: "Why cores matter", body: "The foam is the trampoline. Face fibre changes the trampoline’s skin; core hardness changes how deep the ball sinks and how quickly it leaves." },
      { id: "s-framework", heading: "Decision framework", body: "Arm comfort or mishit kindness first → soft/medium. Explosive exit with clean contact → firmer cores. Cold halls can make soft cores feel dead and hard cores harsher — adjust expectations by season." },
      { id: "s-tech", heading: "Technical explanation", body: "EVA and related foams vary by density and layering. Multi-density constructions mix zones. Without lab compression data, treat published soft/medium/hard and feel notes as relative, not absolute SI units." },
      { id: "s-examples", heading: "Catalog examples", body: "Soft path: Comfort Soft, Equation Soft, Indiga SoftEva story. Performance path: Vertex 05, Hack 04, Metalbone 3.5. Comfort within attack geometry: Hack 04 Comfort — geometry still demands timing." },
      { id: "s-trade", heading: "Trade-offs", body: "Soft cores forgive and can feel less crisp on finishers. Hard cores feel lively and can punish the arm and mishits." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Treating proprietary foam names as unique physics; ignoring temperature; pairing the softest core with a tip-heavy diamond and calling it a beginner racket." },
      { id: "s-next", heading: "Related", body: "Continue with Soft vs Hard and Sweet Spots." },
    ],
  },
  {
    id: "guide-soft-vs-hard-padel-rackets",
    slug: "soft-vs-hard-padel-rackets",
    title: "Soft vs Hard Padel Rackets",
    guideType: "comparison",
    categoryId: "cat-padel-rackets",
    subject: "soft vs hard padel rackets",
    outcome: "choose soft packages for forgiveness and hard packages for crisp exit when contact quality supports it",
    factors: ["Contact consistency", "Arm comfort", "Desired ball exit", "Playing style", "Shape pairing"],
    comparison: ["Soft forgiving package", "Hard crisp package"],
    products: ["prod-nox-equation-soft-2026", "prod-kuikma-pr-comfort-soft", "prod-bullpadel-hack-04", "prod-adidas-metalbone-3-5-2026"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-comfort",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-comfort", "best-padel-rackets-power", "best-padel-rackets-control"],
    relatedTools: ["padel-racket-finder"],
    priority: 35,
    quickAnswer: "Soft rackets help developing contact and arm comfort; hard rackets reward clean strikers with a more abrupt exit. Soft is not “worse” and hard is not “more advanced” by default — match the package to your mishit rate.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Equation Soft / Comfort Soft are soft-package examples. Hack 04 / Metalbone 3.5 are harder attack packages. Control cups like ML10 can sit between depending on exact core." },
      { id: "s-why", heading: "Why soft vs hard matters", body: "Players feel this on every block and vibora. Choosing hard because it sounds competitive is a common confidence trap." },
      { id: "s-framework", heading: "Decision framework", body: "High mishit rate or elbow/shoulder caution → soft. Clean contact seeking finishing pop → hard. If unsure, soft/medium hybrid first." },
      { id: "s-tech", heading: "Technical explanation", body: "Hardness is mostly core-driven, modulated by face stiffness. A soft core under a stiff carbon skin can still feel firmer than a soft glass package." },
      { id: "s-examples", heading: "Catalog examples", body: "Soft: Equation Soft, Comfort Soft, Indiga CTR SoftEva. Harder attack: Hack 04, Metalbone 3.5, Technical Viper. Comfort-attack middle: Hack 04 Comfort." },
      { id: "s-trade", heading: "Trade-offs", body: "Soft gains dwell and forgiveness; hard gains crisp exit and can amplify errors." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Equating soft with beginner-only forever; buying hard to “force” power without timing." },
      { id: "s-next", heading: "Related", body: "Read Cores / EVA and Best Comfort vs Best Power." },
    ],
  },
  {
    id: "guide-padel-racket-sweet-spots",
    slug: "how-padel-racket-sweet-spots-work",
    title: "How Padel Racket Sweet Spots Work",
    guideType: "technical",
    categoryId: "cat-padel-rackets",
    subject: "padel racket sweet spots",
    outcome: "interpret sweet-spot claims as forgiveness geometry rather than guaranteed power maps",
    factors: ["Sweet-spot size claims", "Sweet-spot height", "Shape correlation", "Evidence quality", "Your mishit pattern"],
    comparison: ["Centred forgiving sweet zone", "Higher attacking sweet zone"],
    products: ["prod-bullpadel-indiga-ctr", "prod-nox-ml10-pro-cup", "prod-bullpadel-vertex-05", "prod-bullpadel-hack-04"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-control",
    browseHref: "/padel/gear?category=padel-rackets",
    relatedBest: ["best-padel-rackets-control", "best-padel-rackets-beginners", "best-padel-rackets-power"],
    relatedTools: ["padel-racket-finder"],
    priority: 40,
    quickAnswer: "A larger, more central sweet spot helps inconsistent contact; a smaller, higher sweet spot rewards clean attackers. Marketing diagrams are weak evidence — treat them as hypotheses to demo.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Sweet spot means the contact zone that feels most efficient. Round control frames (Indiga, ML10) usually advertise more accessible zones. Attack diamonds (Hack 04) move reward higher and narrower." },
      { id: "s-why", heading: "Why sweet spots matter", body: "Most club points die on mishits, not on lack of maximum smash speed. Sweet-spot geometry is often the real difference players feel between “easy” and “demanding” rackets." },
      { id: "s-framework", heading: "Decision framework", body: "Track where you miss for two weeks. Off-centre and late → centred/forgiving. Clean high contact seeking finishers → higher sweet-spot attack molds." },
      { id: "s-tech", heading: "Technical explanation", body: "Foam thickness, face stiffness and outline interact. Without independent mapping, Kitletics treats manufacturer sweet-spot claims as needs-research signals paired with shape/balance evidence." },
      { id: "s-examples", heading: "Catalog examples", body: "Accessible: Indiga CTR, ML10 Pro Cup, Gravity Pro. Middle: Vertex 05 / Genius 12K. High attack: Hack 04, Coello Pro, Attack 18K." },
      { id: "s-trade", heading: "Trade-offs", body: "Bigger centred zones forgive and can feel less explosive at the tip. Higher zones reward finishers and punish late swings." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Trusting colourful sweet-spot artwork as measured data; ignoring that a soft core can make a “small” zone feel larger in play." },
      { id: "s-next", heading: "Related", body: "Pair with Shapes Explained and Round vs Teardrop vs Diamond." },
    ],
  },
];

for (const g of more) {
  // unique copy will be auto-built below if missing
  add({ ...g, unique: g.unique || null });
}

// Shoes, balls, bags, grips, beginner — continue
const rest = [
  {
    id: "guide-choose-padel-shoes",
    slug: "how-to-choose-padel-shoes",
    title: "How to Choose Padel Shoes",
    guideType: "buying",
    categoryId: "cat-padel-shoes",
    subject: "padel shoes",
    outcome: "get predictable court grip and lateral support without sacrificing lockdown",
    factors: ["Outsole and court surface", "Lateral stability", "Fit and lockdown", "Cushion and durability", "Session length"],
    comparison: ["Stable court shoe", "Lighter speed shoe"],
    products: ["prod-asics-gel-resolution-padel", "prod-adidas-courtstabil", "prod-babolat-jet-premura", "prod-joma-t-slam"],
    bestHref: "/best/padel-shoes",
    browseHref: "/padel/gear?category=padel-shoes",
    relatedBest: ["best-padel-shoes", "best-padel-shoes-stability", "best-padel-shoes-comfort", "best-padel-shoes-men", "best-padel-shoes-women"],
    relatedTools: [],
    startHere: true,
    featured: true,
    priority: 15,
    quickAnswer: "Prioritise court outsoles and lateral lockdown over running-shoe cushion. Resolution-class stability, Courtquick/Courtstabil grip, and Jet Premura connected feel are different jobs — pick the job, then the model.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Padel shoes must plant and cut on sand-dressed or carpet courts. ASICS Gel-Resolution padel builds for high lateral stability; Adidas Courtquick (catalog id Courtstabil) emphasises court outsole grip; Babolat Jet Premura feels more connected/racy; Joma T.Slam is a value stability path that can run narrow." },
      { id: "s-why", heading: "Why it matters", body: "Running trainers roll and slip sideways. Ankle confidence changes whether you close at the net or hesitate." },
      { id: "s-framework", heading: "Decision framework", body: "Surface first → stability need → fit/last → cushion preference. Wide feet: catalog width options are limited — do not invent a wide award; try lasts carefully (T.Slam often noted narrow)." },
      { id: "s-tech", heading: "Technical explanation", body: "Herringbone and omni outsoles manage sand and dust differently. Lateral TPU/heel counters resist rollover. Cushion foams matter less than a planted platform for most players." },
      { id: "s-examples", heading: "Catalog examples", body: "Stability: Resolution padel. Grip platform: Courtquick. Connected racer: Jet Premura. Value: T.Slam. Women’s lasts: Sensa Women — not just a recolour of men’s Jet Premura." },
      { id: "s-trade", heading: "Trade-offs", body: "Max stability can feel heavier. Race-light shoes can feel less planted on hard cuts." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Wearing road runners on court; buying by colourway; assuming tennis shoes automatically match your local sand dressing." },
      { id: "s-next", heading: "Next", body: "Read Padel vs Tennis Shoes and Outsoles Explained, then Best Padel Shoes." },
    ],
  },
  {
    id: "guide-padel-vs-tennis-shoes",
    slug: "padel-vs-tennis-shoes",
    title: "Padel vs Tennis Shoes",
    guideType: "comparison",
    categoryId: "cat-padel-shoes",
    subject: "padel vs tennis shoes",
    outcome: "decide when a tennis court shoe is enough and when a padel-specific model is the better tool",
    factors: ["Court surface", "Movement pattern", "Outsole pattern", "Brand padel line", "Fit"],
    comparison: ["Padel-specific court shoe", "Tennis crossover shoe"],
    products: ["prod-asics-gel-resolution-padel", "prod-head-revolt-pro-court", "prod-adidas-courtstabil", "prod-babolat-jet-premura"],
    bestHref: "/best/padel-shoes",
    browseHref: "/padel/gear?category=padel-shoes",
    relatedBest: ["best-padel-shoes", "best-padel-shoes-stability"],
    priority: 40,
    quickAnswer: "Many tennis court shoes work for padel if the outsole matches your surface and lockdown is strong. Padel-specific models often tune for glass recovery and sand-dressed courts — prefer them when your tennis pair slips or feels vague sideways.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Resolution padel and Jet Premura are padel-line tools. Revolt Pro Court is a tennis/padel crossover example. Courtquick is a padel grip platform. Use tennis shoes when surface and lockdown already work; switch when sand/dust grip fails." },
      { id: "s-why", heading: "Why the distinction matters", body: "Padel adds glass-line recovery and frequent short lateral punches. A hard-court tennis shoe can be excellent — or wrong for your club’s dressing." },
      { id: "s-framework", heading: "Decision framework", body: "If your tennis shoes grip and plant, keep them. If you slip on bandeja plants or fear ankles on glass recovery, shortlist padel-specific outsoles." },
      { id: "s-tech", heading: "Technical explanation", body: "Outsole compound and pattern dominate. Upper lockdown and lateral posts matter next. Cushion stacks marketed for tennis baseline pounding are secondary for padel’s shorter cuts." },
      { id: "s-examples", heading: "Catalog examples", body: "Padel-first: Resolution padel, Courtquick, Jet Premura, Sensa Women. Crossover: Revolt Pro Court. Always verify current outsole notes for your surface." },
      { id: "s-trade", heading: "Trade-offs", body: "Keeping tennis shoes saves money if they already work. Padel-specific pairs can grip better on local sand and still wear faster on abrasive courts." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Assuming “court shoe” always equals padel-ready; buying clay-only herringbone for a dusty carpet club without checking." },
      { id: "s-next", heading: "Related", body: "Read Outsoles Explained and How to Choose Padel Shoes." },
    ],
  },
  {
    id: "guide-padel-shoe-outsoles",
    slug: "padel-shoe-outsoles-explained",
    title: "Padel Shoe Outsoles Explained",
    guideType: "technical",
    categoryId: "cat-padel-shoes",
    subject: "padel shoe outsoles",
    outcome: "match outsole pattern and compound to your club’s surface instead of buying by upper colour",
    factors: ["Surface type", "Herringbone vs omni", "Dust/sand behaviour", "Durability", "Indoor vs outdoor"],
    comparison: ["High-grip sand-ready outsole", "Faster connected outsole"],
    products: ["prod-adidas-courtstabil", "prod-asics-gel-resolution-padel", "prod-babolat-jet-premura", "prod-joma-t-slam"],
    bestHref: "/best/padel-shoes",
    browseHref: "/padel/gear?category=padel-shoes",
    relatedBest: ["best-padel-shoes", "best-padel-shoes-stability"],
    priority: 40,
    quickAnswer: "Outsole pattern decides grip in sand and dust more than midsole foam. Match herringbone/omni behaviour to your courts; Courtquick and Resolution-class platforms illustrate planted grip jobs, Jet Premura a more connected Michelin court feel.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "If your club dresses courts with sand, prioritise patterns that clear and bite. If courts are cleaner indoor carpet, a connected racer outsole can feel enough — until it is not." },
      { id: "s-why", heading: "Why outsoles matter", body: "Most “I hate these shoes” reports on padel are grip stories, not cushion stories." },
      { id: "s-framework", heading: "Decision framework", body: "Name your surface → pick grip priority → then stability/fit. Do not reverse the order." },
      { id: "s-tech", heading: "Technical explanation", body: "Herringbone channels help on clay-like dressings. Omni/modified patterns balance multi-direction cuts. Rubber compounds trade bite vs wear." },
      { id: "s-examples", heading: "Catalog examples", body: "Grip platforms: Courtquick (Courtstabil id), Resolution padel, T.Slam. Connected court: Jet Premura Michelin story. Verify traction notes per model year." },
      { id: "s-trade", heading: "Trade-offs", body: "Aggressive bite can feel sticky or wear faster. Slicker race outsoles feel quick and can slip on heavy sand." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Buying running rubber; ignoring worn-smooth outsoles that still look fine on top." },
      { id: "s-next", heading: "Related", body: "How to Choose Padel Shoes and Best Stability." },
    ],
  },
  {
    id: "guide-how-long-padel-balls-last",
    slug: "how-long-do-padel-balls-last",
    title: "How Long Do Padel Balls Last?",
    guideType: "explainer",
    categoryId: "cat-padel-balls",
    subject: "padel ball lifespan",
    outcome: "set realistic session expectations for pressurized cans instead of guessing from tennis habits alone",
    factors: ["Pressure loss", "Felt wear", "Court abrasion", "Temperature/humidity", "Match vs training use"],
    comparison: ["Fresh pressurized can", "Tired training ball"],
    products: ["prod-head-padel-pro-s", "prod-head-padel-pro-plus", "prod-head-padel-pro-s"],
    bestHref: "/padel/gear?category=padel-balls",
    browseHref: "/padel/gear?category=padel-balls",
    relatedBest: [],
    priority: 50,
    quickAnswer: "Pressurized padel balls typically feel match-worthy for a small number of hard sessions, then become training balls as pressure and felt drop. Exact life varies by court abrasion, heat and how hard you hit — open a new can when bounce and “pop” feel muted.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Expect fresh cans (HEAD Pro S / Pro+) to play their best early. Many club pairs rotate a match can and demote it to warm-ups within a few sessions. There is no universal “X hours” claim Kitletics can invent without lab pressure logging." },
      { id: "s-why", heading: "Why lifespan matters", body: "Dead balls change smash height and glass behaviour. Players often blame rackets for a ball that has quietly gone flat." },
      { id: "s-framework", heading: "Decision framework", body: "Match day → freshest can. Training → demoted cans. Extreme heat/humidity → expect faster fade. Abrasion courts → felt dies before pressure sometimes." },
      { id: "s-tech", heading: "Technical explanation", body: "Pressurized balls lose internal pressure through the core and valve over time once opened (and slowly even sealed). Felt wear changes aerodynamics and bounce character." },
      { id: "s-examples", heading: "Catalog examples", body: "Published fast cans in catalog include HEAD Padel Pro S and Pro+. Training SKUs may exist as drafts — we only cite published competition cans for examples here. Best Balls ranking is skipped until a useful control/speed distinction is awardable." },
      { id: "s-trade", heading: "Trade-offs", body: "Opening fresh cans every match costs money and plays truest. Stretching cans saves cash and dulls bounce." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Judging balls only by felt colour; storing opened cans in hot cars; comparing unopened shelf life to opened match life." },
      { id: "s-next", heading: "Related", body: "How to Choose Padel Balls and the beginner gear checklist." },
    ],
  },
  {
    id: "guide-choose-padel-balls",
    slug: "how-to-choose-padel-balls",
    title: "How to Choose Padel Balls",
    guideType: "buying",
    categoryId: "cat-padel-balls",
    subject: "padel balls",
    outcome: "pick a pressurized competition can that matches court speed preference with honest catalog limits",
    factors: ["Speed/control preference", "Official vs training", "Court conditions", "Pack format", "Freshness"],
    comparison: ["Faster competition can", "Control-oriented competition can"],
    products: ["prod-head-padel-pro-s", "prod-head-padel-pro-plus", "prod-head-padel-pro-s"],
    bestHref: "/padel/gear?category=padel-balls",
    browseHref: "/padel/gear?category=padel-balls",
    relatedBest: [],
    priority: 50,
    quickAnswer: "Choose pressurized competition cans for matches. In the current published catalog, HEAD Pro S leans faster and Pro+ leans more control-oriented within the same family — both are competition cans, not a full multi-brand ranking.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "For match play, open a pressurized competition can. Pro S is the faster personality in catalog notes; Pro+ the control-oriented sibling. Training balls are for practice once match bounce is gone." },
      { id: "s-why", heading: "Why ball choice matters", body: "Ball speed changes smash margins and defensive time. A “slow” preference on a fast outdoor court is a different problem than the same preference indoors." },
      { id: "s-framework", heading: "Decision framework", body: "Match vs training → preferred pace → brand familiarity for your club’s official ball if required → freshness." },
      { id: "s-tech", heading: "Technical explanation", body: "Core rubber and felt construction change pressure retention and pace. Kitletics does not invent bounce lab numbers; we use manufacturer positioning and catalog fields." },
      { id: "s-examples", heading: "Catalog examples", body: "HEAD Padel Pro S and Pro+ are the published competition examples. A Best Padel Balls page is intentionally skipped until more publishable SKUs support a useful ranked shortlist." },
      { id: "s-trade", heading: "Trade-offs", body: "Faster cans excite attackers and shrink defensive time. Control cans sit longer and can frustrate players who want easy winners." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Buying cheap flat multipacks for league matches; assuming all HEAD cans play identical." },
      { id: "s-next", heading: "Related", body: "How Long Do Padel Balls Last? and Complete Gear Checklist." },
    ],
  },
  {
    id: "guide-choose-padel-bag",
    slug: "how-to-choose-a-padel-bag",
    title: "How to Choose a Padel Bag",
    guideType: "buying",
    categoryId: "cat-padel-bags",
    subject: "a padel bag",
    outcome: "match paletero volume, thermo needs and commute style to how you actually travel to court",
    factors: ["Form factor", "Volume / racket count", "Thermo compartment", "Shoe pocket", "Carry comfort"],
    comparison: ["Club paletero", "Tournament volume bag"],
    products: ["prod-nox-at10-team-bag", "prod-babolat-rh-pro-padel", "prod-nox-at10-team-bag"],
    bestHref: "/best/padel-bags",
    browseHref: "/padel/gear?category=padel-bags",
    relatedBest: ["best-padel-bags"],
    priority: 45,
    quickAnswer: "Pick form first: club paletero (AT10 Team ~42 L) vs tournament volume (RH Pro ~62 L) vs backpack commute. Thermo compartments matter if you protect frames from heat; litre counts are not marketing poetry — use published numbers.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Nox AT10 Team bag covers typical club thermo paletero needs. Babolat RH Pro covers larger tournament volume. Backpack-style endurance bags suit commute-first players when published in catalog." },
      { id: "s-why", heading: "Why bag choice matters", body: "Wrong volume means leaving shoes or a second racket behind — or carrying an empty cavern. Thermo protection matters in hot cars." },
      { id: "s-framework", heading: "Decision framework", body: "Commute mode → racket count → thermo yes/no → shoe separation → litre reality check." },
      { id: "s-tech", heading: "Technical explanation", body: "Paleteros organise racket tunnels and pockets differently from duffels. Thermo linings slow heat transfer; they are not refrigerators." },
      { id: "s-examples", heading: "Catalog examples", body: "AT10 Team bag for club thermo volume; RH Pro for 62 L tournament carry. See Best Padel Bags for the editorial shortlist." },
      { id: "s-trade", heading: "Trade-offs", body: "Bigger bags carry more and weigh more empty. Compact bags force discipline and can omit thermo." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Buying tournament volume for two weekly club sessions; treating “thermo” as unlimited heat immunity." },
      { id: "s-next", heading: "Related", body: "Best Padel Bags and Complete Gear Checklist." },
    ],
  },
  {
    id: "guide-padel-grips",
    slug: "padel-grips-overgrips-explained",
    title: "Padel Grips & Overgrips Explained",
    guideType: "explainer",
    categoryId: "cat-padel-grips",
    subject: "padel grips and overgrips",
    outcome: "set a comfortable handle diameter while maintaining tack and moisture control",
    factors: ["Base-grip condition", "Handle thickness", "Tack and absorption", "Replacement frequency"],
    comparison: ["Replacement grip", "Overgrip"],
    products: ["prod-wilson-overgrip", "prod-bullpadel-gb1200", "prod-wilson-overgrip"],
    bestHref: "/best/padel-overgrips",
    browseHref: "/padel/gear?category=padel-grips",
    relatedBest: ["best-padel-overgrips"],
    priority: 20,
    featured: true,
    quickAnswer: "Replacement grips rebuild the handle; overgrips fine-tune tack, sweat control and small diameter changes. Most club players refresh overgrips often and rebuild the base when the handle feels packed or uneven.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Use a base grip as foundation and overgrips as the wearable layer. Wilson Pro Overgrip is the tack-first club staple in catalog; Bullpadel HaC (GB1200) prioritises absorption when sweat kills tack." },
      { id: "s-why", heading: "Why it matters", body: "Handle feel changes every swing. Slippery or oversized grips force death-gripping and forearm fatigue." },
      { id: "s-framework", heading: "Decision framework", body: "Uneven ridges → rebuild base. Lost tack mid-match → overgrip swap. Heavy sweat → absorption-first overgrip. Dry halls → tack-first." },
      { id: "s-tech", heading: "Technical explanation", body: "Overgrips are thin wraps; replacement grips are thicker foundations. Stacking endless overgrips without rebuilding creates a mushy, oversized handle." },
      { id: "s-examples", heading: "Catalog examples", body: "Wilson overgrip vs Bullpadel HaC — see Best Padel Overgrips. This guide explains the system; Grip vs Overgrip and Replace Frequency go deeper on those jobs." },
      { id: "s-trade", heading: "Trade-offs", body: "More wraps increase diameter and cushion; too many hurt wrist freedom." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Never replacing overgrips; stacking five dead wraps; thinking grips change foam power." },
      { id: "s-next", heading: "Related", body: "Grip vs Overgrip, How Often to Replace, Best Overgrips." },
    ],
  },
  {
    id: "guide-padel-grip-vs-overgrip",
    slug: "padel-grip-vs-overgrip",
    title: "Padel Grip vs Overgrip",
    guideType: "comparison",
    categoryId: "cat-padel-grips",
    subject: "padel grip vs overgrip",
    outcome: "know when to rebuild the base grip versus refreshing an overgrip",
    factors: ["Handle foundation", "Diameter change needed", "Tack vs absorption", "Cost per week"],
    comparison: ["Base replacement grip", "Overgrip refresh"],
    products: ["prod-wilson-overgrip", "prod-bullpadel-gb1200", "prod-wilson-overgrip"],
    bestHref: "/best/padel-overgrips",
    browseHref: "/padel/gear?category=padel-grips",
    relatedBest: ["best-padel-overgrips"],
    priority: 45,
    quickAnswer: "A replacement grip is the foundation layer; an overgrip is the thin consumable on top. Rebuild the base when the handle is soft or ridged; replace overgrips when tack or absorption dies.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "If the handle feels structurally wrong, replace the grip. If it only feels slippery or soaked, change the overgrip. Wilson vs HaC is an overgrip personality choice, not a base-grip substitute." },
      { id: "s-why", heading: "Why the distinction matters", body: "Players waste money stacking overgrips on a dead base and wonder why the racket still twists." },
      { id: "s-framework", heading: "Decision framework", body: "Structural issues → base grip. Surface tack/sweat → overgrip. Diameter up slightly → extra overgrip. Diameter down → thinner stack or new thinner base." },
      { id: "s-tech", heading: "Technical explanation", body: "Base grips are thicker polyurethane/synthetic wraps. Overgrips are thinner sacrificial layers for tack and moisture." },
      { id: "s-examples", heading: "Catalog examples", body: "Overgrip shortlist: Wilson Pro Overgrip (tack) and Bullpadel HaC (absorption). Base replacement SKUs vary by retailer — rebuild with a quality replacement grip when needed." },
      { id: "s-trade", heading: "Trade-offs", body: "Base rebuilds take longer and last longer. Overgrips are fast and frequent." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Using only base grips without overgrips in humid halls; never touching the base for a year." },
      { id: "s-next", heading: "Related", body: "Grips & Overgrips Explained and replacement frequency." },
    ],
  },
  {
    id: "guide-how-often-replace-padel-overgrip",
    slug: "how-often-should-you-replace-a-padel-overgrip",
    title: "How Often Should You Replace a Padel Overgrip?",
    guideType: "decision",
    categoryId: "cat-padel-grips",
    subject: "padel overgrip replacement frequency",
    outcome: "replace overgrips based on tack and sweat failure, not an arbitrary calendar myth",
    factors: ["Sweat rate", "Match length", "Climate", "Overgrip type", "Hygiene"],
    comparison: ["Tack-first overgrip", "Absorption-first overgrip"],
    products: ["prod-wilson-overgrip", "prod-bullpadel-gb1200", "prod-wilson-overgrip"],
    bestHref: "/best/padel-overgrips",
    browseHref: "/padel/gear?category=padel-grips",
    relatedBest: ["best-padel-overgrips"],
    priority: 50,
    quickAnswer: "Replace an overgrip when tack dies, the wrap glazes, or sweat soaks through — often every few sessions for sweaty players, longer for dry hands. Carry a spare; mid-match swaps are normal.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "There is no universal “every X hours” rule that fits every hand. Sweaty players may burn Wilson tack wraps quickly and prefer HaC absorption. Dry climates stretch life. When the racket twists or you death-grip, change it." },
      { id: "s-why", heading: "Why frequency matters", body: "A dead overgrip is a hidden technique leak. It is also a hygiene issue on shared demo rackets." },
      { id: "s-framework", heading: "Decision framework", body: "After each session: still tacky? still dry enough? still even? Any no → replace. Tournament days: start fresh." },
      { id: "s-tech", heading: "Technical explanation", body: "Oils, sweat and dust glaze porous wraps. Absorption wraps saturate. Neither fails on a fixed timer." },
      { id: "s-examples", heading: "Catalog examples", body: "Wilson Pro Overgrip for tack-first rotation; Bullpadel HaC when sweat is the failure mode. See Best Overgrips." },
      { id: "s-trade", heading: "Trade-offs", body: "Frequent swaps cost little per wrap and keep feel consistent. Stretching wraps saves pennies and loses points." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Waiting until the wrap shreds; stacking new overgrips on soaked ones." },
      { id: "s-next", heading: "Related", body: "Grip vs Overgrip and Grips Explained." },
    ],
  },
  {
    id: "guide-beginner-padel-gear",
    slug: "beginner-padel-gear-guide",
    title: "Beginner Padel Gear Guide",
    guideType: "setup",
    categoryId: "cat-padel-rackets",
    subject: "beginner padel gear",
    outcome: "build a forgiving first kit without copying pro diamonds",
    factors: ["Forgiving racket", "Court shoes", "Fresh balls", "Overgrips", "Optional bag"],
    comparison: ["Forgiving starter kit", "Pro-copy kit"],
    products: ["prod-bullpadel-indiga-ctr", "prod-adidas-courtstabil", "prod-head-padel-pro-s", "prod-wilson-overgrip"],
    tool: "padel-racket-finder",
    bestHref: "/best/padel-rackets-beginners",
    browseHref: "/padel/gear",
    relatedBest: ["best-padel-rackets-beginners", "best-padel-shoes", "best-padel-overgrips", "best-padel-bags"],
    relatedTools: ["padel-racket-finder"],
    startHere: true,
    featured: true,
    priority: 5,
    quickAnswer: "Start with a forgiving round/soft racket (Indiga CTR or Comfort Soft class), court shoes with real lateral grip, a fresh pressurized can, and spare overgrips. Skip pro diamonds and oversized tournament bags until the basics are solved.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Beginner kit = Indiga CTR / Comfort Soft class racket + Courtquick or Resolution-class shoes + Pro S/Pro+ balls + Wilson/HaC overgrips. Add AT10 Team-class bag when you carry shoes and a second frame." },
      { id: "s-why", heading: "Why a beginner kit differs", body: "Early padel is contact and footwork. Gear that demands pro timing slows learning." },
      { id: "s-framework", heading: "Decision framework", body: "Racket forgiveness → shoe grip → balls freshness → overgrips → bag last. Use the Finder only after you know you want a racket upgrade path." },
      { id: "s-tech", heading: "Technical explanation", body: "Soft round frames enlarge usable contact. Court outsoles protect ankles. Pressurized balls keep bounce honest so you learn real trajectories." },
      { id: "s-examples", heading: "Catalog examples", body: "Racket: Indiga CTR (not Coello Pro). Shoes: Courtquick / Resolution. Balls: HEAD Pro S/Pro+. Overgrips: Wilson or HaC. See Padel Starter Kit setup and Best Beginners." },
      { id: "s-trade", heading: "Trade-offs", body: "Starter gear forgives and will be outgrown. Buying “forever” attack gear early often means selling a mistake." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Coello/Hack first rackets; running shoes on court; one dead can for months; no overgrip spares." },
      { id: "s-next", heading: "Related", body: "Complete Gear Checklist, Best Beginners, How to Choose a Padel Racket." },
    ],
  },
  {
    id: "guide-complete-padel-gear-checklist",
    slug: "complete-padel-gear-checklist",
    title: "Complete Padel Gear Checklist",
    guideType: "setup",
    categoryId: "cat-padel-rackets",
    subject: "a complete padel gear checklist",
    outcome: "verify required vs optional kit before a match or trip without overspending",
    factors: ["Required match kit", "Optional extras", "Travel constraints", "Climate", "Level"],
    comparison: ["Essential match kit", "Expanded tournament kit"],
    products: ["prod-bullpadel-indiga-ctr", "prod-asics-gel-resolution-padel", "prod-nox-at10-team-bag", "prod-wilson-overgrip"],
    bestHref: "/best/padel-rackets",
    browseHref: "/padel/gear",
    relatedBest: ["best-padel-rackets", "best-padel-shoes", "best-padel-bags", "best-padel-overgrips"],
    relatedTools: ["padel-racket-finder"],
    priority: 12,
    featured: true,
    quickAnswer: "Required: racket, court shoes, balls, overgrip, water. Strongly useful: spare overgrips, towel, thermo bag for heat. Optional: second racket, wristbands, backup shoes. Buy depth after the essentials work.",
    sections: [
      { id: "s-answer", heading: "Clear answer", body: "Checklist by priority: (1) forgiving-enough racket, (2) gripping court shoes, (3) fresh-enough balls, (4) overgrips, (5) bag that carries shoes separately when needed. Everything else is optimisation." },
      { id: "s-why", heading: "Why a checklist helps", body: "Players overspend on cosmetics and underbuy consumables. A checklist keeps money on the court." },
      { id: "s-framework", heading: "Decision framework", body: "Club night vs tournament travel vs hot-car storage each change the optional tier. Level changes racket role, not whether shoes matter." },
      { id: "s-tech", heading: "Technical explanation", body: "Consumables (balls, overgrips) degrade. Durable goods (racket, shoes, bag) should be chosen for role and replaced on wear/injury signals." },
      { id: "s-examples", heading: "Catalog examples", body: "Map items to Indiga/Vertex/Hack roles as appropriate, Resolution/Courtquick shoes, AT10 Team bag, Wilson/HaC overgrips, HEAD Pro cans." },
      { id: "s-trade", heading: "Trade-offs", body: "Minimal kits travel light and risk missing a spare. Expanded kits cover failures and weigh more." },
      { id: "s-mistakes", heading: "Common mistakes", body: "Two fashion shoes, zero overgrips; tournament bag with one tired can; no plan for heat storage." },
      { id: "s-next", heading: "Related", body: "Beginner Gear Guide and each category How-to Choose guide." },
    ],
  },
];

for (const g of rest) add({ ...g, unique: g.unique || null });

/**
 * Decision-facing openers — never the old "You are solving for … marketing labels" template.
 * Keep in sync with src/lib/guides/explainers/padel-knowledge-unique.ts.
 */
const DEFINITION_INTROS_BY_SLUG = {
  "how-to-choose-a-padel-racket":
    "You are matching geometry and response to how you already play — not copying a World Padel Tour bag.",
  "padel-racket-shapes-explained":
    "Round, teardrop and diamond move the sweet spot and tip mass — use shape to shortlist, then confirm balance and weight before you buy.",
  "round-vs-teardrop-vs-diamond-padel-rackets":
    "Pick the silhouette that matches your mishit rate and finishing ability: round when contact is messy, diamond only when you already place overheads.",
  "padel-racket-balance-explained":
    "Balance tells you whether the tip feels light in preparation or heavy through the ball — measure it instead of inferring it from a shape label.",
  "padel-racket-weight-explained":
    "Choose a published weight band you can swing for two hours before you compare carbon weave marketing.",
  "padel-racket-materials-explained":
    "Face and frame materials change feel and durability — read them as response inputs, not a prestige ladder.",
  "carbon-vs-fiberglass-padel-rackets":
    "Fiberglass usually forgives off-centre hits; carbon firms the exit — pick the fibre for the contact quality you actually have.",
  "padel-racket-cores-eva-foam-explained":
    "Soft vs hard EVA (and multi-density cores) set forgiveness and ball exit — treat core density as a feel filter, not a power guarantee.",
  "soft-vs-hard-padel-rackets":
    "Soft packages help when your contact is still developing; hard packages reward clean timing with a crisper exit — choose for today’s consistency.",
  "how-padel-racket-sweet-spots-work":
    "Sweet-spot claims describe forgiveness geometry, not a free power map — judge where usable contact sits for your mishit pattern.",
  "how-to-choose-padel-shoes":
    "Court grip and lateral lockdown matter more than upper colour — shortlist shoes that hold cuts on your club’s surface.",
  "padel-vs-tennis-shoes":
    "A tennis court shoe can work; a padel-specific last earns the upgrade when lateral cuts and dusty outdoor grip keep failing.",
  "padel-shoe-outsoles-explained":
    "Match herringbone, clay and hard-court compounds to the surface you play on every week — not to a catalogue lifestyle shot.",
  "how-long-do-padel-balls-last":
    "Pressurized cans lose bounce across sessions faster than many tennis habits suggest — plan can life from match feel, not the print date alone.",
  "how-to-choose-padel-balls":
    "Choose a pressurized competition can for the court speed you want, within what the catalog actually lists — speed preference first, brand second.",
  "how-to-choose-a-padel-bag":
    "Size paletero volume, thermo wells and commute style to how you actually get to court — capacity without a racket job is wasted weight.",
  "padel-grips-overgrips-explained":
    "Build a comfortable handle diameter first, then pick tack versus absorption for how you sweat — feel beats packaging claims.",
  "padel-grip-vs-overgrip":
    "Rebuild the base grip when the foundation is gone; refresh an overgrip when tack or moisture control fails mid-session.",
  "how-often-should-you-replace-a-padel-overgrip":
    "Replace overgrips when tack dies or sweat slips the handle — session failure beats any calendar rule of thumb.",
  "beginner-padel-gear-guide":
    "Build a forgiving first kit around a round/soft frame, court shoes and fresh balls — skip copying pro diamonds until contact is reliable.",
  "complete-padel-gear-checklist":
    "Separate must-have match kit from nice-to-have extras so you pack for the session without overspending on unused accessories.",
};

function definitionIntroFor(g) {
  if (DEFINITION_INTROS_BY_SLUG[g.slug]) return DEFINITION_INTROS_BY_SLUG[g.slug];
  // Fallback: decision-facing sentence from subject + first factor — never the marketing-labels template.
  const lead = g.factors?.[0] ? g.factors[0].toLowerCase() : "the real constraint";
  return `Decide ${g.subject} from ${lead} and how you actually play — then verify catalog specs before you buy.`;
}

function buildUnique(g) {
  if (g.unique) return g.unique;
  const [a, b] = g.comparison;
  const f = g.factors;
  return {
    deck: g.quickAnswer.slice(0, 140) + (g.quickAnswer.length > 140 ? "…" : ""),
    quickAnswerBullets: [
      g.sections[0]?.body?.slice(0, 160) || g.quickAnswer,
      g.sections[1]?.body?.slice(0, 160) || `Why it matters: ${g.outcome}.`,
      g.sections[2]?.body?.slice(0, 160) || `Use ${f[0]} before ${f[f.length - 1]}.`,
      `Catalog examples stay role-based — verify current generation and offers.`,
    ].map((s) => (s.length > 180 ? s.slice(0, 177) + "…" : s)),
    definitionTitle: `What ${g.subject} decisions are really about`,
    definitionIntro: definitionIntroFor(g),
    definitionParas: [
      g.sections.find((s) => s.id.includes("tech") || s.heading.includes("Technical"))?.body ||
        g.sections[0].body,
      g.sections.find((s) => s.heading.includes("framework") || s.heading.includes("Decision"))?.body ||
        g.sections[2]?.body ||
        g.sections[0].body,
      "Treat every product example as a role illustration from the Kitletics padel catalog. Confirm model year, published specs and return/demo options before you buy.",
    ],
    whyTitle: g.sections[1]?.heading || "Why this decision matters",
    whyParas: [
      g.sections[1]?.body || `Getting ${g.subject} wrong costs matches and confidence.`,
      "Use evidence from normalized catalog fields and manufacturer specs; treat unverified claims as hypotheses.",
    ],
    factorWhat: f.map((title) => `How ${title.toLowerCase()} shows up in ${g.subject}.`),
    factorChanges: f.map(
      (title) => `Your level, courts and session length change how much ${title.toLowerCase()} should weigh.`,
    ),
    factorNotices: f.map(
      (title) => `Whether ${title.toLowerCase()} still helps late in a match or long session.`,
    ),
    comparisonRows: [
      { label: "Primary job", values: [a, b, "Your recurring miss"] },
      { label: "Best when", values: [`${a} fits today’s constraint`, `${b} fits today’s constraint`, "Which constraint is louder"] },
      { label: "Watch for", values: ["Over-forgiving / under-powered feel", "Over-demanding / harsh feel", "Honest self-assessment"] },
    ],
    tradeoffs: {
      gains: ["Clearer role fit", "Fewer gear-induced errors", "Faster shortlisting", "Catalog-backed examples"],
      giveUps: ["One-size prestige shopping", "Copying pro bags blindly", "Ignoring consumables", "Shape/material stereotypes alone"],
      footnote: "Revisit the choice when your mishit pattern or courts change — not when an ad drops.",
    },
    callout: {
      title: "Catalog honesty over SEO breadth",
      body: "Where the published catalog is thin (for example balls), this guide stays educational and refuses fake rankings. Awards live on Best pages only when shortlists are awardable.",
    },
    decisionSteps: [
      { id: "name", title: "Name the job", body: `State the outcome in one line: ${g.outcome}.` },
      { id: "filter", title: "Apply hard filters", body: `Start with ${f[0]} and ${f[1] || f[0]} before optional features.` },
      { id: "compare", title: `Compare ${a} vs ${b}`, body: "Keep one option from each column only if your level supports both." },
      { id: "examples", title: "Check catalog roles", body: "Open the example products as roles, not as a forced ranking." },
      { id: "next", title: "Take the next link", body: "Continue to the related Best guide, Finder, or peer explainer." },
      { id: "buy", title: "Buy for today’s constraint", body: "Prefer the option you can use twice a week over the one that looks like a final." },
    ],
    branchQuestion: `Which side of ${a} vs ${b} matches your week?`,
    branchOptions: [
      { label: a, result: `Bias the shortlist toward ${a.toLowerCase()} examples and related Best guides.` },
      { label: b, result: `Bias the shortlist toward ${b.toLowerCase()} examples and related Best guides.` },
      { label: "Not sure yet", result: "Stay on the more forgiving / essential side until your mishit pattern is clear." },
    ],
    exampleLabels: g.products.slice(0, 4).map((_, i) => ["Role A", "Role B", "Role C", "Role D"][i]),
    exampleWhys: g.products.slice(0, 4).map(
      (id, i) =>
        `${id} illustrates a concrete catalog role for ${g.subject} (${g.factors[Math.min(i, g.factors.length - 1)]}).`,
    ),
    exampleTradeoffs: g.products.slice(0, 4).map(
      () => "Role fit is not universal — verify specs, generation and feel against your constraint.",
    ),
    mistakes: (g.sections.find((s) => s.heading.includes("mistake"))?.body || "")
      .split(";")
      .map((part, i) => ({
        id: `m${i + 1}`,
        title: part.trim().slice(0, 48) || `Mistake ${i + 1}`,
        body: part.trim() || "Avoid prestige shopping without a job.",
      }))
      .filter((m) => m.body)
      .slice(0, 4),
    faqs: [
      {
        question: `What is the quick answer on ${g.subject}?`,
        answer: g.quickAnswer,
      },
      {
        question: `How should I decide between ${a} and ${b}?`,
        answer: `Match the column to your recurring constraint, then confirm with catalog examples and a Best guide or Finder where available.`,
      },
      {
        question: "Which products illustrate this guide?",
        answer: `See the example roles tied to ${g.products.filter((p, i, a) => a.indexOf(p) === i).join(", ")}. They are roles, not a universal ranking.`,
      },
      {
        question: "What should I read next?",
        answer: `Use the related guides cluster and Best links on this page — especially peers covering adjacent decisions for ${g.subject}.`,
      },
    ],
  };
}

// Enrich example labels for known guides
const LABEL_OVERRIDES = {
  "padel-racket-shapes-explained": ["Round beginner", "Hybrid all-court", "Diamond attack", "Teardrop Genius"],
  "round-vs-teardrop-vs-diamond-padel-rackets": ["Round", "Teardrop Genius", "Diamond Hack"],
  "padel-racket-balance-explained": ["Low-balance round", "Motion handling", "Hack high leverage", "Metalbone attack"],
  "padel-racket-weight-explained": ["Ionic Light", "Extreme Motion", "Vertex 05", "Metalbone 3.5"],
  "padel-racket-materials-explained": ["Comfort Soft glass/soft", "Hack Comfort hybrid", "Genius 12K carbon", "Hack 04 carbon"],
  "carbon-vs-fiberglass-padel-rackets": ["Comfort Soft", "Equation Soft", "Genius 12K", "Technical Viper"],
  "padel-racket-cores-eva-foam-explained": ["Equation Soft", "Comfort Soft", "Vertex 05", "Hack 04"],
  "soft-vs-hard-padel-rackets": ["Equation Soft", "Comfort Soft", "Hack 04", "Metalbone 3.5"],
  "how-padel-racket-sweet-spots-work": ["Indiga centred", "ML10 control", "Vertex middle", "Hack high"],
  "how-to-choose-padel-shoes": ["Resolution stability", "Courtquick grip", "Jet Premura connected", "T.Slam value"],
  "padel-vs-tennis-shoes": ["Resolution padel", "Revolt crossover", "Courtquick", "Jet Premura"],
  "padel-shoe-outsoles-explained": ["Courtquick", "Resolution", "Jet Premura", "T.Slam"],
  "how-long-do-padel-balls-last": ["Pro S fresh", "Pro+ fresh", "Pro S training-tired"],
  "how-to-choose-padel-balls": ["Pro S faster", "Pro+ control", "Pro S match can"],
  "how-to-choose-a-padel-bag": ["AT10 Team club", "RH Pro tournament", "AT10 Team thermo"],
  "padel-grips-overgrips-explained": ["Wilson tack", "HaC absorption", "Wilson rotation"],
  "padel-grip-vs-overgrip": ["Wilson overgrip", "HaC overgrip", "Wilson stack"],
  "how-often-should-you-replace-a-padel-overgrip": ["Wilson tack life", "HaC sweat life", "Fresh Wilson"],
  "beginner-padel-gear-guide": ["Indiga racket", "Courtquick shoes", "Pro S balls", "Wilson overgrips"],
  "complete-padel-gear-checklist": ["Starter racket role", "Stability shoes", "Club bag", "Overgrips"],
};

for (const g of GUIDES) {
  g.unique = buildUnique(g);
  const labels = LABEL_OVERRIDES[g.slug];
  if (labels) {
    g.unique.exampleLabels = labels;
    g.unique.exampleWhys = labels.map(
      (label, i) =>
        `${label} maps to ${g.products[i]} as a catalog role for this guide — not a universal #1.`,
    );
  }
  // dedupe products to min 3 unique where possible
  const uniq = [...new Set(g.products)];
  while (uniq.length < 3) uniq.push(uniq[0]);
  g.products = uniq.slice(0, Math.max(3, Math.min(4, uniq.length)));
}

function esc(str) {
  return JSON.stringify(str);
}

function emitUnique() {
  let out = `/**
 * Unique authored copy for padel equipment knowledge-center guides.
 * Generated by scripts/tmp/generate-padel-knowledge-center.mjs — edit carefully.
 */

import type { RacketUnique } from "@/lib/guides/explainers/racket-unique-copy";

export const PADEL_KNOWLEDGE_UNIQUE: Record<string, RacketUnique> = {\n`;
  for (const g of GUIDES) {
    const u = g.unique;
    out += `  ${esc(g.slug)}: ${JSON.stringify(u, null, 2).replace(/\n/g, "\n  ")},\n`;
  }
  out += `};\n`;
  return out;
}

function emitPlans() {
  let out = `/**
 * Compact explainer plans for the padel equipment knowledge center.
 * Generated by scripts/tmp/generate-padel-knowledge-center.mjs
 */

import type { FAQ } from "@/domain/editorial/types";
import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import { resolveHeroFromProductIds } from "@/lib/guides/guide-product-hero";
import { PADEL_KNOWLEDGE_UNIQUE } from "@/lib/guides/explainers/padel-knowledge-unique";

type PadelKnowledgeSpec = {
  slug: string;
  title: string;
  subject: string;
  outcome: string;
  factors: [string, string, string, string, ...string[]];
  comparison: [string, string];
  products: [string, string, string, ...string[]];
  tool?: "padel-racket-finder";
  bestHref: string;
  browseHref: string;
};

const PADEL_KNOWLEDGE_SPECS: PadelKnowledgeSpec[] = [\n`;
  for (const g of GUIDES) {
    const factors = g.factors.length >= 4 ? g.factors : [...g.factors, ...Array(4 - g.factors.length).fill("Context")];
    out += `  {
    slug: ${esc(g.slug)},
    title: ${esc(g.title)},
    subject: ${esc(g.subject)},
    outcome: ${esc(g.outcome)},
    factors: ${JSON.stringify(factors)},
    comparison: ${JSON.stringify(g.comparison)},
    products: ${JSON.stringify(g.products)},
    ${g.tool ? `tool: ${esc(g.tool)},` : ""}
    bestHref: ${esc(g.bestHref)},
    browseHref: ${esc(g.browseHref)},
  },\n`;
  }
  out += `];

function makePlan(spec: PadelKnowledgeSpec): CompactExplainerPlan {
  const u = PADEL.KNOWLEDGE_UNIQUE_PLACEHOLDER;
  return {} as CompactExplainerPlan;
}
`;
  // Fix - write proper makePlan
  out = out.replace(
    `function makePlan(spec: PadelKnowledgeSpec): CompactExplainerPlan {
  const u = PADEL.KNOWLEDGE_UNIQUE_PLACEHOLDER;
  return {} as CompactExplainerPlan;
}
`,
    `function makePlan(spec: PadelKnowledgeSpec): CompactExplainerPlan {
  const u = PADEL_KNOWLEDGE_UNIQUE[spec.slug];
  if (!u) throw new Error(\`Missing PADEL_KNOWLEDGE_UNIQUE for \${spec.slug}\`);

  const toolHref = spec.tool ? \`/tools/\${spec.tool}\` : spec.browseHref;
  const examples = spec.products.slice(0, Math.min(4, spec.products.length)).map((productId, index) => ({
    productId,
    approachLabel: u.exampleLabels[index] ?? \`Approach \${index + 1}\`,
    whyIllustrates: u.exampleWhys[index] ?? "Catalog role example for this guide.",
    bestFor: [
      spec.factors[Math.min(index, spec.factors.length - 1)]!,
      spec.comparison[index % 2]!,
    ],
    tradeoff: u.exampleTradeoffs[index] ?? "Verify fit and the complete setup.",
  }));

  return {
    slug: spec.slug,
    displayTitle: spec.title,
    deck: u.deck,
    eyebrow: "Buying Guide",
    ...resolveHeroFromProductIds(
      spec.products,
      "/images/padel/hero.jpg",
      \`Padel equipment: \${spec.subject}\`,
    ),
    quickAnswerBullets: u.quickAnswerBullets,
    methodologyNote:
      "Needs-research guide: manufacturer specifications and normalized catalog fields establish the comparison. Unverified marketing claims are treated as claims rather than measured performance. Catalog examples are roles, not affiliate rankings.",
    finder: spec.tool
      ? {
          toolSlug: spec.tool,
          title: \`Find \${spec.subject}\`,
          description: "Turn hard constraints into an explainable shortlist.",
          ctaLabel: "Open the finder →",
        }
      : undefined,
    decisionLinks: [
      {
        label: spec.tool ? "Use the finder →" : "Browse current options →",
        href: toolHref,
      },
      { label: "See related recommendations →", href: spec.bestHref },
    ],
    definition: {
      title: u.definitionTitle,
      intro: u.definitionIntro,
      paragraphs: [...u.definitionParas],
    },
    whyItMatters: {
      title: u.whyTitle,
      paragraphs: [...u.whyParas],
    },
    factors: {
      title: \`\${spec.factors.length} factors that should drive the choice\`,
      intro:
        "Use these as connected filters for this guide’s job — not a generic equipment checklist.",
      cards: spec.factors.map((title, index) => ({
        id: \`factor-\${index + 1}\`,
        title,
        whatItIs: u.factorWhat[index] ?? \`The \${title.toLowerCase()} requirement.\`,
        howItChanges:
          u.factorChanges[index] ??
          "Your level and conditions change the useful range.",
        whatYouNotice:
          u.factorNotices[index] ??
          "Whether the choice still works late in a match.",
      })),
    },
    comparison: {
      title: \`\${spec.comparison[0]} vs \${spec.comparison[1]}\`,
      columns: [spec.comparison[0], spec.comparison[1], "Choose based on"],
      rows: u.comparisonRows,
      footnote:
        "Category tendencies are starting points, not guarantees of individual feel.",
    },
    tradeoffs: {
      title: "What you gain — and give up",
      gains: u.tradeoffs.gains,
      giveUps: u.tradeoffs.giveUps,
      footnote: u.tradeoffs.footnote,
    },
    callouts: [
      {
        id: "marketing-limit",
        title: u.callout.title,
        body: u.callout.body,
        tone: "caution",
      },
    ],
    decision: {
      title: "Decision steps for this guide",
      steps: u.decisionSteps,
      branches: {
        question: u.branchQuestion,
        options: u.branchOptions,
      },
    },
    examples: {
      title: \`\${examples.length} approaches for this decision\`,
      disclaimer:
        "These products demonstrate distinct roles rather than a ranking. Verify current specifications and availability.",
      items: examples,
    },
    compareProductIds: spec.products,
    bestGuideHref: spec.bestHref,
    bestGuideLabel: "See related recommendations →",
    mistakes: u.mistakes,
    ctaFinder: {
      title: spec.tool
        ? "Turn the framework into a shortlist"
        : "Compare current catalog options",
      body: spec.tool
        ? "Use hard constraints before optional features."
        : "Browse after the role is clear.",
      ctaLabel: spec.tool ? "Open the finder →" : "Browse options →",
      href: toolHref,
    },
    ctaBest: {
      title: "Want current recommendations?",
      body: "Open the related Best guide after non-negotiables are set.",
      ctaLabel: "See related recommendations →",
      href: spec.bestHref,
    },
    productExampleRoles: examples.map((example) => ({
      productId: example.productId,
      roleLabel: example.approachLabel,
    })),
    productRailTitle: \`Examples for this \${spec.subject} decision\`,
    productRailBrowseHref: spec.browseHref,
    productRailBrowseLabel: "Browse current options →",
  };
}

export const PADEL_KNOWLEDGE_PLANS: CompactExplainerPlan[] =
  PADEL_KNOWLEDGE_SPECS.map(makePlan);

export const padelKnowledgeConfigs = PADEL_KNOWLEDGE_PLANS.map(
  buildExplainerFromPlan,
);

export const padelKnowledgeFaqs: FAQ[] = PADEL_KNOWLEDGE_SPECS.flatMap((spec) => {
  const u = PADEL_KNOWLEDGE_UNIQUE[spec.slug]!;
  return u.faqs.map((faq, index) => ({
    id: \`faq-\${spec.slug}-\${index + 1}\`,
    question: faq.question,
    answer: faq.answer,
    sportId: "sport-padel" as const,
  }));
});
`,
  );
  return out;
}

function emitBuyingGuides() {
  let out = `/**
 * Padel equipment knowledge-center BuyingGuides.
 * Generated by scripts/tmp/generate-padel-knowledge-center.mjs
 */

import type { BuyingGuide } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();
const padelSportId = "sport-padel" as const;

export const padelBuyingGuides: BuyingGuide[] = [\n`;
  for (const g of GUIDES) {
    out += `  {
    id: ${esc(g.id)},
    slug: ${esc(g.slug)},
    title: ${esc(g.title)},
    sportId: padelSportId,
    categoryId: ${esc(g.categoryId)},
    guideType: ${esc(g.guideType)},
    ${g.startHere ? "startHere: true," : ""}
    ${g.featured ? "featured: true," : ""}
    ${g.priority != null ? `priority: ${g.priority},` : ""}
    relatedProductIds: ${JSON.stringify(g.products)},
    relatedUseCaseIds: ${JSON.stringify(g.relatedUseCases || [])},
    quickAnswer: ${esc(g.quickAnswer)},
    relatedBestGuideIds: ${JSON.stringify(g.relatedBest)},
    relatedToolSlugs: ${JSON.stringify(g.relatedTools || (g.tool ? [g.tool] : []))},
    relatedComparisonIds: ${JSON.stringify(g.relatedCompare || [])},
    relatedGuideIds: ${JSON.stringify(g.relatedGuides)},
    sections: ${JSON.stringify(g.sections, null, 2).replace(/\n/g, "\n    ")},
    faqIds: [],
    ...pub,
  },\n`;
  }
  out += `];\n`;
  return out;
}

const uniquePath = path.join(ROOT, "src/lib/guides/explainers/padel-knowledge-unique.ts");
const plansPath = path.join(ROOT, "src/lib/guides/explainers/padel-knowledge-plans.ts");
const guidesPath = path.join(ROOT, "src/content/padel/buying-guides/index.ts");

fs.writeFileSync(uniquePath, emitUnique());
fs.writeFileSync(plansPath, emitPlans());
fs.writeFileSync(guidesPath, emitBuyingGuides());

console.log(`Wrote ${GUIDES.length} guides:`);
console.log(`- ${uniquePath}`);
console.log(`- ${plansPath}`);
console.log(`- ${guidesPath}`);
console.log(GUIDES.map((g) => g.slug).join("\n"));

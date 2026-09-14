/**
 * High-value padel racket comparisons — derived from catalog relationships.
 * No mass permutations. Previous-gen only when labeled as generation comps.
 * Dimension winners omitted when evidence is insufficient.
 */

import type { Comparison } from "@/domain/editorial/types";
import {
  biggestDiff,
  choose,
  dim,
  keyDiff,
  strongPadelComparison,
  pickForUseCase,
} from "@/content/padel/comparisons/build";
import { padelSoftComparisons } from "@/content/padel/comparisons/soft";

const V05 = "prod-bullpadel-vertex-05";
const V05H = "prod-bullpadel-vertex-05-hybrid";
const V04 = "prod-bullpadel-vertex-04";
const H04 = "prod-bullpadel-hack-04";
const AT12 = "prod-nox-at10-12k-2026";
const AT18 = "prod-nox-at10-18k-2026";
const ATTACK = "prod-nox-at10-attack-18k-2026";
const MB35 = "prod-adidas-metalbone-3-5-2026";
const TV = "prod-babolat-technical-viper";
const CV = "prod-babolat-counter-viper";
const COELLO = "prod-head-coello-pro";
const BELA = "prod-wilson-bela-pro";
const ML10 = "prod-nox-ml10-pro-cup";
const INDIGA = "prod-bullpadel-indiga-ctr";

export const padelComparisons: Comparison[] = [
  // —— Same-brand control/all-court vs power ——
  strongPadelComparison({
    id: "cmp-vertex05-vs-hack04",
    slug: "bullpadel-vertex-05-vs-hack-04-2026",
    title: "Bullpadel Vertex 05 vs Hack 04",
    shortDescription:
      "Same-brand diamond flagships: Vertex usable attack zone versus Hack finishing bias.",
    productIds: [V05, H04],
    summary:
      "Vertex 05 and Hack 04 are both current Bullpadel diamond attackers, but they do different jobs. Vertex keeps a wider usable zone for redirects and all-court play; Hack 04 pushes further into smash authority with a denser MultiEva attack response. Neither is a beginner frame — choose by whether forgiveness inside a diamond still matters more than peak finishing.",
    verdict:
      "No universal winner. Choose Vertex 05 when you want diamond attack with more usable control; choose Hack 04 when smash output outweighs forgiveness and your timing already supports a compact attack mold.",
    criteria: [
      dim("shape", undefined, "Both diamond — silhouette alone does not decide this pair."),
      dim("power", H04, "Hack 04 is the clearer finishing-power tool in this family."),
      dim("control", V05, "Vertex 05 keeps more usable mid-court control inside a diamond."),
      dim("forgiveness", V05, "Wider usable sweet-zone story than Hack."),
      dim("comfort", undefined, "Both are performance diamonds — comfort is secondary to geometry."),
      dim("maneuverability", undefined, "Insufficient to declare a clear winner without measured swingweight."),
      dim("core", H04, "Hack denser MultiEva attack bias vs Vertex MultiEva balance."),
      dim("feel", undefined, "Both firm performance packages; demo decides."),
      dim("player-level", undefined, "Both advanced — not a beginner pair."),
      dim("play-style", V05, "Vertex covers all-court attack; Hack is left-side finishing first."),
      dim("price", undefined, "Live offers decide — do not invent street prices."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", H04, "Maximum finishing bias within the Bullpadel diamond pair."),
      pickForUseCase("uc-padel-balanced", V05, "More usable mid-court control while staying attack-capable."),
      pickForUseCase("uc-padel-control", V05, "Still a diamond, but the control-friendlier of the two."),
    ],
    keyDifferences: [
      biggestDiff(
        "usable zone vs finishing bias",
        { productId: V05, impact: "Wider usable attack zone" },
        { productId: H04, impact: "Peak smash authority" },
        "This is the same-brand fork: Vertex when you still redirect and defend inside a diamond; Hack when finishing is the weekly job.",
      ),
      keyDiff(
        "core-response",
        "Core / attack response",
        { productId: V05, impact: "MultiEva with more all-court usable feel" },
        { productId: H04, impact: "Denser MultiEva attack package" },
        "Core marketing names overlap; the published job split is balance vs pure attack.",
      ),
    ],
    chooseProductReasons: [
      choose(V05, "You want Bullpadel diamond power without Hack-level unforgiveness on mishits and late bandejas."),
      choose(V05, "You still place viboras and glass redirects as often as you finish overheads.", "Advanced all-court"),
      choose(H04, "Smash output and left-side finishing outweigh forgiveness, and your preparation already supports tip mass."),
      choose(H04, "Vertex still feels soft on finishers and you want the clearer Hack attack mold.", "Left-side finishing"),
    ],
  }),

  // —— Nox vs Bullpadel flagships ——
  strongPadelComparison({
    id: "cmp-vertex05-vs-at10-12k",
    slug: "bullpadel-vertex-05-vs-nox-at10-12k-2026",
    title: "Bullpadel Vertex 05 vs Nox AT10 Genius 12K",
    shortDescription:
      "Spanish flagship rivals: Vertex diamond vs AT10 Genius teardrop all-court — not Attack diamond.",
    productIds: [V05, AT12],
    summary:
      "Vertex 05 is a current Bullpadel diamond flagship with a medium-large usable-zone story. AT10 Genius 12K Alum XTREM is Nox’s firmer Genius teardrop — an all-court Tapia-line frame, not the Attack diamond. The real choice is diamond Bullpadel geometry versus Nox Genius teardrop response, not a fake “two identical diamonds” story.",
    verdict:
      "No single winner. Choose Vertex 05 for Bullpadel diamond attack with usable control; choose AT10 Genius 12K when you want Nox teardrop all-court punch and Alum XTREM face response.",
    criteria: [
      dim("shape", V05, "Vertex diamond vs Genius teardrop — primary geometry split."),
      dim("balance", undefined, "Confirm published balance; do not infer only from silhouette."),
      dim("surface", AT12, "Alum XTREM 12K face is the clearer Nox surface story."),
      dim("power", undefined, "Both high for advanced players — no honest universal power crown."),
      dim("control", V05, "Diamond Vertex still reads more control-usable than a compact Genius punch story."),
      dim("forgiveness", V05, "Medium-large usable zone vs more compact Genius attack feel."),
      dim("comfort", undefined, "Insufficient without on-court feel evidence."),
      dim("maneuverability", undefined, "Insufficient without measured handling data."),
      dim("core", undefined, "Different core systems — treat as distinct, not ranked."),
      dim("play-style", AT12, "Genius teardrop suits all-court; Vertex leans diamond attack."),
      dim("player-level", undefined, "Both advanced / high-intermediate+."),
      dim("price", undefined, "Regional offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-balanced", AT12, "Genius teardrop all-court when attack and defence share the week."),
      pickForUseCase("uc-padel-power", V05, "Diamond Vertex when finishing geometry leads."),
      pickForUseCase("uc-padel-control", V05, "More usable zone inside the advanced pair."),
    ],
    keyDifferences: [
      biggestDiff(
        "diamond Vertex vs Genius teardrop",
        { productId: V05, impact: "Diamond attack geometry" },
        { productId: AT12, impact: "Teardrop Genius all-court" },
        "Do not treat Genius 12K as Attack. Attack 18K is the Nox diamond sibling; this pair is Vertex diamond versus Genius teardrop.",
      ),
      keyDiff(
        "face",
        "Face response",
        { productId: V05, impact: "Bullpadel 12K MultiEva package" },
        { productId: AT12, impact: "Nox 12K Alum XTREM" },
        "Face systems differ by brand philosophy — demo blocks and viboras, not K-count ladders.",
      ),
    ],
    chooseProductReasons: [
      choose(V05, "You want Bullpadel Vertex diamond geometry with a medium-large usable sweet zone."),
      choose(V05, "You prefer diamond finishing shape over Genius teardrop all-court."),
      choose(AT12, "You want Nox AT10 Genius teardrop with Alum XTREM punch — not Attack diamond."),
      choose(AT12, "Your week is all-court more than pure left-side finishing."),
    ],
  }),

  // —— Adidas vs Nox (current Metalbone) ——
  strongPadelComparison({
    id: "cmp-at10-12k-vs-metalbone",
    slug: "nox-at10-12k-vs-adidas-metalbone-2026",
    title: "Nox AT10 Genius 12K vs Adidas Metalbone 3.5",
    shortDescription:
      "Nox Genius teardrop versus current Metalbone 3.5 diamond with Weight & Balance — not previous 3.3.",
    productIds: [AT12, MB35],
    summary:
      "AT10 Genius 12K is a firmer Nox teardrop all-court flagship. Metalbone 3.5 is the current Adidas diamond attacker with Soft Performance EVA character and Weight & Balance tuning. This page uses Metalbone 3.5, not previous-generation 3.3. Pick by teardrop Genius response versus tunable Metalbone diamond attack.",
    verdict:
      "Contextual. Choose Genius 12K for Nox teardrop all-court and Alum XTREM face punch; choose Metalbone 3.5 when Soft EVA diamond feel and on-racket weight/balance tuning matter more.",
    criteria: [
      dim("shape", MB35, "Metalbone diamond vs Genius teardrop."),
      dim("surface", AT12, "Alum XTREM is the clearer face-response story."),
      dim("core", MB35, "Soft Performance EVA is central to Metalbone’s published feel."),
      dim("power", undefined, "Both attack-capable — no universal power winner without player context."),
      dim("control", AT12, "Teardrop Genius tends to stay more all-court usable than tip-heavy diamonds."),
      dim("forgiveness", AT12, "Genius outline usually kinder than attack diamonds for developing timing."),
      dim("comfort", MB35, "Soft EVA Metalbone story when comfort inside power is the ask."),
      dim("maneuverability", undefined, "Metalbone plates can shift feel — declare only after setup."),
      dim("feel", MB35, "Soft EVA vs firmer Alum XTREM Genius response."),
      dim("play-style", AT12, "All-court Genius vs diamond Metalbone attack."),
      dim("frame", MB35, "Weight & Balance system is the clearer tunability story."),
      dim("price", undefined, "Live offers only."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-balanced", AT12, "Genius teardrop when the week mixes attack and defence."),
      pickForUseCase("uc-padel-power", MB35, "Current Metalbone diamond when finishing + Soft EVA tuning lead."),
      pickForUseCase("uc-padel-control", AT12, "More all-court usable of the two geometries."),
    ],
    keyDifferences: [
      biggestDiff(
        "Genius teardrop vs tunable Metalbone diamond",
        { productId: AT12, impact: "Teardrop Alum XTREM all-court" },
        { productId: MB35, impact: "Diamond Soft EVA + Weight & Balance" },
        "Current Metalbone award lane is 3.5. Previous 3.3 is not the peer for this decision.",
      ),
      keyDiff(
        "tunability",
        "Setup tunability",
        { productId: AT12, impact: "Fixed Genius construction" },
        { productId: MB35, impact: "Weight & Balance plates" },
        "Only Metalbone offers a published on-racket mass/balance adjustment story here.",
      ),
    ],
    chooseProductReasons: [
      choose(AT12, "You want Nox Genius 12K teardrop geometry and Alum XTREM face response."),
      choose(AT12, "You need all-court coverage more than a tip-heavy diamond."),
      choose(MB35, "You want current Metalbone 3.5 Soft EVA diamond feel plus Weight & Balance tuning."),
      choose(MB35, "You already finish overheads and want Adidas attack geometry — not Metalbone 3.3 leftovers."),
    ],
  }),

  // —— Genius all-round vs Viper attack ——
  strongPadelComparison({
    id: "cmp-nox-babolat",
    slug: "nox-at10-genius-18k-2026-vs-babolat-technical-viper-2026",
    title: "Nox AT10 Genius 18K vs Babolat Technical Viper",
    shortDescription:
      "Genius teardrop all-court versus Technical Viper diamond attack — hybrid vs pure finisher.",
    productIds: [AT18, TV],
    summary:
      "AT10 Genius 18K is the softer/18K Genius teardrop in the Tapia all-court lane. Technical Viper is Babolat’s technical-striker diamond for players who already generate racket-head speed. This is all-court Genius versus finishing Viper — not two interchangeable power frames.",
    verdict:
      "Choose Genius 18K when you need teardrop all-court balance; choose Technical Viper when finishing power and diamond strike preference lead and timing already supports it.",
    criteria: [
      dim("shape", TV, "Diamond Viper vs teardrop Genius."),
      dim("power", TV, "Technical Viper is the clearer finishing tool."),
      dim("control", AT18, "Genius 18K stays more placement-friendly for mixed weeks."),
      dim("forgiveness", AT18, "Teardrop Genius usually more usable than technical diamond."),
      dim("comfort", AT18, "18K Genius core story reads softer than Technical Viper attack."),
      dim("maneuverability", undefined, "No measured swingweight winner declared."),
      dim("spin", undefined, "Insufficient independent spin evidence."),
      dim("play-style", AT18, "All-court vs technical striker."),
      dim("player-level", TV, "Viper demands cleaner contact; Genius tolerates more mixed level."),
      dim("surface", undefined, "Different brand face systems — not ranked by weave count."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-balanced", AT18, "Hybrid all-court when attack and defence share points."),
      pickForUseCase("uc-padel-power", TV, "Finishing power when smash output is the priority."),
      pickForUseCase("uc-padel-control", AT18, "More control-friendly of the advanced pair."),
    ],
    keyDifferences: [
      biggestDiff(
        "all-court Genius vs technical diamond",
        { productId: AT18, impact: "Teardrop all-court Genius 18K" },
        { productId: TV, impact: "Technical-striker diamond" },
        "If you still spray bandejas, Genius is the safer advanced bet; Viper rewards clean technical striking.",
      ),
    ],
    chooseProductReasons: [
      choose(AT18, "You want Nox Genius teardrop all-court balance rather than a pure diamond finisher."),
      choose(AT18, "You attack and defend in equal measure across a club week."),
      choose(TV, "You already generate head speed and want Babolat Technical Viper finishing geometry."),
      choose(TV, "Genius still feels soft on put-aways and you want a technical diamond."),
    ],
  }),

  // —— Same-family control vs power (Viper) ——
  strongPadelComparison({
    id: "cmp-technical-vs-counter-viper",
    slug: "babolat-technical-viper-vs-counter-viper",
    title: "Babolat Technical Viper vs Counter Viper",
    shortDescription:
      "Same Viper family: technical diamond attack versus round Counter control/defence.",
    productIds: [TV, CV],
    summary:
      "Technical Viper and Counter Viper share a Babolat Viper family name but opposite jobs. Technical is the diamond striker; Counter is the rounder control/defence Viper. Do not buy Counter expecting Technical smash authority, or Technical expecting Counter forgiveness.",
    verdict:
      "Choose Technical Viper for diamond finishing; choose Counter Viper for rounder control and counter-punch play inside the Viper family.",
    criteria: [
      dim("shape", TV, "Diamond Technical vs round Counter."),
      dim("power", TV, "Technical is the power/finishing sibling."),
      dim("control", CV, "Counter is the control/defence sibling."),
      dim("forgiveness", CV, "Round Counter sweet-zone vs technical diamond."),
      dim("comfort", CV, "Control round usually kinder on mishits."),
      dim("maneuverability", CV, "Rounder Counter tends to recover faster between balls."),
      dim("play-style", CV, "Counter-punch vs technical attack."),
      dim("player-level", undefined, "Both intermediate+; Technical needs cleaner timing."),
      dim("spin", undefined, "No independent spin ranking."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", TV, "Technical diamond when finishing leads."),
      pickForUseCase("uc-padel-control", CV, "Counter round when placement and defence lead."),
      pickForUseCase("uc-padel-balanced", CV, "Counter if your week still lives on the glass more than put-aways."),
    ],
    keyDifferences: [
      biggestDiff(
        "diamond attack vs round counter",
        { productId: TV, impact: "Technical diamond striker" },
        { productId: CV, impact: "Round Counter control" },
        "Same family badge, opposite geometries — treat as a control-vs-power decision, not a cosmetic variant.",
      ),
    ],
    chooseProductReasons: [
      choose(TV, "You want the technical-striker diamond and already time overheads cleanly."),
      choose(CV, "You want Viper branding with round control and counter-punch forgiveness."),
      choose(CV, "Technical felt too tip-heavy or unforgiving in demos."),
    ],
  }),

  // —— Same-family Genius vs Attack ——
  strongPadelComparison({
    id: "cmp-at10-genius-vs-attack",
    slug: "nox-at10-genius-12k-vs-at10-attack-18k-2026",
    title: "Nox AT10 Genius 12K vs AT10 Attack 18K",
    shortDescription:
      "Same AT10 line: Genius teardrop all-court versus Attack diamond — do not confuse the two.",
    productIds: [AT12, ATTACK],
    summary:
      "Genius 12K and Attack 18K both wear AT10 branding, but Genius is the teardrop all-court tool and Attack 18K is the diamond finishing tool. Shoppers often confuse Genius 12K with Attack; this page exists to stop that mistake and force an honest geometry choice.",
    verdict:
      "Choose Genius 12K for teardrop all-court Alum XTREM play; choose Attack 18K only when you want the diamond Attack job and can support tip-heavy finishing.",
    criteria: [
      dim("shape", ATTACK, "Attack diamond vs Genius teardrop."),
      dim("power", ATTACK, "Attack 18K is the finishing sibling."),
      dim("control", AT12, "Genius stays more all-court usable."),
      dim("forgiveness", AT12, "Teardrop Genius vs Attack diamond."),
      dim("comfort", undefined, "Different cores/faces — no blanket comfort crown."),
      dim("maneuverability", AT12, "Genius typically quicker to organise between balls."),
      dim("surface", AT12, "12K Alum XTREM vs Attack 18K Alum — different weave stories, not a quality ladder."),
      dim("play-style", AT12, "All-court Genius vs Attack finisher."),
      dim("player-level", ATTACK, "Attack demands clearer timing."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-balanced", AT12, "Genius when the week is mixed."),
      pickForUseCase("uc-padel-power", ATTACK, "Attack diamond when finishing is the job."),
      pickForUseCase("uc-padel-control", AT12, "Genius for more usable contact."),
    ],
    keyDifferences: [
      biggestDiff(
        "Genius teardrop vs Attack diamond",
        { productId: AT12, impact: "Teardrop Genius 12K" },
        { productId: ATTACK, impact: "Attack 18K diamond" },
        "If a retailer lists Genius as Attack (or the reverse), walk away — the molds are different jobs.",
      ),
    ],
    chooseProductReasons: [
      choose(AT12, "You want AT10 Genius teardrop all-court — not Attack."),
      choose(ATTACK, "You explicitly want AT10 Attack diamond finishing and already prepare overheads early."),
      choose(ATTACK, "Genius still feels soft on put-aways after honest demos."),
    ],
  }),

  // —— Vertex diamond vs hybrid ——
  strongPadelComparison({
    id: "cmp-vertex05-vs-hybrid",
    slug: "bullpadel-vertex-05-vs-vertex-05-hybrid",
    title: "Bullpadel Vertex 05 vs Vertex 05 Hybrid",
    shortDescription:
      "Same Vertex 05 generation: diamond attack mold versus hybrid all-court silhouette.",
    productIds: [V05, V05H],
    summary:
      "Vertex 05 and Vertex 05 Hybrid share a generation and brand story but split on silhouette. The diamond Vertex leans attack; the Hybrid opens a more all-court outline for players who want Vertex DNA without full diamond tip bias. Pick by geometry job inside the same family year.",
    verdict:
      "Choose Vertex 05 diamond for attack-first Vertex play; choose Vertex 05 Hybrid when you want Vertex construction with a more all-court hybrid outline.",
    criteria: [
      dim("shape", V05, "Diamond vs hybrid — the defining split."),
      dim("power", V05, "Diamond usually carries more finishing leverage."),
      dim("control", V05H, "Hybrid outline for more all-court placement."),
      dim("forgiveness", V05H, "Hybrid typically more usable than tip-biased diamond."),
      dim("maneuverability", V05H, "Hybrid often easier to organise at net and glass."),
      dim("comfort", undefined, "Same-family cores — no hard comfort winner without feel notes."),
      dim("play-style", V05H, "All-court hybrid vs diamond attack."),
      dim("player-level", undefined, "Both intermediate+ / advanced."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", V05, "Diamond Vertex when finishing leads."),
      pickForUseCase("uc-padel-balanced", V05H, "Hybrid when all-court coverage leads."),
      pickForUseCase("uc-padel-control", V05H, "More control-friendly Vertex 05 silhouette."),
    ],
    keyDifferences: [
      biggestDiff(
        "diamond vs hybrid outline",
        { productId: V05, impact: "Diamond attack Vertex" },
        { productId: V05H, impact: "Hybrid all-court Vertex" },
        "Same year, different job — Hybrid is not “Vertex light marketing”; it is a silhouette change.",
      ),
    ],
    chooseProductReasons: [
      choose(V05, "You want the diamond Vertex 05 attack mold."),
      choose(V05H, "You want Vertex 05 construction with hybrid all-court handling."),
      choose(V05H, "Diamond Vertex felt late on bandejas in demos."),
    ],
  }),

  // —— Generation ——
  strongPadelComparison({
    id: "cmp-vertex04-vs-vertex05",
    slug: "bullpadel-vertex-04-vs-vertex-05",
    title: "Bullpadel Vertex 04 vs Vertex 05",
    shortDescription:
      "Previous-generation Vertex 04 versus current Vertex 05 — labeled generation comparison.",
    productIds: [V04, V05],
    summary:
      "Vertex 04 is the previous-generation diamond Vertex; Vertex 05 is the current award-lane Vertex. This page exists for upgrade decisions and discounted 04 shopping — not to treat 04 as a current peer against 2026 rivals. Spec and construction evolved; confirm live offers and condition before paying near-new prices for 04.",
    verdict:
      "Upgrade to Vertex 05 when replacing a worn 04 or when you want the current Vertex construction; keep Vertex 04 when it still feels good and is heavily discounted relative to 05.",
    isGenerationComparison: true,
    upgradeAdvice: {
      upgradeIf: [
        "Your Vertex 04 is worn out or cracked.",
        "You want the current Vertex 05 construction and recommendation coverage.",
        "Street price gap to 05 is small after discounts.",
      ],
      keepOlderIf: [
        "Vertex 04 still feels good with remaining life.",
        "A steep 04 discount meets your attack needs.",
        "You are not chasing current-gen cosmetics.",
      ],
    },
    criteria: [
      dim("player-level", undefined, "Both advanced diamond Vertex tools."),
      dim("play-style", undefined, "Same family attack role across generations."),
      dim("power", undefined, "Both attack diamonds — no invented power delta."),
      dim("control", undefined, "Insufficient to invent a control crown between gens."),
      dim("forgiveness", undefined, "Do not invent sweet-spot lab deltas."),
      dim("comfort", undefined, "Feel differences need demo, not marketing."),
      dim("maneuverability", undefined, "No measured swingweight claim."),
      dim("price", V04, "Previous gen often wins on discounted street price."),
      dim("frame", V05, "Current-generation Vertex construction."),
      dim("shape", undefined, "Both diamond Vertex silhouettes."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", V05, "Current Vertex when buying new for attack."),
      pickForUseCase("uc-padel-balanced", V05, "Prefer current gen for ongoing catalog coverage."),
    ],
    keyDifferences: [
      biggestDiff(
        "previous gen vs current Vertex",
        { productId: V04, impact: "Previous-generation Vertex 04" },
        { productId: V05, impact: "Current Vertex 05" },
        "Do not shortlist Vertex 04 as a current peer against Hack 04 or AT10 12K — use this page only for generation upgrade logic.",
      ),
    ],
    chooseProductReasons: [
      choose(V05, "You are buying new and want the current Vertex 05."),
      choose(V04, "You found a steep discount on a healthy Vertex 04 and accept previous-gen status."),
      choose(V04, "Your existing 04 still plays well and the upgrade gap is mostly cosmetic."),
    ],
  }),

  // —— Control path ——
  strongPadelComparison({
    id: "cmp-ml10-vs-indiga",
    slug: "nox-ml10-pro-cup-vs-bullpadel-indiga-ctr",
    title: "Nox ML10 Pro Cup vs Bullpadel Indiga CTR",
    shortDescription:
      "Classic control cup versus beginner SoftEva round — placement tool vs first-racket forgiveness.",
    productIds: [ML10, INDIGA],
    summary:
      "ML10 Pro Cup is the classic Nox control-cup tool for players who place more than they smash. Indiga CTR is Bullpadel’s SoftEva beginner round built for developing contact. Both favour control and forgiveness over attack diamonds, but Indiga is the clearer first-racket job while ML10 suits players who already have a control identity.",
    verdict:
      "Choose Indiga CTR when contact consistency is still the weekly problem; choose ML10 Pro Cup when you want a classic control cup and already place balls reliably.",
    criteria: [
      dim("shape", undefined, "Both round / control-oriented outlines."),
      dim("power", undefined, "Neither is a power diamond — no power crown."),
      dim("control", ML10, "ML10 is the classic control-cup reference."),
      dim("forgiveness", INDIGA, "Indiga SoftEva beginner round prioritises usable mishits."),
      dim("comfort", INDIGA, "SoftEva beginner package."),
      dim("maneuverability", INDIGA, "Low-balance beginner handling story."),
      dim("player-level", INDIGA, "Indiga for developing players; ML10 for control-minded intermediates."),
      dim("play-style", ML10, "Placement / defence cup vs learning-first Indiga."),
      dim("core", INDIGA, "SoftEva beginner core vs ML10 control construction."),
      dim("price", undefined, "Offers decide — Indiga often sits below flagship cups."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-beginner", INDIGA, "Forgiving SoftEva round for first consistent contact."),
      pickForUseCase("uc-padel-control", ML10, "Classic control cup when placement is the identity."),
      pickForUseCase("uc-padel-balanced", ML10, "Control cup for intermediates who still reject diamonds."),
    ],
    keyDifferences: [
      biggestDiff(
        "beginner SoftEva vs classic control cup",
        { productId: INDIGA, impact: "Beginner SoftEva round" },
        { productId: ML10, impact: "Classic ML10 control cup" },
        "Indiga teaches contact; ML10 refines placement. Neither replaces Hack or Technical Viper.",
      ),
    ],
    chooseProductReasons: [
      choose(INDIGA, "You are still building consistent contact and need SoftEva forgiveness."),
      choose(ML10, "You already place balls and want the classic Nox control-cup job."),
      choose(ML10, "Indiga feels too soft or too “first racket” for your current level."),
    ],
  }),

  // —— Head vs Babolat attack ——
  strongPadelComparison({
    id: "cmp-coello-vs-technical-viper",
    slug: "head-coello-pro-vs-babolat-technical-viper",
    title: "HEAD Coello Pro vs Babolat Technical Viper",
    shortDescription:
      "Two current attack diamonds for advanced finishers — Head Coello versus Babolat Technical Viper.",
    productIds: [COELLO, TV],
    summary:
      "Coello Pro and Technical Viper are both advanced attacking diamonds. Coello is HEAD’s Arturo Coello attack tool; Technical Viper is Babolat’s technical-striker diamond. Neither is a beginner or value-hybrid frame — ignore older seed copy that framed Coello as a value hybrid or Diablo as a round beginner.",
    verdict:
      "No universal winner. Choose Coello Pro for HEAD Coello attack geometry; choose Technical Viper for Babolat technical-striker diamond preference. Both require reliable overhead timing.",
    criteria: [
      dim("shape", undefined, "Both diamond attack molds."),
      dim("power", undefined, "Both high — no honest universal power winner."),
      dim("control", undefined, "Both demand clean contact; insufficient control crown."),
      dim("forgiveness", undefined, "Both unforgiving relative to rounds — no forgiveness winner."),
      dim("comfort", undefined, "Brand feel packages differ — demo required."),
      dim("maneuverability", undefined, "Insufficient measured data."),
      dim("spin", undefined, "Insufficient independent evidence."),
      dim("play-style", undefined, "Both finishing / attack."),
      dim("player-level", undefined, "Both advanced."),
      dim("surface", undefined, "Different face systems — not a K-count ladder."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", COELLO, "HEAD Coello diamond when you prefer that attack ecosystem."),
      pickForUseCase("uc-padel-power", TV, "Technical Viper when you prefer Babolat’s technical diamond."),
      pickForUseCase("uc-padel-balanced", TV, "Still attack-first — only if your “balanced” week still finishes points."),
    ],
    keyDifferences: [
      biggestDiff(
        "HEAD Coello ecosystem vs Babolat technical diamond",
        { productId: COELLO, impact: "Coello Pro attack diamond" },
        { productId: TV, impact: "Technical Viper diamond" },
        "Brand/feel preference and demo results decide more than a fake universal score. Both punish late preparation.",
      ),
    ],
    chooseProductReasons: [
      choose(COELLO, "You want HEAD Coello Pro attack geometry and already finish overheads cleanly."),
      choose(TV, "You want Babolat Technical Viper’s technical-striker diamond."),
      choose(TV, "You prefer Babolat Viper family path (with Counter as the control sibling if needed)."),
    ],
  }),

  // —— Power rivals Bullpadel vs Adidas ——
  strongPadelComparison({
    id: "cmp-hack04-vs-metalbone35",
    slug: "bullpadel-hack-04-vs-adidas-metalbone-3-5",
    title: "Bullpadel Hack 04 vs Adidas Metalbone 3.5",
    shortDescription:
      "Current diamond power rivals: Hack 04 MultiEva attack versus Metalbone 3.5 Soft EVA + plates.",
    productIds: [H04, MB35],
    summary:
      "Hack 04 and Metalbone 3.5 are current diamond power tools from Bullpadel and Adidas. Hack leans denser MultiEva attack response; Metalbone 3.5 pairs Soft Performance EVA with Weight & Balance tuning. Both are advanced finishers — choose by core/feel philosophy and whether on-racket tuning matters.",
    verdict:
      "Choose Hack 04 for Bullpadel’s denser attack MultiEva package; choose Metalbone 3.5 when Soft EVA diamond feel and Weight & Balance adjustment are the priority.",
    criteria: [
      dim("shape", undefined, "Both diamond power molds."),
      dim("power", undefined, "Both finishing tools — no universal power crown."),
      dim("control", undefined, "Both demand timing — insufficient control winner."),
      dim("forgiveness", undefined, "Both low-forgiveness relative to rounds."),
      dim("comfort", MB35, "Soft EVA Metalbone story when comfort inside power matters."),
      dim("maneuverability", undefined, "Metalbone plates can change tip feel — setup-dependent."),
      dim("core", H04, "Denser Hack MultiEva vs Soft Performance EVA."),
      dim("feel", MB35, "Soft EVA vs denser Hack attack feel."),
      dim("frame", MB35, "Weight & Balance tunability."),
      dim("play-style", undefined, "Both attack / finishing."),
      dim("player-level", undefined, "Both advanced."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", H04, "Hack 04 when denser Bullpadel attack response leads."),
      pickForUseCase("uc-padel-power", MB35, "Metalbone 3.5 when Soft EVA + plates lead."),
      pickForUseCase("uc-padel-balanced", MB35, "Soft EVA can help mid-court exchanges inside a power mold."),
    ],
    keyDifferences: [
      biggestDiff(
        "dense Hack MultiEva vs Soft EVA Metalbone + plates",
        { productId: H04, impact: "Denser MultiEva attack" },
        { productId: MB35, impact: "Soft EVA + Weight & Balance" },
        "Same job class (diamond power), different feel systems. Current Metalbone peer is 3.5, not 3.3.",
      ),
    ],
    chooseProductReasons: [
      choose(H04, "You want Bullpadel Hack 04 denser attack response and already time finishers."),
      choose(MB35, "You want Metalbone 3.5 Soft EVA diamond feel and the ability to tune Weight & Balance."),
      choose(MB35, "Hack felt too harsh and you still want a current diamond power tool."),
    ],
  }),

  // —— Wilson vs Babolat attack ——
  strongPadelComparison({
    id: "cmp-babolat-wilson",
    slug: "babolat-technical-viper-2026-vs-wilson-bela-pro-v2-2026",
    title: "Babolat Technical Viper vs Wilson Bela Pro",
    shortDescription:
      "Two advanced attacking diamonds — Technical Viper versus Bela Pro feel/stiffness preference.",
    productIds: [TV, BELA],
    summary:
      "Technical Viper and Bela Pro are advanced attacking options aimed at players who finish points. The useful difference is brand feel and stiffness preference inside the attack lane, not a beginner-friendly fork. Demo blocks, viboras and overheads before paying flagship prices.",
    verdict:
      "Both favour attackers. Choose Technical Viper for Babolat technical-diamond preference; choose Bela Pro when Wilson Bela attack feel/stiffness suits you better after demos.",
    criteria: [
      dim("shape", undefined, "Both attack-oriented diamonds / high-balance attack tools."),
      dim("power", undefined, "Both high — no universal winner."),
      dim("control", undefined, "Insufficient."),
      dim("forgiveness", undefined, "Both demand clean contact."),
      dim("comfort", undefined, "Stiffness preference is personal — no declared winner."),
      dim("maneuverability", undefined, "Insufficient."),
      dim("feel", undefined, "Primary demo axis — not invented."),
      dim("play-style", undefined, "Both attack."),
      dim("player-level", undefined, "Both advanced."),
      dim("price", undefined, "Offers decide."),
    ],
    recommendationsByUseCase: [
      pickForUseCase("uc-padel-power", TV, "Technical Viper when Babolat finishing diamond leads."),
      pickForUseCase("uc-padel-power", BELA, "Bela Pro when Wilson attack feel wins the demo."),
      pickForUseCase("uc-padel-balanced", BELA, "Still attack-capable with a different stiffness/head-feel profile."),
    ],
    keyDifferences: [
      biggestDiff(
        "Babolat technical diamond vs Wilson Bela attack feel",
        { productId: TV, impact: "Technical Viper diamond" },
        { productId: BELA, impact: "Bela Pro attack feel" },
        "Pick after demos. Stiffness and head feel matter more here than marketing silhouettes.",
      ),
    ],
    chooseProductReasons: [
      choose(TV, "You prefer Babolat Technical Viper’s technical-striker diamond after demos."),
      choose(BELA, "You prefer Wilson Bela Pro attack stiffness/head feel."),
      choose(BELA, "Technical Viper felt too demanding and Bela still covers your finishing week."),
    ],
  }),
  ...padelSoftComparisons,
];

/** IDs retired from the thin seed era (wrong peers / previous-gen as current). */
export const PADEL_COMPARISON_RETIRED = [
  {
    id: "cmp-nox-bullpadel",
    reason: "Paired current AT10 18K with previous-gen Vertex 04 as if both were current peers.",
  },
  {
    id: "cmp-head-siux",
    reason: "Misframed Coello Pro as value hybrid and Diablo as beginner round control.",
  },
] as const;

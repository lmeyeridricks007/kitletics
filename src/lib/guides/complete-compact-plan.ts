/**
 * Lift thin CompactExplainerPlan stubs to STANDARD-tier completeness
 * (≥10 blocks, decision flow, FAQs, ≥3 product examples).
 */

import type { CompactExplainerPlan } from "@/lib/guides/build-explainer-from-plan";

type ExampleItem = CompactExplainerPlan["examples"]["items"][number];

const FILLER_BY_TOPIC: Array<{ match: RegExp; products: ExampleItem[] }> = [
  {
    match: /watch|battery|maps|navigation|beginner-vs-advanced|optical-wrist/,
    products: [
      {
        productId: "prod-forerunner-570",
        approachLabel: "Mid-range training watch",
        whyIllustrates:
          "Shows a practical daily trainer feature set without flagship extras.",
        bestFor: ["Daily training", "Value"],
        tradeoff: "Fewer adventure maps/lifestyle extras than flagships.",
      },
      {
        productId: "prod-coros-pace-4",
        approachLabel: "Light GPS racer",
        whyIllustrates:
          "Emphasises battery and weight for high-mileage runners.",
        bestFor: ["High mileage", "Long events"],
        tradeoff: "Leaner music/smartwatch lifestyle stack.",
      },
    ],
  },
  {
    match: /sock|belt|flask|bladder|handheld|hydration|marathon|vest|carry-fuel/,
    products: [
      {
        productId: "prod-soft-flask-500",
        approachLabel: "Soft flask hydration",
        whyIllustrates: "Front-access fluid you can see and refill quickly.",
        bestFor: ["Vest running", "Supported races"],
        tradeoff: "Lower total volume than a large bladder.",
      },
      {
        productId: "prod-salomon-pulse-belt",
        approachLabel: "Running belt",
        whyIllustrates: "Minimal carry when a vest is overkill.",
        bestFor: ["Road longs", "Phone + gels"],
        tradeoff: "Limited water and layer capacity.",
      },
      {
        productId: "prod-nathan-peak",
        approachLabel: "Hydration waist pack",
        whyIllustrates:
          "Bottle-plus-storage middle ground between belt and vest.",
        bestFor: ["Long road runs", "Hot weather"],
        tradeoff: "More bounce risk than a well-fitted vest if overloaded.",
      },
    ],
  },
  {
    match: /jacket|apparel|layer|hot-weather|winter/,
    products: [
      {
        productId: "prod-clifton-10",
        approachLabel: "Daily trainer (session context)",
        whyIllustrates:
          "Reminds you apparel choices sit beside shoe job — easy miles vs speed work change layering needs.",
        bestFor: ["Easy miles", "Warm-up context"],
        tradeoff: "Not apparel — use it only as session-context reference.",
      },
      {
        productId: "prod-bondi-9",
        approachLabel: "Max-cushion recovery context",
        whyIllustrates:
          "Pairs with easy-day apparel when cushion and comfort dominate the week.",
        bestFor: ["Recovery days", "Long easy runs"],
        tradeoff:
          "Heavy for faster sessions; apparel still needs its own breathability test.",
      },
      {
        productId: "prod-adv-skin-12",
        approachLabel: "Loaded long-run kit",
        whyIllustrates:
          "Shows how layers and weather shells must fit under or over a pack.",
        bestFor: ["Trail longs", "Weather swings"],
        tradeoff: "Pack bulk changes jacket fit — test loaded.",
      },
    ],
  },
  {
    match: /massage|foam|recovery|sandal/,
    products: [
      {
        productId: "prod-theragun-mini",
        approachLabel: "Compact percussion tool",
        whyIllustrates: "Travel-friendly percussion for short targeted sessions.",
        bestFor: ["Travel", "Local spots"],
        tradeoff: "Less amplitude than full-size guns.",
      },
      {
        productId: "prod-blackroll-standard",
        approachLabel: "Foam roller",
        whyIllustrates:
          "Self-myofascial rolling staple for larger muscle groups.",
        bestFor: ["Home recovery", "Post-run routine"],
        tradeoff: "Takes floor space and time versus a quick gun pass.",
      },
      {
        productId: "prod-oofos-ooriginal",
        approachLabel: "Recovery sandal",
        whyIllustrates:
          "Soft post-run footwear when standing around matters more than walking miles.",
        bestFor: ["After long runs", "Race weekends"],
        tradeoff: "Not for running or technical walking.",
      },
    ],
  },
  {
    match: /shoe-jobs|gear-stack|trail-race|first-marathon|checklist/,
    products: [
      {
        productId: "prod-novablast-5",
        approachLabel: "Daily trainer",
        whyIllustrates: "Default easy-mile shoe role in a simple rotation.",
        bestFor: ["Easy miles", "Beginner stacks"],
        tradeoff: "Not a race plate.",
      },
      {
        productId: "prod-forerunner-165",
        approachLabel: "Beginner GPS watch",
        whyIllustrates:
          "Enough training metrics without adventure-watch complexity.",
        bestFor: ["First race build", "Daily tracking"],
        tradeoff: "Limited maps and ultra battery versus flagships.",
      },
      {
        productId: "prod-adv-skin-12",
        approachLabel: "Race/long-run vest",
        whyIllustrates:
          "Carries fluids and mandatory kit when belts run out of space.",
        bestFor: ["Long runs", "Trail races"],
        tradeoff: "More coverage and fit tuning than a belt.",
      },
    ],
  },
  {
    match: /gel|fuel|caffeine|chew|drink-mix/,
    products: [
      {
        productId: "prod-soft-flask-500",
        approachLabel: "Soft flask for drink mix",
        whyIllustrates:
          "How drink-mix fuel is carried when gels alone are not enough.",
        bestFor: ["Long runs", "Hot days"],
        tradeoff: "Needs vest or handheld real estate.",
      },
      {
        productId: "prod-salomon-pulse-belt",
        approachLabel: "Belt for gels",
        whyIllustrates: "Minimal gel carry without a vest.",
        bestFor: ["Road marathon", "Supported races"],
        tradeoff: "Limited fluid volume.",
      },
      {
        productId: "prod-nathan-exoshot",
        approachLabel: "Handheld bottle",
        whyIllustrates:
          "Quick fluid access when you want one bottle and a few gels.",
        bestFor: ["Solo longs", "Simple kits"],
        tradeoff: "One hand occupied; bounce if overfilled with soft goods.",
      },
    ],
  },
];

function fillerForSlug(slug: string): ExampleItem[] {
  for (const row of FILLER_BY_TOPIC) {
    if (row.match.test(slug)) return row.products;
  }
  return FILLER_BY_TOPIC[0]!.products;
}

function ensureThreeExamples(
  plan: CompactExplainerPlan,
): CompactExplainerPlan["examples"] {
  const items = [...plan.examples.items];
  const have = new Set(items.map((i) => i.productId));
  for (const fill of fillerForSlug(plan.slug)) {
    if (items.length >= 3) break;
    if (have.has(fill.productId)) continue;
    items.push(fill);
    have.add(fill.productId);
  }
  return {
    ...plan.examples,
    title: plan.examples.title || "Useful examples",
    items: items.slice(0, 4),
  };
}

function topicFamily(
  slug: string,
):
  | "fuel"
  | "recovery"
  | "watch"
  | "hrm"
  | "hydration"
  | "apparel"
  | "setup"
  | "shoes"
  | "general" {
  const s = slug.toLowerCase();
  if (/gel|fuel|caffeine|chew|drink-mix|sodium|carb/.test(s)) return "fuel";
  if (/foam|massage|recovery|sandal/.test(s)) return "recovery";
  if (/optical-wrist|chest-strap|heart-rate|hrm/.test(s)) return "hrm";
  if (/watch|battery|maps|navigation|gps/.test(s)) return "watch";
  if (/vest|belt|flask|bladder|handheld|hydration/.test(s)) return "hydration";
  if (/jacket|apparel|layer|hot-weather|winter|sock/.test(s)) return "apparel";
  if (/gear-stack|checklist|kit|shoe-jobs|marathon-gear|trail-race/.test(s))
    return "setup";
  if (/shoe|drop|cushion|plate|trainer|stability/.test(s)) return "shoes";
  return "general";
}

function whyMattersSecondPara(
  topic: ReturnType<typeof topicFamily>,
  slug: string,
): string {
  switch (topic) {
    case "fuel":
      return `Getting fuel wrong usually means GI distress, late-race empty legs, or carrying caffeine you never practised. Match carbs, fluids and stimulants to sessions you already tolerate — not to a podium bottle lineup.`;
    case "recovery":
      return `Recovery tools fail when they replace sleep or become a ritual that eats training time. Prefer short, tolerable routines you will repeat; this is not clinical treatment advice.`;
    case "hrm":
      return `A pretty HR chart that lags or drops out wastes interval quality. Choose sensing for the workouts that need trustworthy traces — and remember consumer HR is training input, not diagnosis.`;
    case "watch":
      return `Extra watch modes are clutter if you never open them. Battery, GPS reliability and controls for your longest or hardest sessions should beat lifestyle feature lists.`;
    case "hydration":
      return `Carry systems fail through bounce, slow access or capacity that does not match unsupported stretches. Test loaded on a normal long run before race week.`;
    case "apparel":
      return `Apparel mistakes show up as overheating, chafe or a shell you never pack. Breathability and coverage for your climate beat catalog waterproof theatre.`;
    case "setup":
      return `Kit lists fail when every item is “nice” and nothing is rehearsed. Prioritise what race rules, weather and your longest sessions actually require.`;
    case "shoes":
      return `Shoe decisions fail when one pair is forced to cover every job. Match stack, stability and plate behaviour to the session — then keep race tools for race day.`;
    default:
      return `Getting the choice wrong usually means paying for features you will not use, or missing the one constraint that shows up when it matters for ${slug.replace(/-/g, " ")}. Filter against real sessions — not a generic “best” list.`;
  }
}

function calloutTitle(topic: ReturnType<typeof topicFamily>): string {
  switch (topic) {
    case "fuel":
      return "Practice the plan, not the packet";
    case "recovery":
      return "Short routines beat unused gadgets";
    case "hrm":
      return "Trustworthy traces over all-day convenience";
    case "watch":
      return "Battery and controls before extras";
    case "hydration":
      return "Access and bounce beat pocket count";
    case "apparel":
      return "Climate fit beats hangtag claims";
    case "setup":
      return "Rehearse the checklist";
    case "shoes":
      return "One job per shoe when you can";
    default:
      return "Match the tool to the week";
  }
}

function calloutBody(topic: ReturnType<typeof topicFamily>): string {
  switch (topic) {
    case "fuel":
      return "If a gel, mix or caffeine dose will not appear in your next long run or race rehearsal, leave it on the shelf. Gut tolerance is the filter.";
    case "recovery":
      return "If a roller, gun or sandal will not earn ten focused minutes after hard sessions, it is clutter. Comfort is useful; miracle claims are not.";
    case "hrm":
      return "If your key sessions are easy Z2, wrist optical may be enough. If you live on intervals and hills, prioritise contact and response speed.";
    case "watch":
      return "If a map pack, music store or training metric will not show up this training block, it is decoration. Protect battery for the days that matter.";
    case "hydration":
      return "If flask access, bladder cleaning or belt bounce will annoy you on weekly longs, fix that before chasing reserve capacity.";
    case "apparel":
      return "If a shell only works in a drizzle walk and steams on tempo, it fails the job. Breathability under effort is the test.";
    case "setup":
      return "If an item is not required by rules, weather or a practised long session, demote it. Race morning is for verified kit.";
    case "shoes":
      return "If a plate, stack or stability feature will not appear in this week’s sessions, do not let it steal the daily trainer budget.";
    default:
      return "If a feature will not show up in your next month of training, it is decoration. Prioritise the constraint that bites when it counts.";
  }
}

function nextStepParas(topic: ReturnType<typeof topicFamily>): string[] {
  switch (topic) {
    case "fuel":
      return [
        "Take your shortlist onto a mid-long run with the same timing and fluids you expect on race day. Note GI comfort, packaging hassle and whether caffeine timing felt useful.",
        "If nothing improves after two practised sessions, simplify — fewer products with known tolerance usually beat a crowded vest.",
      ];
    case "recovery":
      return [
        "Use the shortlist after one hard session and one long run. Note whether you actually used the tool and whether comfort changed enough to keep the habit.",
        "If the routine dies within a week, choose the simpler option you will repeat — consistency beats amplitude claims.",
      ];
    case "hrm":
      return [
        "Wear the shortlist through an easy run and one interval or hill session. Compare lag, dropouts and comfort without obsessing over absolute BPM.",
        "If wrist optical stays clean for your real week, keep it. If intervals invent noise, move to chest or arm sensing.",
      ];
    case "watch":
      return [
        "Run your usual routes and one longer session with music/maps/fields configured as you would race. Check battery drain and button usability with wet hands or gloves if relevant.",
        "If you never opened the expensive extras, buy the simpler watch that nails GPS and battery.",
      ];
    case "hydration":
      return [
        "Load the shortlist for a normal long run. Note bounce, flask/bladder access at pace and how refill or cleaning will fit your week.",
        "If access is slow or bounce annoys you by kilometre ten, change carry format — capacity alone is not the win.",
      ];
    case "apparel":
      return [
        "Wear the shortlist in the weather you are buying for, at easy and harder efforts. Note sweat build-up, chafe and whether you would pack it again.",
        "If you only reach for it on easy jogs, it may still be fine — just do not pretend it is a hard-rain race shell.",
      ];
    case "setup":
      return [
        "Lay out the checklist the night before a long run or tune-up. Remove anything unused; add only what rules or weather demand.",
        "If the bag is still heavy with untested items, cut until every piece has a rehearsal behind it.",
      ];
    case "shoes":
      return [
        "Shake out the shortlist on an easy run, then decide which pair owns easy miles vs workouts vs race day.",
        "If one shoe is asked to do every job, expect compromise — rotations exist for a reason.",
      ];
    default:
      return [
        "Take your shortlist into a normal training week. Keep notes on access, comfort and whether you actually used the features you paid for.",
        "If nothing changes after two representative sessions, simplify — the option you use usually beats the option you admire.",
      ];
  }
}

/** Fill missing STANDARD-tier fields without rewriting authored content. */
export function completeCompactPlan(
  plan: CompactExplainerPlan,
): CompactExplainerPlan {
  const examples = ensureThreeExamples(plan);
  const roles =
    plan.productExampleRoles.length >= 3
      ? plan.productExampleRoles
      : examples.items.slice(0, 3).map((it) => ({
          productId: it.productId,
          roleLabel: it.approachLabel,
        }));

  const topic = topicFamily(plan.slug);

  const whyItMatters = plan.whyItMatters ?? {
    title: "Why this decision matters",
    paragraphs: [
      plan.deck,
      whyMattersSecondPara(topic, plan.slug),
    ],
  };

  const tradeoffs = plan.tradeoffs ?? {
    title: "What you gain and give up",
    gains: examples.items
      .slice(0, 3)
      .map(
        (it) =>
          `${it.approachLabel}: useful when ${it.bestFor[0] ?? "the role fits"}`,
      ),
    giveUps: examples.items.slice(0, 3).map((it) => it.tradeoff),
    footnote:
      "Trade-offs are model- and runner-dependent — verify fit and use case.",
  };

  const factors =
    plan.factors ??
    (examples.items.length >= 2
      ? {
          title: "Decision filters",
          cards: examples.items.slice(0, 3).map((it, i) => ({
            id: `factor-${i}-${it.productId}`,
            title: it.approachLabel,
            whatItIs: it.whyIllustrates,
            howItChanges: `Best when: ${it.bestFor.join(", ") || "the role fits"}.`,
            whatYouNotice: it.tradeoff,
          })),
        }
      : undefined);

  const factorSteps = (factors?.cards ?? []).slice(0, 6).map((c) => ({
    id: c.id,
    title: c.title,
    body: `${c.whatItIs} ${c.howItChanges} You will notice: ${c.whatYouNotice}`,
  }));

  const decision = plan.decision ?? {
    title: "How to decide",
    steps: (
      factorSteps.length >= 3
        ? factorSteps
        : [
            {
              id: "job",
              title: "Name the job",
              body: "Write the session or race constraint this product must solve.",
            },
            {
              id: "shortlist",
              title: "Shortlist two approaches",
              body: "Keep two options that fit your week, then compare upkeep and fit.",
            },
            {
              id: "test",
              title: "Test before race week",
              body: "Prove the choice on a representative long run or workout.",
            },
            {
              id: "commit",
              title: "Commit to the role",
              body: "Keep the product for the job it won — do not force one tool to cover every session.",
            },
            ...factorSteps,
          ]
    ).slice(0, 6),
  };

  const comparison =
    plan.comparison ??
    (examples.items.length >= 2
      ? {
          title: "Compare approaches at a glance",
          columns: examples.items.slice(0, 3).map((it) => it.approachLabel),
          rows: [
            {
              label: "Best for",
              values: examples.items
                .slice(0, 3)
                .map(
                  (it) => it.bestFor.slice(0, 2).join(", ") || "Specific use case",
                ),
            },
            {
              label: "Main trade-off",
              values: examples.items.slice(0, 3).map((it) => it.tradeoff),
            },
          ],
          footnote: "Examples illustrate approaches — not a universal ranking.",
        }
      : undefined);

  const callouts = plan.callouts ?? [
    {
      id: `${plan.slug}-reality-check`,
      title: calloutTitle(topic),
      body: calloutBody(topic),
      tone: "accent" as const,
    },
  ];

  const extraProse =
    plan.extraProse ??
    [
      {
        id: `${plan.slug}-next-step`,
        title: "Next step after you shortlist",
        paragraphs: nextStepParas(topic),
      },
    ];

  const mistakes =
    plan.mistakes.length >= 3
      ? plan.mistakes
      : [
          ...plan.mistakes,
          {
            id: "feature-chase",
            title: "Buying features you will not use",
            body: "Extra modes and marketing claims only help when they change a real session outcome.",
          },
          {
            id: "no-test",
            title: "Skipping a training test",
            body: "Race-week surprises usually come from untested fuel, fit or battery profiles.",
          },
          {
            id: "one-tool",
            title: "Forcing one product to do every job",
            body: "Specialist tools exist because weekly volume and intensity ask for different compromises.",
          },
        ].slice(0, 5);

  const ctaBest =
    plan.ctaBest ??
    (plan.bestGuideHref
      ? {
          title: "See current picks",
          body: "Open the related best guide for live catalog options that match these roles.",
          ctaLabel: plan.bestGuideLabel ?? "View best guide →",
          href: plan.bestGuideHref,
        }
      : undefined);

  return {
    ...plan,
    whyItMatters,
    factors,
    tradeoffs,
    decision,
    comparison,
    callouts,
    extraProse,
    mistakes,
    examples,
    productExampleRoles: roles,
    compareProductIds:
      plan.compareProductIds && plan.compareProductIds.length >= 2
        ? plan.compareProductIds
        : examples.items.slice(0, 3).map((i) => i.productId),
    ctaBest,
    methodologyNote:
      plan.methodologyNote ??
      "This guide combines manufacturer specifications, catalog product data and independent specialist coverage. Product examples render from live catalog data and illustrate approaches — not medical or ranking claims.",
  };
}

export function faqsFromCompactPlan(plan: CompactExplainerPlan): Array<{
  id: string;
  question: string;
  answer: string;
  sportId: string;
}> {
  const completed = completeCompactPlan(plan);
  const faqs: Array<{
    id: string;
    question: string;
    answer: string;
    sportId: string;
  }> = [];
  const bullets = completed.quickAnswerBullets.slice(0, 2);
  if (bullets[0]) {
    faqs.push({
      id: `faq-${plan.slug}-1`,
      question: `What is the quick takeaway on this topic?`,
      answer: bullets.join(" "),
      sportId: "sport-running",
    });
  }
  const firstFactor = completed.factors?.cards[0];
  if (firstFactor) {
    faqs.push({
      id: `faq-${plan.slug}-2`,
      question: `How should I weigh ${firstFactor.title.toLowerCase()}?`,
      answer: `${firstFactor.whatItIs} ${firstFactor.howItChanges} In practice: ${firstFactor.whatYouNotice}`,
      sportId: "sport-running",
    });
  }
  const firstMistake = completed.mistakes[0];
  if (firstMistake) {
    faqs.push({
      id: `faq-${plan.slug}-3`,
      question: `What mistake should I avoid?`,
      answer: `${firstMistake.title}: ${firstMistake.body}`,
      sportId: "sport-running",
    });
  }
  const firstExample = completed.examples.items[0];
  if (firstExample) {
    faqs.push({
      id: `faq-${plan.slug}-4`,
      question: `How do product examples help?`,
      answer: `${firstExample.approachLabel} illustrates this topic because ${firstExample.whyIllustrates} Trade-off: ${firstExample.tradeoff}`,
      sportId: "sport-running",
    });
  }
  return faqs.slice(0, 4);
}

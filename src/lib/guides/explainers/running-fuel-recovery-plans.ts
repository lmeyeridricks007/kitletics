/**
 * Compact explainer plans for thin fuel + recovery buying guides
 * that lacked long-form configs.
 */

import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import {
  completeCompactPlan,
  faqsFromCompactPlan,
} from "@/lib/guides/complete-compact-plan";

function plan(p: CompactExplainerPlan): CompactExplainerPlan {
  return completeCompactPlan(p);
}

export const RUNNING_FUEL_RECOVERY_PLANS: CompactExplainerPlan[] = [
  plan({
    slug: "running-gels-explained",
    displayTitle: "Running Gels Explained",
    deck: "How gels fit a fuelling plan — carbs per hour, caffeine timing, and gut training — without treating packets as magic.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    heroImageAlt: "Running vest with fuel pockets for gels",
    quickAnswerBullets: [
      "Gels are concentrated carbohydrate for mid-run energy when chewing is hard.",
      "Match carbs per hour to session length and what your gut tolerates in training.",
      "Practice the same brand, flavour and fluid pairing before race day.",
      "Caffeine gels are optional — time them; do not stack blindly.",
      "Carry capacity and pocket access matter as much as the packet itself.",
    ],
    medicalNote:
      "Fuelling advice here is general training guidance, not medical nutrition therapy. Seek a qualified professional for clinical needs or GI disease.",
    definition: {
      title: "What a running gel is",
      paragraphs: [
        "A running gel packs carbohydrate into a soft packet you can take while moving. Most are designed to be taken with water unless labelled otherwise.",
        "Gels differ in carbs per serving, texture, electrolytes and caffeine. Those differences only matter when they change how your stomach and energy feel mid-run.",
        "The product is only half the system. Timing, total carbs per hour and how you carry fluids decide whether gels help or cause GI trouble.",
      ],
    },
    factors: {
      title: "Decide with these filters",
      cards: [
        {
          id: "carbs",
          title: "Carbs per hour",
          whatItIs: "How much carbohydrate you plan to take during the effort.",
          howItChanges: "Longer and harder sessions usually need more fuel — within gut tolerance.",
          whatYouNotice: "Steadier energy without mid-run crashes or nausea.",
        },
        {
          id: "gut",
          title: "Gut training",
          whatItIs: "Practising the same products and timing in long runs.",
          howItChanges: "Unfamiliar gels on race day are a common DNF risk.",
          whatYouNotice: "Confidence that the plan survives race intensity.",
        },
        {
          id: "fluid",
          title: "Fluid pairing",
          whatItIs: "Water or drink mix taken with each gel.",
          howItChanges: "Thick gels without fluid can sit poorly.",
          whatYouNotice: "Easier swallowing and fewer stomach complaints.",
        },
        {
          id: "caffeine",
          title: "Caffeine strategy",
          whatItIs: "Whether and when caffeine gels enter the plan.",
          howItChanges: "Late-race stimulants can help some runners and upset others.",
          whatYouNotice: "Alertness without jitters or GI surprise.",
        },
        {
          id: "carry",
          title: "Carry method",
          whatItIs: "Belt, vest, handheld or shorts pockets.",
          howItChanges: "Access under fatigue decides whether you actually take the gel.",
          whatYouNotice: "One-handed opens without stopping.",
        },
      ],
    },
    examples: {
      title: "Carry systems that make gels usable",
      disclaimer: "Examples show carry approaches — fuel brands vary by region and preference.",
      items: [
        {
          productId: "prod-salomon-pulse-belt",
          approachLabel: "Belt for gel packets",
          whyIllustrates: "Minimal kit when course support covers most water.",
          bestFor: ["Road races", "Supported longs"],
          tradeoff: "Limited fluid if aid stations are sparse.",
        },
        {
          productId: "prod-soft-flask-500",
          approachLabel: "Flask + gel pockets",
          whyIllustrates: "Pairs drink mix or water with gels in a vest.",
          bestFor: ["Long runs", "Hot weather"],
          tradeoff: "Needs vest real estate.",
        },
        {
          productId: "prod-nathan-exoshot",
          approachLabel: "Handheld + gels",
          whyIllustrates: "Simple fluid access with a few packets in hand or belt.",
          bestFor: ["Solo road longs"],
          tradeoff: "One hand occupied.",
        },
      ],
    },
    mistakes: [
      {
        id: "race-new",
        title: "Trying a new gel on race day",
        body: "Train the exact product, timing and fluid pairing first.",
      },
      {
        id: "no-water",
        title: "Skipping fluid with sticky gels",
        body: "Unless the gel is designed as isotonic, plan water access.",
      },
      {
        id: "caffeine-stack",
        title: "Stacking caffeine gels without a plan",
        body: "Count total caffeine from all sources across the day.",
      },
    ],
    bestGuideHref: "/best/running-race-fuel",
    bestGuideLabel: "Best race fuel →",
    productExampleRoles: [
      { productId: "prod-salomon-pulse-belt", roleLabel: "Gel belt" },
      { productId: "prod-soft-flask-500", roleLabel: "Flask carry" },
      { productId: "prod-nathan-exoshot", roleLabel: "Handheld" },
    ],
    productRailTitle: "Carry options for gel fuelling",
  }),
  plan({
    slug: "how-to-carry-fuel-on-long-runs",
    displayTitle: "How to Carry Fuel on Long Runs",
    deck: "Pick a carry system from distance, support and access — belt, handheld, vest or mix — then test it loaded.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    heroImageAlt: "Running hydration vest for long-run fuel carry",
    quickAnswerBullets: [
      "Choose capacity from unsupported time, not vanity volume.",
      "Access under fatigue beats clever pockets you cannot open mid-run.",
      "Test the full load — fluid, gels, phone, layer — at long-run pace.",
      "Belts suit light kits; vests win when water and mandatory kit grow.",
      "Handhelds are simple until you need two bottles or poles.",
    ],
    definition: {
      title: "Carry is part of the fuelling plan",
      paragraphs: [
        "Long-run fuel only works if you can reach it without breaking stride. Carry systems exist to keep carbs and fluid stable and accessible.",
        "Belts, handhelds and vests solve different load sizes. Overpacking a belt creates bounce; under-sizing a vest leaves essentials behind.",
        "The right system is the smallest one that carries the required load without chafe or constant adjustment.",
      ],
    },
    factors: {
      title: "Five carry decisions",
      cards: [
        {
          id: "support",
          title: "Course support",
          whatItIs: "Aid stations, crew or none.",
          howItChanges: "Sparse support increases fluid and backup fuel needs.",
          whatYouNotice: "Whether you can skip heavy bottles.",
        },
        {
          id: "duration",
          title: "Time on feet",
          whatItIs: "Expected hours, not just kilometres.",
          howItChanges: "Longer efforts need more carbs and often more water.",
          whatYouNotice: "A kit that lasts the whole outing.",
        },
        {
          id: "access",
          title: "One-handed access",
          whatItIs: "Opening gels and bottles without stopping.",
          howItChanges: "Fatigue makes fiddly pockets useless.",
          whatYouNotice: "Fewer mid-run fights with zips.",
        },
        {
          id: "bounce",
          title: "Bounce and chafe",
          whatItIs: "How the load moves once full.",
          howItChanges: "Water weight exposes weak fit.",
          whatYouNotice: "Stable carry after 90 minutes.",
        },
        {
          id: "weather",
          title: "Weather and layers",
          whatItIs: "Shell, gloves, hat storage.",
          howItChanges: "Cold starts force extra pockets.",
          whatYouNotice: "Layers stashed without crushing flasks.",
        },
      ],
    },
    examples: {
      title: "Three carry patterns",
      disclaimer: "Match the pattern to your longest unsupported segment.",
      items: [
        {
          productId: "prod-salomon-pulse-belt",
          approachLabel: "Light belt",
          whyIllustrates: "Phone, keys and a few gels when water is available on course.",
          bestFor: ["Supported road longs"],
          tradeoff: "Not enough for remote trail water needs.",
        },
        {
          productId: "prod-nathan-exoshot",
          approachLabel: "Handheld",
          whyIllustrates: "Visible fluid with optional soft-flask gels in the other hand or belt.",
          bestFor: ["Solo road runs"],
          tradeoff: "Limits poles and two-bottle setups.",
        },
        {
          productId: "prod-adv-skin-12",
          approachLabel: "Hydration vest",
          whyIllustrates: "Flasks, gels, layer and safety kit when the day gets serious.",
          bestFor: ["Trail longs", "Unsupported segments"],
          tradeoff: "More fit tuning than a belt.",
        },
      ],
    },
    mistakes: [
      {
        id: "empty-test",
        title: "Testing empty",
        body: "Load every gel and flask you will race with before judging bounce.",
      },
      {
        id: "overbelt",
        title: "Overloading a belt",
        body: "When water and layers appear, move up to a vest instead of stacking bottles on the hips.",
      },
      {
        id: "new-race",
        title: "Debut carry on race day",
        body: "Chafe and access problems show up after hour two — find them in training.",
      },
    ],
    bestGuideHref: "/best/running-hydration-vests",
    bestGuideLabel: "Best hydration vests →",
    productExampleRoles: [
      { productId: "prod-salomon-pulse-belt", roleLabel: "Belt" },
      { productId: "prod-nathan-exoshot", roleLabel: "Handheld" },
      { productId: "prod-adv-skin-12", roleLabel: "Vest" },
    ],
    productRailTitle: "Long-run carry options",
  }),
  plan({
    slug: "gel-vs-drink-mix-vs-chews",
    displayTitle: "Gel vs Drink Mix vs Chews",
    deck: "Pick the carbohydrate format your gut, hands and fluid plan can actually sustain for the session length.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    heroImageAlt: "Soft flasks and vest pockets for run fuel formats",
    quickAnswerBullets: [
      "Gels are fast packets when chewing is hard at race pace.",
      "Drink mix combines carbs and fluid — ideal when you already carry bottles.",
      "Chews suit runners who prefer solid bites and have time to chew.",
      "Many plans mix formats across a long event.",
      "Train the exact combination before race day.",
    ],
    medicalNote:
      "General fuelling education only — not personalised medical nutrition advice.",
    definition: {
      title: "Three common carb formats",
      paragraphs: [
        "Gels are soft concentrates. Drink mixes dissolve carbohydrate into bottles or flasks. Chews are solid pieces taken with fluid.",
        "None is universally better. Texture preference, GI tolerance and how you carry water decide the winner.",
        "Compare carbs per serving and how easily you can take the next dose when tired — not marketing flavour charts alone.",
      ],
    },
    factors: {
      title: "Choose the format with these checks",
      cards: [
        {
          id: "texture",
          title: "Texture preference",
          whatItIs: "Soft, liquid or chewable.",
          howItChanges: "Race intensity reduces willingness to chew.",
          whatYouNotice: "Whether you still take fuel after hour two.",
        },
        {
          id: "fluid",
          title: "Fluid already carried",
          whatItIs: "Bottles, flasks or aid-station water.",
          howItChanges: "Drink mix needs bottle space; gels need sips.",
          whatYouNotice: "A plan that matches your carry kit.",
        },
        {
          id: "gi",
          title: "GI history",
          whatItIs: "What sat well in long training.",
          howItChanges: "Sweet gels and high fructose loads upset some runners.",
          whatYouNotice: "Fewer emergency toilet stops.",
        },
        {
          id: "mix",
          title: "Format mixing",
          whatItIs: "Using more than one format across the event.",
          howItChanges: "Flavour fatigue drops intake late.",
          whatYouNotice: "Steadier eating through the final third.",
        },
      ],
    },
    examples: {
      title: "How formats show up in kit",
      disclaimer: "Carry gear illustrates delivery — choose fuel brands you tolerate.",
      items: [
        {
          productId: "prod-salomon-pulse-belt",
          approachLabel: "Gel-first kit",
          whyIllustrates: "Packets in a belt when aid-station water is reliable.",
          bestFor: ["Road marathon"],
          tradeoff: "Depends on water access with each gel.",
        },
        {
          productId: "prod-soft-flask-500",
          approachLabel: "Drink-mix flask",
          whyIllustrates: "Carbs dissolved in fluid you already carry.",
          bestFor: ["Hot longs", "Vest runners"],
          tradeoff: "Mixing and cleaning overhead.",
        },
        {
          productId: "prod-adv-skin-12",
          approachLabel: "Mixed-format vest",
          whyIllustrates: "Room for flasks plus chew/gel pockets on long days.",
          bestFor: ["Ultra / trail"],
          tradeoff: "More kit complexity.",
        },
      ],
    },
    mistakes: [
      {
        id: "format-only",
        title: "Picking a format without a gut test",
        body: "Texture preference still fails if carbs per hour are unpractised.",
      },
      {
        id: "mix-blind",
        title: "Mixing brands randomly on race day",
        body: "Keep the combination you trained.",
      },
      {
        id: "ignore-fluid",
        title: "Ignoring fluid needs of gels/chews",
        body: "Solids and sticky gels usually need planned water.",
      },
    ],
    bestGuideHref: "/best/running-race-fuel",
    bestGuideLabel: "Best race fuel →",
    productExampleRoles: [
      { productId: "prod-salomon-pulse-belt", roleLabel: "Gel carry" },
      { productId: "prod-soft-flask-500", roleLabel: "Drink mix flask" },
      { productId: "prod-adv-skin-12", roleLabel: "Mixed kit vest" },
    ],
    productRailTitle: "Formats meet carry systems",
  }),
  plan({
    slug: "caffeine-in-running-fuel-explained",
    displayTitle: "Caffeine in Running Fuel Explained",
    deck: "Use caffeine gels and drink mixes deliberately — dose, timing and total daily intake — not as unlimited late-race stacking.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/watches/products/coros-pace-4-hero.png",
    heroImageAlt: "GPS watch timing late-race caffeine strategy",
    quickAnswerBullets: [
      "Caffeine can help late-race alertness for some runners — it is optional.",
      "Count total milligrams from coffee, gels and drink mix across the day.",
      "Train the dose; sensitive stomachs and sleep matter.",
      "Timing usually beats “more packets”.",
      "Skip caffeine strategies if they disrupt sleep before key sessions.",
    ],
    medicalNote:
      "Caffeine affects people differently. This is general sports guidance, not medical advice. Seek clinical advice for heart conditions, pregnancy or medication interactions.",
    definition: {
      title: "What caffeine gels are for",
      paragraphs: [
        "Caffeinated running fuels add a stimulant on top of carbohydrate. They are a timing tool, not a substitute for enough carbs.",
        "Response varies widely. Some runners feel clearer late; others get jitters, GI upset or poor sleep.",
        "Treat caffeine as a planned dose with a ceiling — not an open-ended stack every time you open a packet.",
      ],
    },
    factors: {
      title: "Plan caffeine with these checks",
      cards: [
        {
          id: "dose",
          title: "Total dose",
          whatItIs: "Milligrams from all sources that day.",
          howItChanges: "Hidden coffee plus gels adds up quickly.",
          whatYouNotice: "Stimulation without overshooting tolerance.",
        },
        {
          id: "timing",
          title: "Timing",
          whatItIs: "When the dose hits relative to the hard segment.",
          howItChanges: "Too early can fade; too late can wreck sleep.",
          whatYouNotice: "Alertness when you need it.",
        },
        {
          id: "gut",
          title: "Gut and nerves",
          whatItIs: "Sensitivity history.",
          howItChanges: "Race anxiety amplifies caffeine side effects.",
          whatYouNotice: "Steady stomach and composure.",
        },
        {
          id: "sleep",
          title: "Sleep cost",
          whatItIs: "Evening races and late doses.",
          howItChanges: "Poor sleep hurts the next session more than one gel helps.",
          whatYouNotice: "Recovery across the week.",
        },
      ],
    },
    examples: {
      title: "Where caffeine plans show up in kit",
      disclaimer: "Carry examples — choose caffeine products you have trained.",
      items: [
        {
          productId: "prod-salomon-pulse-belt",
          approachLabel: "Marked caffeine gels in belt",
          whyIllustrates: "Keeps caffeinated packets separate from plain gels.",
          bestFor: ["Road races"],
          tradeoff: "Easy to grab the wrong packet when fatigued — label them.",
        },
        {
          productId: "prod-soft-flask-500",
          approachLabel: "Caffeinated drink mix",
          whyIllustrates: "Spreads dose across sips instead of one hit.",
          bestFor: ["Long hot runs"],
          tradeoff: "Harder to know exact milligrams mid-flask.",
        },
        {
          productId: "prod-forerunner-165",
          approachLabel: "Watch alarms for timing",
          whyIllustrates: "Reminders help hit planned caffeine windows.",
          bestFor: ["Structured race plans"],
          tradeoff: "Alarms do not fix an untested dose.",
        },
      ],
    },
    mistakes: [
      {
        id: "stack",
        title: "Stacking every caffeine gel",
        body: "Set a race ceiling and stick to it.",
      },
      {
        id: "untested",
        title: "First caffeine gel on race day",
        body: "Sensitivity belongs in training, not at kilometre 35.",
      },
      {
        id: "sleep",
        title: "Ignoring sleep",
        body: "Late caffeine can cost more than it returns.",
      },
    ],
    bestGuideHref: "/best/running-race-fuel",
    bestGuideLabel: "Best race fuel →",
    productExampleRoles: [
      { productId: "prod-salomon-pulse-belt", roleLabel: "Gel organisation" },
      { productId: "prod-soft-flask-500", roleLabel: "Drink-mix dose" },
      { productId: "prod-forerunner-165", roleLabel: "Timing aid" },
    ],
    productRailTitle: "Caffeine plan support kit",
  }),
  plan({
    slug: "massage-guns-explained",
    displayTitle: "Massage Guns Explained",
    deck: "Percussion tools for short, targeted sessions — amplitude, reach and noise matter more than peak marketing force.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/therabody-theragun-prime-hero.png",
    heroImageAlt: "Percussion massage gun for runners",
    quickAnswerBullets: [
      "Use massage guns for brief, tolerable pressure — not bruising sessions.",
      "Amplitude and head shape change how deep and precise the tool feels.",
      "Travel size trades power for packability.",
      "Noise and battery decide whether you will actually use it.",
      "Percussion is not a diagnosis tool or injury treatment plan.",
    ],
    medicalNote:
      "Percussion devices are consumer recovery tools. They do not diagnose or treat injuries. Stop if pain increases and seek clinical care for injuries.",
    definition: {
      title: "What a massage gun does",
      paragraphs: [
        "A massage gun delivers rapid percussion through interchangeable heads. Runners use them to target sore spots around training.",
        "Force numbers in ads are hard to compare across brands. Amplitude, head geometry, ergonomics and battery matter more in daily use.",
        "Keep sessions short and pressure comfortable. More aggression is not more recovery.",
      ],
    },
    factors: {
      title: "Buy with these filters",
      cards: [
        {
          id: "amplitude",
          title: "Amplitude and heads",
          whatItIs: "Stroke length and attachment shapes.",
          howItChanges: "Different heads suit large muscles vs bony areas.",
          whatYouNotice: "Coverage without sharp hotspot pain.",
        },
        {
          id: "size",
          title: "Size vs power",
          whatItIs: "Full-size vs mini form factors.",
          howItChanges: "Travel tools pack easier but may feel milder.",
          whatYouNotice: "Whether it earns a place in the race bag.",
        },
        {
          id: "noise",
          title: "Noise and battery",
          whatItIs: "Sound level and runtime.",
          howItChanges: "Loud tools get left unused at home or hotels.",
          whatYouNotice: "Routine use after hard sessions.",
        },
        {
          id: "reach",
          title: "Handle reach",
          whatItIs: "Angle and grip for your own back and calves.",
          howItChanges: "Poor ergonomics limit independent use.",
          whatYouNotice: "You can hit target areas without a partner.",
        },
      ],
    },
    examples: {
      title: "Percussion and complementary tools",
      disclaimer: "Illustrative recovery tools — not a clinical protocol.",
      items: [
        {
          productId: "prod-theragun-mini",
          approachLabel: "Compact percussion",
          whyIllustrates: "Travel-friendly gun for short targeted passes.",
          bestFor: ["Travel", "Race weekends"],
          tradeoff: "Less amplitude than full-size units.",
        },
        {
          productId: "prod-blackroll-standard",
          approachLabel: "Foam roller",
          whyIllustrates: "Broader tissue coverage than a gun tip.",
          bestFor: ["Home routine"],
          tradeoff: "Takes more time and floor space.",
        },
        {
          productId: "prod-oofos-ooriginal",
          approachLabel: "Recovery sandal",
          whyIllustrates: "Passive comfort after long days on feet.",
          bestFor: ["Post-run standing"],
          tradeoff: "Not a substitute for tissue work.",
        },
      ],
    },
    mistakes: [
      {
        id: "bruise",
        title: "Chasing bruise-level pressure",
        body: "Comfortable short sessions beat aggressive passes.",
      },
      {
        id: "injury",
        title: "Using a gun on acute injuries",
        body: "Seek clinical guidance for sharp pain or suspected injury.",
      },
      {
        id: "replace",
        title: "Replacing sleep and easy days",
        body: "Tools support recovery — they do not replace load management.",
      },
    ],
    bestGuideHref: "/best/running-recovery-gear",
    bestGuideLabel: "Best recovery gear →",
    productExampleRoles: [
      { productId: "prod-theragun-mini", roleLabel: "Massage gun" },
      { productId: "prod-blackroll-standard", roleLabel: "Foam roller" },
      { productId: "prod-oofos-ooriginal", roleLabel: "Recovery sandal" },
    ],
    productRailTitle: "Recovery tool approaches",
  }),
  plan({
    slug: "foam-rolling-for-runners",
    displayTitle: "Foam Rolling for Runners",
    deck: "Use a roller for short, tolerable passes on large muscle groups — density and shape should match the areas you actually roll.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/fitness/products/blackroll-standard-hero.jpg",
    heroImageAlt: "BLACKROLL foam roller",
    quickAnswerBullets: [
      "Roll slowly with tolerable pressure — pain is not the goal.",
      "Larger muscles suit standard rollers; smaller tools help targeted spots.",
      "Density changes how aggressive the same motion feels.",
      "Consistency beats marathon rolling sessions.",
      "Rolling is not treatment for acute injuries.",
    ],
    medicalNote:
      "Foam rolling is a self-care practice, not medical treatment. Seek care for injuries or unusual pain.",
    definition: {
      title: "What foam rolling is for",
      paragraphs: [
        "Foam rolling uses body weight over a cylinder or ball to apply pressure to soft tissue. Runners use it around training for comfort and routine.",
        "Tools vary in density, diameter and texture. Harder is not automatically better — intolerable pressure ends the habit.",
        "Pair rolling with the rest of recovery: sleep, easy days and sensible training load.",
      ],
    },
    factors: {
      title: "Choose a roller with these filters",
      cards: [
        {
          id: "density",
          title: "Density",
          whatItIs: "How firm the foam feels.",
          howItChanges: "Firmer tools feel more intense at the same body weight.",
          whatYouNotice: "Whether you can finish short sessions consistently.",
        },
        {
          id: "size",
          title: "Size and shape",
          whatItIs: "Length, diameter, balls vs rollers.",
          howItChanges: "Small tools reach differently than long rollers.",
          whatYouNotice: "Coverage for calves, quads, glutes and back.",
        },
        {
          id: "storage",
          title: "Storage",
          whatItIs: "Home space and travel.",
          howItChanges: "Bulky rollers get left unused.",
          whatYouNotice: "A tool that stays in the routine.",
        },
        {
          id: "habit",
          title: "Session length",
          whatItIs: "Minutes you will actually spend.",
          howItChanges: "Overlong protocols fail adherence.",
          whatYouNotice: "Short passes you repeat after hard days.",
        },
      ],
    },
    examples: {
      title: "Rolling tools runners actually use",
      disclaimer: "Illustrative tools — not a rehab protocol.",
      items: [
        {
          productId: "prod-blackroll-standard",
          approachLabel: "Standard roller",
          whyIllustrates: "Everyday length for quads, calves and back.",
          bestFor: ["Home routines"],
          tradeoff: "Bulkier to travel with.",
        },
        {
          productId: "prod-blackroll-ball",
          approachLabel: "Massage ball",
          whyIllustrates: "Smaller contact for glutes and targeted spots.",
          bestFor: ["Targeted work"],
          tradeoff: "Slower for large muscle groups.",
        },
        {
          productId: "prod-theragun-mini",
          approachLabel: "Percussion alternative",
          whyIllustrates: "When you want short targeted work without floor space.",
          bestFor: ["Travel"],
          tradeoff: "Different stimulus than rolling.",
        },
      ],
    },
    mistakes: [
      {
        id: "pain",
        title: "Rolling into sharp pain",
        body: "Ease off; sharp pain is a stop signal.",
      },
      {
        id: "forever",
        title: "Hour-long sessions",
        body: "Short consistent passes beat occasional marathons.",
      },
      {
        id: "injury",
        title: "Rolling acute injuries",
        body: "Get injuries assessed instead of self-treating with pressure tools.",
      },
    ],
    bestGuideHref: "/best/running-recovery-gear",
    bestGuideLabel: "Best recovery gear →",
    productExampleRoles: [
      { productId: "prod-blackroll-standard", roleLabel: "Standard roller" },
      { productId: "prod-blackroll-ball", roleLabel: "Massage ball" },
      { productId: "prod-theragun-mini", roleLabel: "Percussion option" },
    ],
    productRailTitle: "Foam rolling toolkit",
  }),
  plan({
    slug: "recovery-tools-what-evidence-shows",
    displayTitle: "Recovery Tools: What Evidence Shows",
    deck: "Separate comfort and routine from proven performance claims — sleep and training load still dominate recovery.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/therabody-theragun-prime-hero.png",
    heroImageAlt: "Recovery tools for runners",
    quickAnswerBullets: [
      "Sleep, nutrition and easy days drive recovery more than gadgets.",
      "Many tools help comfort and routine — that can still be worth buying.",
      "Be sceptical of dramatic performance or injury-prevention claims.",
      "Choose tools you will use consistently after hard sessions.",
      "Stop if pain worsens; tools are not diagnosis devices.",
    ],
    medicalNote:
      "This guide summarises practical buying judgement around consumer recovery tools. It is not medical advice or a treatment plan.",
    methodologyNote:
      "Evidence language here is intentionally cautious. Product examples illustrate tool categories from the Kitletics catalog; they are not clinical endorsements.",
    definition: {
      title: "What “recovery tools” usually means",
      paragraphs: [
        "Runners buy rollers, percussion devices, sandals and similar products to feel better between sessions. Comfort and habit are legitimate goals.",
        "Marketing often overstates what consumer tools can prove for performance or injury risk. Buy for use you will repeat — not miracle claims.",
        "The hierarchy stays familiar: training load, sleep and fuelling first; tools as optional support.",
      ],
    },
    factors: {
      title: "Judge tools with these filters",
      cards: [
        {
          id: "claim",
          title: "Claim vs comfort",
          whatItIs: "What the brand promises versus how it feels.",
          howItChanges: "Big claims need bigger scepticism.",
          whatYouNotice: "Whether you buy comfort or hype.",
        },
        {
          id: "adherence",
          title: "Adherence",
          whatItIs: "Likelihood you will use it weekly.",
          howItChanges: "Unused tools recover nothing.",
          whatYouNotice: "A short routine that sticks.",
        },
        {
          id: "load",
          title: "Training load context",
          whatItIs: "Easy days and sleep around hard sessions.",
          howItChanges: "Gadgets cannot offset chronic overload.",
          whatYouNotice: "Better weeks when load is sane.",
        },
        {
          id: "budget",
          title: "Budget honesty",
          whatItIs: "Cost versus a simpler tool that gets used.",
          howItChanges: "Premium toys often sit unused.",
          whatYouNotice: "Money spent on the routine you keep.",
        },
      ],
    },
    examples: {
      title: "Common tool categories",
      disclaimer: "Category examples — not ranked medical devices.",
      items: [
        {
          productId: "prod-blackroll-standard",
          approachLabel: "Foam roller",
          whyIllustrates: "Low-tech routine tool with broad muscle coverage.",
          bestFor: ["Home habits"],
          tradeoff: "Takes time and space.",
        },
        {
          productId: "prod-theragun-mini",
          approachLabel: "Percussion gun",
          whyIllustrates: "Targeted sessions with higher price and noise trade-offs.",
          bestFor: ["Travel", "Local spots"],
          tradeoff: "Easy to overuse aggressively.",
        },
        {
          productId: "prod-oofos-ooriginal",
          approachLabel: "Recovery sandal",
          whyIllustrates: "Passive comfort after long standing days.",
          bestFor: ["Race weekends"],
          tradeoff: "Comfort ≠ proven performance effect.",
        },
      ],
    },
    mistakes: [
      {
        id: "miracle",
        title: "Buying miracle claims",
        body: "Pay for comfort and adherence — not unverifiable physiology marketing.",
      },
      {
        id: "skip-sleep",
        title: "Skipping sleep for gadget time",
        body: "An extra hour of sleep usually beats an extra device session.",
      },
      {
        id: "ignore-pain",
        title: "Pushing through worsening pain",
        body: "Tools should not replace clinical assessment.",
      },
    ],
    bestGuideHref: "/best/running-recovery-gear",
    bestGuideLabel: "Best recovery gear →",
    productExampleRoles: [
      { productId: "prod-blackroll-standard", roleLabel: "Roller" },
      { productId: "prod-theragun-mini", roleLabel: "Percussion" },
      { productId: "prod-oofos-ooriginal", roleLabel: "Sandal" },
    ],
    productRailTitle: "Recovery tool categories",
  }),
];

export const runningFuelRecoveryConfigs = RUNNING_FUEL_RECOVERY_PLANS.map(
  buildExplainerFromPlan,
);

export const runningFuelRecoveryFaqs = RUNNING_FUEL_RECOVERY_PLANS.flatMap(
  faqsFromCompactPlan,
);

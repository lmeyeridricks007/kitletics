/**
 * How to Choose a GPS Running Watch — a needs-first buying framework.
 */
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import type { LongFormGuideConfig } from "@/lib/guides/long-form-config";

const RUNNING_WATCH_BLOCKS: ExplainerBlock[] = [
  {
    id: "start-with-the-job",
    type: "prose",
    title: "Start with the run, not the feature list",
    intro: "The best running watch is the least complicated one that reliably covers your real training.",
    paragraphs: [
      "Begin with three questions: where you run, how long your longest activity lasts and what decisions you want the watch to help you make. A road runner following simple pace workouts needs a different tool from an ultrarunner navigating unfamiliar trails.",
      "GPS accuracy and enough battery are foundations. Maps, music, payments, AMOLED displays and advanced training analysis are optional layers. Buying every layer can add cost, charging frequency, weight and menus without improving the runs you actually do.",
      "Also consider the software around the watch. Your training history, planned workouts, connected sensors and preferred apps can make an ecosystem more valuable over time, but they should not lock you into hardware that misses a core requirement.",
    ],
  },
  {
    id: "phone-vs-watch",
    type: "comparison-table",
    title: "Phone tracking vs a dedicated GPS watch",
    diagram: {
      variant: "phone-vs-watch",
      caption:
        "A phone records the run; a GPS watch keeps pace, laps and sensors glanceable on the wrist.",
    },
    columns: ["Phone app", "GPS running watch", "Buying implication"],
    rows: [
      {
        label: "Pace and distance",
        values: [
          "Adequate for many casual runs, but awkward to check mid-run",
          "Live data fields remain visible on the wrist",
          "A watch matters more when you pace workouts or races",
        ],
      },
      {
        label: "Battery",
        values: [
          "Navigation, music and mobile signal share one battery",
          "Activity battery is designed around continuous GPS recording",
          "Long events need tested GPS-mode headroom",
        ],
      },
      {
        label: "Heart rate",
        values: [
          "Usually needs an external sensor",
          "Wrist optical HR is convenient; many watches pair with straps",
          "Convenience and interval precision are separate needs",
        ],
      },
      {
        label: "Navigation",
        values: [
          "Large, detailed map but less convenient in rain or on technical terrain",
          "Wrist prompts range from breadcrumb routes to offline maps",
          "Choose the navigation depth your routes require",
        ],
      },
      {
        label: "Safety and communication",
        values: [
          "Native calls, messaging and location sharing when coverage exists",
          "Varies by model; many still depend on a paired phone",
          "Do not assume a GPS watch replaces a phone or emergency device",
        ],
      },
    ],
    footnote: "A phone is enough for runners who mainly want a post-run record. A watch earns its place through glanceable pacing, structured workouts, sensors, navigation or longer GPS endurance.",
  },
  {
    id: "six-buying-factors",
    type: "factor-cards",
    title: "The six factors that should drive the purchase",
    cards: [
      {
        id: "gps",
        title: "GPS accuracy",
        whatItIs: "How consistently the watch records position, pace and distance.",
        howItChanges: "Buildings, tree cover, terrain, antenna design and GNSS mode affect the track.",
        whatYouNotice: "Cleaner routes and steadier instant pace in difficult environments.",
      },
      {
        id: "battery",
        title: "Battery",
        whatItIs: "Separate endurance figures for daily smartwatch use and active GPS recording.",
        howItChanges: "Multi-band GNSS, AMOLED always-on display, music, maps and cold weather increase drain.",
        whatYouNotice: "Whether the watch completes your longest activity with a safe reserve.",
      },
      {
        id: "maps",
        title: "Maps and navigation",
        whatItIs: "Anything from a line to follow through to routable offline cartography.",
        howItChanges: "Full maps add context at junctions; breadcrumb navigation mainly shows the planned track.",
        whatYouNotice: "How easily you recover from a missed turn without reaching for a phone.",
      },
      {
        id: "heart-rate",
        title: "Heart-rate sensing",
        whatItIs: "Optical wrist measurement plus support for external chest or arm sensors.",
        howItChanges: "Fit, motion, skin conditions, temperature and intensity can affect wrist readings.",
        whatYouNotice: "Convenient effort trends, with a strap often preferred for fast-changing intervals.",
      },
      {
        id: "training",
        title: "Training metrics",
        whatItIs: "Workout guidance, load, recovery, readiness and performance estimates.",
        howItChanges: "Algorithms need consistent wear and good input data; brands interpret similar signals differently.",
        whatYouNotice: "More context for planning, but also more numbers that require judgment.",
      },
      {
        id: "durability",
        title: "Durability and fit",
        whatItIs: "Case, lens, buttons, water rating, strap, weight and wrist ergonomics.",
        howItChanges: "Trail impacts, swimming, weather and all-day wear place different demands on the hardware.",
        whatYouNotice: "A watch that stays secure, readable and comfortable late in a long run.",
      },
    ],
  },
  {
    id: "gps-accuracy",
    type: "prose",
    title: "When multi-band GPS is worth paying for",
    paragraphs: [
      "Multi-band or dual-frequency GNSS can reduce some errors caused by signals reflecting between tall buildings, cliffs or dense cover. It is most useful for runners who regularly train in urban canyons, forests, mountains or on routes where small position errors make pacing and navigation less dependable.",
      "It is not a guarantee of a perfect track. Antenna design, software, recording settings and satellite visibility still matter, and easier open-sky routes may show little practical difference from a good standard GPS mode.",
      "Treat GNSS mode as a selectable tool. Use the most demanding mode when conditions justify it and a lower-power mode when battery matters more than marginal track improvement.",
    ],
    diagram: {
      variant: "gps-signal",
      caption:
        "Open sky often looks fine on standard GNSS. Cities, forests and cliffs are where multi-band earns its battery cost.",
    },
    lookFor: [
      {
        id: "gps-env",
        title: "Your hardest routes",
        checks: [
          "Tall buildings, dense trees or steep terrain on weekly runs",
          "Whether track drift or jumpy pace currently frustrates you",
          "Whether you need cleaner navigation inputs, not prettier Strava art",
        ],
      },
      {
        id: "gps-battery",
        title: "Battery in the real mode",
        checks: [
          "GPS runtime with multi-band / all-systems enabled",
          "Reserve beyond your longest planned activity",
          "Whether you can drop to a lighter GNSS mode on easy days",
        ],
      },
    ],
  },
  {
    id: "battery-reality",
    type: "pros-tradeoffs",
    title: "Read battery claims in the mode you will use",
    gains: [
      "GPS-mode headroom reduces charging anxiety during races and long trail days",
      "Longer daily battery makes sleep and recovery tracking more consistent",
      "Power profiles let endurance users trade some accuracy or display behaviour for runtime",
      "MIP displays can remain highly readable outdoors with lower power demand",
    ],
    giveUps: [
      "Multi-band GPS, music playback and frequent map use can sharply reduce headline runtime",
      "Bright AMOLED and always-on settings generally increase charging frequency",
      "A larger battery can mean a larger or heavier case",
      "Published maximums may assume settings different from your preferred configuration",
    ],
    footnote: "Aim for meaningful reserve beyond your longest expected activity. Battery ages, weather changes and sensors add load.",
  },
  {
    id: "display-choice",
    type: "comparison-table",
    title: "AMOLED or MIP display?",
    diagram: {
      variant: "amoled-vs-mip",
      caption:
        "AMOLED prioritises contrast and graphics; MIP prioritises outdoor readability and daily battery.",
    },
    lookFor: [
      {
        id: "display-amoled",
        title: "AMOLED buyers should verify",
        checks: [
          "Brightness and always-on settings you will actually use",
          "Gesture-to-wake reliability while running",
          "Buttons still usable with wet hands if you dislike touch-only controls",
        ],
      },
      {
        id: "display-mip",
        title: "MIP buyers should verify",
        checks: [
          "Readability of your preferred data fields in sun",
          "Night backlight behaviour on early or late runs",
          "Whether the simpler interface matches how you train",
        ],
      },
    ],
    columns: ["AMOLED", "MIP", "Choose it when"],
    rows: [
      {
        label: "Readability",
        values: [
          "High contrast and vivid indoors; may use gesture or always-on settings",
          "Reflective display becomes clearer in bright outdoor light",
          "AMOLED suits rich everyday use; MIP suits always-visible outdoor data",
        ],
      },
      {
        label: "Battery behaviour",
        values: [
          "Brightness and always-on use consume more power",
          "Low-power static display supports long daily endurance",
          "Compare actual configured modes, not display labels alone",
        ],
      },
      {
        label: "Interface",
        values: [
          "Often paired with touch and detailed graphics",
          "Often button-led and visually simpler",
          "Wet-weather runners should verify reliable button control either way",
        ],
      },
    ],
    footnote: "Display type is a usability preference, not a measure of GPS or training quality.",
  },
  {
    id: "maps-navigation",
    type: "prose",
    title: "Breadcrumb routes and full maps are not the same",
    paragraphs: [
      "Basic route navigation shows a line, direction and distance to turns. It works well on known road routes and uncomplicated courses. Full offline maps add paths, roads, landmarks and surrounding context, which is more helpful when trails intersect or you leave the planned course.",
      "Check whether routes can be created in the brand app, imported from your preferred route service and recalculated on the watch. “Navigation” on a specification sheet does not necessarily mean routable maps.",
      "Maps do not remove the need for route preparation, suitable paper or offline backup, and sound judgment in remote terrain. A wrist device can fail, run flat or lack current trail information.",
    ],
    diagram: {
      variant: "breadcrumb-vs-maps",
      caption:
        "A breadcrumb is a line to follow. Full offline maps add the surrounding network when you miss a turn.",
    },
    lookFor: [
      {
        id: "nav-depth",
        title: "Navigation depth you need",
        checks: [
          "No routes, follow-the-line breadcrumb, or full offline maps",
          "Route import from the services you already use",
          "On-watch recalculation or only preloaded courses",
        ],
      },
      {
        id: "nav-backup",
        title: "Backup plan",
        checks: [
          "Battery headroom with maps enabled",
          "Offline map coverage for your region",
          "A non-watch backup for remote or consequential terrain",
        ],
      },
    ],
  },
  {
    id: "heart-rate-limit",
    type: "callout",
    title: "Heart-rate data is training information, not a diagnosis",
    tone: "caution",
    body: "Wrist optical heart rate is useful for trends and convenient effort guidance, but movement, fit, cold and physiology can affect readings. ECG or other wellness features on a consumer watch do not make all watch data clinically diagnostic. Do not use a running watch to diagnose or rule out a medical condition; seek qualified medical care for symptoms or concerns.",
  },
  {
    id: "metrics-ecosystem",
    type: "prose",
    title: "Training metrics are only useful if they change a decision",
    paragraphs: [
      "Load, recovery and readiness scores summarize data through proprietary models. They can help you notice patterns, but a precise-looking score is still an estimate influenced by sensor quality, sleep tracking, consistent wear and the brand’s assumptions.",
      "Choose metrics by action: structured workouts if you follow a plan, recovery trends if you wear the watch overnight, or running dynamics if your coaching process uses them. More dashboards are not automatically better coaching.",
      "Before changing brands, check workout syncing, route services, sensor compatibility, music, payments, phone support and data export. Ecosystem friction can outweigh a small hardware advantage, while open export reduces future lock-in.",
    ],
    lookFor: [
      {
        id: "metrics-action",
        title: "Metrics that earn their place",
        checks: [
          "Programmable workouts if you follow a plan",
          "Recovery / readiness only if you wear the watch overnight",
          "External HR strap support if intervals matter more than convenience",
        ],
      },
      {
        id: "metrics-ecosystem",
        title: "Ecosystem checks",
        checks: [
          "Phone OS support and app reliability",
          "Route / workout sync from tools you already use",
          "Data export so you are not trapped later",
        ],
      },
    ],
  },
  {
    id: "runner-profiles",
    type: "use-case-cards",
    title: "Match the watch to your runner profile",
    cards: [
      {
        id: "beginner",
        title: "First 5K or regular easy running",
        description: "Prioritise reliable GPS, simple pace and lap controls, comfortable fit and clear workout prompts. Flagship maps and metrics are optional.",
        href: "/tools/fitness-watch-finder",
      },
      {
        id: "structured",
        title: "Structured road training",
        description: "Look for programmable workouts, stable pace data, sensor support, recovery context and a screen readable at speed.",
        href: "/best/running-watches",
      },
      {
        id: "trail",
        title: "Trail and unfamiliar routes",
        description: "Prioritise multi-band GPS where conditions are difficult, useful maps, buttons, weather-ready construction and route tools.",
        href: "/best/running-watches",
      },
      {
        id: "ultra",
        title: "Ultra and all-day events",
        description: "Start with worst-case GPS battery, charging strategy, navigation and comfort; smart features come later.",
        href: "/best/running-watches",
      },
      {
        id: "smartwatch",
        title: "Running plus everyday smartwatch use",
        description: "Balance run tracking against calls, apps, payments, music and phone integration, accepting the likely battery trade-off.",
        href: "/running/gear?category=gps-watches",
      },
    ],
  },
  {
    id: "decision-flow",
    type: "decision-flow",
    title: "A six-step running-watch decision",
    steps: [
      {
        id: "longest",
        title: "Set the battery floor",
        body: "Use your longest event or adventure with the GPS mode, maps, sensors and display settings you expect, then add reserve.",
      },
      {
        id: "environment",
        title: "Name the hard GPS environment",
        body: "Open roads may not require multi-band; cities, forests and mountains make it more valuable.",
      },
      {
        id: "navigation",
        title: "Choose navigation depth",
        body: "Decide between no routes, breadcrumb guidance and full offline maps before comparing extras.",
      },
      {
        id: "training",
        title: "List actionable training tools",
        body: "Keep only metrics, workout features and sensors that will inform a real training decision.",
      },
      {
        id: "wear",
        title: "Check wrist fit and controls",
        body: "Confirm case size, weight, strap comfort, screen readability and button operation during movement.",
      },
      {
        id: "ecosystem",
        title: "Audit the ecosystem",
        body: "Verify phone support, route and workout sync, external sensors, data export, music and payments.",
      },
    ],
    branches: {
      question: "Which requirement eliminates the most watches?",
      options: [
        { label: "Very long battery", result: "Start with endurance-focused GPS watches and compare the exact high-accuracy mode." },
        { label: "Full maps", result: "Filter for offline maps, then verify routing and route-import behaviour." },
        { label: "Simple and affordable", result: "Start with entry running watches; avoid paying for maps and deep analytics by default." },
        { label: "Smartwatch apps", result: "Start with phone compatibility and daily features, then confirm GPS battery covers your runs." },
      ],
    },
  },
  {
    id: "product-examples",
    type: "product-examples",
    title: "Five real approaches to a running watch",
    disclaimer: "These catalog products illustrate different priorities rather than a ranking. Specifications, availability and prices can change; use the current Best guide for recommendations.",
    examples: [
      {
        productId: "prod-forerunner-165",
        approachLabel: "Simpler first running watch",
        whyIllustrates: "Core GPS, wrist heart rate and recovery features without multi-band GPS, maps or a flagship training suite.",
        bestFor: ["New runners", "Road training", "Buyers who value simplicity"],
        tradeoff: "Limited navigation and fewer advanced metrics.",
      },
      {
        productId: "prod-forerunner-970",
        approachLabel: "Deep training and maps",
        whyIllustrates: "Combines AMOLED, multi-band GPS, full maps and Garmin’s broad training ecosystem.",
        bestFor: ["Structured training", "Navigation", "Runners already using Garmin"],
        tradeoff: "Premium price and more complexity than many runners need.",
      },
      {
        productId: "prod-coros-pace-pro",
        approachLabel: "Light maps-and-battery balance",
        whyIllustrates: "A lightweight AMOLED watch pairing maps and multi-band GPS with a strong stated GPS battery figure.",
        bestFor: ["High-mileage runners", "Marathon training", "Weight-conscious map users"],
        tradeoff: "Smaller app ecosystem and no payments.",
      },
      {
        productId: "prod-coros-apex-2-pro",
        approachLabel: "Rugged endurance focus",
        whyIllustrates: "Sapphire construction, MIP display, maps and a 10 ATM rating target trail and ultra use.",
        bestFor: ["Trail running", "Ultras", "Runners prioritising durability"],
        tradeoff: "Less vivid display and more weight than a Pace-focused model.",
      },
      {
        productId: "prod-apple-watch-ultra-2",
        approachLabel: "Smartwatch-running hybrid",
        whyIllustrates: "Strong iPhone integration, apps, maps and multi-band GPS put daily smartwatch ability alongside run tracking.",
        bestFor: ["iPhone users", "Everyday apps and payments", "Running plus general fitness"],
        tradeoff: "Shorter endurance profile and less specialised coaching than dedicated running platforms.",
      },
    ],
  },
  {
    id: "product-comparison",
    type: "product-comparison",
    title: "Compare five watch philosophies",
    productIds: [
      "prod-forerunner-165",
      "prod-forerunner-970",
      "prod-coros-pace-pro",
      "prod-coros-apex-2-pro",
      "prod-apple-watch-ultra-2",
    ],
    bestGuideHref: "/best/running-watches",
    bestGuideLabel: "Best Running Watches →",
    compareHref: "/compare?category=gps-watches&products=garmin-forerunner-165,garmin-forerunner-970,coros-pace-pro,coros-apex-2-pro,apple-watch-ultra-2",
  },
  {
    id: "mistakes",
    type: "mistakes",
    title: "Common running-watch buying mistakes",
    mistakes: [
      {
        id: "headline-battery",
        title: "Comparing only headline battery",
        body: "Smartwatch runtime and GPS runtime are different, and high-accuracy GPS, maps, music and always-on display change the result.",
      },
      {
        id: "flagship",
        title: "Buying a flagship for motivation",
        body: "A more expensive watch cannot create training consistency. Buy features that remove a real limitation.",
      },
      {
        id: "maps",
        title: "Assuming navigation means full maps",
        body: "Verify whether the watch shows breadcrumb guidance, offline map context or on-device routing.",
      },
      {
        id: "fit",
        title: "Ignoring fit for specifications",
        body: "A large watch that moves on the wrist can be uncomfortable and can undermine optical heart-rate consistency.",
      },
      {
        id: "ecosystem",
        title: "Forgetting software and sensors",
        body: "Confirm phone compatibility, workout and route sync, sensor protocols and data export before switching brands.",
      },
      {
        id: "medical",
        title: "Treating wellness data as medical certainty",
        body: "Heart-rate and wellness features can inform training or prompt attention, but they do not diagnose or exclude medical conditions.",
      },
    ],
  },
  {
    id: "finder-cta",
    type: "cta",
    title: "Turn your requirements into a shortlist",
    variant: "finder",
    body: "Use the Fitness Watch Finder to filter around your training, battery, navigation and feature priorities.",
    ctaLabel: "Find my running watch →",
    href: "/tools/fitness-watch-finder",
  },
  {
    id: "best-guide-cta",
    type: "cta",
    title: "Want current model recommendations?",
    variant: "best-guide",
    body: "See Best Running Watches for current category picks across serious training, value, beginners, endurance and smartwatch use.",
    ctaLabel: "Best Running Watches →",
    href: "/best/running-watches",
  },
];

export const howToChooseRunningWatchConfig: LongFormGuideConfig = {
  guideSlug: "how-to-choose-running-watch",
  layout: "explainer",
  eyebrow: "Buying Guide",
  displayTitle: "How to Choose a GPS Running Watch",
  deck: "A needs-first guide to GPS accuracy, real battery endurance, maps, heart rate, training metrics, durability and the software ecosystem around your watch.",
  heroImageSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
  heroImageAlt: "Garmin Forerunner 970 GPS running watch",
  finder: {
    toolSlug: "fitness-watch-finder",
    title: "Find your running watch",
    description: "Build a shortlist from battery, navigation, training and everyday feature priorities.",
    ctaLabel: "Find my running watch →",
  },
  decisionLinks: [
    { label: "Best running watches →", href: "/best/running-watches" },
    { label: "Compare GPS watches →", href: "/compare?category=gps-watches" },
    { label: "Fitness Watch Finder →", href: "/tools/fitness-watch-finder" },
  ],
  glossaryTerms: [
    { id: "gnss", term: "GNSS", definition: "Satellite positioning systems used to calculate location, pace and distance.", icon: "circle" },
    { id: "multi-band", term: "Multi-band GPS", definition: "Reception on multiple satellite frequency bands to improve positioning in difficult environments.", icon: "gauge" },
    { id: "gps-battery", term: "GPS battery", definition: "Expected runtime while actively recording an outdoor activity.", icon: "gauge" },
    { id: "breadcrumb", term: "Breadcrumb navigation", definition: "Following a route line without the full surrounding map detail.", icon: "ruler" },
    { id: "offline-maps", term: "Offline maps", definition: "Map data stored on the watch for use without mobile coverage.", icon: "layers" },
    { id: "optical-hr", term: "Optical heart rate", definition: "Wrist-based pulse estimation using light sensors.", icon: "circle" },
    { id: "water-rating", term: "Water rating", definition: "A device resistance classification, not a blanket guarantee for every water activity.", icon: "shield" },
  ],
  needs: [],
  factors: [],
  fit: [],
  toc: tocFromExplainer([...RUNNING_WATCH_BLOCKS]),
  productExampleRoles: [
    { productId: "prod-forerunner-165", roleLabel: "Beginner simplicity" },
    { productId: "prod-forerunner-970", roleLabel: "Training depth and maps" },
    { productId: "prod-coros-pace-pro", roleLabel: "Light battery-and-maps balance" },
    { productId: "prod-coros-apex-2-pro", roleLabel: "Rugged endurance" },
    { productId: "prod-apple-watch-ultra-2", roleLabel: "Smartwatch hybrid" },
  ],
  productRailTitle: "Examples for different watch priorities",
  productRailBrowseHref: "/running/gear?category=gps-watches",
  productRailBrowseLabel: "Browse GPS running watches →",
  explainer: {
    layout: "explainer",
    quickAnswerBullets: [
      "Start with enough GPS-mode battery for your longest activity, including the settings you will actually enable.",
      "Multi-band GPS is most valuable around tall buildings, forests, cliffs and other difficult reception environments.",
      "Choose breadcrumb navigation for straightforward planned routes; pay for full offline maps when surrounding trail and road context matters.",
      "Training metrics are useful only when you will wear the watch consistently and use the result to make a decision.",
      "Case fit, controls, phone compatibility, sensor support and data export can matter more than one extra headline feature.",
      "Wrist heart rate and watch wellness features support training awareness; they are not medical diagnoses.",
    ],
    medicalNote: "Consumer watch heart-rate, ECG, oxygen and wellness features have device-specific limitations and do not diagnose or rule out a medical condition. Seek advice from a qualified healthcare professional for symptoms, abnormal readings or medical decisions.",
    methodologyNote: "This guide separates required capabilities from optional conveniences, using structured catalog fields for display, GPS mode, maps, navigation, battery, heart rate, training features and water rating alongside manufacturer documentation and editorial evidence. Product cards and comparison specifications render from current catalog data rather than hardcoded prices.",
    blocks: [...RUNNING_WATCH_BLOCKS],
  },
};

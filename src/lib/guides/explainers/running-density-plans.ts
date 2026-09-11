/**
 * Compact plans that grow thin Running Guides Hub topics to ≥5–6 guides each.
 */

import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import { completeCompactPlan } from "@/lib/guides/complete-compact-plan";

function plan(p: CompactExplainerPlan): CompactExplainerPlan {
  return p;
}

export const RUNNING_DENSITY_PLANS: CompactExplainerPlan[] = [
  plan({
    slug: "optical-wrist-hr-vs-chest-strap",
    displayTitle: "Optical Wrist HR vs Chest Strap for Runners",
    deck: "When wrist optical is enough — and when a chest or arm sensor earns a place in your kit.",
    eyebrow: "Comparison",
    heroImageSrc: "/images/hrm/products/polar-h10-hero.png",
    heroImageAlt: "Polar H10 chest strap next to training context",
    quickAnswerBullets: [
      "Wrist optical is convenient for easy miles and all-day wear.",
      "Chest straps usually respond faster to sharp intervals and hills.",
      "Optical arm bands sit between wrist comfort and chest consistency for many runners.",
      "Fit and contact beat brand claims — a loose sensor invents bad data.",
      "Heart-rate numbers are training inputs, not medical diagnoses.",
    ],
    medicalNote:
      "Heart-rate sensors estimate pulse for training. They do not diagnose conditions. Seek qualified advice for symptoms or concerning readings.",
    definition: {
      title: "Three common sensing approaches",
      paragraphs: [
        "Wrist optical sensors shine light into tissue and estimate blood-flow changes. They travel with the watch you already wear.",
        "Chest straps sense electrical timing through skin contact. Optical arm bands move the optical method to a steadier placement than many wrists.",
        "The useful question is which approach stays reliable for the workouts you actually run — not which marketing chart looks best.",
      ],
    },
    comparison: {
      title: "Wrist vs chest vs arm optical",
      columns: ["Wrist optical", "Chest strap", "Arm optical"],
      rows: [
        {
          label: "Convenience",
          values: ["Highest", "Extra strap", "Extra band"],
        },
        {
          label: "Hard intervals",
          values: ["Often lags", "Usually strongest", "Often steadier than wrist"],
        },
        {
          label: "Comfort",
          values: ["All-day watch", "Torso pressure", "Arm placement preference"],
        },
      ],
      footnote: "Fit and conditions can outweigh category tendencies.",
    },
    factors: {
      title: "Decide with these filters",
      cards: [
        {
          id: "session",
          title: "Session type",
          whatItIs: "Easy miles vs tightly controlled intervals.",
          howItChanges: "Fast intensity changes expose lag and contact issues.",
          whatYouNotice: "Whether zones match how hard the effort feels.",
        },
        {
          id: "fit",
          title: "Fit and contact",
          whatItIs: "Strap tension, dryness and movement.",
          howItChanges: "Loose or dry sensors invent spikes and dropouts.",
          whatYouNotice: "Cleaner traces without constant readjustment.",
        },
        {
          id: "devices",
          title: "Device connections",
          whatItIs: "Bluetooth, ANT+ and simultaneous links.",
          howItChanges: "Protocols decide whether watch, app and gym gear all receive data.",
          whatYouNotice: "Fewer re-pairing headaches mid-block.",
        },
      ],
    },
    examples: {
      title: "Useful sensor approaches",
      disclaimer: "Illustrative products — check current compatibility before buying.",
      items: [
        {
          productId: "prod-forerunner-970",
          approachLabel: "Wrist optical on a training watch",
          whyIllustrates: "Shows the convenience path when easy-day trends matter more than interval precision.",
          bestFor: ["Daily wear", "Easy miles", "Minimal kit"],
          tradeoff: "Hard intervals may need a dedicated strap.",
        },
        {
          productId: "prod-polar-h10",
          approachLabel: "Chest strap",
          whyIllustrates: "Represents electrical sensing for structured workouts.",
          bestFor: ["Intervals", "Threshold work", "Multi-device setups"],
          tradeoff: "Another item to fit, clean and power.",
        },
        {
          productId: "prod-polar-verity-sense",
          approachLabel: "Optical arm sensor",
          whyIllustrates: "Shows the comfort alternative when chest straps feel restrictive.",
          bestFor: ["Chest-strap avoiders", "Steady runs", "Multi-sport"],
          tradeoff: "Still an extra band versus wrist-only.",
        },
      ],
    },
    mistakes: [
      {
        id: "trust-spikes",
        title: "Trusting spikes without checking fit",
        body: "Fix contact first — then judge whether the sensor class fits your workouts.",
      },
      {
        id: "medical",
        title: "Treating readings as diagnosis",
        body: "Consumer sensors inform training; they do not replace clinical care.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-forerunner-970", roleLabel: "Wrist optical watch" },
      { productId: "prod-polar-h10", roleLabel: "Chest strap" },
      { productId: "prod-polar-verity-sense", roleLabel: "Optical arm sensor" },
    ],
    productRailTitle: "Compare heart-rate sensing approaches",
    bestGuideHref: "/best/heart-rate-monitors-running",
    bestGuideLabel: "Best heart-rate monitors →",
  }),
  plan({
    slug: "running-watch-battery-life-explained",
    displayTitle: "Running Watch Battery Life Explained",
    deck: "How GNSS mode, maps, music and always-on displays change real-world battery — beyond the marketing headline.",
    eyebrow: "Explainer",
    heroImageSrc: "/images/watches/products/coros-pace-4-hero.png",
    heroImageAlt: "COROS Pace 4 GPS running watch",
    quickAnswerBullets: [
      "Manufacturer GPS hours assume a usage profile — yours may differ.",
      "Multi-band GNSS, maps, music and always-on displays shorten runtime.",
      "Smartwatch days and GPS hours are different jobs — compare the mode you will use.",
      "Cold weather and backlight habits move numbers further.",
      "Size the watch for your longest unsupported event, not the best-case brochure.",
    ],
    definition: {
      title: "What battery claims usually mean",
      paragraphs: [
        "Running watches publish separate figures for smartwatch wear and continuous GPS activity. Those numbers are not interchangeable.",
        "Activity battery depends on GNSS configuration, screen behaviour, connected sensors, music storage and temperature. Turning features on changes the clock.",
        "Treat published hours as a ceiling for a defined profile. Plan with margin for the longest event you care about.",
      ],
    },
    factors: {
      title: "What drains GPS battery",
      cards: [
        {
          id: "gnss",
          title: "GNSS mode",
          whatItIs: "Single-band vs multi-band / all-systems tracking.",
          howItChanges: "More constellations and frequencies raise power draw for cleaner tracks.",
          whatYouNotice: "Better urban/trail traces at the cost of hours.",
        },
        {
          id: "display",
          title: "Display behaviour",
          whatItIs: "AMOLED brightness, always-on and gesture wake.",
          howItChanges: "Bright always-on faces consume far more than dim gesture screens.",
          whatYouNotice: "Shorter GPS days when the face never sleeps.",
        },
        {
          id: "extras",
          title: "Maps, music and sensors",
          whatItIs: "Offline maps, onboard audio and external HR straps.",
          howItChanges: "Radio, storage access and Bluetooth all add load.",
          whatYouNotice: "Ultra-day plans need conservative settings or a bigger battery class.",
        },
      ],
    },
    examples: {
      title: "Battery personality examples",
      disclaimer: "Illustrative — verify current manufacturer claims before buying.",
      items: [
        {
          productId: "prod-coros-pace-4",
          approachLabel: "Lean GPS endurance",
          whyIllustrates: "Shows a light watch tuned for long stated GPS hours.",
          bestFor: ["Ultras", "Minimal chrome", "Battery-first buyers"],
          tradeoff: "Fewer lifestyle features than flagship Forerunners.",
        },
        {
          productId: "prod-forerunner-970",
          approachLabel: "Feature-dense AMOLED",
          whyIllustrates: "Shows how maps and bright displays trade against raw GPS hours.",
          bestFor: ["Maps users", "Training metrics", "Daily AMOLED wear"],
          tradeoff: "Settings matter more if you race long unsupported days.",
        },
        {
          productId: "prod-enduro-3",
          approachLabel: "Ultra-battery MIP",
          whyIllustrates: "Represents the extreme multi-day GPS class.",
          bestFor: ["Multi-day ultras", "Adventure weeks", "Solar-assisted profiles"],
          tradeoff: "MIP looks less vivid indoors than AMOLED flagships.",
        },
      ],
    },
    mistakes: [
      {
        id: "brochure",
        title: "Buying on the best-case number only",
        body: "Match your GNSS, maps and display habits to the claim profile.",
      },
      {
        id: "race-week",
        title: "Discovering drain on race week",
        body: "Rehearse race settings on a long training day first.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-coros-pace-4", roleLabel: "Lean GPS endurance" },
      { productId: "prod-forerunner-970", roleLabel: "Feature-dense AMOLED" },
      { productId: "prod-enduro-3", roleLabel: "Ultra-battery MIP" },
    ],
    productRailTitle: "Compare battery personalities",
    bestGuideHref: "/best/gps-watches-running",
    bestGuideLabel: "Best GPS watches →",
  }),
  plan({
    slug: "maps-navigation-running-watches",
    displayTitle: "Maps & Navigation on Running Watches",
    deck: "When onboard maps matter — and when breadcrumb navigation or a phone is enough.",
    eyebrow: "Explainer",
    heroImageSrc: "/images/watches/products/garmin-forerunner-970-hero.jpg",
    heroImageAlt: "Garmin Forerunner 970 GPS running watch",
    quickAnswerBullets: [
      "Full offline maps help remote trails and complex city navigation.",
      "Breadcrumb courses suit supported races and familiar loops.",
      "Map watches cost more battery and usually more money.",
      "Course import and turn prompts matter as much as pretty cartography.",
      "Buy maps for the routes you get lost on — not for the screenshot.",
    ],
    definition: {
      title: "Map depth vs course following",
      paragraphs: [
        "Some watches show full topo or street maps offline. Others follow a preloaded course with a breadcrumb line and turn alerts.",
        "Maps help when you need to re-route, recognise junctions or navigate without a phone. Course following helps when the path is already planned.",
        "If you never leave marked races or neighbourhood loops, maps may be unused chrome.",
      ],
    },
    factors: {
      title: "Navigation buying filters",
      cards: [
        {
          id: "terrain",
          title: "Where you run",
          whatItIs: "Urban, marked race, or remote trail.",
          howItChanges: "Remote and complex junctions reward fuller maps.",
          whatYouNotice: "Fewer wrong turns when coverage matches the route.",
        },
        {
          id: "workflow",
          title: "Course workflow",
          whatItIs: "How you build and sync routes.",
          howItChanges: "Awkward imports mean maps stay unused.",
          whatYouNotice: "Whether planning stays in one ecosystem.",
        },
        {
          id: "battery",
          title: "Battery cost",
          whatItIs: "Map redraw and GNSS load.",
          howItChanges: "Active map use shortens GPS days.",
          whatYouNotice: "You may need conservative settings on long efforts.",
        },
      ],
    },
    examples: {
      title: "Navigation approaches",
      disclaimer: "Illustrative models — features vary by firmware and size.",
      items: [
        {
          productId: "prod-forerunner-970",
          approachLabel: "Full maps on a running watch",
          whyIllustrates: "Shows offline maps inside a training-first Forerunner.",
          bestFor: ["Trail days", "City navigation", "Garmin course users"],
          tradeoff: "Premium price and settings-sensitive battery.",
        },
        {
          productId: "prod-coros-apex-4",
          approachLabel: "Topo maps on a durable MIP",
          whyIllustrates: "Represents map depth with long-endurance hardware.",
          bestFor: ["Mountain routes", "Multi-hour days", "Offline topo needs"],
          tradeoff: "MIP is less vivid indoors than AMOLED.",
        },
        {
          productId: "prod-coros-pace-4",
          approachLabel: "Lean GPS without full maps",
          whyIllustrates: "Shows when breadcrumb-level navigation is enough.",
          bestFor: ["Supported races", "Known loops", "Battery-first buyers"],
          tradeoff: "Step up if you need full cartography.",
        },
      ],
    },
    mistakes: [
      {
        id: "screenshot",
        title: "Buying maps for the demo screenshot",
        body: "If you never navigate unfamiliar routes, spend the budget on fit and battery instead.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-forerunner-970", roleLabel: "AMOLED maps" },
      { productId: "prod-coros-apex-4", roleLabel: "Topo MIP maps" },
      { productId: "prod-coros-pace-4", roleLabel: "Lean GPS" },
    ],
    productRailTitle: "Compare navigation depth",
    bestGuideHref: "/best/gps-watches-running",
    bestGuideLabel: "Best GPS watches →",
  }),
  plan({
    slug: "beginner-vs-advanced-running-watch",
    displayTitle: "Beginner vs Advanced Running Watch Features",
    deck: "Which metrics and menus you will actually use — so you do not overbuy chrome.",
    eyebrow: "Decision guide",
    heroImageSrc: "/images/watches/products/coros-pace-3-hero.jpg",
    heroImageAlt: "COROS Pace 3 lightweight GPS running watch",
    quickAnswerBullets: [
      "Beginners need reliable GPS, simple workouts and readable recovery cues.",
      "Advanced athletes use training load, structured workouts, maps and ecosystem depth.",
      "Unused menus still cost money, battery and attention.",
      "Start with the features that change this week’s sessions.",
      "You can upgrade later — overbuying rarely improves the first training block.",
    ],
    definition: {
      title: "Feature density is a trade-off",
      paragraphs: [
        "Entry running watches prioritise pace, distance, heart rate and basic training status. Flagships add maps, music, payments, ECG and deeper coaching stacks.",
        "Advanced features help when you open them weekly. Otherwise they become noise and price.",
        "Match the watch to coaching habits and race goals — not to a spec sheet rivalry.",
      ],
    },
    comparison: {
      title: "Beginner vs advanced priorities",
      columns: ["Beginner-first", "Advanced-first", "Buy when"],
      rows: [
        {
          label: "Core tracking",
          values: ["Essential", "Essential", "Always"],
        },
        {
          label: "Maps / music / pay",
          values: ["Optional", "Often daily", "You will open them weekly"],
        },
        {
          label: "Training load depth",
          values: ["Simple cues", "Detailed readiness", "You periodise with the data"],
        },
      ],
    },
    examples: {
      title: "Watch roles",
      disclaimer: "Illustrative — confirm current feature lists.",
      items: [
        {
          productId: "prod-forerunner-165",
          approachLabel: "Approachable AMOLED entry",
          whyIllustrates: "Shows a clearer on-ramp without flagship complexity.",
          bestFor: ["New GPS buyers", "Daily activity + runs", "Lower budget"],
          tradeoff: "Fewer advanced maps and metrics.",
        },
        {
          productId: "prod-coros-pace-3",
          approachLabel: "Lean training watch",
          whyIllustrates: "Keeps battery and weight first with essentials intact.",
          bestFor: ["Endurance focus", "Minimal lifestyle chrome", "Light wrists"],
          tradeoff: "Smaller ecosystem than Garmin flagships.",
        },
        {
          productId: "prod-forerunner-970",
          approachLabel: "Advanced training flagship",
          whyIllustrates: "Shows the dense feature set serious Garmin users unlock weekly.",
          bestFor: ["Maps", "Deep metrics", "Garmin ecosystem"],
          tradeoff: "Premium price and learning curve.",
        },
      ],
    },
    mistakes: [
      {
        id: "future-you",
        title: "Buying for a future athlete you are not yet",
        body: "If you will not open maps or training load this month, start simpler.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-forerunner-165", roleLabel: "Beginner-friendly" },
      { productId: "prod-coros-pace-3", roleLabel: "Lean training" },
      { productId: "prod-forerunner-970", roleLabel: "Advanced flagship" },
    ],
    productRailTitle: "Compare watch depth",
    bestGuideHref: "/best/gps-watches-running",
    bestGuideLabel: "Best GPS watches →",
  }),
  plan({
    slug: "soft-flasks-vs-bladders-explained",
    displayTitle: "Soft Flasks vs Hydration Bladders Explained",
    deck: "Front flasks for access and monitoring — bladders for volume. Choose by refill and route support.",
    eyebrow: "Comparison",
    heroImageSrc: "/images/hydration/products/hydrapak-softflask-speed-500-hero.jpg",
    heroImageAlt: "HydraPak soft flask for running vests",
    quickAnswerBullets: [
      "Soft flasks are easy to see, sip and refill on the move.",
      "Bladders carry more water centrally but are harder to monitor.",
      "Many vests support both — confirm pocket and hanger compatibility.",
      "Taste, cleaning and freeze risk differ by system.",
      "Pick the system you will actually refill on race day.",
    ],
    definition: {
      title: "Two ways to carry fluid",
      paragraphs: [
        "Soft flasks sit in front vest pockets with bite valves or speed caps. You watch volume drop and swap bottles at aid stations.",
        "Bladders ride on the back with a hose to the shoulder. They favour longer unsupported stretches with fewer refill stops.",
        "Neither is universally better — route support and habit decide.",
      ],
    },
    comparison: {
      title: "Flask vs bladder",
      columns: ["Soft flasks", "Bladder", "Choose when"],
      rows: [
        {
          label: "Monitoring",
          values: ["Easy", "Harder", "You want to see remaining fluid"],
        },
        {
          label: "Volume",
          values: ["Moderate", "Higher", "Long unsupported sections"],
        },
        {
          label: "Refill speed",
          values: ["Usually faster", "Slower", "Busy aid stations"],
        },
      ],
    },
    examples: {
      title: "Carry examples",
      disclaimer: "Confirm vest pocket dimensions before buying flasks.",
      items: [
        {
          productId: "prod-hydrapak-softflask-speed-500",
          approachLabel: "Front soft flask",
          whyIllustrates: "Shows the accessible front-carry pattern most vest runners use.",
          bestFor: ["Road ultras with aid", "Quick sips", "Easy cleaning"],
          tradeoff: "Total volume is limited by pocket count.",
        },
        {
          productId: "prod-adv-skin-12",
          approachLabel: "Vest built for flasks",
          whyIllustrates: "Demonstrates a vest shaped around front flask workflow.",
          bestFor: ["Trail days", "Mixed kit + water", "Frequent drinking"],
          tradeoff: "Still confirm flask size fit.",
        },
        {
          productId: "prod-camelbak-crux-15",
          approachLabel: "Bladder volume",
          whyIllustrates: "Represents higher back-mounted fluid capacity.",
          bestFor: ["Long dry stretches", "Fewer refill points"],
          tradeoff: "Harder to judge remaining water mid-run.",
        },
      ],
    },
    mistakes: [
      {
        id: "incompatible",
        title: "Buying flasks that do not fit the vest",
        body: "Height, width and valve position vary — match the pocket.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-hydrapak-softflask-speed-500", roleLabel: "Soft flask" },
      { productId: "prod-adv-skin-12", roleLabel: "Flask-friendly vest" },
      { productId: "prod-camelbak-crux-15", roleLabel: "Bladder" },
    ],
    productRailTitle: "Compare fluid systems",
    bestGuideHref: "/best/running-hydration-vests",
    bestGuideLabel: "Best hydration vests →",
    decisionLinks: [
      {
        label: "Hydration vest vs running belt",
        href: "/guides/hydration-vest-vs-running-belt",
      },
      {
        label: "How to choose a running belt",
        href: "/guides/how-to-choose-running-belt",
      },
    ],
  }),
  plan({
    slug: "how-to-choose-running-belt",
    displayTitle: "How to Choose a Running Belt",
    deck: "Pick a belt for bounce control, bottle compatibility and the kit you actually carry — not maximum advertised storage.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/flipbelt-classic-hero.jpg",
    heroImageAlt: "FlipBelt classic running belt",
    quickAnswerBullets: [
      "Choose a belt when phone, keys and small flasks are enough.",
      "Bounce and chafe on a loaded shake-out beat pocket count.",
      "Match bottle sleeves to the flasks you already own.",
      "Move to a vest when layers or mandatory kit overwhelm the belt.",
      "Try the belt with race-day contents before trusting it.",
    ],
    definition: {
      title: "What a running belt is for",
      paragraphs: [
        "A running belt carries light essentials around the waist with less coverage than a vest. Designs range from stretch tubes to structured packs with bottle holsters.",
        "Good belts disappear when loaded correctly. Poor belts bounce, ride up or dig into the hips once bottles and phones are in.",
        "Use a belt for supported races and shorter long runs; size up to a vest when fluid and kit grow.",
      ],
    },
    factors: {
      title: "Belt buying filters",
      cards: [
        {
          id: "load",
          title: "Typical load",
          whatItIs: "Phone, gels, flasks, keys.",
          howItChanges: "Heavier asymmetric loads bounce more.",
          whatYouNotice: "Whether the belt stays quiet at race pace.",
        },
        {
          id: "fit",
          title: "Fit system",
          whatItIs: "Stretch tube vs buckle vs vest-lite.",
          howItChanges: "Adjustment range and pressure points differ.",
          whatYouNotice: "Comfort after an hour with full contents.",
        },
        {
          id: "access",
          title: "Access while moving",
          whatItIs: "Zippers, stretch openings, bottle angle.",
          howItChanges: "Fiddly access means gels stay uneaten.",
          whatYouNotice: "One-handed reach without breaking stride.",
        },
      ],
    },
    examples: {
      title: "Belt styles",
      disclaimer: "Illustrative — test bounce with your phone and bottles.",
      items: [
        {
          productId: "prod-flipbelt-classic",
          approachLabel: "Stretch tube belt",
          whyIllustrates: "Minimal profile for phone and soft items.",
          bestFor: ["Phone + gels", "Road races", "Low bulk"],
          tradeoff: "Not ideal for large rigid bottles.",
        },
        {
          productId: "prod-spibelt-original",
          approachLabel: "Expandable pocket belt",
          whyIllustrates: "Shows a compact zip pocket approach.",
          bestFor: ["Keys and soft flasks", "Short long runs"],
          tradeoff: "Capacity ceiling arrives quickly.",
        },
        {
          productId: "prod-nathan-peak",
          approachLabel: "Bottle-oriented waist pack",
          whyIllustrates: "Represents structured bottle carry at the waist.",
          bestFor: ["Handheld alternative", "Hot weather fluid"],
          tradeoff: "More bulk than a tube belt.",
        },
      ],
    },
    mistakes: [
      {
        id: "empty-test",
        title: "Testing the belt empty",
        body: "Load race contents and run — empty fit lies.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-flipbelt-classic", roleLabel: "Stretch tube" },
      { productId: "prod-spibelt-original", roleLabel: "Compact pocket" },
      { productId: "prod-nathan-peak", roleLabel: "Bottle waist pack" },
    ],
    productRailTitle: "Compare running belts",
    bestGuideHref: "/best/running-belts",
    bestGuideLabel: "Best running belts →",
  }),
  plan({
    slug: "handheld-bottles-for-running",
    displayTitle: "Handheld Bottles for Running",
    deck: "When a handheld beats a belt or vest — and how strap comfort and capacity decide it.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/hydration/products/nathan-exoshot-2-hero.jpg",
    heroImageAlt: "Nathan ExoShot handheld running bottle",
    quickAnswerBullets: [
      "Handhelds suit short-to-medium runs with simple fluid needs.",
      "Strap comfort and hand fatigue matter more than bottle shape marketing.",
      "Insulated bottles help in heat; soft flasks pack flatter when empty.",
      "If you need layers and lots of gels, a belt or vest usually wins.",
      "Practice drinking and stowing before race day.",
    ],
    definition: {
      title: "What a handheld is for",
      paragraphs: [
        "A handheld bottle keeps fluid in one hand with a strap or grip. It is the lightest structured hydration option for many road runners.",
        "Capacity is limited compared with vests. The trade is simplicity and quick access.",
        "Switch away when you need both hands free for poles, technical trail or heavy kit.",
      ],
    },
    factors: {
      title: "Handheld filters",
      cards: [
        {
          id: "strap",
          title: "Strap and hand feel",
          whatItIs: "How the bottle sits during swing.",
          howItChanges: "Hot spots and numbness end runs early.",
          whatYouNotice: "Whether you forget it is there after twenty minutes.",
        },
        {
          id: "volume",
          title: "Volume vs weight",
          whatItIs: "Fluid capacity when full.",
          howItChanges: "Larger bottles fatigue the grip sooner.",
          whatYouNotice: "Enough water without an awkward pendulum.",
        },
        {
          id: "stow",
          title: "Empty behaviour",
          whatItIs: "Soft vs hard bottles when drained.",
          howItChanges: "Soft flasks collapse; hard bottles stay bulky.",
          whatYouNotice: "Easier aid-station transitions with soft designs.",
        },
      ],
    },
    examples: {
      title: "Handheld approaches",
      disclaimer: "Try grip feel in-store when you can.",
      items: [
        {
          productId: "prod-nathan-exoshot",
          approachLabel: "Structured handheld",
          whyIllustrates: "Shows a race-day handheld pattern with secure strap.",
          bestFor: ["Road long runs", "Simple fluid plans"],
          tradeoff: "One hand is occupied.",
        },
        {
          productId: "prod-hydrapak-skyflask-speed-500",
          approachLabel: "Soft handheld flask",
          whyIllustrates: "Represents collapsible carry when empty.",
          bestFor: ["Heat training", "Packability"],
          tradeoff: "Less structure than hard bottles for some grips.",
        },
        {
          productId: "prod-nathan-speeddraw-insulated",
          approachLabel: "Insulated handheld",
          whyIllustrates: "Shows insulation for warmer climates.",
          bestFor: ["Hot weather", "Longer sips"],
          tradeoff: "Slightly more bulk.",
        },
      ],
    },
    mistakes: [
      {
        id: "poles",
        title: "Planning poles and a handheld together",
        body: "Technical trail with poles usually wants vest or belt carry instead.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-nathan-exoshot", roleLabel: "Structured handheld" },
      { productId: "prod-hydrapak-skyflask-speed-500", roleLabel: "Soft flask handheld" },
      { productId: "prod-nathan-speeddraw-insulated", roleLabel: "Insulated handheld" },
    ],
    productRailTitle: "Compare handheld bottles",
  }),
  plan({
    slug: "hydration-for-marathon-training",
    displayTitle: "Hydration for Marathon Training",
    deck: "Match carry to long-run support — belts for city loops, vests when heat and duration stack up.",
    eyebrow: "Decision guide",
    heroImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    heroImageAlt: "Running hydration vest for long training",
    quickAnswerBullets: [
      "Practice race-day fluid access on training long runs.",
      "Supported city routes often need less carry than hot unsupported loops.",
      "Heat, humidity and stomach tolerance change volume needs.",
      "Carry plan and fuel plan belong together.",
      "Do not debut a new vest or belt in the taper.",
    ],
    definition: {
      title: "Training carry vs race carry",
      paragraphs: [
        "Marathon training long runs teach how much fluid you need between fountains or bottles. The race may offer more aid — or less, depending on the event.",
        "A belt may cover cool, well-supported weekends. Heat waves and park loops without taps push toward handhelds or vests.",
        "Rehearse the exact bottles, mixes and access pattern you will use on race day.",
      ],
    },
    factors: {
      title: "Marathon hydration filters",
      cards: [
        {
          id: "support",
          title: "Route support",
          whatItIs: "Fountains, shops, crew, race aid.",
          howItChanges: "More support shrinks required carry.",
          whatYouNotice: "Lighter kits on familiar city loops.",
        },
        {
          id: "heat",
          title: "Heat and duration",
          whatItIs: "Temperature and time on feet.",
          howItChanges: "Hot long runs raise fluid and electrolyte needs.",
          whatYouNotice: "You may need a larger system mid-summer.",
        },
        {
          id: "stomach",
          title: "Gut tolerance",
          whatItIs: "What mixes and volumes you absorb.",
          howItChanges: "Aggressive new plans cause GI issues.",
          whatYouNotice: "Steady intake you have already rehearsed.",
        },
      ],
    },
    examples: {
      title: "Training kit patterns",
      disclaimer: "Personal sweat rate and medical advice still come first.",
      items: [
        {
          productId: "prod-flipbelt-classic",
          approachLabel: "Light belt long run",
          whyIllustrates: "Works when fountains and short gaps cover fluid.",
          bestFor: ["Cool weather", "City support", "Phone + gels"],
          tradeoff: "Limited water volume.",
        },
        {
          productId: "prod-nathan-exoshot",
          approachLabel: "Handheld long run",
          whyIllustrates: "Simple fluid without a full vest.",
          bestFor: ["Moderate gaps", "Road loops"],
          tradeoff: "One hand busy for 90–180 minutes.",
        },
        {
          productId: "prod-adv-skin-12",
          approachLabel: "Vest for heat / longer gaps",
          whyIllustrates: "Carries fluid, fuel and a light layer together.",
          bestFor: ["Hot blocks", "Unsupported parks", "Longer efforts"],
          tradeoff: "More coverage than some road racers want.",
        },
      ],
    },
    mistakes: [
      {
        id: "race-debut",
        title: "Debuting carry on race morning",
        body: "Anything that touches fluid or fuel should appear in training first.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-flipbelt-classic", roleLabel: "Light belt" },
      { productId: "prod-nathan-exoshot", roleLabel: "Handheld" },
      { productId: "prod-adv-skin-12", roleLabel: "Training vest" },
    ],
    productRailTitle: "Compare marathon carry options",
  }),
  plan({
    slug: "how-to-choose-running-socks",
    displayTitle: "How to Choose Running Socks",
    deck: "Cushion zones, height and moisture management matter more than logo colour — match socks to blister risk and shoe volume.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/feetures-elite-light-cushion-hero.jpg",
    heroImageAlt: "Feetures Elite Light Cushion running socks",
    quickAnswerBullets: [
      "Fit and seam placement reduce hot spots more than thick marketing cushion.",
      "Match sock volume to shoe fit — bulky socks in a snug race shoe cause trouble.",
      "Height is preference plus protection (debris, Achilles coverage).",
      "Toe-sock designs help some runners; they are not mandatory.",
      "Replace thin worn pairs before a goal race.",
    ],
    definition: {
      title: "What running socks actually change",
      paragraphs: [
        "Running socks manage moisture, reduce friction and add selective cushion under the foot. They are a cheap injury-prevention tool when they fit.",
        "Cushion maps vary — light for race shoes, denser for long road days. Height ranges from no-show to crew.",
        "The right sock disappears. The wrong sock creates blisters you blame on the shoe.",
      ],
    },
    factors: {
      title: "Sock buying filters",
      cards: [
        {
          id: "volume",
          title: "Volume vs shoe",
          whatItIs: "How thick the sock sits in the last.",
          howItChanges: "Too much bulk tightens a performance fit.",
          whatYouNotice: "Toes that still wiggle after lacing.",
        },
        {
          id: "moisture",
          title: "Moisture and friction",
          whatItIs: "Yarn and knit that move sweat.",
          howItChanges: "Wet cotton-like feels raise blister risk.",
          whatYouNotice: "Drier feet late in long runs.",
        },
        {
          id: "zones",
          title: "Cushion zones",
          whatItIs: "Where padding sits under heel and forefoot.",
          howItChanges: "Extra padding can help or feel mushy.",
          whatYouNotice: "Comfort without hot spots.",
        },
      ],
    },
    examples: {
      title: "Sock approaches",
      disclaimer: "Try with the shoes you race and train in.",
      items: [
        {
          productId: "prod-feetures-elite-light-cushion",
          approachLabel: "Targeted light cushion",
          whyIllustrates: "Shows zone cushioning without race-shoe bulk.",
          bestFor: ["Daily trainers", "Mixed weeks"],
          tradeoff: "Personal fit still varies by foot shape.",
        },
        {
          productId: "prod-balega-hidden-comfort",
          approachLabel: "Plush comfort sock",
          whyIllustrates: "Represents a softer everyday feel.",
          bestFor: ["Easy days", "Recovery runs"],
          tradeoff: "May feel roomy in snug race shoes.",
        },
        {
          productId: "prod-injinji-run-midweight",
          approachLabel: "Toe-sock design",
          whyIllustrates: "Separates toes to reduce between-toe friction for some runners.",
          bestFor: ["Blister-prone toes", "Long efforts"],
          tradeoff: "Different on-foot feel — rehearse before race day.",
        },
      ],
    },
    mistakes: [
      {
        id: "cotton",
        title: "Racing in casual cotton socks",
        body: "Moisture and seams that feel fine on a walk show up at mile 18.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-feetures-elite-light-cushion", roleLabel: "Light cushion" },
      { productId: "prod-balega-hidden-comfort", roleLabel: "Plush comfort" },
      { productId: "prod-injinji-run-midweight", roleLabel: "Toe sock" },
    ],
    productRailTitle: "Compare running socks",
    bestGuideHref: "/best/running-socks",
    bestGuideLabel: "Best running socks →",
  }),
  plan({
    slug: "running-jackets-explained",
    displayTitle: "Running Jackets Explained",
    deck: "Wind shell vs waterproof — choose by rain intensity, breathability needs and how hard you run in it.",
    eyebrow: "Explainer",
    heroImageSrc: "/images/catalog/fallbacks/clothing.svg",
    heroImageAlt: "Running jacket weather layer",
    quickAnswerBullets: [
      "Wind shells handle most cool, dry training days.",
      "Waterproof jackets matter in sustained rain — and trap more heat.",
      "Breathability and packability often beat maximum waterproof ratings for tempo work.",
      "Reflectivity helps for dark road miles.",
      "Buy for the weather you actually train in most weeks.",
    ],
    definition: {
      title: "Shell jobs for runners",
      paragraphs: [
        "A running jacket blocks wind, light precip or serious rain while trying not to steam you from the inside. This page is the jacket-type filter: packable wind, everyday training DWR, and wetter weather shells.",
        "Wind shells are lighter and more breathable. Waterproof membranes add protection and usually more heat and noise. Winter Layering for Runners covers base/mid/extremities around the shell — not this taxonomy.",
        "The right jacket matches intensity: easy rainy jogs tolerate more protection than hard intervals.",
      ],
    },
    factors: {
      title: "Jacket filters",
      cards: [
        {
          id: "weather",
          title: "Typical weather",
          whatItIs: "Wind, drizzle or lasting rain.",
          howItChanges: "Overbuilding for rare storms adds weekly sweat.",
          whatYouNotice: "You reach for the jacket instead of dreading it.",
        },
        {
          id: "breathability",
          title: "Breathability",
          whatItIs: "How vapour escapes during hard efforts.",
          howItChanges: "Sealed jackets soak you from inside on tempo days.",
          whatYouNotice: "Less clammy feel mid-run.",
        },
        {
          id: "pack",
          title: "Packability",
          whatItIs: "Stuff size for belts and vests.",
          howItChanges: "Bulky shells get left at home.",
          whatYouNotice: "A jacket you actually carry for changing forecasts.",
        },
      ],
    },
    examples: {
      title: "Jacket roles",
      disclaimer: "Layer with your own base preferences.",
      items: [
        {
          productId: "prod-patagonia-houdini-men",
          approachLabel: "Packable wind shell",
          whyIllustrates: "Ultralight emergency wind layer you stuff in a vest, not a start-the-run training jacket.",
          bestFor: ["Race kits", "Trail stow layer", "Changing forecasts"],
          tradeoff: "Thin fabric; not everyday cool-weather coverage.",
        },
        {
          productId: "prod-brooks-canopy-jacket-unisex",
          approachLabel: "Training DWR jacket",
          whyIllustrates: "A jacket you actually start easy and long runs in — more everyday than a race-stow shell.",
          bestFor: ["Cool road miles", "Light drizzle"],
          tradeoff: "Not a fully waterproof membrane shell.",
        },
        {
          productId: "prod-on-weather-jacket-men",
          approachLabel: "Wetter-weather shell",
          whyIllustrates: "More weather protection than a paper-thin wind shirt when rain is the weekly pattern.",
          bestFor: ["Sustained rain", "Changeable outdoor sessions"],
          tradeoff: "Warmer and less packable than a Houdini-class layer.",
        },
      ],
    },
    mistakes: [
      {
        id: "sauna",
        title: "Wearing a rain shell for dry tempo work",
        body: "Save waterproof layers for rain; use a lighter wind shirt when dry.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-patagonia-houdini-men", roleLabel: "Packable wind" },
      { productId: "prod-brooks-canopy-jacket-unisex", roleLabel: "Training jacket" },
      { productId: "prod-on-weather-jacket-men", roleLabel: "Wetter shell" },
    ],
    productRailTitle: "Jacket jobs",
    bestGuideHref: "/best/running-jackets",
    bestGuideLabel: "Best running jackets →",
    decisionLinks: [
      {
        label: "Winter layering (base / mid / extremities)",
        href: "/guides/winter-layering-for-runners",
      },
    ],
  }),
  plan({
    slug: "hot-weather-running-apparel",
    displayTitle: "Hot-Weather Running Apparel",
    deck: "Light fabrics, coverage choices and colour — stay cooler without guessing at miracle cooling claims.",
    eyebrow: "Decision guide",
    heroImageSrc: "/images/running/best-hub/best-running-socks.jpg",
    heroImageAlt: "Light running apparel and socks for warm weather",
    quickAnswerBullets: [
      "Prioritise moisture movement and freer airflow over heavy cotton.",
      "Light colours and loose cuts help in strong sun.",
      "Coverage can protect skin even when it feels warmer at the start.",
      "Socks, hats and sunglasses are part of the heat system.",
      "Hydration planning matters as much as fabric marketing.",
    ],
    definition: {
      title: "Dressing for heat",
      paragraphs: [
        "Hot-weather apparel tries to move sweat and keep air flowing while limiting chafe. Claims about dramatic body-temperature drops are usually overstated.",
        "Singlet vs tee, short length and sock height are preference plus sun exposure decisions.",
        "Train in the kit you will race — heat surprises on race morning are avoidable.",
      ],
    },
    factors: {
      title: "Heat kit filters",
      cards: [
        {
          id: "fabric",
          title: "Fabric behaviour",
          whatItIs: "How quickly cloth dries and breathes.",
          howItChanges: "Heavy wet fabric raises chafe and heat load.",
          whatYouNotice: "Less cling late in the run.",
        },
        {
          id: "coverage",
          title: "Coverage vs sun",
          whatItIs: "Exposed skin versus light sleeves.",
          howItChanges: "Sunburn and heat interact differently by person.",
          whatYouNotice: "Comfortable skin at the finish.",
        },
        {
          id: "chafe",
          title: "Chafe points",
          whatItIs: "Seams, salves and fit under sweat.",
          howItChanges: "Salt and friction appear after the first hour.",
          whatYouNotice: "No new hot spots in long heat runs.",
        },
      ],
    },
    examples: {
      title: "Heat-system pieces",
      disclaimer: "Combine apparel with fluid and pacing sense.",
      items: [
        {
          productId: "prod-feetures-elite-light-cushion",
          approachLabel: "Light running sock",
          whyIllustrates: "Moisture-aware feet reduce blister risk in heat.",
          bestFor: ["Long hot runs", "Race rehearsal"],
          tradeoff: "Still replace worn pairs.",
        },
        {
          productId: "prod-flipbelt-classic",
          approachLabel: "Minimal carry",
          whyIllustrates: "Less torso coverage than a vest when fluid needs are small.",
          bestFor: ["Supported heat runs"],
          tradeoff: "Limited water — plan fountains.",
        },
        {
          productId: "prod-buff-coolnet-uv",
          approachLabel: "Hot-weather neck tube",
          whyIllustrates: "A UPF 50 CoolNet Buff manages sweat and sun on the neck without Polar fleece. Fabric rating, not a medical sun claim.",
          bestFor: ["Bright road longs", "Exposed trail heat"],
          tradeoff: "No winter warmth — Polar is the cold-weather Buff.",
        },
      ],
    },
    mistakes: [
      {
        id: "new-kit",
        title: "New shorts on a hot race day",
        body: "Chafe and fit surprises are worse in heat — rehearse the outfit.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-feetures-elite-light-cushion", roleLabel: "Heat-ready socks" },
      { productId: "prod-flipbelt-classic", roleLabel: "Minimal carry" },
      { productId: "prod-buff-coolnet-uv", roleLabel: "Hot-weather Buff" },
    ],
    productRailTitle: "Heat kit pieces",
  }),
  plan({
    slug: "winter-layering-for-runners",
    displayTitle: "Winter Layering for Runners",
    deck: "Base, mid and shell — dress for the second mile, not the first block of wind.",
    eyebrow: "Setup guide",
    heroImageSrc: "/images/catalog/fallbacks/clothing.svg",
    heroImageAlt: "Running jacket for cool-weather training",
    quickAnswerBullets: [
      "Start slightly cool — you warm up after ten minutes.",
      "Wicking base layers beat cotton next to skin.",
      "Add a shell for wind and precip; avoid sauna stacks for hard workouts.",
      "Hands, ears and toes need their own plan.",
      "Reflectivity matters on dark winter roads.",
    ],
    definition: {
      title: "Layer jobs",
      paragraphs: [
        "Winter running layers manage sweat at the skin, optional insulation, and wind or rain outside. This page is the stack: base, mid and extremities — Running Jackets Explained is where you pick the outer shell type.",
        "Overdressing creates sweat that chills you later. Underdressing makes the first kilometre miserable and unsafe in wind.",
        "Build a small modular kit rather than one giant coat.",
      ],
    },
    factors: {
      title: "Winter filters",
      cards: [
        {
          id: "intensity",
          title: "Session intensity",
          whatItIs: "Easy jog vs intervals.",
          howItChanges: "Hard efforts need fewer insulating layers.",
          whatYouNotice: "You finish damp, not soaked and shivering.",
        },
        {
          id: "wind",
          title: "Wind and precip",
          whatItIs: "Shell needs for the forecast.",
          howItChanges: "Wind cuts through breathable shirts quickly.",
          whatYouNotice: "Face and chest stay workable mid-run.",
        },
        {
          id: "extremities",
          title: "Extremities",
          whatItIs: "Gloves, hat, socks.",
          howItChanges: "Cold hands end runs early for many athletes.",
          whatYouNotice: "Fingers that still work at the key stash.",
        },
      ],
    },
    examples: {
      title: "Layer examples",
      disclaimer: "Adjust for your cold tolerance.",
      items: [
        {
          productId: "prod-patagonia-capilene-thermal-crew-unisex",
          approachLabel: "Wicking thermal base",
          whyIllustrates: "Next-to-skin winter layer that moves sweat — not a jacket substitute.",
          bestFor: ["Easy cold miles", "Under a shell"],
          tradeoff: "Needs a wind layer when the forecast is biting.",
        },
        {
          productId: "prod-patagonia-nano-puff-vest-men",
          approachLabel: "Insulating mid / core",
          whyIllustrates: "Core warmth without sleeve bulk so arms can dump heat on tempo.",
          bestFor: ["Bitter easy days", "Standing around before intervals"],
          tradeoff: "Too much insulation for hard efforts once you are moving.",
        },
        {
          productId: "prod-brooks-notch-thermal-beanie",
          approachLabel: "Extremities",
          whyIllustrates: "Hands, ears and toes need their own plan — a jacket does not cover that job.",
          bestFor: ["Dark winter roads", "Easy cold starts"],
          tradeoff: "Overcapping on hard workouts soaks the hat in sweat.",
        },
        {
          productId: "prod-buff-polar",
          approachLabel: "Neck / face layer",
          whyIllustrates: "A fleece-backed Buff covers neck and face when a beanie does not — Polar, not CoolNet, for freezing wind.",
          bestFor: ["Windy winter easy miles", "Face coverage without a balaclava"],
          tradeoff: "Too warm once the workout is hard or the day is mild.",
        },
      ],
    },
    mistakes: [
      {
        id: "cotton",
        title: "Cotton base layers",
        body: "Wet cotton stays cold — use a wicking next-to-skin layer.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-patagonia-capilene-thermal-crew-unisex", roleLabel: "Thermal base" },
      { productId: "prod-patagonia-nano-puff-vest-men", roleLabel: "Insulating vest" },
      { productId: "prod-brooks-notch-thermal-beanie", roleLabel: "Head layer" },
      { productId: "prod-buff-polar", roleLabel: "Winter neck tube" },
    ],
    productRailTitle: "Winter layer examples",
    bestGuideHref: "/best/running-gear-winter",
    bestGuideLabel: "Best winter running gear →",
    decisionLinks: [
      {
        label: "Running jackets explained (shell types)",
        href: "/guides/running-jackets-explained",
      },
    ],
  }),
  plan({
    slug: "shoe-jobs-by-session-type",
    displayTitle: "Shoe Jobs by Session Type",
    deck: "Easy, long, workout and race shoes do different jobs — mixing them without a plan is how rotations fail.",
    eyebrow: "Decision guide",
    heroImageSrc: "/images/running/products/pegasus-42-hero.jpg",
    heroImageAlt: "Nike Pegasus daily trainer",
    quickAnswerBullets: [
      "Easy days want protective, forgiving trainers.",
      "Workouts often want snappier foam or a nylon-plated bridge shoe.",
      "Race shoes are tools for goal efforts — not daily mileage.",
      "Long runs may share the easy shoe or a dedicated softer pair.",
      "Write the job on the shoe before you lace it.",
    ],
    definition: {
      title: "One week, several jobs",
      paragraphs: [
        "A training week usually mixes easy aerobic running, longer efforts, faster sessions and occasional races. Shoes that excel at one job often compromise another.",
        "A rotation assigns shoes to jobs so foam and geometry stay appropriate — and last longer.",
        "You do not need four pairs on day one. You do need clarity about what each pair is for.",
      ],
    },
    factors: {
      title: "Session filters",
      cards: [
        {
          id: "easy",
          title: "Easy / recovery",
          whatItIs: "Soft, stable enough daily trainers.",
          howItChanges: "Racing flats here beat up legs and foam.",
          whatYouNotice: "Legs that still feel usable the next day.",
        },
        {
          id: "workout",
          title: "Workout / tempo",
          whatItIs: "Snappier ride or light plate.",
          howItChanges: "Max-soft dailies can feel sluggish at pace.",
          whatYouNotice: "Cleaner turnover without race-day extremes.",
        },
        {
          id: "race",
          title: "Race day",
          whatItIs: "Light, aggressive race tools.",
          howItChanges: "Poorly rehearsed race shoes cause hot spots.",
          whatYouNotice: "Familiar fit under goal effort.",
        },
      ],
    },
    examples: {
      title: "Job examples",
      disclaimer: "Illustrative roles — not a universal ranking.",
      items: [
        {
          productId: "prod-pegasus-42",
          approachLabel: "Daily / easy",
          whyIllustrates: "Classic mixed-week daily trainer role.",
          bestFor: ["Easy miles", "Versatile weeks"],
          tradeoff: "Not a max-plush recovery shoe or a racer.",
        },
        {
          productId: "prod-adizero-boston-13",
          approachLabel: "Workout bridge",
          whyIllustrates: "Shows a faster training shoe between daily and race.",
          bestFor: ["Tempo", "Longer quality"],
          tradeoff: "Less ideal as pure recovery.",
        },
        {
          productId: "prod-vaporfly-4",
          approachLabel: "Race tool",
          whyIllustrates: "Aggressive race geometry for goal efforts.",
          bestFor: ["Goal races", "Key pre-race rehearsals"],
          tradeoff: "Wrong tool for most easy mileage.",
        },
      ],
    },
    mistakes: [
      {
        id: "one-shoe",
        title: "Forcing one shoe to do every pace",
        body: "If workouts and easy days fight each other, split the jobs.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-pegasus-42", roleLabel: "Easy daily" },
      { productId: "prod-adizero-boston-13", roleLabel: "Workout bridge" },
      { productId: "prod-vaporfly-4", roleLabel: "Race tool" },
    ],
    productRailTitle: "Shoes by session job",
    bestGuideHref: "/guides/running-shoe-rotation",
    bestGuideLabel: "Shoe rotation explained →",
  }),
  plan({
    slug: "first-marathon-gear-checklist",
    displayTitle: "First Marathon Gear Checklist",
    deck: "Shoes, socks, watch, carry and fuel — lock the kit in training, not at the expo.",
    eyebrow: "Setup guide",
    heroImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    heroImageAlt: "Long-distance road running context",
    quickAnswerBullets: [
      "Race shoes and socks need long-run rehearsals.",
      "Watch battery and GPS settings get a dress rehearsal too.",
      "Carry only the fluid and fuel plan you have practised.",
      "Weather layer decision trees beat last-minute panic buys.",
      "Write the checklist the week before — then stop tinkering.",
    ],
    definition: {
      title: "A kit that has already worked",
      paragraphs: [
        "First marathons go wrong when gear is new. The checklist exists to force rehearsal.",
        "Cover footwear, apparel, watch, nutrition, hydration access and weather contingencies.",
        "If an item has not appeared on a long run, it does not belong in the race bag.",
      ],
    },
    factors: {
      title: "Checklist pillars",
      cards: [
        {
          id: "feet",
          title: "Feet system",
          whatItIs: "Shoes, socks, anti-chafe.",
          howItChanges: "Blisters end more debuts than slow splits.",
          whatYouNotice: "Familiar pressure after 90 minutes.",
        },
        {
          id: "fuel",
          title: "Fuel and fluid",
          whatItIs: "Gels, bottles, aid-station plan.",
          howItChanges: "Untried mixes cause GI distress.",
          whatYouNotice: "Steady energy without stomach drama.",
        },
        {
          id: "timing",
          title: "Watch and pacing",
          whatItIs: "GPS mode, data screens, battery.",
          howItChanges: "Wrong screens create mid-race confusion.",
          whatYouNotice: "Calm splits you can actually read.",
        },
      ],
    },
    examples: {
      title: "Core kit examples",
      disclaimer: "Personal medical and coaching advice still override generic lists.",
      items: [
        {
          productId: "prod-pegasus-42",
          approachLabel: "Trusted trainer / possible race shoe",
          whyIllustrates: "Many debut runners race the daily they trust — if rehearsed.",
          bestFor: ["First marathon", "Known fit"],
          tradeoff: "Not as light as a supershoe.",
        },
        {
          productId: "prod-forerunner-165",
          approachLabel: "Simple GPS watch",
          whyIllustrates: "Enough pacing tools without flagship complexity.",
          bestFor: ["Clear screens", "Reliable GPS"],
          tradeoff: "Fewer advanced maps/metrics.",
        },
        {
          productId: "prod-flipbelt-classic",
          approachLabel: "Gel / key carry",
          whyIllustrates: "Light carry when aid stations cover water.",
          bestFor: ["Supported courses"],
          tradeoff: "Limited fluid volume.",
        },
      ],
    },
    mistakes: [
      {
        id: "expo",
        title: "Expo-only shoe decisions",
        body: "Never race a fresh model without mileage in it.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-pegasus-42", roleLabel: "Trusted shoes" },
      { productId: "prod-forerunner-165", roleLabel: "Simple watch" },
      { productId: "prod-flipbelt-classic", roleLabel: "Light carry" },
    ],
    productRailTitle: "Debut marathon kit pieces",
  }),
  plan({
    slug: "trail-race-kit-essentials",
    displayTitle: "Trail Race Kit Essentials",
    deck: "Mandatory kit, water, layers and navigation — build from the race rules outward, not from Instagram packs.",
    eyebrow: "Setup guide",
    heroImageSrc: "/images/packs/products/salomon-adv-skin-12-hero.jpg",
    heroImageAlt: "Trail running hydration vest",
    quickAnswerBullets: [
      "Start with the organiser’s mandatory kit list.",
      "Size the vest for water plus required layers and safety gear.",
      "Rehearse full-kit long runs on similar terrain.",
      "Navigation and light matter when weather or darkness is plausible.",
      "Do not carry unused litres just to look prepared.",
    ],
    definition: {
      title: "Rules first, then comfort",
      paragraphs: [
        "Trail races often require specific safety items. Missing kit can mean a DNS at check-in.",
        "Once mandatory items fit, optimise bounce, access and fluid for the course profile.",
        "Training with the race vest teaches hot spots before they appear at kilometre forty.",
      ],
    },
    factors: {
      title: "Trail kit filters",
      cards: [
        {
          id: "mandatory",
          title: "Mandatory kit",
          whatItIs: "Jacket, whistle, phone, food minimums.",
          howItChanges: "List drives vest size more than preference.",
          whatYouNotice: "Check-in without scrambling.",
        },
        {
          id: "terrain",
          title: "Course demands",
          whatItIs: "Climb, heat, remote sections.",
          howItChanges: "Water and layer needs scale with exposure.",
          whatYouNotice: "Enough reserves between aid stations.",
        },
        {
          id: "access",
          title: "On-trail access",
          whatItIs: "Where gels, flasks and jacket live.",
          howItChanges: "Buried layers stay unused when weather turns.",
          whatYouNotice: "One-handed access while moving.",
        },
      ],
    },
    examples: {
      title: "Trail kit pieces",
      disclaimer: "Always defer to the specific race rules.",
      items: [
        {
          productId: "prod-adv-skin-12",
          approachLabel: "Race vest",
          whyIllustrates: "Common capacity class for mandatory kit + fluid.",
          bestFor: ["Trail ultras", "Mixed mandatory lists"],
          tradeoff: "Overkill for short, fully supported races.",
        },
        {
          productId: "prod-petzl-swift-rl",
          approachLabel: "Headlamp",
          whyIllustrates: "Darkness insurance when start/finish times spill into night.",
          bestFor: ["Early starts", "Long cutoffs"],
          tradeoff: "Carry weight if never used — still often required.",
        },
        {
          productId: "prod-peregrine-15",
          approachLabel: "Trail shoe",
          whyIllustrates: "Grip and protection matched to soft or rocky surfaces.",
          bestFor: ["Technical trails", "Mud and roots"],
          tradeoff: "Wrong tool for pure road races.",
        },
      ],
    },
    mistakes: [
      {
        id: "list",
        title: "Ignoring the mandatory list until race week",
        body: "Buy and rehearse early — specialty kit sells out.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-adv-skin-12", roleLabel: "Trail vest" },
      { productId: "prod-petzl-swift-rl", roleLabel: "Headlamp" },
      { productId: "prod-peregrine-15", roleLabel: "Trail shoe" },
    ],
    productRailTitle: "Trail race essentials",
  }),
  plan({
    slug: "beginner-running-gear-stack",
    displayTitle: "Beginner Running Gear Stack",
    deck: "Shoes, a simple watch and light carry — buy the stack that gets you consistent, not the full catalogue.",
    eyebrow: "Setup guide",
    heroImageSrc: "/images/home/guide-running-shoes.jpg",
    heroImageAlt: "Beginner-friendly running shoes",
    quickAnswerBullets: [
      "Start with well-fitted daily trainers — not race plates.",
      "A basic GPS watch beats phone-only once pacing matters.",
      "Skip the vest until long runs need real fluid capacity.",
      "Socks and anti-chafe prevent early quitters.",
      "Add specialised gear only when a clear weekly job appears.",
    ],
    definition: {
      title: "A minimum useful kit",
      paragraphs: [
        "New runners are sold entire ecosystems. Consistency needs far less: shoes that fit, apparel that does not chafe, and optional timing.",
        "Watches and carry systems help once sessions have structure. They are not day-one requirements.",
        "Grow the stack with training age — not with wishlist momentum.",
      ],
    },
    factors: {
      title: "Beginner stack filters",
      cards: [
        {
          id: "shoes",
          title: "Shoes first",
          whatItIs: "Daily trainer fit and terrain.",
          howItChanges: "Wrong shoes create pain that looks like “I hate running.”",
          whatYouNotice: "Comfortable easy miles.",
        },
        {
          id: "timing",
          title: "Timing tool",
          whatItIs: "Phone vs entry GPS watch.",
          howItChanges: "Wrist GPS frees hands and simplifies pacing.",
          whatYouNotice: "Less fiddling mid-run.",
        },
        {
          id: "carry",
          title: "Carry only when needed",
          whatItIs: "Belt or handheld for longer efforts.",
          howItChanges: "Empty vests add heat and cost.",
          whatYouNotice: "Fluid when runs actually outgrow fountains.",
        },
      ],
    },
    examples: {
      title: "Starter stack examples",
      disclaimer: "Fit still beats any named model.",
      items: [
        {
          productId: "prod-ghost-18",
          approachLabel: "Forgiving daily trainer",
          whyIllustrates: "Approachable cushion for new road mileage.",
          bestFor: ["Easy weeks", "First consistent block"],
          tradeoff: "Not a race shoe.",
        },
        {
          productId: "prod-forerunner-165",
          approachLabel: "Entry GPS watch",
          whyIllustrates: "Enough metrics without flagship overwhelm.",
          bestFor: ["Pace learning", "Simple workouts"],
          tradeoff: "Fewer maps and advanced tools.",
        },
        {
          productId: "prod-spibelt-original",
          approachLabel: "Light belt",
          whyIllustrates: "Phone and key carry without a vest.",
          bestFor: ["Road loops", "Short long runs"],
          tradeoff: "Limited water.",
        },
      ],
    },
    mistakes: [
      {
        id: "supershoe",
        title: "Starting in supershoes",
        body: "Learn easy mileage in a daily trainer first.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-ghost-18", roleLabel: "Daily trainer" },
      { productId: "prod-forerunner-165", roleLabel: "Entry watch" },
      { productId: "prod-spibelt-original", roleLabel: "Light belt" },
    ],
    productRailTitle: "Beginner stack pieces",
    bestGuideHref: "/guides/how-to-choose-running-shoes",
    bestGuideLabel: "How to choose running shoes →",
  }),
  plan({
    slug: "when-to-use-a-massage-gun",
    displayTitle: "When to Use a Massage Gun",
    deck: "Short, controlled soft-tissue sessions — not a substitute for rest, load management or clinical care.",
    eyebrow: "Decision guide",
    heroImageSrc: "/images/running/accessories/therabody-theragun-mini-2-hero.jpg",
    heroImageAlt: "Theragun Mini massage gun",
    quickAnswerBullets: [
      "Use brief, tolerable pressure on large running muscles after hard days if it helps you feel better.",
      "Skip sharp pain, acute injuries and bony spots.",
      "Portable minis suit travel; larger units suit home routines.",
      "Noise, battery and attachment variety matter more than miracle claims.",
      "Massage guns do not heal injuries or guarantee faster recovery.",
    ],
    medicalNote:
      "Massage guns are comfort tools, not medical devices. Seek qualified care for injuries or unusual pain.",
    definition: {
      title: "What a massage gun is for",
      paragraphs: [
        "Percussion devices apply rapid mechanical pressure many runners use for soft-tissue comfort around training.",
        "They are optional adjuncts. Sleep, progressive training load and sensible rest still do the heavy lifting.",
        "Buy for the routine you will keep — not for marketing physiology language.",
      ],
    },
    factors: {
      title: "Buying filters",
      cards: [
        {
          id: "size",
          title: "Size and travel",
          whatItIs: "Mini vs full-size body.",
          howItChanges: "Travel minis trade amplitude for packability.",
          whatYouNotice: "Whether it stays in the bag you actually carry.",
        },
        {
          id: "noise",
          title: "Noise and battery",
          whatItIs: "Household friendliness and runtime.",
          howItChanges: "Loud units get abandoned in shared spaces.",
          whatYouNotice: "Sessions you finish instead of skipping.",
        },
        {
          id: "heads",
          title: "Attachments",
          whatItIs: "Head shapes for calves, quads and glutes.",
          howItChanges: "Wrong heads feel pokey or useless.",
          whatYouNotice: "Comfortable coverage on the muscles you target.",
        },
      ],
    },
    examples: {
      title: "Device example",
      disclaimer: "Comfort preference is personal — start gently.",
      items: [
        {
          productId: "prod-theragun-mini",
          approachLabel: "Travel-friendly mini",
          whyIllustrates: "Shows a compact percussion option for bags and hotels.",
          bestFor: ["Travel", "Short sessions", "Small storage"],
          tradeoff: "Less power/amplitude than full-size home units.",
        },
        {
          productId: "prod-oofos-ooriginal",
          approachLabel: "Passive recovery footwear",
          whyIllustrates: "Contrasts active percussion with simple post-run comfort footwear.",
          bestFor: ["After long runs", "Standing around post-race"],
          tradeoff: "Not soft-tissue percussion.",
        },
      ],
    },
    mistakes: [
      {
        id: "bruise",
        title: "Chasing intensity",
        body: "More amplitude is not better — stop at comfortable pressure.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-theragun-mini", roleLabel: "Massage gun" },
      { productId: "prod-oofos-ooriginal", roleLabel: "Recovery sandal" },
    ],
    productRailTitle: "Recovery comfort tools",
  }),
  plan({
    slug: "recovery-sandals-for-runners",
    displayTitle: "Recovery Sandals for Runners",
    deck: "Soft post-run footwear for walking around after hard days — comfort preference, not medical treatment.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/oofos-ooriginal-hero.jpg",
    heroImageAlt: "OOFOS OOriginal recovery sandal",
    quickAnswerBullets: [
      "Choose recovery sandals for easy walking after long or hard sessions.",
      "Fit and foam feel matter more than recovery marketing language.",
      "They do not replace training sense or clinical care.",
      "Travel pairs help after races when you still need to walk the venue.",
      "If they hot-spot on day one, try another shape — do not hope for break-in miracles.",
    ],
    definition: {
      title: "What recovery sandals are for",
      paragraphs: [
        "Recovery sandals use soft foam and open designs for casual walking when running shoes feel like too much after a hard effort.",
        "They are comfort tools. Kitletics will not claim they heal tissue, improve circulation or speed recovery on their own.",
        "Buy them if you want an easy shoe for the hours after training — not as a therapy device.",
      ],
    },
    factors: {
      title: "Sandal filters",
      cards: [
        {
          id: "foam",
          title: "Foam feel",
          whatItIs: "How soft and stable the footbed feels.",
          howItChanges: "Too soft can feel unstable for some walkers.",
          whatYouNotice: "Comfortable steps without hot spots.",
        },
        {
          id: "fit",
          title: "Fit and strap",
          whatItIs: "How the sandal stays on.",
          howItChanges: "Slip-ons that rub ruin the point.",
          whatYouNotice: "All-afternoon wear without adjustment.",
        },
        {
          id: "pack",
          title: "Packability",
          whatItIs: "Travel and race-bag size.",
          howItChanges: "Bulky pairs get left at home.",
          whatYouNotice: "A pair that actually travels with you.",
        },
      ],
    },
    examples: {
      title: "Example",
      disclaimer: "Try fit in person when possible.",
      items: [
        {
          productId: "prod-oofos-ooriginal",
          approachLabel: "Soft recovery sandal",
          whyIllustrates: "Common post-run comfort footwear pattern.",
          bestFor: ["After long runs", "Race weekends"],
          tradeoff: "Not for running or technical walking.",
        },
      ],
    },
    mistakes: [
      {
        id: "claims",
        title: "Buying for unverified recovery claims",
        body: "Pay for comfort and fit — not miracle physiology language.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-oofos-ooriginal", roleLabel: "Recovery sandal" },
    ],
    productRailTitle: "Recovery sandal example",
  }),
  plan({
    slug: "anti-chafe-for-runners",
    displayTitle: "Anti-Chafe for Runners",
    deck: "Stick vs roll-on barriers for known hotspots — not a blister cure, not audio, and not a reason to keep a short that already rubs.",
    eyebrow: "Buying Guide",
    heroImageSrc: "/images/running/accessories/body-glide-original-hero.png",
    heroImageAlt: "Body Glide Original anti-chafe stick",
    quickAnswerBullets: [
      "Name the exact rub before you buy a brand — thighs, sports-bra line, underarms and seams are different jobs.",
      "A twist-up stick is the race-morning default; a roll-on wins thin coverage under tight kits if you give it dry-time.",
      "Trial the format on a mid-week long in the same shorts, bra and socks you will race in.",
      "Balm does not treat wounds or replace a garment that already eats you.",
      "Headphones, lights and sunglasses are other shelves — use the Accessories Finder to leave this catalog.",
    ],
    definition: {
      title: "This is a hotspot tool",
      paragraphs: [
        "Anti-chafe stick balms and roll-on films reduce skin-on-skin or kit-on-skin rub on miles you already know fail. Kitletics ranks format and how you will apply it — not clinical blister outcomes.",
        "This category is a three-SKU specialist shelf: Body Glide Original and Squirrel’s Nut Butter as stick/tin balms, 2Toms SportShield as a roll-on. Gaiters, armbands and neckwear stay draft until authentic heroes exist.",
        "A barrier is a finisher. If the liner, bra or sock is already the problem, change that first — then add film only where you still fail.",
      ],
    },
    comparison: {
      title: "Stick vs roll-on",
      columns: ["Stick / tin balm", "Roll-on film"],
      rows: [
        {
          label: "Race-morning speed",
          values: ["One-hand twist-up", "Uncap, roll, wait to dry"],
        },
        {
          label: "Under tight lycra",
          values: ["Can feel waxy", "Thinner even film"],
        },
        {
          label: "Reapply on the move",
          values: ["Pocketable stick or tin", "Harder without stopping"],
        },
      ],
      footnote: "Trial both formats before you pick a race-week default.",
    },
    factors: {
      title: "How to choose",
      cards: [
        {
          id: "rub",
          title: "Name the rub",
          whatItIs: "Skin-on-skin vs seam or sports-bra hardware.",
          howItChanges: "A full-body coating wastes product and still misses the hotspot.",
          whatYouNotice: "You apply only where last week actually failed.",
        },
        {
          id: "format",
          title: "Format",
          whatItIs: "Stick/tin vs roll-on bottle.",
          howItChanges: "Start-corral speed vs thin kit coverage.",
          whatYouNotice: "Whether you can use it without looking, or need dry-time before dressing.",
        },
        {
          id: "reapply",
          title: "Reapplication plan",
          whatItIs: "Whether the film must last past 90 minutes without a stop.",
          howItChanges: "Ultra kits often carry a tin or mini stick; roll-ons are a dressing-room tool.",
          whatYouNotice: "You do not discover the format fails at kilometre 32.",
        },
      ],
    },
    examples: {
      title: "Published formats",
      disclaimer: "Three published SKUs only — not a full accessories mall.",
      items: [
        {
          productId: "prod-body-glide-original",
          approachLabel: "Default stick",
          whyIllustrates: "Twist-up stick you can hit on thighs and sports-bra lines in a start corral without a bottle.",
          bestFor: ["Weekly longs", "Marathon start corrals"],
          tradeoff: "Some athletes still reapply after 90+ minutes; residue can bother tight lycra.",
        },
        {
          productId: "prod-squirrels-nut-butter",
          approachLabel: "Ultra stick / tin",
          whyIllustrates: "Same balm job as Body Glide with a different texture and a tin that stashes on very long days.",
          bestFor: ["Ultra carry", "Second balm texture"],
          tradeoff: "Less one-tube-done than Body Glide if you only want a twist-up stick.",
        },
        {
          productId: "prod-2toms-sportshield",
          approachLabel: "Race-kit roll-on",
          whyIllustrates: "Thin liquid film under seams and race lycra when stick residue feels messy.",
          bestFor: ["Tight race kits", "Seam rub"],
          tradeoff: "Needs dry-time; not the pocket-speed reapply pick.",
        },
      ],
    },
    mistakes: [
      {
        id: "race-morning",
        title: "First use on race morning",
        body: "A new texture under a new kit is how you invent a hotspot. Trial on a mid-week long.",
      },
      {
        id: "garment",
        title: "Buying a second balm instead of changing the short",
        body: "If the liner already eats you at 8 km, a fourth brand will not save kilometre 32.",
      },
      {
        id: "audio-here",
        title: "Shopping headphones on this shelf",
        body: "This catalog is chafe. Audio, lights, sunglasses and belts have their own pages — use the Finder to leave.",
      },
    ],
    productExampleRoles: [
      { productId: "prod-body-glide-original", roleLabel: "Default stick" },
      { productId: "prod-squirrels-nut-butter", roleLabel: "Ultra stick / tin" },
      { productId: "prod-2toms-sportshield", roleLabel: "Race-kit roll-on" },
    ],
    productRailTitle: "Compare anti-chafe formats",
    productRailBrowseHref: "/running/accessories",
    productRailBrowseLabel: "Browse anti-chafe",
    bestGuideHref: "/best/running-anti-chafe",
    bestGuideLabel: "Best anti-chafe for runners →",
    finder: {
      toolSlug: "running-accessories-finder",
      title: "Chafe, audio, lights or eyewear?",
      description:
        "This guide is stick vs roll-on. Use the Finder when the job is headphones, lights, sunglasses or safety instead.",
      ctaLabel: "Open Accessories Finder →",
    },
    ctaFinder: {
      title: "Not shopping chafe?",
      body: "The Accessories Finder routes audio, lights, sunglasses and safety away from this specialist shelf.",
      ctaLabel: "Find accessories",
      href: "/tools/running-accessories-finder",
    },
    ctaBest: {
      title: "See the three published SKUs",
      body: "Best Anti-Chafe ranks Body Glide, Squirrel’s and SportShield on format — not a blister ranking.",
      ctaLabel: "Best anti-chafe →",
      href: "/best/running-anti-chafe",
    },
    decisionLinks: [
      { label: "Best anti-chafe →", href: "/best/running-anti-chafe" },
      { label: "Running socks →", href: "/guides/how-to-choose-running-socks" },
    ],
  }),
];

export const runningDensityConfigs = RUNNING_DENSITY_PLANS.map((p) =>
  buildExplainerFromPlan(completeCompactPlan(p)),
);


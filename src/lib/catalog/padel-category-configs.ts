import type { ProductCategoryPageConfig } from "@/lib/catalog/types";

/** Deep category configs for padel discovery pages. */

export const padelRacketsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-rackets",
  hero: {
    title: "Padel Rackets",
    description:
      "Shortlist frames by shape, balance and weight — then compare control rounds, all-court hybrids and attack diamonds with real trade-offs.",
    primaryCta: {
      label: "Find My Padel Racket",
      href: "/tools/padel-racket-finder",
    },
    secondaryCta: {
      label: "Best Padel Rackets",
      href: "/best/padel-rackets",
    },
    imageSrc: "/images/padel/guides/choose-racket.jpg",
    imageAlt: "Padel rackets for shape, balance and weight decisions",
  },
  relatedCategories: [
    { label: "Shoes", href: "/padel/shoes" },
    { label: "Bags", href: "/padel/bags" },
    { label: "Grips", href: "/padel/grips" },
    { label: "Balls", href: "/padel/balls" },
    { label: "Accessories", href: "/padel/accessories" },
    { label: "Racket database", href: "/padel/rackets/database" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [
    "uc-padel-beginner",
    "uc-padel-control",
    "uc-padel-balanced",
    "uc-padel-power",
  ],
  runnerUseCaseIds: [
    "uc-padel-beginner",
    "uc-padel-control",
    "uc-padel-power",
    "uc-padel-maneuverability",
  ],
  runnerUseCaseHrefs: {
    "uc-padel-beginner": "/best/padel-rackets-beginners",
    "uc-padel-control": "/best/padel-rackets-control",
    "uc-padel-power": "/best/padel-rackets-power",
    "uc-padel-maneuverability": "/best/padel-rackets-maneuverability",
  },
  featuredToolSlugs: ["padel-racket-finder"],
  finder: {
    toolSlug: "padel-racket-finder",
    headline: "Not sure which frame?",
    title: "Use the Padel Racket Finder",
    description:
      "Answer a few questions about level, play style and feel — get an explainable shortlist with strengths and trade-offs.",
    ctaLabel: "Find My Racket",
  },
  primaryFilterKeys: ["shape", "balance", "weightMin", "feel", "brand", "price"],
  educationFactors: [
    {
      title: "Shape first",
      body: "Round forgives; teardrop balances; diamond rewards clean preparation. Match outline to how you already time the ball.",
      href: "/guides/padel-racket-shapes-explained",
    },
    {
      title: "Balance & weight",
      body: "Head-heavy power costs recovery between balls. Stay inside a published weight band you can swing all session.",
      href: "/guides/padel-racket-balance-explained",
    },
    {
      title: "Soft vs firm feel",
      body: "Softer cores forgive mishits; firmer faces return energy more abruptly — pick the contact you want under fatigue.",
      href: "/guides/soft-vs-hard-padel-rackets",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Padel frames for control, all-court and attack — sorted by shape, balance and feel, not carbon K-count marketing.",
    productTypes: [
      { name: "Control / round", note: "Centred sweet spot; beginner and defensive first pick." },
      { name: "All-court / hybrid", note: "Teardrop balance for most club matches." },
      { name: "Attack / diamond", note: "Higher sweet spot when overheads already land clean." },
      { name: "Comfort soft", note: "Softer EVA when arm comfort and forgiveness lead." },
    ],
    whatMatters: [
      "Level and timing before pro-player diamonds",
      "Shape + balance together (not shape alone)",
      "Published weight range you can swing late in sets",
      "Feel preference — soft forgiveness vs firm pop",
    ],
    specsThatMatter: [
      { spec: "Shape", why: "Sweet-spot location and forgiveness class." },
      { spec: "Balance", why: "Maneuverability vs smash authority." },
      { spec: "Weight", why: "Session fatigue and recovery between balls." },
      { spec: "Feel", why: "Soft vs firm contact under pressure." },
    ],
    tradeOffs: [
      {
        left: "Forgiveness",
        right: "Peak smash",
        note: "Round/soft frames win points earlier; diamonds punish late swings.",
      },
      {
        left: "Head-heavy power",
        right: "Quick recovery",
        note: "Attack molds cost hand speed between glass exchanges.",
      },
      {
        left: "Stiff carbon face",
        right: "Mishit kindness",
        note: "Lively faces feel explosive and less kind off-centre.",
      },
    ],
    useCaseShifts: [
      { useCase: "Beginner / club learner", note: "Lighter round or soft teardrop before any diamond." },
      { useCase: "All-court intermediate", note: "Hybrid/teardrop with mid balance (Vertex / Genius class)." },
      { useCase: "Attack finisher", note: "Diamond only when bandejas and viboras already land." },
    ],
    beginnerStart:
      "Start round or soft teardrop in a mid weight band. Skip pro diamonds until your overhead timing is reliable under fatigue.",
    relatedBestHref: "/best/padel-rackets",
    relatedBestLabel: "Best padel rackets",
    relatedGuideHref: "/guides/how-to-choose-a-padel-racket",
    relatedGuideLabel: "How to choose a padel racket",
    relatedFinderHref: "/tools/padel-racket-finder",
    relatedFinderLabel: "Padel Racket Finder",
    usefulComparisonsNote:
      "Compare within the same job (control vs control, attack vs attack) — not a beginner round against a pro diamond.",
  },
  faqIds: [],
  defaultSort: "recommended",
};

export const padelShoesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-shoes",
  hero: {
    title: "Padel Shoes",
    description:
      "Court shoes built for lateral cuts and sand-dressed grip — filter by support, cushioning and fit, not road-running stack.",
    primaryCta: {
      label: "Best Padel Shoes",
      href: "/best/padel-shoes",
    },
    secondaryCta: {
      label: "How to Choose",
      href: "/guides/how-to-choose-padel-shoes",
    },
    imageSrc: "/images/padel/guides/choose-shoes.jpg",
    imageAlt: "Padel court shoes for grip and lateral stability",
  },
  relatedCategories: [
    { label: "Rackets", href: "/padel/rackets" },
    { label: "Bags", href: "/padel/bags" },
    { label: "Balls", href: "/padel/balls" },
    { label: "Best shoes", href: "/best/padel-shoes" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: ["genderFit", "support", "cushioning", "brand", "price"],
  educationFactors: [
    {
      title: "Outsole before foam",
      body: "Grip on sand and dust decides confidence more than midsole marketing. Match pattern to your courts.",
      href: "/guides/padel-shoe-outsoles-explained",
    },
    {
      title: "Lateral lockdown",
      body: "Stability and upper hold matter for glass recovery and hard cuts — running trainers often roll.",
      href: "/guides/how-to-choose-padel-shoes",
    },
    {
      title: "Padel vs tennis",
      body: "Tennis court shoes can work; switch when sand grip or sideways plant feels vague.",
      href: "/guides/padel-vs-tennis-shoes",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Court footwear for padel movement — outsole grip and lateral plant first, cushioning second.",
    productTypes: [
      { name: "Stability platforms", note: "High lateral confidence for aggressive cutting." },
      { name: "Grip-first court", note: "Outsole bite on sand-dressed or dusty courts." },
      { name: "Connected / race-light", note: "Lower, quicker feel when you already plant well." },
      { name: "Value stability", note: "Solid lockdown without flagship pricing." },
    ],
    whatMatters: [
      "Surface and outsole match",
      "Lateral support need",
      "Fit / last (width options are limited)",
      "Session length vs race-light trade-offs",
    ],
    specsThatMatter: [
      { spec: "Support", why: "Neutral vs stability for hard cuts." },
      { spec: "Cushioning", why: "Comfort under volume — secondary to plant." },
      { spec: "Gender fit", why: "Last and sizing path on Kitletics." },
    ],
    tradeOffs: [
      {
        left: "Max stability",
        right: "Race-light feel",
        note: "Planted platforms can feel heavier; light shoes less locked.",
      },
      {
        left: "Aggressive grip",
        right: "Outsole wear",
        note: "Biting rubber on abrasive courts wears faster.",
      },
    ],
    useCaseShifts: [
      { useCase: "Sandy outdoor club", note: "Prioritise outsole pattern that clears and bites." },
      { useCase: "Indoor carpet", note: "Connected court shoes can work until grip fails." },
      { useCase: "Ankle-cautious cutter", note: "Stability platforms before race-light models." },
    ],
    beginnerStart:
      "Buy for grip and lateral plant on your courts. Skip road runners; start with a stability or grip-first padel shoe in your size.",
    relatedBestHref: "/best/padel-shoes",
    relatedBestLabel: "Best padel shoes",
    relatedGuideHref: "/guides/how-to-choose-padel-shoes",
    relatedGuideLabel: "How to choose padel shoes",
  },
  faqIds: [],
  defaultSort: "recommended",
};

export const padelBallsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-balls",
  hero: {
    title: "Padel Balls",
    description:
      "Competition cans, training packs and speed positioning — filter by use, feel and pack size for how you actually play.",
    primaryCta: {
      label: "Best Padel Balls",
      href: "/best/padel-balls",
    },
    secondaryCta: {
      label: "How to Choose",
      href: "/guides/how-to-choose-padel-balls",
    },
    imageSrc: "/images/padel/hero.jpg",
    imageAlt: "Padel balls on court — competition and training cans",
  },
  relatedCategories: [
    { label: "Rackets", href: "/padel/rackets" },
    { label: "Pressurizers", href: "/padel/accessories" },
    { label: "Best balls", href: "/best/padel-balls" },
    { label: "Bags", href: "/padel/bags" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: [
    "ballType",
    "use",
    "speed",
    "ballPositioning",
    "packSize",
    "brand",
    "price",
  ],
  educationFactors: [
    {
      title: "Competition vs training",
      body: "Match ball job to the session — official cans for match play, durable training packs for volume.",
      href: "/guides/how-to-choose-padel-balls",
    },
    {
      title: "How long they last",
      body: "Pressure drop and felt wear decide replacement more than the print on the can.",
      href: "/guides/how-long-do-padel-balls-last",
    },
    {
      title: "Pressurizers",
      body: "Tubes can stretch can life when you open often — they do not revive dead felt.",
      href: "/guides/padel-ball-pressurizers",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Pressurized and training padel balls — chosen by session job, speed feel and pack economics.",
    productTypes: [
      { name: "Competition cans", note: "Match / tournament bounce when fresh." },
      { name: "Training packs", note: "Volume sessions where durability leads." },
      { name: "Fast / control positioned", note: "Speed class for club preference." },
      { name: "Value multipacks", note: "Lower cost per ball for high weekly volume." },
    ],
    whatMatters: [
      "Use (competition vs training)",
      "Speed / bounce preference of your club",
      "Pack size vs how often you open cans",
      "Whether a pressurizer fits your routine",
    ],
    specsThatMatter: [
      { spec: "Use", why: "Match vs practice job." },
      { spec: "Speed", why: "Fast vs control feel on your courts." },
      { spec: "Pressurization", why: "Pressurized cans vs pressureless training." },
      { spec: "Pack size", why: "Cost and freshness vs open rate." },
    ],
    tradeOffs: [
      {
        left: "Fresh match bounce",
        right: "Cost per hour",
        note: "Competition cans feel best early and go flat with opens.",
      },
      {
        left: "Fast ball",
        right: "Control rallies",
        note: "Speed positioning changes point length and timing.",
      },
    ],
    useCaseShifts: [
      { useCase: "League match night", note: "Fresh competition can; open close to start." },
      { useCase: "High-volume drills", note: "Training packs or pressureless when bounce consistency matters less." },
      { useCase: "Frequent openers", note: "Consider a pressurizer between sessions." },
    ],
    beginnerStart:
      "Buy a standard competition can for matches and a cheaper training pack for drills. Replace when bounce dies — do not stretch dead felt forever.",
    relatedBestHref: "/best/padel-balls",
    relatedBestLabel: "Best padel balls",
    relatedGuideHref: "/guides/how-to-choose-padel-balls",
    relatedGuideLabel: "How to choose padel balls",
  },
  faqIds: [],
  defaultSort: "recommended",
};

export const padelBagsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-bags",
  hero: {
    title: "Padel Bags",
    description:
      "Paleteros, backpacks and tournament bags — filter by racket capacity, thermal protection and shoe storage for how you commute to court.",
    primaryCta: {
      label: "Best Padel Bags",
      href: "/best/padel-bags",
    },
    secondaryCta: {
      label: "How to Choose",
      href: "/guides/how-to-choose-a-padel-bag",
    },
    imageSrc: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
    imageAlt: "Padel paletero bag for rackets, shoes and court kit",
  },
  relatedCategories: [
    { label: "Rackets", href: "/padel/rackets" },
    { label: "Shoes", href: "/padel/shoes" },
    { label: "Grips", href: "/padel/grips" },
    { label: "Best bags", href: "/best/padel-bags" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: [
    "form",
    "racketCompartments",
    "thermalProtection",
    "shoeCompartment",
    "brand",
    "price",
  ],
  educationFactors: [
    {
      title: "Bag factor",
      body: "Paletero vs backpack changes carry comfort and how many frames you haul.",
      href: "/guides/padel-bag-vs-backpack",
    },
    {
      title: "Capacity & thermal",
      body: "Match racket slots and thermal protection to tournament vs gym-bag days.",
      href: "/guides/how-to-choose-a-padel-bag",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Bags and backpacks for rackets, shoes and court kit — sized by how many frames you carry and how you commute.",
    productTypes: [
      { name: "Paletero / racket bag", note: "Horizontal racket layout; tournament capacity." },
      { name: "Backpack", note: "Hands-free commute with fewer frames." },
      { name: "Tournament / large", note: "Multi-racket + kit volume for match days." },
      { name: "Compact commute", note: "One–two rackets and shoe pocket for club nights." },
    ],
    whatMatters: [
      "How many rackets you carry",
      "Thermal need in heat",
      "Shoe compartment vs separate tote",
      "Carry style (shoulder vs backpack)",
    ],
    specsThatMatter: [
      { spec: "Form", why: "Paletero vs backpack vs hybrid." },
      { spec: "Racket capacity", why: "Slots vs real frame count." },
      { spec: "Thermal protection", why: "Heat days and multi-frame bags." },
      { spec: "Shoe compartment", why: "Keeps sand out of kit pockets." },
    ],
    tradeOffs: [
      {
        left: "Tournament volume",
        right: "Commute comfort",
        note: "Large paleteros hold more and feel heavier on bike/metro.",
      },
      {
        left: "Thermal sleeve",
        right: "Weight / bulk",
        note: "Insulated compartments add structure you carry every day.",
      },
    ],
    useCaseShifts: [
      { useCase: "Club night + commute", note: "Backpack or compact bag with shoe pocket." },
      { useCase: "Tournament weekend", note: "Multi-racket thermal paletero." },
      { useCase: "One frame + shoes", note: "Skip oversized tournament bags." },
    ],
    beginnerStart:
      "One racket compartment plus a shoe pocket is enough. Upgrade to thermal multi-racket bags when you travel with backups.",
    relatedBestHref: "/best/padel-bags",
    relatedBestLabel: "Best padel bags",
    relatedGuideHref: "/guides/how-to-choose-a-padel-bag",
    relatedGuideLabel: "How to choose a padel bag",
  },
  faqIds: [],
  defaultSort: "recommended",
};

export const padelGripsCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-grips",
  hero: {
    title: "Padel Grips & Overgrips",
    description:
      "Overgrips and replacement grips by tack, absorption and pack size — keep handle feel consistent as sweat and wear change the stack.",
    primaryCta: {
      label: "Best Padel Overgrips",
      href: "/best/padel-overgrips",
    },
    secondaryCta: {
      label: "Grips Explained",
      href: "/guides/padel-grips-overgrips-explained",
    },
    imageSrc: "/images/padel/guides/grips.jpg",
    imageAlt: "Padel overgrips for tack versus absorption",
  },
  relatedCategories: [
    { label: "Rackets", href: "/padel/rackets" },
    { label: "Bags", href: "/padel/bags" },
    { label: "Best overgrips", href: "/best/padel-overgrips" },
    { label: "Grip vs overgrip", href: "/guides/padel-grip-vs-overgrip" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: [
    "gripType",
    "tack",
    "absorption",
    "perforated",
    "packQuantity",
    "brand",
    "price",
  ],
  educationFactors: [
    {
      title: "Grip vs overgrip",
      body: "Replacement grips set base diameter; overgrips are the refresh layer you swap often.",
      href: "/guides/padel-grip-vs-overgrip",
    },
    {
      title: "Tack & sweat",
      body: "Tacky vs dry absorption is a preference — match to how your hands behave mid-match.",
      href: "/guides/padel-grips-overgrips-explained",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Overgrips, replacement grips and cushion systems — chosen for tack, sweat handling and how often you rewrap.",
    productTypes: [
      { name: "Overgrips", note: "Frequent refresh layer; multipacks for weekly players." },
      { name: "Replacement grips", note: "Base layer when the stock grip is shot." },
      { name: "Cushion / ergonomic", note: "Diameter and shape systems when fit leads." },
    ],
    whatMatters: [
      "Tack preference when dry and when sweaty",
      "Absorption for long sessions",
      "Pack quantity vs replacement cadence",
      "Whether you need a new base grip or only overgrips",
    ],
    specsThatMatter: [
      { spec: "Grip type", why: "Overgrip vs replacement vs cushion system." },
      { spec: "Tack", why: "Dry vs tacky hold preference." },
      { spec: "Absorption", why: "Sweat management mid-match." },
      { spec: "Pack size", why: "Cost per rewrap." },
    ],
    tradeOffs: [
      {
        left: "High tack",
        right: "Clean rewrap feel",
        note: "Very tacky wraps can feel gummy as they load with dust.",
      },
      {
        left: "Thick stack",
        right: "Handle precision",
        note: "Extra overgrips add comfort and change diameter.",
      },
    ],
    useCaseShifts: [
      { useCase: "Sweaty hands", note: "Higher absorption or dry-feel overgrips." },
      { useCase: "Weekly club play", note: "Multipack overgrips; replace often." },
      { useCase: "Worn stock grip", note: "New replacement grip before more overgrips." },
    ],
    beginnerStart:
      "Keep a multipack of overgrips that match your tack preference. Replace when the handle feels slick or shiny — do not wait for it to tear.",
    relatedBestHref: "/best/padel-overgrips",
    relatedBestLabel: "Best padel overgrips",
    relatedGuideHref: "/guides/padel-grips-overgrips-explained",
    relatedGuideLabel: "Padel grips & overgrips explained",
  },
  faqIds: [],
  defaultSort: "recommended",
};

export const padelAccessoriesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "padel",
  categorySlug: "padel-accessories",
  hero: {
    title: "Padel Accessories",
    description:
      "Frame protectors, pressurizers, weights and court add-ons — filter by accessory type so you only shortlist what your kit is missing.",
    primaryCta: {
      label: "Gear Checklist",
      href: "/guides/complete-padel-gear-checklist",
    },
    secondaryCta: {
      label: "Beginner Gear Guide",
      href: "/guides/beginner-padel-gear-guide",
    },
    imageSrc: "/images/padel/hero.jpg",
    imageAlt: "Padel accessories — protectors, pressurizers and court kit",
  },
  relatedCategories: [
    { label: "Rackets", href: "/padel/rackets" },
    { label: "Balls", href: "/padel/balls" },
    { label: "Grips", href: "/padel/grips" },
    { label: "Best protectors", href: "/best/padel-racket-protectors" },
  ],
  featuredSubcategoryIds: [],
  goalUseCaseIds: [],
  runnerUseCaseIds: [],
  featuredToolSlugs: [],
  primaryFilterKeys: ["type", "compatibility", "brand", "price"],
  educationFactors: [
    {
      title: "Frame protectors",
      body: "Tape and guards reduce glass/mesh scrapes — cheap insurance for frequent wall contact.",
      href: "/guides/padel-racket-frame-protectors",
    },
    {
      title: "Customization weights",
      body: "Lead/tape changes balance — start small and verify feel before match play.",
      href: "/guides/padel-racket-customization",
    },
    {
      title: "Ball pressurizers",
      body: "Useful when you open cans often; not a fix for worn felt.",
      href: "/guides/padel-ball-pressurizers",
    },
  ],
  terminology: [],
  decision: {
    whatItIs:
      "Court add-ons around the racket and balls — protectors, pressurizers, weights and training aids.",
    productTypes: [
      { name: "Frame protectors", note: "Glass and mesh scrape insurance." },
      { name: "Pressurizers", note: "Extend can life between opens." },
      { name: "Customization weights", note: "Fine-tune balance after you know the frame." },
      { name: "Training aids", note: "Baskets and drills gear for volume sessions." },
    ],
    whatMatters: [
      "Which gap your kit actually has",
      "Compatibility with your racket / balls",
      "Whether the accessory changes play feel",
    ],
    specsThatMatter: [
      { spec: "Type", why: "Accessory job — protector vs pressurizer vs weight." },
      { spec: "Compatibility", why: "Fits your frame, can size or routine." },
    ],
    tradeOffs: [
      {
        left: "Extra protection / tools",
        right: "Bag & fuss",
        note: "Only buy what you will use weekly.",
      },
      {
        left: "Balance weights",
        right: "Swing familiarity",
        note: "Changing balance mid-block can unsettle timing.",
      },
    ],
    useCaseShifts: [
      { useCase: "New expensive frame", note: "Protector tape early." },
      { useCase: "Frequent can opens", note: "Pressurizer before buying more cans." },
      { useCase: "Settled frame", note: "Small weight experiments only after you know the stock feel." },
    ],
    beginnerStart:
      "Start with overgrips and a frame protector. Add a pressurizer only if you open competition cans often.",
    relatedGuideHref: "/guides/complete-padel-gear-checklist",
    relatedGuideLabel: "Complete padel gear checklist",
    relatedBestHref: "/best/padel-overgrips",
    relatedBestLabel: "Best padel overgrips",
  },
  faqIds: [],
  defaultSort: "recommended",
};

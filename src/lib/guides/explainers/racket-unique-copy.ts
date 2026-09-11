/**
 * Unique authored copy for racket-sport Buying Guides — breaks template cannibalization.
 */

export type RacketUnique = {
  deck: string;
  quickAnswerBullets: string[];
  definitionTitle: string;
  definitionIntro: string;
  definitionParas: [string, string, string];
  whyTitle: string;
  whyParas: [string, string];
  factorWhat: string[];
  factorChanges: string[];
  factorNotices: string[];
  comparisonRows: Array<{ label: string; values: [string, string, string] }>;
  tradeoffs: { gains: string[]; giveUps: string[]; footnote: string };
  callout: { title: string; body: string };
  decisionSteps: Array<{ id: string; title: string; body: string }>;
  branchQuestion: string;
  branchOptions: Array<{ label: string; result: string }>;
  exampleLabels: string[];
  exampleWhys: string[];
  exampleTradeoffs: string[];
  mistakes: Array<{ id: string; title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const RACKET_UNIQUE: Record<string, RacketUnique> = {
  "how-to-choose-a-padel-racket": {
    deck: "Match padel frame shape, balance and face response to your level — forgiveness first, smash power second.",
    quickAnswerBullets: [
      "Round/hybrid frames usually forgive developing contact better than stiff diamonds.",
      "Weight and balance decide whether you can prepare the bandeja on time.",
      "Carbon K-count is not a quality ladder — core and mass distribution matter more.",
      "Demo when you can; buy the frame you can place repeatedly, not the pro’s smash tool.",
    ],
    definitionTitle: "What a padel racket decision really is",
    definitionIntro:
      "You are matching geometry and response to how you already play — not copying a World Padel Tour bag.",
    definitionParas: [
      "A padel racket is a foam-cored face with a shape (round, hybrid, diamond) that moves the sweet spot and balance. Glass and carbon faces change how the ball leaves the racket, but they do not create technique.",
      "Beginners and intermediates usually lose more points to late preparation and off-centre hits than to a lack of peak smash speed. That is why accessible handling often beats a stiff attacking diamond early.",
      "Treat catalog examples as role illustrations. Confirm the exact model generation, weight range and whether you can return or demo before locking in.",
    ],
    whyTitle: "Why forgiveness usually compounds faster",
    whyParas: [
      "Points are won with repeated, on-time contact at the glass and net. A frame you can position under fatigue supports better decisions than one that only rewards perfect timing.",
      "Overgrips, shoe grip and string-free foam faces still interact. Judge the racket as part of the court system you actually play with — not as an isolated lab object.",
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
      {
        label: "Sweet spot",
        values: [
          "Lower/centred, more margin",
          "Higher, more finishing reward",
          "Your mishit rate this month",
        ],
      },
      {
        label: "Preparation",
        values: [
          "Easier to get into position",
          "Needs earlier footwork",
          "Your average recovery time",
        ],
      },
      {
        label: "Best stage",
        values: [
          "Learning & consolidating",
          "Clear attacking identity",
          "The problem you must solve now",
        ],
      },
    ],
    tradeoffs: {
      gains: [
        "More usable mishits",
        "Faster preparation",
        "Confidence under pressure",
        "A frame matched to today",
      ],
      giveUps: [
        "Some peak smash authority",
        "Pro-style diamond prestige",
        "Ultra-stiff face feedback",
        "The urge to copy a sponsor bag",
      ],
      footnote:
        "Progression can justify a more demanding frame later — not on day one.",
    },
    callout: {
      title: "Carbon count is not a ranking",
      body: "12K or 18K labels do not form a universal quality ladder. Shape, core, balance and the player determine the ball. Treat material claims as one input among many.",
    },
    decisionSteps: [
      {
        id: "level",
        title: "Honest level filter",
        body: "If you still spray bandejas, start round/hybrid before diamond power frames.",
      },
      {
        id: "problem",
        title: "Name the recurring miss",
        body: "Late preparation, soft finishing, or arm fatigue each point to different shapes.",
      },
      {
        id: "weight",
        title: "Set a weight window",
        body: "Define a wearable range before comparing carbon marketing.",
      },
      {
        id: "shortlist",
        title: "Shortlist two roles",
        body: "Keep one forgiving control frame and one more attacking option only if technique supports it.",
      },
      {
        id: "demo",
        title: "Demo decisive balls",
        body: "Test blocks, viboras and overheads — not only open-court winners.",
      },
      {
        id: "buy",
        title: "Buy the repeatable one",
        body: "Choose the frame you place under fatigue, then check live offers.",
      },
    ],
    branchQuestion: "What is failing most often?",
    branchOptions: [
      {
        label: "Mishits / late prep",
        result: "Start with a forgiving control or hybrid frame.",
      },
      {
        label: "Cannot finish",
        result: "Test a more attacking diamond only if preparation is already solid.",
      },
      {
        label: "Unsure",
        result: "Stay hybrid and revisit after a block of coached sessions.",
      },
    ],
    exampleLabels: [
      "Attacking diamond reference",
      "Pro-line punch",
      "Accessible control",
      "Demanding precision",
    ],
    exampleWhys: [
      "Shows how a modern diamond prioritises finishing stability for advanced attackers.",
      "Illustrates a stiff, punchy face when you already prepare early.",
      "Demonstrates a more accessible control-oriented role for consolidating players.",
      "Highlights a precision/pro profile that punishes late contact — useful as a contrast, not a beginner default.",
    ],
    exampleTradeoffs: [
      "Demanding if your bandeja timing is still inconsistent.",
      "Less round-frame forgiveness on defensive glass balls.",
      "May offer less peak smash than a pure diamond.",
      "Wrong buy if you need margin more than precision.",
    ],
    mistakes: [
      {
        id: "pro-copy",
        title: "Buying your idol’s diamond",
        body: "Pro conditioning and contact quality are not transferable with the paint job.",
      },
      {
        id: "k-count",
        title: "Treating K-count as quality",
        body: "Higher carbon counts are not automatically “better” for your swing.",
      },
      {
        id: "weight-blind",
        title: "Ignoring wearable weight",
        body: "A frame that feels great for ten minutes can wreck recovery by set three.",
      },
      {
        id: "no-demo",
        title: "Skipping contact tests",
        body: "Blocks and viboras reveal more than a few open winners.",
      },
    ],
    faqs: [
      {
        question: "What matters most when choosing a padel racket?",
        answer:
          "Level-honest shape and balance first, then face/core feel. Power specs only help after you can prepare on time.",
      },
      {
        question: "Is a more expensive padel racket automatically better?",
        answer:
          "No. Price tracks materials and branding; value is forgiveness and handling for your actual points.",
      },
      {
        question: "Should beginners buy a power diamond?",
        answer:
          "Usually not. Round or hybrid forgiveness typically builds consistency faster.",
      },
      {
        question: "How should I test a padel racket?",
        answer:
          "Hit blocks, viboras and overheads with the same overgrip thickness you play with — judge late-set preparation, not first-ball wow.",
      },
    ],
  },

  "how-to-choose-padel-shoes": {
    deck: "Padel shoes are a court-grip and lateral-stability decision — not a racket-frame decision in footwear form.",
    quickAnswerBullets: [
      "Outsole compound and pattern must match your club’s court surface.",
      "Lateral lockdown matters more than road-shoe cushion marketing.",
      "Fit length and midfoot hold decide whether cuts feel planted.",
      "Light speed shoes can feel quick and still fail on hard plant-and-push moves.",
    ],
    definitionTitle: "What padel footwear is for",
    definitionIntro:
      "You need predictable traction and ankle/forefoot security for side-to-side court work.",
    definitionParas: [
      "Padel shoes use court outsoles and supportive uppers designed for lateral load — closer to tennis court shoes than to road runners or generic trainers.",
      "The job is plant, cut, recover: grip that does not slip on the surface you play, and a midfoot that does not collapse when you change direction to the glass.",
      "Racket choice does not fix a slipping shoe. Treat footwear as its own decision with surface and fit as hard filters.",
    ],
    whyTitle: "Why grip and lockdown decide points",
    whyParas: [
      "Late or slipping plants make every overhead and defensive dig harder. Traction failures look like “bad hands” on video.",
      "Cushion is useful, but unstable soft foam under lateral load is the wrong trade for most padel sessions.",
    ],
    factorWhat: [
      "Outsole pattern and gum/clay suitability for your courts.",
      "Sidewall and midfoot structure under cutting.",
      "Length, width and heel hold with match socks.",
      "Cushion vs platform firmness for multi-match days.",
    ],
    factorChanges: [
      "Indoor resin vs outdoor abrasive courts change wear and grip.",
      "Heavier players and aggressive cutters need more structure.",
      "Hot feet and wide lasts change which upper works.",
      "Tournament days punish overly soft daily trainers.",
    ],
    factorNotices: [
      "Whether the shoe squeaks, slips or grabs too hard on your surface.",
      "Midfoot crease collapse on sharp cuts.",
      "Hotspots after a full match.",
      "Whether legs feel worked from fighting the shoe, not the opponent.",
    ],
    comparisonRows: [
      {
        label: "Stability",
        values: [
          "Planted base for cuts",
          "Lighter, quicker feel",
          "How hard you change direction",
        ],
      },
      {
        label: "Grip",
        values: [
          "Predictable court bite",
          "May prioritise flex/speed",
          "Your club surface",
        ],
      },
      {
        label: "Tradeoff",
        values: [
          "Slightly heavier",
          "Less planted under load",
          "What you notice by game three",
        ],
      },
    ],
    tradeoffs: {
      gains: [
        "Confident plants",
        "Fewer slip-related errors",
        "Support for multi-match days",
        "Surface-matched outsoles",
      ],
      giveUps: [
        "Ultralight race-shoe feel",
        "Soft road-foam plushness",
        "Fashion trainer looks",
        "One shoe for road + padel",
      ],
      footnote: "If the shoe is not for your surface, nothing else matters.",
    },
    callout: {
      title: "Do not buy running shoes for padel",
      body: "Road outsoles and soft stacks are built for forward miles, not repeated lateral plants on court. Use court-specific footwear.",
    },
    decisionSteps: [
      {
        id: "surface",
        title: "Confirm the court surface",
        body: "Match outsole intent to your club before brand loyalty.",
      },
      {
        id: "cut",
        title: "Prioritise lateral lockdown",
        body: "If midfoot collapses on cuts, discard the shoe.",
      },
      {
        id: "fit",
        title: "Fit with match socks",
        body: "Check length, width and heel slip after a few hard plants.",
      },
      {
        id: "compare",
        title: "Stable vs light",
        body: "Only take the lighter shoe if grip and lockdown still pass.",
      },
      {
        id: "session",
        title: "Test in a real hit",
        body: "Judge glass defence and net exchanges, not a walk around the shop.",
      },
      {
        id: "rotate",
        title: "Plan outsole life",
        body: "Abrasive courts eat gum rubber — budget replacements.",
      },
    ],
    branchQuestion: "What is the main footwear problem?",
    branchOptions: [
      {
        label: "Slipping",
        result: "Prioritise surface-matched outsoles and a planted court shoe.",
      },
      {
        label: "Unstable cuts",
        result: "Choose a stability-first court shoe over a light speed model.",
      },
      {
        label: "Hot spots / fit",
        result: "Fix last and width before chasing cushion brands.",
      },
    ],
    exampleLabels: [
      "Stable court platform",
      "Lighter court speed",
      "Value court option",
    ],
    exampleWhys: [
      "Illustrates a planted court shoe role for aggressive lateral work.",
      "Shows a lighter court option when you already have secure footwork.",
      "Demonstrates a practical club-level court shoe without flagship pricing.",
    ],
    exampleTradeoffs: [
      "Heavier than speed-oriented court shoes.",
      "Less planted if you load hard on every cut.",
      "May wear faster on highly abrasive outdoor courts.",
    ],
    mistakes: [
      {
        id: "road-shoe",
        title: "Wearing road runners on court",
        body: "Forward-roll geometry and soft foam fight padel’s lateral demands.",
      },
      {
        id: "wrong-outsole",
        title: "Ignoring surface",
        body: "An outsole that grips indoors can be wrong outdoors — and vice versa.",
      },
      {
        id: "size-casual",
        title: "Casual shoe sizing",
        body: "Match length needs room to plant without heel slip.",
      },
      {
        id: "racket-budget",
        title: "Spending only on the racket",
        body: "A sliding shoe wastes a perfect frame.",
      },
    ],
    faqs: [
      {
        question: "What matters most in padel shoes?",
        answer:
          "Surface-matched grip and lateral lockdown. Cushion is secondary to a planted plant-and-cut platform.",
      },
      {
        question: "Can I use tennis shoes for padel?",
        answer:
          "Often yes if the outsole suits your courts and lockdown is solid — still verify surface compatibility.",
      },
      {
        question: "Are light shoes better?",
        answer:
          "Only if they stay planted. Many players prefer a slightly heavier stable shoe for match play.",
      },
      {
        question: "How should I test padel shoes?",
        answer:
          "Hard cuts, glass recovery steps and a few overhead plants — not a straight-line jog.",
      },
    ],
  },

  "padel-grips-overgrips-explained": {
    deck: "Grips and overgrips set handle diameter, tack and sweat control — a small part that changes every swing.",
    quickAnswerBullets: [
      "Base grips rebuild the handle; overgrips fine-tune thickness and tack.",
      "Most players layer overgrips and replace them as tack dies.",
      "Diameter should let you hold without death-gripping.",
      "This is not a racket-shape decision — keep frame choice separate.",
    ],
    definitionTitle: "Grips vs overgrips",
    definitionIntro:
      "You are tuning the handle interface: diameter, tack and moisture — not buying a new frame.",
    definitionParas: [
      "A replacement grip sits on the handle as the foundation layer. An overgrip is a thin wrap added for tack, sweat absorption and small diameter changes.",
      "Most club players keep a base grip and refresh overgrips frequently. When the handle feels packed or uneven, rebuild from the base rather than stacking endless wraps.",
      "Handle feel changes how loosely you can hold the racket and how cleanly you can roll for spin — it does not change the foam core’s power profile.",
    ],
    whyTitle: "Why handle feel shows up on every ball",
    whyParas: [
      "A slippery or oversized handle forces grip tension that slows wrist action and accelerates forearm fatigue.",
      "Cheap to change and fast to test — grips are one of the highest leverage, lowest cost tweaks in padel.",
    ],
    factorWhat: [
      "Condition of the worn base grip.",
      "Resulting handle circumference with your preferred stack.",
      "Tack vs absorption preference in your climate.",
      "How often tack dies in your match length.",
    ],
    factorChanges: [
      "A dead base grip makes every overgrip feel uneven.",
      "Small diameter changes alter leverage and comfort dramatically.",
      "Humid halls need absorption; dry halls may favour tack.",
      "Long match days may need mid-event overgrip swaps.",
    ],
    factorNotices: [
      "Ridges or soft spots through the overgrip.",
      "Whether you can hold loosely without the racket twisting.",
      "Sweat-through by the second set.",
      "How many wraps you burn per month.",
    ],
    comparisonRows: [
      {
        label: "Role",
        values: [
          "Rebuild foundation",
          "Tune tack/thickness",
          "What actually feels wrong",
        ],
      },
      {
        label: "Frequency",
        values: [
          "Occasional",
          "Often",
          "How fast tack dies for you",
        ],
      },
      {
        label: "Risk if wrong",
        values: [
          "Uneven handle forever",
          "Slip or bulk",
          "What you notice mid-match",
        ],
      },
    ],
    tradeoffs: {
      gains: [
        "Consistent diameter",
        "Fresh tack",
        "Cheaper than a new racket",
        "Quick on-court fixes",
      ],
      giveUps: [
        "Time wrapping",
        "Ongoing consumable cost",
        "Trial-and-error on thickness",
        "The myth that grips add power",
      ],
      footnote: "If the frame is wrong, grips will not save it — and vice versa.",
    },
    callout: {
      title: "Do not stack endlessly",
      body: "Too many overgrips create a club-like handle and hide a failed base grip. Rebuild when the foundation is soft or ridged.",
    },
    decisionSteps: [
      {
        id: "base",
        title: "Inspect the base grip",
        body: "Replace it if it is slick, torn or uneven before adding wraps.",
      },
      {
        id: "diameter",
        title: "Set target diameter",
        body: "Hold should be secure with relaxed fingers — not a fist clench.",
      },
      {
        id: "climate",
        title: "Match tack vs absorb",
        body: "Pick overgrips for your sweat and hall humidity.",
      },
      {
        id: "stack",
        title: "Limit the stack",
        body: "Usually one base + one or two overgrips — not a towel roll.",
      },
      {
        id: "refresh",
        title: "Plan replacements",
        body: "Carry a spare overgrip for long match days.",
      },
      {
        id: "separate",
        title: "Keep frame choice separate",
        body: "Do not buy a new racket to fix a dead grip.",
      },
    ],
    branchQuestion: "What feels wrong on the handle?",
    branchOptions: [
      {
        label: "Slippery",
        result: "Fresh absorbent/tacky overgrip; check base condition.",
      },
      {
        label: "Too thin/thick",
        result: "Adjust wrap count or rebuild base grip diameter.",
      },
      {
        label: "Uneven ridges",
        result: "Replace the base grip instead of adding wraps.",
      },
    ],
    exampleLabels: [
      "Standard overgrip refresh",
      "High-tack match wrap",
      "Bulk replacement pack",
    ],
    exampleWhys: [
      "Illustrates the everyday overgrip consumable most players should refresh often.",
      "Shows a tack-focused wrap when sweat is moderate but slip is the complaint.",
      "Represents keeping spares so diameter/tack never becomes a match emergency.",
    ],
    exampleTradeoffs: [
      "Needs frequent replacement as tack dies.",
      "May feel less absorbent in very humid halls.",
      "Still useless if the base grip underneath is failed.",
    ],
    mistakes: [
      {
        id: "endless-stack",
        title: "Stacking overgrips forever",
        body: "Bulk hides a dead base and ruins diameter.",
      },
      {
        id: "racket-fix",
        title: "Buying a new racket for grip feel",
        body: "Fix the handle interface first — it is cheaper and reversible.",
      },
      {
        id: "ignore-sweat",
        title: "Ignoring climate",
        body: "Tack preferences change with humidity and match length.",
      },
      {
        id: "death-grip",
        title: "Using tension instead of tack",
        body: "A death grip is a symptom of a failed wrap, not toughness.",
      },
    ],
    faqs: [
      {
        question: "What matters most for padel grips?",
        answer:
          "Stable diameter and reliable tack/absorption for your sweat. Replace overgrips before they become glass-smooth.",
      },
      {
        question: "Overgrip or replacement grip?",
        answer:
          "Use overgrips for frequent refresh; rebuild the base grip when the foundation is soft, torn or ridged.",
      },
      {
        question: "Do grips add power?",
        answer:
          "No meaningful power. They change control, comfort and how loosely you can hold the handle.",
      },
      {
        question: "How often should I change overgrips?",
        answer:
          "As soon as tack dies or the wrap saturates — for some players that is every session in heat.",
      },
    ],
  },

  "how-to-choose-a-tennis-racket": {
    deck: "Tennis rackets are head size, mass and swingweight decisions for open-court tennis — not padel foam frames.",
    quickAnswerBullets: [
      "Larger heads forgive; smaller heads reward precision if you already centre the ball.",
      "Strung weight and swingweight decide whether you can prepare on time.",
      "String pattern and tension change spin and launch — plan the full setup.",
      "Demo with your strings/tension when possible; cosmetics are not playtests.",
    ],
    definitionTitle: "What a tennis racket decision is",
    definitionIntro:
      "You are matching head size, mass and balance to your swing and level on a tennis court.",
    definitionParas: [
      "Tennis rackets are strung frames with measurable head size, weight, balance and swingweight. They behave differently from padel’s foam-faced rackets — do not transfer padel shape advice here.",
      "Forgiving 100-square-inch class frames help developing contact. Heavier or smaller-headed player frames reward clean acceleration but punish late preparation.",
      "Strings and tension are part of the purchase. A frame demo with the wrong stringbed teaches the wrong lesson.",
    ],
    whyTitle: "Why the right frame speeds learning",
    whyParas: [
      "A racket you can get into position for on the run supports better patterns than one that only feels great on first-ball winners.",
      "Arm comfort, launch angle and spin potential are setup outcomes — frame plus strings — not sticker slogans.",
    ],
    factorWhat: [
      "Head size and sweet-spot margin.",
      "Strung mass you can accelerate all match.",
      "Balance and swingweight through the hitting zone.",
      "Open vs dense patterns and tension targets.",
      "Grip size for secure but relaxed hold.",
    ],
    factorChanges: [
      "Improving centre contact allows smaller heads over time.",
      "Higher swingweights stabilise pace but slow preparation.",
      "Head-light balances can feel whippy; head-heavy can feel ploughing.",
      "Polyester vs multifilament changes comfort and spin dramatically.",
      "Wrong grip size causes tension and tennis elbow risk factors.",
    ],
    factorNotices: [
      "Mishit frequency on returns and stretch balls.",
      "Late-set preparation on wide balls.",
      "Whether the frame ploughs or feels unstable on blocks.",
      "Arm comfort after a string change.",
      "Whether the buttcap feels secure without squeezing.",
    ],
    comparisonRows: [
      {
        label: "Margin",
        values: [
          "Larger head forgiveness",
          "Smaller head precision",
          "Your centre-hit rate",
        ],
      },
      {
        label: "Mass feel",
        values: [
          "Easier to accelerate",
          "More plough through contact",
          "Your preparation speed",
        ],
      },
      {
        label: "Best stage",
        values: [
          "Building consistency",
          "Established technique",
          "Honest current level",
        ],
      },
    ],
    tradeoffs: {
      gains: [
        "More centred contact",
        "Match-long manoeuvrability",
        "Arm-friendlier setups",
        "A frame matched to today",
      ],
      giveUps: [
        "Some ploughing stability",
        "Pro-stock aesthetics",
        "Ultra-dense control patterns (if you need launch)",
        "Copying tour specs blindly",
      ],
      footnote: "Tour frames assume tour technique and customisation.",
    },
    callout: {
      title: "Not a padel buying guide",
      body: "Padel shape language (diamond/round foam faces) does not map to tennis head size and stringbeds. Keep the sports’ frameworks separate.",
    },
    decisionSteps: [
      {
        id: "level",
        title: "Level-honest head size",
        body: "If returns spray, stay in the forgiving head-size band.",
      },
      {
        id: "mass",
        title: "Set a swingweight window",
        body: "You must still prepare on wide balls in the third set.",
      },
      {
        id: "strings",
        title: "Plan the stringbed",
        body: "Decide poly vs multi and a starting tension before judging the frame.",
      },
      {
        id: "grip",
        title: "Get grip size right",
        body: "Secure with relaxed fingers; overgrip can fine-tune slightly.",
      },
      {
        id: "demo",
        title: "Demo match patterns",
        body: "Returns, stretch forehands and serves — not only open-court winners.",
      },
      {
        id: "buy",
        title: "Buy the repeatable setup",
        body: "Frame + strings you can reproduce, then check offers.",
      },
    ],
    branchQuestion: "What is the main tennis problem?",
    branchOptions: [
      {
        label: "Mishits / confidence",
        result: "Start with a more forgiving head size and manageable weight.",
      },
      {
        label: "Need more precision/plough",
        result: "Test a smaller head or higher swingweight only if preparation is solid.",
      },
      {
        label: "Arm comfort",
        result: "Prioritise softer stringbeds and avoid ultra-stiff demos first.",
      },
    ],
    exampleLabels: [
      "Forgiving modern 100",
      "Power-oriented all-court",
      "Precise player’s 98",
    ],
    exampleWhys: [
      "Illustrates an accessible 100-class frame for consistency-first players.",
      "Shows a power-oriented setup when you want easier depth.",
      "Demonstrates a denser, more precise frame for established technique.",
    ],
    exampleTradeoffs: [
      "Less surgical than a 98 for clean strikers.",
      "Can launch long if timing is late.",
      "Punishes off-centre contact more than a forgiving 100.",
    ],
    mistakes: [
      {
        id: "tour-copy",
        title: "Copying a tour frame unstrung",
        body: "Tour players customise mass and use different string programmes.",
      },
      {
        id: "padel-transfer",
        title: "Using padel shape advice",
        body: "Foam-face padel geometry is a different sport framework.",
      },
      {
        id: "strings-last",
        title: "Ignoring strings",
        body: "The stringbed can matter as much as the frame stamp.",
      },
      {
        id: "grip-wrong",
        title: "Wrong grip size",
        body: "Over-squeezing to compensate is an injury risk factor over time.",
      },
    ],
    faqs: [
      {
        question: "What matters most when choosing a tennis racket?",
        answer:
          "Head size and manageable swingweight for your level, then a stringbed you can reproduce. Cosmetics are last.",
      },
      {
        question: "Is a more expensive tennis racket better?",
        answer:
          "Not automatically. Value is match-long control and comfort for your swing, not the retail tier.",
      },
      {
        question: "Should beginners use a player’s 98?",
        answer:
          "Usually not. Forgiving head sizes and lighter swingweights typically build consistency faster.",
      },
      {
        question: "How should I test a tennis racket?",
        answer:
          "Demo returns, serves and stretch balls with a representative string/tension — judge late-set preparation.",
      },
    ],
  },
};

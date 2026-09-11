import type { FAQ } from "@/domain/editorial/types";
import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import { resolveHeroFromProductIds } from "@/lib/guides/guide-product-hero";

type HyroxUnique = {
  definitionParas: [string, string, string];
  whyParas: [string, string];
  exampleWhys: [string, string, string];
  exampleTradeoffs: [string, string, string];
  factorNotices: [string, string, string, string];
  factorDetails: [
    { whatItIs: string; howItChanges: string },
    { whatItIs: string; howItChanges: string },
    { whatItIs: string; howItChanges: string },
    { whatItIs: string; howItChanges: string },
  ];
  mistakes: Array<{ id: string; title: string; body: string }>;
  faqAnswers: [string, string, string, string];
  quickAnswerBullets: [string, string, string, string];
  comparisonRows: Array<{ label: string; values: [string, string, string] }>;
  gains: [string, string, string, string];
  giveUps: [string, string, string, string];
  decisionSteps: Array<{ id: string; title: string; body: string }>;
};

type HyroxSpec = {
  slug: string;
  title: string;
  subject: string;
  goal: string;
  factors: [string, string, string, string];
  comparison: [string, string];
  products: [string, string, string];
  tool?: "hyrox-race-kit-builder" | "hyrox-shoe-finder";
  bestHref: string;
  bestLabel: string;
  unique: HyroxUnique;
};

const HYROX_SPECS: HyroxSpec[] = [
  {
    slug: "how-to-build-a-hyrox-home-gym",
    title: "How to Build a HYROX Home Gym",
    subject: "a HYROX home gym",
    goal: "cover repeatable race-relevant training without buying equipment your room cannot support",
    factors: ["Usable floor area", "Sled runway and surface", "Station coverage", "Noise and storage"],
    comparison: ["Minimal versatile kit", "Machine-led setup"],
    products: ["prod-concept2-rowerg", "prod-concept2-skierg", "prod-rogue-dog-sled"],
    bestHref: "/best/home-gym-equipment",
    bestLabel: "See best home-gym equipment →",
    unique: {
      definitionParas: [
        "Choosing a HYROX home gym is a constraint-matching problem: map race stations to the volume you can store, load and repeat weekly.",
        "A useful home gym for this event is not a replica of a competition floor. It is a prioritised set of implements that closes the gaps your commercial gym leaves—usually ski, row, sled runway or loaded carries—while protecting neighbours and door clearances.",
        "Start from room geometry and weekly session length. Only then decide whether a rower, SkiErg, sled or plate stack earns permanent floor space.",
      ],
      whyParas: [
        "Buying machines before measuring runway and ceiling height often strands expensive cardio tools against walls you cannot load around.",
        "A needs-first layout keeps progression possible: the same footprint should support easy intervals, heavier sled efforts and accessory strength without weekly rearranging.",
      ],
      exampleWhys: [
        "The RowErg illustrates a high-transfer ergometer that covers race rowing and general conditioning when floor length is available.",
        "The SkiErg shows a low-footprint station that trains the race ski pattern without needing a long pull path.",
        "A plate sled demonstrates the push–pull demand that no rower or ski machine substitutes, provided the floor and runway allow it.",
      ],
      exampleTradeoffs: [
        "Needs roughly 2.5 m of clear length in use and storage for the rail; awkward in short rooms.",
        "Requires wall or freestanding mount height and still leaves sled and farmer work uncovered.",
        "Only useful where the surface can take plates and you have a straight push corridor.",
      ],
      factorNotices: [
        "You keep clipping door swings, benches or walls during carries and burpee broad jumps.",
        "Plates tip, sleds skate unpredictably or the push ends before you hit race-like distances.",
        "You repeatedly skip a race station because nothing at home approximates it.",
        "Sessions stop early because neighbours complain or packing the kit takes longer than the workout.",
      ],
      factorDetails: [
        {
          whatItIs: "Clear length, width and ceiling height for movement plus equipment footprints.",
          howItChanges: "Apartments favour ergs and dumbbells; garages may allow sled lanes and taller SkiErg mounts.",
        },
        {
          whatItIs: "Straight path length, floor friction and edge protection for loaded pushes and pulls.",
          howItChanges: "Carpet, floating wood and shared hallways often rule out a true sled even if budget exists.",
        },
        {
          whatItIs: "Which of the eight stations you can already train elsewhere versus must own.",
          howItChanges: "Athletes with a strong commercial gym may only need one missing erg; full home athletes need broader coverage.",
        },
        {
          whatItIs: "Sound transmission, plate storage and how quickly the room returns to living use.",
          howItChanges: "Upstairs flats punish dropped plates and SkiErg slam; ground floors tolerate more machine permanence.",
        },
      ],
      mistakes: [
        { id: "replica", title: "Trying to clone the full competition floor", body: "Own the stations you cannot access elsewhere; rent or visit a gym for rare high-load sled work if needed." },
        { id: "runway", title: "Ordering a sled without measuring runway", body: "A short corridor teaches bad patterning and frustrates loading more than it trains race pushes." },
        { id: "noise", title: "Ignoring building rules and neighbour noise", body: "Rubber mats help contact sound but do not stop structural vibration from thrusters or plate drops." },
        { id: "duplicate", title: "Duplicating machines the gym already provides", body: "Budget usually returns more when spent on personal footwear, sensors or the one missing erg." },
        { id: "storage", title: "Ignoring pack-down time", body: "If every session needs twenty minutes of assembly, adherence collapses before the programming does." },
      ],
      faqAnswers: [
        "Prioritise usable floor area and which race stations you cannot train elsewhere, then size machines to those gaps.",
        "No. A machine-heavy room only wins when you will use those ergs weekly and the building can tolerate them.",
        "Beginners should start with personal race gear and reliable gym access; add home machines after a clear, repeated gap appears.",
        "Compare a minimal versatile kit and a machine-led setup under the same weekly plan, including setup time and neighbour constraints.",
      ],
      quickAnswerBullets: [
        "Inventory which stations your gym already covers before buying ergs or a sled.",
        "Measure clear length for a rower rail and any sled push before browsing models.",
        "Prefer one high-use machine over a partial replica of every competition station.",
        "Plan noise, plate storage and pack-down as hard constraints, not afterthoughts.",
      ],
      comparisonRows: [
        { label: "Coverage", values: ["Mixed implements + one erg", "Dedicated ergs plus optional sled", "Buy only what fills a weekly gap"] },
        { label: "Space demand", values: ["Lower permanent footprint", "Higher dedicated stations", "Match room geometry first"] },
        { label: "Progression", values: ["Depends on plates and versatility", "Clear meter targets on ergs", "Choose the path you will repeat"] },
      ],
      gains: ["Race-relevant stations at home", "Fewer cancelled sessions", "Clearer erg progression", "Less travel dependency"],
      giveUps: ["Floor and storage cost", "Neighbour noise risk", "Possible gym duplication", "Setup and maintenance time"],
      decisionSteps: [
        { id: "gap", title: "List station gaps", body: "Write the stations you cannot train well at your current gym or club." },
        { id: "room", title: "Measure the room", body: "Record clear length, width, ceiling height, door swings and floor type." },
        { id: "noise", title: "Check building limits", body: "Confirm rules on dropped weights, machine vibration and evening sessions." },
        { id: "compare", title: "Compare kit styles", body: "Score a minimal versatile kit against a machine-led setup for the same week." },
        { id: "buy", title: "Buy the bottleneck piece", body: "Purchase the single item that unlocks the most sessions, then reassess." },
      ],
    },
  },
  {
    slug: "how-to-choose-a-hyrox-training-sled",
    title: "How to Choose a HYROX Training Sled",
    subject: "a HYROX training sled",
    goal: "train pushing and pulling safely on the surface and runway you actually have",
    factors: ["Surface compatibility", "Push and pull hardware", "Load capacity", "Footprint and transport"],
    comparison: ["Dedicated plate sled", "Sled alternatives"],
    products: ["prod-rogue-dog-sled", "prod-concept2-rowerg", "prod-concept2-skierg"],
    bestHref: "/best/home-gym-equipment",
    bestLabel: "See best home-gym equipment →",
    unique: {
      definitionParas: [
        "Choosing a HYROX training sled is a constraint-matching problem focused on friction, hardware and the straight path you can actually use.",
        "Competition sleds run on specified turf with division loads; home and box surfaces change resistance dramatically, so “race weight” on the wrong floor is not race practice.",
        "Select a sled for the pushes and pulls you can repeat safely—low skids for turf or dedicated lanes, clear attachment points for straps, and a load range that matches your division goals without tipping.",
      ],
      whyParas: [
        "A sled that chatters, tips or destroys flooring teaches compensation patterns that do not transfer to race day.",
        "When the runway is too short or the surface too aggressive, athletes under-load and lose the conditioning stimulus the station is meant to provide.",
      ],
      exampleWhys: [
        "A dedicated plate sled shows the push–pull hardware and stack capacity athletes need when they have a suitable lane.",
        "A RowErg is a useful alternative conditioning tool when sled access is limited, covering locomotor work without floor friction risk.",
        "A SkiErg fills upper-body engine work when sled training is seasonal or gym-only, keeping conditioning available without a runway.",
      ],
      exampleTradeoffs: [
        "Demands a compatible floor and storage; poor surfaces raise injury and equipment risk.",
        "Does not replicate sled-specific horizontal force or low-handle posture.",
        "Leaves push and pull patterning untrained despite strong metabolic overlap.",
      ],
      factorNotices: [
        "Skids dig into floors, squeal on concrete or refuse to slide on rubber tiles.",
        "Pull straps slip, push horns feel too high or low, or you cannot switch modes quickly.",
        "You hit the plate stack limit before race-relevant loads or the sled becomes tippy.",
        "Moving the sled between sessions takes so long that you skip the station.",
      ],
      factorDetails: [
        {
          whatItIs: "How sled runners interact with turf, rubber, concrete or temporary lanes.",
          howItChanges: "Turf and dedicated sled floors favour low-friction runners; finished wood and thin mats often forbid use.",
        },
        {
          whatItIs: "Horns, posts and strap anchors for push and pull orientations.",
          howItChanges: "Race prep needs both modes; some budget sleds only do one well.",
        },
        {
          whatItIs: "Safe plate capacity and stability at your target loads.",
          howItChanges: "Heavier divisions and strong athletes need higher stacks without a narrow base tipping.",
        },
        {
          whatItIs: "Stored size, weight empty and how you move it between uses.",
          howItChanges: "Shared boxes need compact sleds; home users may accept bulk if the lane is permanent.",
        },
      ],
      mistakes: [
        { id: "floor", title: "Matching race plates to the wrong floor", body: "Resistance is surface-dependent; chase quality pushes on a legal surface rather than copied kilogram numbers." },
        { id: "pull", title: "Buying a push-only toy sled", body: "HYROX includes both push and pull; missing strap points leaves half the station untrained." },
        { id: "tip", title: "Overloading a narrow base", body: "Tip risk rises faster than training value once the stack exceeds the sled’s stable envelope." },
        { id: "runway-short", title: "Accepting a two-metre runway", body: "Broken segments of a few steps do not prepare continuous race pushes." },
        { id: "alt-denial", title: "Refusing alternatives when sleds are impossible", body: "Heavy prowler substitutes, gym access days or denser erg work beat damaging your living-room floor." },
      ],
      faqAnswers: [
        "Prioritise surface compatibility and push–pull hardware before brand or plate capacity marketing.",
        "Not always. A dedicated sled wins only when you have a safe runway and will use both push and pull regularly.",
        "Beginners can borrow gym sleds first; buy only after confirming floor, runway and weekly use.",
        "Compare a dedicated plate sled with sled alternatives in the same space, including floor risk and setup time.",
      ],
      quickAnswerBullets: [
        "Confirm floor type and straight-path length before choosing runners or horns.",
        "Require both push and pull attachment options for HYROX-specific practice.",
        "Treat published race loads as venue-specific, not universal home targets.",
        "If the room cannot host a sled, plan gym access or conditioning alternatives deliberately.",
      ],
      comparisonRows: [
        { label: "Specificity", values: ["Closest push–pull pattern", "Metabolic stand-ins", "Choose based on runway access"] },
        { label: "Floor risk", values: ["Needs compatible surface", "Usually safer indoors", "Never force a sled on finished floors"] },
        { label: "Session friction", values: ["Setup and plate changes", "Often ready immediately", "Adherence beats theoretical specificity"] },
      ],
      gains: ["True horizontal push–pull", "Race posture practice", "Load progression clarity", "Station confidence"],
      giveUps: ["Floor and storage demands", "Surface-specific resistance", "Transport hassle", "Higher injury risk if misused"],
      decisionSteps: [
        { id: "surface", title: "Audit the surface", body: "Decide whether turf, mats or concrete can legally and safely take sled runners." },
        { id: "path", title: "Measure the runway", body: "Need a continuous straight path long enough for meaningful pushes." },
        { id: "modes", title: "Require both modes", body: "Confirm horns and pull attachments before purchase." },
        { id: "load", title: "Set a realistic load range", body: "Match capacity to your division goals without tippy stacks." },
        { id: "fallback", title: "Define the fallback", body: "If a sled fails the room test, schedule gym sled days or conditioning substitutes." },
      ],
    },
  },
  {
    slug: "how-to-choose-a-hyrox-watch",
    title: "How to Choose a HYROX Watch",
    subject: "a HYROX watch",
    goal: "record useful laps and effort data without adding complexity during stations",
    factors: ["Interval controls", "Readable data fields", "Sensor pairing", "Race-day battery"],
    comparison: ["Custom workout watch", "Simple elapsed-time watch"],
    products: ["prod-forerunner-965", "prod-hrm-pro-plus", "prod-polar-h10"],
    bestHref: "/best/running-watches",
    bestLabel: "See best running watches →",
    unique: {
      definitionParas: [
        "Choosing a HYROX watch is a constraint-matching problem: capture run splits and station effort without fighting menus mid-burpee.",
        "The event mixes one-kilometre runs with discrete stations, so the useful watch behaviour is fast lap marking, glanceable fields and reliable pairing to a chest strap when optical sensing struggles.",
        "Prefer controls you have rehearsed under fatigue. Feature depth only helps if you can operate it with sweaty hands between stations.",
      ],
      whyParas: [
        "A watch that demands multi-press workflows during transitions steals seconds and attention you need for the next station briefing.",
        "Clean split data after the race supports training adjustments; missing laps or dead batteries leave you guessing which segment cost the most time.",
      ],
      exampleWhys: [
        "A Forerunner-class multisport watch shows how custom workouts and rich data fields support structured HYROX-style sessions.",
        "A premium chest strap illustrates the sensor half of accurate effort tracking when wrist optics lose lock on carries and floor work.",
        "A Polar H10-class strap demonstrates a widely compatible alternative when you already own a simpler watch but need better heart-rate fidelity.",
      ],
      exampleTradeoffs: [
        "More screens and options can slow race-day operation if you have not simplified the layout.",
        "Adds another device to charge, wet-clean and remember in the transition area.",
        "Still needs a receiving watch or phone; the strap alone does not solve lap marking.",
      ],
      factorNotices: [
        "You miss lap presses or spend transitions hunting for the right sport profile.",
        "Critical fields are tiny, buried or auto-scroll away when you need them.",
        "Heart rate drops out during sleds, carries or burpees despite a snug watch.",
        "The battery warning appears during long races or back-to-back heats.",
      ],
      factorDetails: [
        {
          whatItIs: "How quickly you can start, lap and lock a structured session.",
          howItChanges: "Custom HYROX-style workouts help training; race day often needs one big activity with manual laps.",
        },
        {
          whatItIs: "Which metrics stay visible at a glance under bright indoor lighting.",
          howItChanges: "Lap time, heart rate and elapsed time usually beat deep power or map pages mid-race.",
        },
        {
          whatItIs: "Bluetooth or ANT+ links to chest straps and external sensors.",
          howItChanges: "Floor stations and carrying implements favour straps over wrist optics for many athletes.",
        },
        {
          whatItIs: "Runtime with GPS and optical HR for your longest expected event.",
          howItChanges: "Doubles, warm-up buffer and music features can shrink usable race battery.",
        },
      ],
      mistakes: [
        { id: "menus", title: "Racing with an unrehearsed profile", body: "Build and practice the exact screens and lap behaviour in training sessions." },
        { id: "optics-only", title: "Trusting wrist HR through every station", body: "Carries, crawling and gripping often break optical lock; pair a strap when effort data matters." },
        { id: "overfield", title: "Showing too many data fields", body: "Clutter slows reading; keep race screens minimal." },
        { id: "battery", title: "Skipping a full charge and warm-up buffer", body: "Account for check-in time, warm-up and the full race distance." },
        { id: "new-race", title: "Debut a brand-new watch on race day", body: "Firmware quirks and button muscle memory belong in training weeks." },
      ],
      faqAnswers: [
        "Prioritise interval controls and readable fields, then confirm strap pairing and battery for your longest race.",
        "No. A custom workout watch only wins if you will operate those features under fatigue; many athletes race better with simple elapsed time plus manual laps.",
        "Beginners can start with any reliable sports watch they already own; upgrade when missing laps or poor HR data actually blocks training decisions.",
        "Compare a custom workout watch and a simple elapsed-time watch in a full practice session that includes stations, not only a clean run.",
      ],
      quickAnswerBullets: [
        "Rehearse one race profile with large lap and elapsed-time fields.",
        "Plan a chest strap if you care about station heart-rate fidelity.",
        "Charge with warm-up and delay buffer, not just estimated race duration.",
        "Ignore maps and deep menus you will never open between stations.",
      ],
      comparisonRows: [
        { label: "Training use", values: ["Structured workouts and analysis", "Basic timing", "Match complexity to your review habits"] },
        { label: "Race operation", values: ["Powerful but easy to overcomplicate", "Hard to misuse", "Fewer presses usually win"] },
        { label: "Data quality", values: ["Strong with paired sensors", "Depends on the watch alone", "Add a strap when stations scramble optics"] },
      ],
      gains: ["Useful split history", "Effort trends across stations", "Familiar race controls", "Training-to-race continuity"],
      giveUps: ["Setup time", "Another chargeable device", "Distraction risk", "Cost beyond a basic timer"],
      decisionSteps: [
        { id: "job", title: "Define the race job", body: "Decide whether you need structured training features or only clean race timing." },
        { id: "screens", title: "Design minimal screens", body: "Keep lap, elapsed and heart rate large enough to read while moving." },
        { id: "strap", title: "Decide on a strap", body: "Add a chest strap if station heart rate regularly fails on the wrist." },
        { id: "rehearse", title: "Rehearse under fatigue", body: "Run a brick session and practice every button you will use." },
        { id: "power", title: "Validate battery", body: "Complete a long simulation on race settings before event week." },
      ],
    },
  },
  {
    slug: "how-to-choose-hyrox-shoes",
    title: "How to Choose HYROX Shoes",
    subject: "HYROX shoes",
    goal: "balance eight kilometres of running with stable, grippy station work",
    factors: ["Running efficiency", "Lateral stability", "Sled grip", "Fit under fatigue"],
    comparison: ["Running-first shoe", "Stability-first trainer"],
    products: ["prod-tyr-cxt-2", "prod-reebok-nano-x4", "prod-nike-metcon-9"],
    tool: "hyrox-shoe-finder",
    bestHref: "/best/hyrox-shoes",
    bestLabel: "See best HYROX shoes →",
    unique: {
      definitionParas: [
        "Choosing HYROX shoes is a constraint-matching problem between repeated one-kilometre runs and mixed-modal station work.",
        "Unlike a pure road race shoe, the pair must tolerate lateral loading, rope or sled contact and quick direction changes without turning the run legs into a slog.",
        "Shortlist shoes that stay secure when wet and fatigued, offer enough cushion for eight kilometres of running, and keep the outsole planted on turf or rubber during pushes.",
      ],
      whyParas: [
        "A maximal road racer can feel unstable on lunges, wall balls and sled starts, while a hard training shoe can punish the run legs late in the race.",
        "Blisters, hotspots and grip slips compound across eight run–station cycles, so fit and outsole behaviour matter as much as stack height marketing.",
      ],
      exampleWhys: [
        "The TYR CXT 2 illustrates a hybrid training shoe aimed at run-plus-station compromise rather than pure road racing.",
        "The Reebok Nano X4 shows a stability-biased trainer many athletes use when station confidence outranks peak run feel.",
        "The Nike Metcon 9 represents a firm, flat training platform that prioritises ground feel and lateral work over soft road cushioning.",
      ],
      exampleTradeoffs: [
        "May not match the softest pure road shoes on long continuous runs outside HYROX.",
        "Can feel less lively on the one-kilometre legs if you are used to racing flats or plated shoes.",
        "Firerness that helps stations can fatigue the legs on later run segments.",
      ],
      factorNotices: [
        "Run splits drift late because the shoe feels dead or unstable at pace.",
        "Feet roll on lunges, carries or burpee landings.",
        "Sled starts slip or turf pellets clog an aggressive road outsole.",
        "Hotspots appear after the fourth or fifth station when feet swell.",
      ],
      factorDetails: [
        {
          whatItIs: "How economically the shoe carries you across repeated flat kilometres.",
          howItChanges: "Strong runners may accept a firmer hybrid; weaker runners often need more cushion.",
        },
        {
          whatItIs: "Midfoot security and base width under side-to-side and rotational loads.",
          howItChanges: "Wall balls, lunges and carries expose narrow, highly rockered road racers.",
        },
        {
          whatItIs: "Outsole rubber and tread behaviour on turf, rubber and dusty indoor floors.",
          howItChanges: "Sled stations punish hard plastic speedboards and worn road gum rubber.",
        },
        {
          whatItIs: "Lockdown and volume when feet heat and swell across a long heat.",
          howItChanges: "Race day socks, taping and mild swelling can turn a snug shop fit into a blister factory.",
        },
      ],
      mistakes: [
        { id: "vapor", title: "Racing in a pure carbon road shoe", body: "Plate geometry and narrow lasts often fail lateral station demands." },
        { id: "crossfit-only", title: "Choosing the flattest box shoe by default", body: "Eight kilometres of running still matter; test run feel under fatigue." },
        { id: "new", title: "Debut shoes on race day", body: "Break in the exact pair and sock combo across full simulations." },
        { id: "grip", title: "Ignoring turf and rubber grip", body: "Sled slips waste more time than a slightly heavier shoe usually costs." },
        { id: "width", title: "Buying only by stack height", body: "Width, heel hold and toe-box shape decide comfort across eight cycles." },
      ],
      faqAnswers: [
        "Prioritise running efficiency and lateral stability together, then confirm sled grip and fit after several hard sessions.",
        "No. A running-first shoe only wins if it stays stable on stations; many athletes prefer a hybrid or training shoe.",
        "Beginners should not buy race-only footwear immediately—start with a versatile trainer and upgrade once race simulations reveal a clear limit.",
        "Compare a running-first shoe and a stability-first trainer on the same brick workout with sled or lunge work included.",
      ],
      quickAnswerBullets: [
        "Treat HYROX footwear as a hybrid decision, not a marathon-shoe decision.",
        "Test lateral drills and a short sled push before trusting a road racer.",
        "Rehearse race socks and lacing under sweaty, swollen-foot conditions.",
        "Use the shoe finder only after you know your run-versus-station priority.",
      ],
      comparisonRows: [
        { label: "Run legs", values: ["Usually more economical", "Often firmer and slower", "Weight your weakest race segment"] },
        { label: "Stations", values: ["May feel tippy or soft", "More planted and secure", "Prioritise where you lose most time"] },
        { label: "Durability", values: ["Road foam can chew on turf", "Training rubber often lasts longer", "Budget for abrasion if you train stations often"] },
      ],
      gains: ["Balanced race economy", "Fewer station slips", "Better late-race confidence", "One pair for most simulations"],
      giveUps: ["Peak pure-run speed", "Maximal soft cushion", "Specialist look", "Possible compromise feel"],
      decisionSteps: [
        { id: "bias", title: "Name your bias", body: "Decide whether late run legs or station security cost you more time." },
        { id: "shortlist", title: "Shortlist hybrids and trainers", body: "Include both running-first and stability-first candidates." },
        { id: "brick", title: "Run a brick test", body: "Combine kilometres with lunges, carries or sled work in the same shoes." },
        { id: "fit", title: "Check fatigued fit", body: "Reassess after heat and swelling, not only in a cold shop try-on." },
        { id: "commit", title: "Lock the race pair", body: "Stop rotating new models in the final two weeks before the event." },
      ],
    },
  },
  {
    slug: "hyrox-equipment-standards",
    title: "HYROX Equipment Standards",
    subject: "HYROX equipment standards",
    goal: "understand the race format while separating official loads from training-equipment claims",
    factors: ["Division", "Station order", "Official distance", "Surface-dependent resistance"],
    comparison: ["Official race specification", "Local training setup"],
    products: ["prod-rogue-dog-sled", "prod-concept2-skierg", "prod-concept2-rowerg"],
    bestHref: "/hyrox/gear",
    bestLabel: "Browse HYROX gear →",
    unique: {
      definitionParas: [
        "Choosing how to interpret HYROX equipment standards is a constraint-matching problem between published race rules and what your gym can actually provide.",
        "Official divisions set distances, implement loads and station sequence for the event. Training equipment pages often imply equivalence that surfaces, calibration and local substitutions cannot deliver.",
        "Use standards to plan pacing and strength targets, then translate those targets into whatever safe, measurable setup your venue allows—without assuming identical kilogram feels.",
      ],
      whyParas: [
        "Athletes who chase “race weight” on dissimilar floors either under-prepare or overload joints when friction differs from competition turf.",
        "Clear separation of rules versus training proxies keeps programming honest and reduces disappointment when race day feels different from the gym.",
      ],
      exampleWhys: [
        "A competition-style sled highlights how push–pull standards depend on turf friction more than plate stickers alone.",
        "A SkiErg shows a station where damper and damper feel still vary by machine condition even when the race distance is fixed.",
        "A RowErg illustrates standardised distance work that still depends on damper setting, drag factor and athlete technique.",
      ],
      exampleTradeoffs: [
        "Home or gym floors may never match race resistance at the same load.",
        "Local machines can be poorly maintained or shared, changing scores week to week.",
        "Familiar damper settings may not match the event machines you draw on race day.",
      ],
      factorNotices: [
        "You programme Open loads while racing Pro, or the reverse, and pacing collapses.",
        "You practise stations out of order and mismanage transitions or fatigue stacking.",
        "You train half-distances and discover race length feels unfamiliar.",
        "Identical plates feel radically harder or easier on a different surface.",
      ],
      factorDetails: [
        {
          whatItIs: "Open, Pro and doubles rules that set loads and expectations.",
          howItChanges: "Strength work and sled targets must track the division you will enter.",
        },
        {
          whatItIs: "The fixed sequence of run legs and functional stations.",
          howItChanges: "Brick sessions should respect order when you are rehearsing race skills.",
        },
        {
          whatItIs: "Published run and station distances for the event format.",
          howItChanges: "Shortened gym proxies need explicit notes so progression stays honest.",
        },
        {
          whatItIs: "How turf, rubber and machine calibration alter perceived load.",
          howItChanges: "Training proxies should use RPE, time or watts alongside plate numbers.",
        },
      ],
      mistakes: [
        { id: "marketing", title: "Treating product pages as rulebooks", body: "Confirm current official standards from the organiser, not retailer copy." },
        { id: "kg-copy", title: "Copying kilograms across surfaces", body: "Match effort and movement quality, not only the number on the plate." },
        { id: "order", title: "Ignoring station order in simulations", body: "Fatigue stacking differs when you reshuffle stations for gym convenience." },
        { id: "division", title: "Training the wrong division loads", body: "Verify your entry category before building strength peaks." },
        { id: "one-machine", title: "Assuming every Concept2 feels identical", body: "Drag factor and maintenance still change scores; log settings." },
      ],
      faqAnswers: [
        "Prioritise your division rules and station order, then translate distances into local equipment with clear proxy notes.",
        "No. Official specification is the event reference; local setups win for weekly training when they are measurable and safe.",
        "Beginners should learn the format first with light, consistent proxies rather than buying every branded “HYROX” implement.",
        "Compare official race specification and your local training setup on the same session goals, noting where friction and calibration differ.",
      ],
      quickAnswerBullets: [
        "Read current division loads and station order from official sources before programming.",
        "Log drag factor, damper and floor type whenever you compare sessions.",
        "Treat retailer “race ready” claims as marketing until verified against rules.",
        "Use time, RPE or watts when surfaces make kilogram matching meaningless.",
      ],
      comparisonRows: [
        { label: "Purpose", values: ["Event truth and pacing", "Weekly accessibility", "Keep both labelled clearly"] },
        { label: "Load meaning", values: ["Defined for competition surfaces", "Friction-dependent", "Do not equate blindly"] },
        { label: "Progression", values: ["Fixed by rules", "Flexible proxies", "Track the metric you can repeat"] },
      ],
      gains: ["Honest race expectations", "Safer load choices", "Better pacing plans", "Clearer training notes"],
      giveUps: ["Illusion of perfect replication", "Simple kilogram copying", "One-number comparisons", "Marketing shortcuts"],
      decisionSteps: [
        { id: "rules", title: "Pull current rules", body: "Confirm division, distances and implements for your event." },
        { id: "venue", title: "Map your venue", body: "List which stations match and which need proxies." },
        { id: "metrics", title: "Pick tracking metrics", body: "Combine loads with time, RPE or erg splits." },
        { id: "simulate", title: "Run ordered simulations", body: "Practise the real sequence at least periodically." },
        { id: "adjust", title: "Adjust without ego", body: "Change local loads when the surface clearly differs from race turf." },
      ],
    },
  },
  {
    slug: "hyrox-heart-rate-monitor",
    title: "Chest Strap vs Wrist Heart Rate for HYROX",
    subject: "a HYROX heart-rate monitor",
    goal: "collect consistent effort data through running, carries and floor-based stations",
    factors: ["Movement artefacts", "Fit and contact", "Watch compatibility", "Cleaning and comfort"],
    comparison: ["Chest strap", "Wrist optical sensor"],
    products: ["prod-hrm-pro-plus", "prod-polar-h10", "prod-forerunner-965"],
    bestHref: "/best/heart-rate-monitors-hyrox",
    bestLabel: "See best HYROX heart-rate monitors →",
    unique: {
      definitionParas: [
        "Choosing a HYROX heart-rate monitor is a constraint-matching problem between sensor physics and the event’s gripping, crawling and carrying demands.",
        "Wrist optical sensors estimate pulse from skin perfusion and struggle when the wrist flexes under load, loses contact or experiences cadence-like noise. Chest straps measure electrical signals at the torso and usually track better through stations—if moistened and seated correctly.",
        "Pick the setup that stays locked from the first run through the last station, then decide whether that means a strap paired to your watch or accepting noisier wrist data for convenience.",
      ],
      whyParas: [
        "Training zones and race effort reviews are only useful when the trace is trustworthy; garbage heart-rate data creates false “breakthroughs” and false alarms.",
        "HYROX’s mix of locomotion and implement work is exactly where optical sensors most often drop or spike, so the strap-versus-wrist choice is event-specific rather than generic running advice.",
      ],
      exampleWhys: [
        "A Garmin HRM Pro-class strap shows how a modern chest strap pairs tightly with Garmin watches for station-heavy sessions.",
        "A Polar H10 illustrates a widely compatible strap many athletes use across mixed watch brands.",
        "A Forerunner watch demonstrates the wrist-optical baseline and the receiving device that displays strap data when paired.",
      ],
      exampleTradeoffs: [
        "Requires moist contact, correct placement and post-session cleaning.",
        "Still needs good electrode contact; dry cold starts can lag until you sweat.",
        "Wrist-only mode remains vulnerable during carries even if GPS and laps are excellent.",
      ],
      factorNotices: [
        "Traces flatline or spike during sleds, wall balls or farmer carries.",
        "The strap rides up, chafes or loses electrodes mid-race.",
        "The watch fails to stay connected or defaults back to wrist optical unexpectedly.",
        "Salt buildup or skin irritation makes you leave the strap at home.",
      ],
      factorDetails: [
        {
          whatItIs: "Noise from wrist flexion, grip tension and intermittent skin contact.",
          howItChanges: "Floor stations and carries amplify optical errors more than steady road running.",
        },
        {
          whatItIs: "Electrode moisture, strap height and snugness around the chest.",
          howItChanges: "Women’s and men’s strap shapes differ; poor fit ruins even premium sensors.",
        },
        {
          whatItIs: "Bluetooth or ANT+ pairing reliability with your race watch.",
          howItChanges: "Some watches manage dual sensors poorly; test the exact pair you will race.",
        },
        {
          whatItIs: "Rinse habits, pad wear and how the strap feels over 60–90 minutes.",
          howItChanges: "Athletes who hate cleaning straps quietly revert to wrist mode and lose data quality.",
        },
      ],
      mistakes: [
        { id: "dry", title: "Starting a strap bone-dry", body: "Moisten electrodes for a faster lock, especially in cool venues." },
        { id: "medical", title: "Treating consumer HR as a diagnosis", body: "Sensors guide training trends only; seek clinical care for symptoms or concerning readings." },
        { id: "chafe", title: "Ignoring chafe until race day", body: "Tape, fit and shirt fabric need rehearsal under sweat." },
        { id: "pair", title: "Never testing the watch–strap pair", body: "Confirm the watch prefers the strap and does not silently fall back." },
        { id: "wash", title: "Skipping post-session rinses", body: "Salt corrosion and skin irritation shorten strap life and adherence." },
      ],
      faqAnswers: [
        "Prioritise movement artefact resistance and secure fit, then confirm your watch stays paired through a full station session.",
        "No. A chest strap is usually more consistent for HYROX stations, but a well-fitted optical watch can suffice if you only need coarse effort trends.",
        "Beginners can rely on wrist HR initially; add a strap when station traces are clearly unusable or you train by zones.",
        "Compare chest strap and wrist optical on the same brick workout, looking specifically at carries and floor stations.",
      ],
      quickAnswerBullets: [
        "Expect wrist optics to struggle most during carries and gripping stations.",
        "Moisten and seat a chest strap before the gun, not after the first artefacts.",
        "Validate the exact watch–strap pair in training, including reconnect behaviour.",
        "Remember consumer heart-rate data is not a medical diagnosis.",
      ],
      comparisonRows: [
        { label: "Station fidelity", values: ["Usually steadier", "Often noisy", "Choose based on how you use HR"] },
        { label: "Convenience", values: ["Extra device to wear and clean", "Already on the watch", "Adherence matters"] },
        { label: "Failure modes", values: ["Dry electrodes, poor fit", "Motion and contact loss", "Rehearse your chosen setup"] },
      ],
      gains: ["Cleaner effort traces", "Better zone training", "More trustworthy race reviews", "Fewer false spikes"],
      giveUps: ["Extra kit to manage", "Possible chafe", "Cleaning time", "Another battery or electrode set"],
      decisionSteps: [
        { id: "need", title: "Decide how you use HR", body: "Zones and analysis need cleaner data than casual curiosity." },
        { id: "test", title: "Test stations specifically", body: "Review traces from carries, sleds and burpees, not only easy runs." },
        { id: "fit", title: "Dial strap fit", body: "Adjust height and tension until contact stays stable when you move." },
        { id: "pair", title: "Lock pairing behaviour", body: "Confirm the watch records the strap for the whole session." },
        { id: "care", title: "Set a cleaning habit", body: "Rinse after salty sessions so you keep using the strap." },
      ],
    },
  },
  {
    slug: "hyrox-home-training-setup",
    title: "HYROX Home Training Setup",
    subject: "a HYROX home training setup",
    goal: "build a compact setup around the stations you cannot train elsewhere",
    factors: ["Available space", "Existing gym access", "Versatility", "Progressive loading"],
    comparison: ["Compact strength kit", "Full station simulation"],
    products: ["prod-concept2-skierg", "prod-concept2-rowerg", "prod-rogue-dog-sled"],
    bestHref: "/best/home-gym-equipment",
    bestLabel: "See best home-gym equipment →",
    unique: {
      definitionParas: [
        "Choosing a HYROX home training setup is a constraint-matching problem that starts with what you already access elsewhere.",
        "Unlike building a showpiece gym, the goal is a compact corner that covers missing stations—often ski, row or loaded locomotion—while dumbbells or a rack handle accessory strength.",
        "Define the weekly sessions you will actually protect at home, then buy the smallest set of tools that makes those sessions automatic.",
      ],
      whyParas: [
        "Athletes with strong box memberships waste money recreating machines they already use; home-only athletes under-train if they buy aesthetics instead of bottlenecks.",
        "A compact, versatile kit raises session frequency. Frequency usually beats a half-built replica that only works on Saturdays.",
      ],
      exampleWhys: [
        "A SkiErg shows how a wall-mounted or freestanding erg can close a common station gap in a small footprint.",
        "A RowErg illustrates the longer-floor option when you need race rowing and general conditioning at home.",
        "A sled represents the high-specificity add-on once space and flooring already support everything else.",
      ],
      exampleTradeoffs: [
        "Does not cover rowing distance or sled pushes by itself.",
        "Consumes floor length and may dominate a shared room.",
        "Only sensible after erg and strength basics are solved.",
      ],
      factorNotices: [
        "Equipment blocks doors or forces constant furniture moving.",
        "You still commute for the same stations you bought to avoid.",
        "Specialist tools sit idle while you lack plates or a bench for strength.",
        "Loads stall because the kit has no sensible progression path.",
      ],
      factorDetails: [
        {
          whatItIs: "The clear corner you can dedicate without daily teardown.",
          howItChanges: "True permanence enables ergs; temporary living rooms favour dumbbells and bands.",
        },
        {
          whatItIs: "Which stations and strength work your club already covers well.",
          howItChanges: "High gym access shrinks the home shopping list to personal kit and one gap-filler.",
        },
        {
          whatItIs: "How many movement patterns each purchase unlocks.",
          howItChanges: "Adjustable dumbbells plus one erg often beat three redundant machines.",
        },
        {
          whatItIs: "Whether you can add load or volume for months without a new purchase.",
          howItChanges: "Fixed light kit ceilings force early upgrades; plan increments first.",
        },
      ],
      mistakes: [
        { id: "mirror-gym", title: "Mirroring the commercial gym at home", body: "Buy the missing piece, not a second full floor." },
        { id: "zero-strength", title: "Owning ergs with no strength progressive path", body: "Wall balls, lunges and carries still need load options." },
        { id: "idle", title: "Buying for a fantasy schedule", body: "Size the kit to sessions you already protect on the calendar." },
        { id: "no-measure", title: "Skipping room measurements", body: "Erg rails and SkiErg height are unforgiving in small rooms." },
        { id: "all-at-once", title: "Ordering everything in one cart", body: "Sequence purchases after living with the first bottleneck fix." },
      ],
      faqAnswers: [
        "Prioritise available space and existing gym access, then choose versatile tools that progress for months.",
        "No. Full station simulation only wins when you lack gym access and have the room; many athletes thrive on a compact strength kit plus one erg.",
        "Beginners should not outfit a full home HYROX floor immediately—start with personal essentials and add machines after gaps are proven.",
        "Compare a compact strength kit and full station simulation against your real weekly calendar and room constraints.",
      ],
      quickAnswerBullets: [
        "Subtract gym-covered stations before spending on home machines.",
        "Protect one compact zone you will not dismantle every session.",
        "Favour versatile loading tools alongside at most one priority erg.",
        "Sequence purchases: gap-filler first, sled last if space allows.",
      ],
      comparisonRows: [
        { label: "Footprint", values: ["Smaller, multi-use", "Larger dedicated stations", "Match the room you have"] },
        { label: "Specificity", values: ["Strength + conditioning focus", "Closer station mimicry", "Buy specificity only for true gaps"] },
        { label: "Cost curve", values: ["Lower entry", "Higher and front-loaded", "Spend where sessions increase"] },
      ],
      gains: ["Higher training frequency", "Lower travel friction", "Clear gap coverage", "Sustainable progression"],
      giveUps: ["Incomplete race replication", "Some storage cost", "Neighbour constraints", "Not every station at home"],
      decisionSteps: [
        { id: "access", title: "Map gym access", body: "List stations you already train well outside the home." },
        { id: "space", title: "Claim a permanent zone", body: "Measure the corner that can stay set up." },
        { id: "gap", title: "Name one gap", body: "Choose the single missing stimulus that blocks race prep." },
        { id: "kit", title: "Build the compact core", body: "Add progressive strength tools before extra machines." },
        { id: "expand", title: "Expand only after use", body: "Add a second erg or sled once the first purchase is habitual." },
      ],
    },
  },
  {
    slug: "hyrox-race-day-gear-checklist",
    title: "HYROX Race Day Gear Checklist",
    subject: "a HYROX race-day kit",
    goal: "arrive with tested essentials and avoid carrying unneeded equipment",
    factors: ["Tested footwear", "Chafe control", "Timing and sensors", "Before-and-after layers"],
    comparison: ["Essential race kit", "Optional comfort kit"],
    products: ["prod-tyr-cxt-2", "prod-forerunner-965", "prod-hrm-pro-plus"],
    tool: "hyrox-race-kit-builder",
    bestHref: "/hyrox/gear",
    bestLabel: "Browse HYROX gear →",
    unique: {
      definitionParas: [
        "Choosing a HYROX race-day kit is a constraint-matching problem: pack only what you have already proven under fatigue.",
        "The checklist is personal kit—shoes, socks, clothing, timing devices and chafe prevention—not a travelling gym. Large implements stay at the venue.",
        "Build the bag from rehearsed items, then add a thin optional layer for weather and delays without turning the transition area into a camping trip.",
      ],
      whyParas: [
        "Untested socks, new shoes or unfamiliar straps create problems you cannot fix between the gun and station one.",
        "Overpacking slows you in the call room and encourages last-minute gear changes that undo months of consistent training setup.",
      ],
      exampleWhys: [
        "A proven hybrid shoe shows why footwear belongs on the essentials list only after full simulations.",
        "A race watch illustrates the timing device you should already know how to lap without looking.",
        "A chest strap represents the optional-but-valuable sensor many athletes add once optical HR fails stations.",
      ],
      exampleTradeoffs: [
        "One pair means no mid-race footwear swap if blister management fails—prevention must be rehearsed.",
        "Another device to charge and potentially distract if screens are cluttered.",
        "Extra chafe and cleaning responsibility on an already busy race morning.",
      ],
      factorNotices: [
        "Hotspots appear because the race pair differs from training shoes.",
        "Salt and seams create bloody areas by mid-race.",
        "You cannot find the lap button or the strap was left in the hotel.",
        "You freeze in the call room or overheat because layers were an afterthought.",
      ],
      factorDetails: [
        {
          whatItIs: "The exact shoes and socks combination used in long simulations.",
          howItChanges: "Swapping to a “faster” untested pair on race morning is a common failure mode.",
        },
        {
          whatItIs: "Anti-chafe products, tape and seam choices on shorts and tops.",
          howItChanges: "Saltier athletes and longer races need more aggressive prevention.",
        },
        {
          whatItIs: "Charged watch, optional strap and any spare battery plan.",
          howItChanges: "Doubles and delays punish marginal battery more than solo heats.",
        },
        {
          whatItIs: "Warm-up top, post-race dry clothes and weather protection.",
          howItChanges: "Outdoor venues and long queues change which layers earn bag space.",
        },
      ],
      mistakes: [
        { id: "new-kit", title: "Packing anything untested", body: "If it did not survive a simulation, it does not belong in the race bag." },
        { id: "overpack", title: "Bringing a spare everything", body: "Essentials plus a thin comfort layer beat a suitcase of options." },
        { id: "nutrition-new", title: "Debut gels or drinks on race day", body: "Gut timing belongs in training bricks." },
        { id: "forget-charge", title: "Assuming devices are charged", body: "Check watch and strap the night before, not in the call room." },
        { id: "ignore-weather", title: "Ignoring venue climate", body: "Indoor heat and outdoor wind need different layer plans." },
      ],
      faqAnswers: [
        "Prioritise tested footwear and chafe control, then confirm timing devices and simple layers for waiting and recovery.",
        "No. Optional comfort items only help when they do not encourage last-minute changes or slow you down.",
        "Beginners should keep the kit minimal—proven shoes, socks, clothing and a charged watch—before adding sensors and extras.",
        "Compare an essential race kit and an optional comfort kit by packing both once, then removing everything unused after a simulation.",
      ],
      quickAnswerBullets: [
        "Pack only gear that survived a full race simulation.",
        "Treat shoes, socks and chafe plan as non-negotiable essentials.",
        "Charge timing devices the night before with buffer for delays.",
        "Keep optional layers thin: warm-up top, dry post-race clothes, weather shell.",
      ],
      comparisonRows: [
        { label: "Bag weight", values: ["Light and fast to manage", "Heavier and decision-heavy", "Lean toward essentials"] },
        { label: "Risk profile", values: ["Low if fully rehearsed", "Higher if extras are untested", "Never add novelty on race morning"] },
        { label: "Best use", values: ["Most athletes, most events", "Harsh weather or long delays", "Add comfort only for known conditions"] },
      ],
      gains: ["Fewer race-morning decisions", "Lower equipment failure risk", "Faster call-room flow", "Consistent setup with training"],
      giveUps: ["Just-in-case options", "Fashion variety", "Last-minute experiments", "Heavy transition bags"],
      decisionSteps: [
        { id: "list", title: "Write the essentials list", body: "Shoes, socks, clothing, nutrition, timing, chafe care." },
        { id: "simulate", title: "Validate in a simulation", body: "Wear and use every item in a long brick." },
        { id: "trim", title: "Trim unused extras", body: "Remove anything you did not touch in the simulation." },
        { id: "charge", title: "Set a charge checklist", body: "Watch, strap and phone alarms the night before." },
        { id: "layers", title: "Add condition-specific layers", body: "Only for known weather or long outdoor waits." },
      ],
    },
  },
  {
    slug: "hyrox-race-shoes-vs-training-shoes",
    title: "HYROX Race Shoes vs Training Shoes",
    subject: "HYROX race and training shoes",
    goal: "decide whether one versatile pair or a deliberate rotation better fits your week",
    factors: ["Race efficiency", "Station stability", "Training durability", "Rotation practicality"],
    comparison: ["Race-biased shoe", "Durable training shoe"],
    products: ["prod-tyr-cxt-2", "prod-nike-metcon-9", "prod-boston-12"],
    tool: "hyrox-shoe-finder",
    bestHref: "/best/hyrox-shoes",
    bestLabel: "See best HYROX shoes →",
    unique: {
      definitionParas: [
        "Choosing between HYROX race and training shoes is a constraint-matching problem about weekly volume, not a single magic pair.",
        "A race-biased hybrid may feel livelier on event day but wear quickly if it also absorbs every sled session. A durable trainer may survive the gym yet leave run legs slower unless you accept that compromise—or rotate.",
        "Decide whether your calendar supports two roles or whether one versatile shoe must do both jobs without falling apart mid-block.",
      ],
      whyParas: [
        "Burning a race shoe on daily station abrasion shortens its useful life and changes the feel you wanted to protect for events.",
        "Conversely, racing in a dead training shoe can cost more time across eight kilometres than athletes expect from “just footwear.”",
      ],
      exampleWhys: [
        "A TYR CXT-class hybrid shows a race-day compromise shoe many athletes protect for events and key simulations.",
        "A Metcon-class trainer illustrates a durable station workhorse that may stay in the gym rotation.",
        "A Boston-class road shoe represents a run-biased option some athletes use for pure running days outside station work.",
      ],
      exampleTradeoffs: [
        "Softer foams and race-oriented outsoles can abrade faster on turf and rope.",
        "Excellent for stations but may feel slow if raced without a livelier pair available.",
        "Strong on road kilometres yet often poorly suited to heavy lateral station loading.",
      ],
      factorNotices: [
        "Event-day shoes feel flat because they already have hundreds of gym kilometres.",
        "The lively race pair tips on lunges when you have not practised stations in them.",
        "Outsoles bald after a few weeks of mixed training.",
        "Owning two pairs fails because you never remember which day uses which.",
      ],
      factorDetails: [
        {
          whatItIs: "How much run economy you want to preserve for race day.",
          howItChanges: "Competitive athletes often protect a fresher pair; beginners may prefer one do-everything shoe.",
        },
        {
          whatItIs: "Security during lunges, carries and sled work in the race pair.",
          howItChanges: "If the race shoe is unstable, it should not be a stranger on station day either—rehearse it.",
        },
        {
          whatItIs: "Foam and rubber life under gym abrasion and outdoor kilometres.",
          howItChanges: "High station frequency argues for a sacrificial trainer.",
        },
        {
          whatItIs: "Whether you will actually switch pairs according to session type.",
          howItChanges: "Complex rotations fail busy athletes; simpler rules stick.",
        },
      ],
      mistakes: [
        { id: "one-pair-abuse", title: "Destroying the race pair in daily Metcon-style work", body: "Save fresher foam for events if you care about run legs." },
        { id: "race-stranger", title: "Never training stations in the race shoe", body: "Familiarity beats saving a pair that feels alien under fatigue." },
        { id: "road-only", title: "Racing a pure road shoe without station tests", body: "Confirm lateral stability before committing." },
        { id: "rotation-chaos", title: "Inventing a four-shoe system you will not follow", body: "Two clear roles beat an unused closet collection." },
        { id: "ignoring-wear", title: "Ignoring outsole and foam wear signals", body: "Replace trainers before race block peaks, not after." },
      ],
      faqAnswers: [
        "Prioritise race efficiency and station stability for the event pair, then decide whether training durability requires a second shoe.",
        "No. A race-biased shoe is not always best for every session—many athletes rotate a durable trainer for gym volume.",
        "Beginners can start with one versatile pair; add a rotation only after abrasion or race-day needs become obvious.",
        "Compare a race-biased shoe and a durable training shoe across one hard brick and one normal gym week before buying both.",
      ],
      quickAnswerBullets: [
        "Protect a fresher pair for races only if you will still rehearse stations in it.",
        "Use a tougher trainer for high-abrasion gym volume when budget allows.",
        "Keep rotation rules simple: race sims versus daily station work.",
        "Retire shoes by wear and feel, not only by calendar age.",
      ],
      comparisonRows: [
        { label: "Best day", values: ["Events and key simulations", "High-volume gym days", "Assign roles explicitly"] },
        { label: "Wear rate", values: ["Often faster on foam/outsole", "Built for abuse", "Budget for replacement cycles"] },
        { label: "Familiarity need", values: ["Must still see station work", "Daily comfort", "Never race a total stranger shoe"] },
      ],
      gains: ["Fresher race-day foam", "Longer trainer life", "Clearer session intent", "Better late-race run feel"],
      giveUps: ["Extra cost", "More decisions", "Bag space", "Risk of unused pairs"],
      decisionSteps: [
        { id: "volume", title: "Count station sessions", body: "High abrasion weeks usually justify a trainer." },
        { id: "race", title: "Define the race pair role", body: "Hybrid efficiency plus enough stability for stations." },
        { id: "rule", title: "Write a simple rotation rule", body: "Example: gym volume in trainer; bricks and races in race pair." },
        { id: "rehearse", title: "Rehearse stations in race shoes", body: "At least several times before the event." },
        { id: "replace", title: "Plan replacement timing", body: "Do not enter a taper in fully dead foam." },
      ],
    },
  },
  {
    slug: "rowerg-vs-skierg-for-hyrox-training",
    title: "RowErg vs SkiErg for HYROX Training",
    subject: "a RowErg or SkiErg",
    goal: "buy the machine that closes the largest gap in your training access",
    factors: ["Race familiarity", "Room dimensions", "Movement demands", "Household usability"],
    comparison: ["RowErg", "SkiErg"],
    products: ["prod-concept2-rowerg", "prod-concept2-skierg", "prod-rogue-dog-sled"],
    bestHref: "/best/rowing-machines",
    bestLabel: "See best rowing machines →",
    unique: {
      definitionParas: [
        "Choosing between a RowErg and a SkiErg for HYROX is a constraint-matching problem about which race station you cannot train elsewhere.",
        "Both are flywheel ergometers with comparable branding, but they occupy different footprints and stress different movement patterns: horizontal pull versus overhead hinge-and-pull.",
        "Buy the erg that fills your largest access gap and fits the room. Owning both is a luxury; owning the wrong one first is a common budget error.",
      ],
      whyParas: [
        "Athletes who already row at a gym gain little from a home RowErg while still lacking ski practice, and the reverse is equally common.",
        "Room length often decides the purchase before preference does: a rower needs rail clearance a SkiErg does not.",
      ],
      exampleWhys: [
        "The Concept2 RowErg is the reference race rowing tool and a strong general conditioner when floor length exists.",
        "The Concept2 SkiErg shows the low-footprint overhead pull pattern that many home gyms can host against a wall.",
        "A sled example reminds buyers that neither erg replaces push–pull locomotion if that is actually the missing station.",
      ],
      exampleTradeoffs: [
        "Needs substantial clear length in use and storage planning for the rail.",
        "Requires mounting height or a freestanding stand and does not train the row station.",
        "Irrelevant to the erg choice if your true gap is sled access rather than ski or row.",
      ],
      factorNotices: [
        "You race one station confidently and dread the other you never train.",
        "The rower rail hits a wall or the SkiErg handle strikes the ceiling.",
        "Shoulders or low back complain because technique volume jumped overnight.",
        "Family members hate the noise, footprint or permanent wall mounts.",
      ],
      factorDetails: [
        {
          whatItIs: "Which of the two race ergs you currently under-practise.",
          howItChanges: "Buy to close the weaker station, not the one you already enjoy.",
        },
        {
          whatItIs: "Floor length for a rower versus wall height for a SkiErg.",
          howItChanges: "Short rooms strongly favour ski; long narrow rooms can host a rower.",
        },
        {
          whatItIs: "Posterior-chain rowing versus overhead ski patterning and grip.",
          howItChanges: "Injury history and skill level may steer which pattern you load at home.",
        },
        {
          whatItIs: "Noise, permanence and how easily others can use or avoid the machine.",
          howItChanges: "Shared homes often prefer the smaller visual footprint of a wall SkiErg.",
        },
      ],
      mistakes: [
        { id: "both-first", title: "Ordering both ergs before using one", body: "Live with the priority gap-filler for a training block first." },
        { id: "ignore-gym", title: "Ignoring gym machines you already access", body: "Home purchases should not duplicate reliable club equipment." },
        { id: "length", title: "Forgetting rower rail length", body: "Measure in-use length, not only folded marketing dimensions." },
        { id: "ceiling", title: "Skipping SkiErg handle height checks", body: "Tall athletes need clearance at full extension." },
        { id: "sled-gap", title: "Buying an erg when the sled is the real gap", body: "Be honest about which station limits your race." },
      ],
      faqAnswers: [
        "Prioritise race familiarity for the station you lack, then confirm the machine fits your room and household constraints.",
        "No. The more race-specific erg is the one you cannot already train—not whichever looks more popular online.",
        "Beginners should use gym ergs first when possible; buy home equipment only after a clear, repeated access gap appears.",
        "Compare RowErg and SkiErg against your room measurements and which race station currently limits you.",
      ],
      quickAnswerBullets: [
        "Buy the erg for the station you cannot train elsewhere.",
        "Measure rower length or SkiErg handle height before ordering.",
        "Treat Concept2 familiarity as useful, not mandatory marketing.",
        "Do not expect either machine to replace sled work.",
      ],
      comparisonRows: [
        { label: "Footprint", values: ["Long floor rail", "Wall or stand footprint", "Measure before preference"] },
        { label: "Race station", values: ["Row", "Ski", "Match your weaker event piece"] },
        { label: "Shared homes", values: ["Dominates floor visually", "Often easier to tuck", "Household veto matters"] },
      ],
      gains: ["Targeted station practice", "Measurable splits", "Home consistency", "Less gym dependence for that erg"],
      giveUps: ["The other erg’s pattern", "Floor or wall space", "Noise and upkeep", "Budget that could buy other gaps"],
      decisionSteps: [
        { id: "weak", title: "Name the weaker erg station", body: "Row versus ski based on race history or gym access." },
        { id: "room", title: "Measure the candidate space", body: "Rail length or handle height plus walkways." },
        { id: "access", title: "Confirm gym alternatives", body: "Skip the purchase if club access is already reliable." },
        { id: "choose", title: "Pick one erg first", body: "Order the gap-filler only." },
        { id: "review", title: "Reassess after a block", body: "Only then consider the second erg or a sled." },
      ],
    },
  },
  {
    slug: "what-gear-do-you-need-for-hyrox",
    title: "What Gear Do You Need for HYROX?",
    subject: "HYROX gear",
    goal: "prioritise what you wear and use often before buying large station equipment",
    factors: ["Race essentials", "Gym access", "Training frequency", "Home constraints"],
    comparison: ["Personal race gear", "Training equipment"],
    products: ["prod-tyr-cxt-2", "prod-forerunner-965", "prod-concept2-rowerg"],
    tool: "hyrox-race-kit-builder",
    bestHref: "/hyrox/gear",
    bestLabel: "Browse HYROX gear →",
    unique: {
      definitionParas: [
        "Choosing what gear you need for HYROX is a constraint-matching problem that separates personal essentials from facility equipment.",
        "You must own shoes, clothing and usually a timing device. Sleds, ergs and competition turf are facility problems unless your training access forces a home purchase.",
        "Rank purchases by how often they touch your body or your weekly sessions—not by how impressive they look in a garage photoshoot.",
      ],
      whyParas: [
        "Athletes regularly overspend on machines while racing in blistering shoes or untested clothing that actually decide comfort across eight cycles.",
        "A clear essentials-first list prevents affiliate-driven shopping lists from dictating a budget that should have gone to coaching, entries or recovery.",
      ],
      exampleWhys: [
        "Hybrid shoes exemplify high-frequency personal gear that affects every run and station.",
        "A sports watch shows the timing tool most athletes eventually want for splits and training review.",
        "A RowErg represents large training equipment that only belongs on the list after essentials and gym gaps are clear.",
      ],
      exampleTradeoffs: [
        "Still a purchase—but usually higher leverage than a premature erg.",
        "Optional for pure beginners who only need a simple timer initially.",
        "High cost and space demand; wrong as a first buy for most new athletes.",
      ],
      factorNotices: [
        "Race day hurts because shoes or clothing were the budget leftovers.",
        "You buy home machines that duplicate a gym you already attend four days a week.",
        "Specialist kit sits idle because you train inconsistently.",
        "Apartment limits make large equipment purchases instantly regretful.",
      ],
      factorDetails: [
        {
          whatItIs: "Shoes, socks, clothing, nutrition and basic timing you personally control.",
          howItChanges: "Every athlete needs these; skimping here to fund machines is backwards.",
        },
        {
          whatItIs: "Which stations your membership or drop-in gym already provides.",
          howItChanges: "Strong access shrinks the shopping list to personal kit.",
        },
        {
          whatItIs: "How many HYROX-specific sessions you truly complete each week.",
          howItChanges: "Low frequency cannot amortise expensive home equipment.",
        },
        {
          whatItIs: "Noise, storage and floor rules that gate large purchases.",
          howItChanges: "Many athletes should stay essentials-only until housing changes.",
        },
      ],
      mistakes: [
        { id: "machines-first", title: "Buying ergs before race shoes", body: "Personal kit contacts every session; machines do not." },
        { id: "full-list", title: "Treating influencer checklists as mandatory", body: "Affiliate-neutral priorities beat complete garage builds." },
        { id: "no-gym-audit", title: "Skipping a gym access audit", body: "Know what you already can use before shopping." },
        { id: "entry-last", title: "Funding kit instead of coaching or entries", body: "Skill and race experience often return more than another machine." },
        { id: "orphan-buy", title: "Owning equipment without a weekly plan", body: "Gear without scheduled use is decoration." },
      ],
      faqAnswers: [
        "Prioritise race essentials you wear every session, then factor gym access before any large training equipment.",
        "No. Personal race gear is usually the higher-leverage first spend; machines only win when access and housing clearly require them.",
        "Beginners should buy tested personal essentials first and delay specialised equipment until training frequency and gaps are proven.",
        "Compare personal race gear and training equipment by asking which purchase increases completed sessions in the next month.",
      ],
      quickAnswerBullets: [
        "Own shoes, clothing and basic timing before any home erg or sled.",
        "Audit gym station access so you do not duplicate machines.",
        "Spend on frequency: kit that enables more completed sessions.",
        "Treat large equipment as conditional on housing and schedule, not status.",
      ],
      comparisonRows: [
        { label: "Who needs it", values: ["Every athlete", "Only if access/housing demand it", "Essentials first"] },
        { label: "Cost leverage", values: ["High per session", "High absolute cost", "Amortise against real use"] },
        { label: "Failure mode", values: ["Blisters and chaos", "Idle expensive machines", "Avoid both by sequencing buys"] },
      ],
      gains: ["Smarter budget order", "Fewer idle purchases", "Better race comfort", "Clearer next buy"],
      giveUps: ["Garage aesthetics", "Complete station ownership", "Impulse machine deals", "One-cart outfitters"],
      decisionSteps: [
        { id: "essentials", title: "Lock personal essentials", body: "Shoes, socks, clothing, nutrition, simple timing." },
        { id: "audit", title: "Audit gym access", body: "List stations already covered nearby." },
        { id: "frequency", title: "Check training frequency", body: "Expensive kit needs weekly use to make sense." },
        { id: "housing", title: "Apply housing constraints", body: "Noise and space veto large buys regardless of desire." },
        { id: "next", title: "Choose one next purchase", body: "The item that most increases completed quality sessions." },
      ],
    },
  },
];

function makePlan(spec: HyroxSpec): CompactExplainerPlan {
  const toolHref = spec.tool ? `/tools/${spec.tool}` : spec.bestHref;
  const u = spec.unique;
  const factorCards = spec.factors.map((title, index) => ({
    id: `factor-${index + 1}`,
    title,
    whatItIs: u.factorDetails[index].whatItIs,
    howItChanges: u.factorDetails[index].howItChanges,
    whatYouNotice: u.factorNotices[index],
  }));
  const examples = spec.products.map((productId, index) => ({
    productId,
    approachLabel: ["Purpose-built priority", "Balanced alternative", "Different constraint"][index],
    whyIllustrates: u.exampleWhys[index],
    bestFor: [spec.factors[index], index === 0 ? "Race specificity" : "Training versatility"],
    tradeoff: u.exampleTradeoffs[index],
  }));

  return {
    slug: spec.slug,
    displayTitle: spec.title,
    deck: `A practical framework to ${spec.goal}, with clear factors, tradeoffs and real catalog examples.`,
    eyebrow: "Buying Guide",
    ...resolveHeroFromProductIds(
      spec.products,
      "/images/home/guide-home-gym.jpg",
      `Athlete considering ${spec.subject} for HYROX training`,
    ),
    quickAnswerBullets: [...u.quickAnswerBullets],
    methodologyNote:
      "Official race format and loads are kept separate from product marketing. Catalog examples demonstrate approaches rather than unverified race equivalence.",
    finder: spec.tool
      ? {
          toolSlug: spec.tool,
          title: `Shortlist ${spec.subject}`,
          description: "Turn your constraints into a focused next step.",
          ctaLabel: "Use the tool →",
        }
      : undefined,
    decisionLinks: [
      { label: spec.tool ? "Open the relevant tool →" : spec.bestLabel, href: toolHref },
      { label: spec.bestLabel, href: spec.bestHref },
      { label: "Browse HYROX gear →", href: "/hyrox/gear" },
    ],
    definition: {
      title: `What choosing ${spec.subject} really means`,
      intro: `The right choice helps you ${spec.goal}.`,
      paragraphs: [...u.definitionParas],
    },
    whyItMatters: {
      title: "Why this decision changes your week",
      paragraphs: [...u.whyParas],
    },
    factors: {
      title: "Four factors that drive the decision",
      intro: "Score each factor against your real environment before comparing models.",
      cards: factorCards,
    },
    comparison: {
      title: `${spec.comparison[0]} vs ${spec.comparison[1]}`,
      columns: [spec.comparison[0], spec.comparison[1], "Decision cue"],
      rows: u.comparisonRows.map((row) => ({ label: row.label, values: [...row.values] })),
      footnote: "Compare the same training scenario; category labels alone do not predict suitability.",
    },
    tradeoffs: {
      title: "What greater specificity gives—and costs",
      gains: [...u.gains],
      giveUps: [...u.giveUps],
    },
    callouts: spec.slug.includes("heart-rate")
      ? [
          {
            id: "medical-limit",
            title: "Heart-rate data is not a diagnosis",
            body: "Consumer sensors can guide training trends but cannot diagnose or exclude a medical condition. Seek qualified care for symptoms or concerning readings.",
            tone: "caution",
          },
        ]
      : [
          {
            id: "specificity-limit",
            title: "Do not claim race equivalence from equipment alone",
            body: "Sled resistance changes with surface and setup, while local machine condition and calibration also vary. Use official standards for event facts and measured training outcomes for progression.",
            tone: "caution",
          },
        ],
    decision: {
      title: "A five-step decision",
      steps: u.decisionSteps,
      branches: {
        question: "What is your strongest constraint?",
        options: [
          {
            label: "Race specificity",
            result: `Start with ${spec.comparison[0].toLowerCase()} and verify its practical requirements.`,
          },
          {
            label: "Versatility",
            result: `Start with ${spec.comparison[1].toLowerCase()} and confirm it still covers the key demand.`,
          },
          {
            label: "Space or access",
            result: "Prefer personal kit and use a gym for large station equipment.",
          },
        ],
      },
    },
    examples: {
      title: `Three approaches to ${spec.subject}`,
      disclaimer:
        "Examples illustrate different priorities, not a ranking. Check current specifications, fit, availability and event rules.",
      items: examples,
    },
    compareProductIds: spec.products,
    bestGuideHref: spec.bestHref,
    bestGuideLabel: spec.bestLabel,
    mistakes: u.mistakes,
    ctaFinder: {
      title: spec.tool ? "Build a focused shortlist" : "Apply the framework to current gear",
      body: "Use your hard constraints before comparing optional features.",
      ctaLabel: spec.tool ? "Open the tool →" : spec.bestLabel,
      href: toolHref,
    },
    ctaBest: {
      title: "Compare current catalog options",
      body: "Review current products only after defining the role they must fill.",
      ctaLabel: spec.bestLabel,
      href: spec.bestHref,
    },
    productExampleRoles: spec.products.map((productId, index) => ({
      productId,
      roleLabel: examples[index].approachLabel,
    })),
    productRailTitle: `Examples for ${spec.subject}`,
    productRailBrowseHref: "/hyrox/gear",
    productRailBrowseLabel: "Browse HYROX gear →",
  };
}

export const HYROX_PLANS: CompactExplainerPlan[] = HYROX_SPECS.map(makePlan);

export const hyroxConfigs = HYROX_PLANS.map(buildExplainerFromPlan);

export const hyroxFaqs: FAQ[] = HYROX_SPECS.flatMap((spec) => [
  {
    id: `faq-${spec.slug}-1`,
    question: `What should I prioritise when choosing ${spec.subject}?`,
    answer: spec.unique.faqAnswers[0],
    sportId: "sport-hyrox",
  },
  {
    id: `faq-${spec.slug}-2`,
    question: `Is the most race-specific ${spec.subject} always best?`,
    answer: spec.unique.faqAnswers[1],
    sportId: "sport-hyrox",
  },
  {
    id: `faq-${spec.slug}-3`,
    question: `Should beginners buy ${spec.subject} immediately?`,
    answer: spec.unique.faqAnswers[2],
    sportId: "sport-hyrox",
  },
  {
    id: `faq-${spec.slug}-4`,
    question: `How should I compare options for ${spec.subject}?`,
    answer: spec.unique.faqAnswers[3],
    sportId: "sport-hyrox",
  },
]);

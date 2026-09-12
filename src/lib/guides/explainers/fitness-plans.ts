import {
  buildExplainerFromPlan,
  type CompactExplainerPlan,
} from "@/lib/guides/build-explainer-from-plan";
import { resolveHeroFromProductIds } from "@/lib/guides/guide-product-hero";

type ProductExample = readonly [
  productId: string,
  role: string,
  why: string,
  tradeoff: string,
];

interface FitnessPlanSeed {
  slug: string;
  title: string;
  deck: string;
  bullets: string[];
  definition: [string, string, string];
  why: [string, string];
  factors: Array<{
    name: string;
    what: string;
    changes: string;
    notice: string;
  }>;
  comparison: {
    columns: [string, string];
    rows: Array<[string, string, string]>;
  };
  gains: string[];
  giveUps: string[];
  caution: string;
  steps: Array<[string, string]>;
  products: [ProductExample, ProductExample, ProductExample];
  mistakes: Array<[string, string]>;
  faqs: Array<[string, string]>;
  finder?: {
    slug: string;
    title: string;
    body: string;
    label: string;
  };
  hero?: string;
  sportId?: "sport-training" | "sport-calisthenics";
}

const HOME_GYM_HERO = "/images/home/guide-home-gym.jpg";
const CHOOSING_HERO = "/images/home/guide-home-gym.jpg";
const SHOE_HERO = "/images/home/guide-running-shoes.jpg";

const seeds: FitnessPlanSeed[] = [
  {
    slug: "adjustable-vs-fixed-dumbbells",
    title: "Adjustable vs Fixed Dumbbells",
    deck: "Choose the format that fits your room, training pace and tolerance for moving parts.",
    bullets: [
      "Adjustable dumbbells replace several pairs with one compact set.",
      "Fixed dumbbells make weight changes faster and tolerate busy-gym handling better.",
      "The usable weight range matters more than the number of advertised settings.",
      "Measure the handles and storage area, not only the cradle footprint.",
    ],
    definition: [
      "Adjustable dumbbells use a selector, dial or locking mechanism to load several weights onto one handle. Most sit in a cradle while the setting changes.",
      "Fixed dumbbells keep one weight permanently attached to each handle. Building a useful progression requires several pairs and usually a rack.",
      "Neither format is universally better. The right answer follows from floor space, session style, target loads and how gently the equipment will be handled.",
    ],
    why: [
      "Dumbbells earn their space because they cover pressing, rowing, carries, split squats and accessories. A poor format choice adds friction to nearly every session.",
      "Apartment users often value compact storage, while supersets and shared gyms reward instant changes and simple construction.",
    ],
    factors: [
      { name: "Weight range", what: "The lightest, heaviest and intermediate settings.", changes: "It determines which movements and future strength levels the set can cover.", notice: "Large jumps are most obvious on raises, curls and rehab-style accessory work." },
      { name: "Change speed", what: "How the load is selected between sets.", changes: "Fast systems suit circuits; slower plates suit deliberate strength work.", notice: "Supersets expose awkward selectors quickly." },
      { name: "Handle geometry", what: "Handle length, diameter and balance at each setting.", changes: "Some adjustable handles stay long even at low loads.", notice: "Long handles can clash during curls, presses and goblet holds." },
      { name: "Durability", what: "Tolerance for drops, impacts and mechanism wear.", changes: "Fixed heads have fewer failure points; adjustable systems need controlled handling.", notice: "A damaged cradle or selector can interrupt the whole set." },
      { name: "Storage", what: "The operating and stored footprint.", changes: "A fixed collection grows with every added pair.", notice: "Allow room to stand over and lift adjustable bells cleanly from their cradles." },
    ],
    comparison: {
      columns: ["Adjustable", "Fixed"],
      rows: [
        ["Space", "One compact station", "Rack space grows with range"],
        ["Weight changes", "Mechanism-dependent", "Immediate pair swap"],
        ["Durability", "Avoid drops unless approved", "Usually simpler and tougher"],
        ["Up-front cost", "Higher per handle", "Lower per pair, higher for a full run"],
      ],
    },
    gains: ["Major space saving", "Broad progression in one purchase", "Tidy home storage"],
    giveUps: ["More moving parts", "Possible handle compromises", "Slower changes on some systems"],
    caution: "Do not drop an adjustable dumbbell unless its manufacturer explicitly permits it. Internal selectors can be damaged even when the outer plates look fine.",
    steps: [
      ["List your movements", "Write down the lightest accessory and heaviest compound loads you actually use."],
      ["Set the range", "Choose a maximum with sensible room to progress, without buying unusable top-end weight."],
      ["Check increments", "Confirm the jumps are small enough for your lighter movements."],
      ["Test the handle", "Check length, grip and balance at both low and high settings."],
      ["Measure storage", "Include cradle access and safe lifting space."],
      ["Match the pace", "Choose fixed pairs if fast circuits and repeated changes dominate."],
    ],
    products: [
      ["prod-nuobell-80", "Quick-change adjustable", "Shows a compact twist-selection approach with a broad range.", "Complex mechanism needs controlled handling."],
      ["prod-powerblock-pro-100", "Expandable adjustable", "Illustrates a selector-pin block format with expansion potential.", "Block geometry feels different from a conventional dumbbell."],
      ["prod-bowflex-552", "Accessible adjustable", "Represents a widely recognised dial-based home option.", "Maximum load may limit stronger compound work."],
    ],
    mistakes: [
      ["Buying only for today", "Leave realistic progression room for rows, presses and split squats."],
      ["Ignoring minimum weight", "A high maximum does not help if the first setting is too heavy for accessories."],
      ["Assuming every system can be dropped", "Follow the specific handling guidance for the model."],
      ["Forgetting cradle access", "Stored dimensions do not include room for your hands and stance."],
      ["Chasing setting count", "Useful increments and reliable changes matter more than a large marketing number."],
    ],
    faqs: [
      ["Are adjustable dumbbells worth it for a home gym?", "They are often worth it when space is limited and one set covers your working range. Fixed pairs remain better for very fast changes or rough handling."],
      ["Can adjustable dumbbells replace a full rack?", "For many home users, yes. Check the minimum load, maximum load and increment pattern against every movement in your programme."],
      ["Why do adjustable dumbbells feel different?", "Handle length, plate shape and balance can stay different from a fixed dumbbell, especially at lighter settings."],
      ["How much room do adjustable dumbbells need?", "Allow the cradle footprint plus clear standing, bending and lifting room around it."],
    ],
    finder: { slug: "adjustable-dumbbell-finder", title: "Narrow the adjustable options", body: "Match range, increments and storage to your training.", label: "Use the dumbbell finder" },
  },
  {
    slug: "bumper-plates-vs-iron-plates",
    title: "Bumper Plates vs Iron Plates",
    deck: "Match plate material to how you lift, what your floor can support and how much sleeve space you need.",
    bullets: [
      "Use bumper plates for lifts that are intentionally returned to a suitable platform.",
      "Iron plates are thinner, so more weight fits on the bar.",
      "Bumpers reduce impact severity but do not make dropping safe or quiet.",
      "Both formats must match the bar sleeve diameter and room constraints.",
    ],
    definition: [
      "Bumper plates are full-diameter plates made primarily from rubber or urethane around a metal hub. Different weights generally share the same outside diameter.",
      "Iron plates are cast or machined metal plates. Lighter iron plates are usually smaller in diameter, and the profile is generally thinner.",
      "The choice is about use, not status: lifting from the floor and controlled drops favour bumpers, while compact storage and sleeve capacity favour iron.",
    ],
    why: [
      "Plate choice affects floor impact, bar loading, storage depth and the starting height of pulls from the floor.",
      "It also changes the total system: platform, collars, bar sleeves and neighbour noise should be considered together.",
    ],
    factors: [
      { name: "Drop use", what: "Whether loaded lifts will be returned from height.", changes: "Bumpers are designed for platform use; iron is intended for controlled placement.", notice: "Olympic lifting makes this the first decision." },
      { name: "Plate thickness", what: "How much bar sleeve each plate occupies.", changes: "Thick bumpers reach sleeve limits sooner.", notice: "Heavy deadlifts can run out of loading space." },
      { name: "Diameter", what: "The outside size that sets bar height from the floor.", changes: "Full-size bumpers standardise pull height across weights.", notice: "Small iron plates lower the bar unless a full-size pair is loaded." },
      { name: "Noise and floor", what: "Impact path through plates, platform and structure.", changes: "Rubber softens contact but cannot isolate structural vibration.", notice: "Upstairs and attached-room gyms expose impact quickly." },
      { name: "Storage", what: "Peg length, rack depth and plate handling.", changes: "Iron packs tightly; bumpers require more storage width.", notice: "A mixed set can solve both technique and heavy-loading needs." },
    ],
    comparison: {
      columns: ["Bumper plates", "Iron plates"],
      rows: [
        ["Intended return", "Suitable platform drops by design", "Controlled placement"],
        ["Thickness", "Usually thicker", "Usually thinner"],
        ["Diameter", "Typically full diameter", "Varies with weight"],
        ["Best fit", "Olympic lifts and floor pulls", "Powerlifting and compact storage"],
      ],
    },
    gains: ["Consistent floor-lift height", "Better fit for Olympic lifting", "Rubber contact surface"],
    giveUps: ["More sleeve and storage space", "Rubber odour on some plates", "Impact still travels through floors"],
    caution: "Bumper plates are not permission to drop anywhere. Use a suitable bar, collars and lifting platform, and confirm the room can tolerate repeated impact.",
    steps: [
      ["Define the lifts", "Prioritise bumpers if cleans, snatches or returned overhead lifts are central."],
      ["Inspect the floor", "Plan a platform and check what lies below or beside the room."],
      ["Estimate top load", "Confirm the chosen plate thickness fits your bar sleeves."],
      ["Measure storage", "Budget enough peg or tree width for the complete set."],
      ["Choose increments", "Add useful change plates or small iron plates for progression."],
      ["Consider a mixed set", "Use bumpers for floor height and iron for compact additional loading when appropriate."],
    ],
    products: [
      ["prod-eleiko-sport-bumper", "Premium bumper example", "Shows a full-diameter Olympic-lifting format.", "Premium pricing is unnecessary for many basic home setups."],
      ["prod-mirafit-bumper-set", "Value bumper example", "Illustrates a home-gym bumper set with UK/EU availability.", "Bumpers still consume more sleeve space than iron."],
      ["prod-atx-cast-iron-set", "Compact iron example", "Shows why iron appeals for rack storage and strength work.", "Not intended for dropped Olympic lifts."],
    ],
    mistakes: [
      ["Treating rubber as soundproofing", "Impact vibration can still travel through the building."],
      ["Ignoring sleeve length", "Check how many of the thickest plates fit with collars."],
      ["Using small plates for floor pulls", "Confirm starting height rather than assuming every plate is full diameter."],
      ["Skipping a platform", "Protect both the equipment and the floor with a suitable lifting surface."],
      ["Buying mismatched bores", "Confirm plate holes fit the bar sleeves before ordering."],
    ],
    faqs: [
      ["Are bumper plates quieter than iron plates?", "They usually reduce sharp metal contact, but repeated drops still create substantial noise and structural vibration."],
      ["Can you deadlift with iron plates?", "Yes. Control the return and ensure the loaded bar starts at the intended height."],
      ["Can bumper and iron plates be mixed?", "Yes, when diameters, sleeve fit and loading are compatible. Keep full-size plates supporting the floor contact."],
      ["Why are bumper plates thicker?", "Rubber needs more volume than dense metal to provide the same mass and tolerate impact."],
    ],
  },
  {
    slug: "how-much-space-do-you-need-for-a-home-gym",
    title: "How Much Space Do You Need for a Home Gym?",
    deck: "Plan the movement envelope, not just the equipment footprint.",
    bullets: [
      "A compact dumbbell zone can work in a few clear square metres.",
      "Rack training needs bar-loading width, ceiling clearance and room behind safeties.",
      "Cardio machines need operating and access space beyond listed dimensions.",
      "Map doors, slopes, sockets and neighbour-facing walls before buying.",
    ],
    definition: [
      "Home-gym space is the clear three-dimensional envelope needed to store equipment, enter it and perform each movement without contact.",
      "Product dimensions describe the machine or rack, not bar overhang, plate loading, bench movement, walking access or body travel.",
      "There is no single minimum room size. A useful room is one whose geometry supports the sessions you plan to repeat.",
    ],
    why: [
      "A layout can fit on paper and still fail when a bar cannot be loaded or a treadmill blocks the only door.",
      "Planning clearances first prevents expensive returns and makes the room easier to use consistently.",
    ],
    factors: [
      { name: "Ceiling height", what: "Floor-to-lowest-obstruction clearance.", changes: "It limits rack height, pull-ups, overhead work and raised treadmill running.", notice: "Lights, beams and open garage doors reduce usable height." },
      { name: "Working width", what: "Equipment width plus hands, plates and loading access.", changes: "A barbell usually sets the widest strength-training envelope.", notice: "Wall clearance that fits the bar may still block plate changes." },
      { name: "Working depth", what: "Machine length plus entry and movement paths.", changes: "Benches slide in and out of racks; rowers and treadmills extend deeply.", notice: "Folded size is irrelevant during a workout." },
      { name: "Circulation", what: "Clear routes to doors, storage and emergency exits.", changes: "Permanent equipment can divide a small room.", notice: "Avoid stepping over bars or benches between sets." },
      { name: "Structure and noise", what: "Floor capacity, vibration path and nearby occupants.", changes: "Heavy static load and repeated impact are different problems.", notice: "Upper floors and shared walls need conservative equipment choices." },
    ],
    comparison: {
      columns: ["Compact setup", "Full rack setup"],
      rows: [
        ["Core equipment", "Adjustable dumbbells and bench", "Rack, bar, plates and bench"],
        ["Main constraint", "Clear exercise floor", "Height and bar-loading width"],
        ["Storage", "Vertical or cradle storage", "Plate, bar and attachment storage"],
        ["Expansion", "Swap pieces", "Plan zones before adding machines"],
      ],
    },
    gains: ["A layout matched to real sessions", "Safer circulation", "A clear expansion path"],
    giveUps: ["Not every equipment category will fit", "Clearances reduce headline capacity", "Multipurpose rooms require reset time"],
    caution: "Do not rely on visual estimates for floor capacity, wall structure or ceiling fixings. Obtain qualified advice where structural suitability is uncertain.",
    steps: [
      ["Draw the room", "Record wall-to-wall dimensions and ceiling height in millimetres."],
      ["Mark obstacles", "Add doors, windows, radiators, sockets, beams and garage-door travel."],
      ["List movements", "Include the body and implement path for every planned exercise."],
      ["Place anchors", "Position the rack or largest cardio machine first."],
      ["Add operating clearance", "Model bar loading, bench movement, mounting and access."],
      ["Walk the plan", "Tape it on the floor and rehearse the route before ordering."],
    ],
    products: [
      ["prod-rogue-rml-390f", "Rack footprint example", "Shows why rack height, depth and bar width must be planned together.", "A listed footprint excludes all working clearance."],
      ["prod-nuobell-80", "Compact strength example", "Shows how one adjustable pair can preserve open floor.", "Cradles still need accessible lifting space."],
      ["prod-rep-ab-5000", "Movable bench example", "Illustrates equipment that needs both use and parking positions.", "A substantial bench can dominate a narrow room."],
    ],
    mistakes: [
      ["Using floor area alone", "Height and usable width can disqualify a room that has enough square metres."],
      ["Measuring only stored size", "Plan every item in its full operating state."],
      ["Forgetting the barbell", "Add sleeve overhang and plate-loading access around a rack."],
      ["Blocking circulation", "Keep doors and safe exit paths clear."],
      ["Planning accessories first", "Place the largest essential equipment before filling spare walls."],
    ],
    faqs: [
      ["Can a home gym fit in a small bedroom?", "A dumbbell-and-bench setup often can, provided movement, floor and access clearances work."],
      ["How much ceiling clearance does a rack need?", "Use the rack's published height plus clearance for installation, pull-ups and any overhead movement."],
      ["Do folding machines need less workout space?", "They need less storage space, but usually require their full open footprint while operating."],
      ["Should I leave space around a power rack?", "Yes. Allow room for the bar, plate loading, bench movement, attachments and safe entry."],
    ],
    finder: { slug: "home-gym-builder", title: "Test the room before buying", body: "Lay out real product footprints and operating clearances in millimetres.", label: "Open Home Gym Builder" },
  },
  {
    slug: "how-to-build-a-home-gym",
    title: "How to Build a Home Gym",
    deck: "Start with the training you will repeat, then buy the smallest reliable setup that supports it.",
    bullets: [
      "Define sessions and constraints before choosing brands.",
      "Flooring, clearances and safe load handling come before accessories.",
      "Buy in layers: core resistance, progression, then conditioning.",
      "Reserve budget for storage, delivery and installation.",
    ],
    definition: [
      "Building a home gym means turning a room and a training plan into a compatible equipment system.",
      "The system includes floor protection, working clearances, resistance, progression, storage and any required mounting—not just headline products.",
      "A good build is intentionally incomplete at first. It earns additions by exposing a repeated training need.",
    ],
    why: [
      "A focused setup removes travel and waiting, but poor planning can replace those frictions with clutter and unusable equipment.",
      "Sequencing purchases protects the budget and keeps the room adaptable while your training changes.",
    ],
    factors: [
      { name: "Training brief", what: "Your weekly movements, loads and session style.", changes: "It determines whether dumbbells, a rack or cardio deserves the anchor position.", notice: "Buy for repeated sessions, not hypothetical variety." },
      { name: "Room envelope", what: "Usable width, depth, height and access.", changes: "It filters equipment before price or brand.", notice: "Delivery routes can be tighter than the finished room." },
      { name: "Progression", what: "How resistance increases over time.", changes: "Small jumps matter for some movements; sleeve capacity matters for others.", notice: "A cheap setup becomes costly if it cannot grow." },
      { name: "Safety system", what: "Safeties, stable surfaces and controlled storage.", changes: "Solo lifting needs dependable failure options.", notice: "Test setup and adjustment at light loads first." },
      { name: "Ecosystem", what: "Compatible attachments, storage and replacement parts.", changes: "Rack dimensions and hole patterns can lock future choices.", notice: "Same-brand does not automatically mean same-series fit." },
    ],
    comparison: {
      columns: ["Dumbbell-first", "Rack-first"],
      rows: [
        ["Space", "Compact and flexible", "Dedicated strength zone"],
        ["Core lifts", "Unilateral and dumbbell work", "Barbell squat, bench and pulls"],
        ["Expansion", "Bench and heavier set", "Plates, attachments and storage"],
        ["Complexity", "Low", "Higher setup and clearance needs"],
      ],
    },
    gains: ["Training access on your schedule", "Equipment matched to your programme", "Long-term modular expansion"],
    giveUps: ["Up-front planning and delivery work", "Space committed to training", "Maintenance and organisation are yours"],
    caution: "Mounting, floor loading and electrical work can exceed a DIY check. Use qualified installation or structural advice whenever the substrate or capacity is uncertain.",
    steps: [
      ["Write the programme", "Identify the movements and load ranges used most weeks."],
      ["Audit the room", "Measure geometry, structure, noise constraints and delivery access."],
      ["Set a complete budget", "Include flooring, storage, collars, delivery and installation."],
      ["Choose the anchor", "Start with adjustable dumbbells or a rack based on the programme."],
      ["Add progression", "Buy the plates, increments or expansion needed for the next year."],
      ["Train before expanding", "Use the core setup long enough to expose a genuine gap."],
    ],
    products: [
      ["prod-rep-pr-4000", "Rack-first anchor", "Illustrates a modular power-rack foundation.", "Requires substantial room and ecosystem planning."],
      ["prod-nuobell-80", "Dumbbell-first anchor", "Shows a compact route to broad strength training.", "Not designed for careless drops."],
      ["prod-rep-ab-5000", "Bench foundation", "Illustrates a stable pressing and accessory platform.", "Needs a separate parking position in small rooms."],
    ],
    mistakes: [
      ["Buying a bundle without a programme", "Start from movements and loads, then select the system."],
      ["Spending the flooring budget", "The room needs an appropriate surface before premium accessories."],
      ["Ignoring delivery access", "Measure stairs, turns and doorways as well as the gym."],
      ["Mixing rack standards", "Verify upright, hole and attachment compatibility exactly."],
      ["Expanding too early", "Train with the core setup before filling every wall."],
    ],
    faqs: [
      ["What should I buy first for a home gym?", "For many people, adjustable dumbbells and a bench are the leanest start; barbell-focused programmes may justify a rack first."],
      ["How much should I budget beyond equipment?", "Reserve money for flooring, storage, collars, delivery, assembly and any professional installation."],
      ["Do I need a power rack?", "Only if your repeated training needs barbell work and your room supports the required clearances and safety setup."],
      ["When should I add cardio equipment?", "Add it after the strength layout is stable and you can identify a repeated cardio need that the room can support."],
    ],
    finder: { slug: "home-gym-builder", title: "Build the layout in millimetres", body: "Check products, clearances and room geometry before checkout.", label: "Plan my home gym" },
  },
  {
    slug: "how-to-choose-a-home-treadmill",
    title: "How to Choose a Home Treadmill",
    deck: "Choose for your fastest regular session, available floor and tolerance for noise—not the console.",
    bullets: [
      "Separate walking, steady running and sprint-conditioning requirements.",
      "Folding reduces storage size, not operating length.",
      "Check deck area, rated user limit, speed and incline together.",
      "Plan delivery, power, ventilation and service access.",
    ],
    definition: [
      "A home treadmill is a powered or self-powered moving deck sized and configured for residential use.",
      "Motorised treadmills control belt speed for walking and running; curved treadmills respond to the user's position and effort.",
      "The right model is the one that sustains your real sessions within the room, electrical and noise constraints.",
    ],
    why: [
      "A treadmill that technically reaches a target speed may still feel cramped, unstable or impractical for repeated mileage.",
      "Large machines are difficult to return, so delivery geometry and operating space deserve the same attention as performance.",
    ],
    factors: [
      { name: "Session type", what: "Walking, jogging, intervals or self-powered sprint work.", changes: "It sets the required deck, speed control and machine format.", notice: "Buy for the hardest session performed regularly." },
      { name: "Deck space", what: "Usable belt length and width.", changes: "Faster running generally benefits from more margin.", notice: "Overall dimensions do not reveal usable belt area." },
      { name: "Drive and speed", what: "Motorised speed control or curved self-propulsion.", changes: "Motorised decks suit pace targets; curves suit responsive effort.", notice: "The two formats feel materially different." },
      { name: "Room fit", what: "Open footprint, folded footprint and overhead clearance.", changes: "Incline and running posture can reduce headroom.", notice: "Leave entry and service space around the machine." },
      { name: "Noise and service", what: "Footfall, motor, rollers, maintenance and support.", changes: "A quiet motor cannot remove impact noise.", notice: "Local service availability matters for a heavy machine." },
    ],
    comparison: {
      columns: ["Motorised", "Curved self-powered"],
      rows: [
        ["Pacing", "Set belt speed", "User controls speed by effort"],
        ["Best fit", "Walking and repeatable running", "Intervals and sprint conditioning"],
        ["Power", "Electrical supply required", "No drive motor"],
        ["Storage", "Folding models available", "Usually fixed and heavy"],
      ],
    },
    gains: ["Weather-independent sessions", "Controlled pace and incline", "Immediate home access"],
    giveUps: ["Large operating footprint", "Footfall and mechanical noise", "Delivery and maintenance burden"],
    caution: "Confirm the electrical circuit, ventilation and floor are suitable for the selected machine. Keep the safety key and clear rear space specified by the manufacturer.",
    steps: [
      ["Define the hardest session", "Use your regular top speed, duration and incline—not an aspirational maximum."],
      ["Measure the open layout", "Include access, rear clearance and raised-deck headroom."],
      ["Check the deck", "Compare usable belt dimensions, not only machine dimensions."],
      ["Confirm capacity", "Use the published user limit with sensible margin."],
      ["Plan delivery and power", "Measure the route and identify the correct outlet."],
      ["Check support", "Review warranty terms, servicing access and regional parts availability."],
    ],
    products: [
      ["prod-sole-f80", "Regular home running", "Shows a folding motorised option aimed at sustained mileage.", "Large and heavy even though it folds."],
      ["prod-horizon-t202", "Walking and jogging", "Illustrates a lower-cost folding approach for smaller spaces.", "Not positioned for demanding sprint work."],
      ["prod-assault-runner", "Curved conditioning", "Shows a self-powered format for intervals and sprint-style work.", "Premium price and fixed operating footprint."],
    ],
    mistakes: [
      ["Shopping by screen size", "Deck, drive, room fit and support affect training more."],
      ["Using folded dimensions", "The full machine must fit while you run."],
      ["Ignoring headroom", "Add deck height, incline rise and your running movement."],
      ["Assuming quiet means neighbour-proof", "Foot strike can transmit through the structure."],
      ["Skipping service research", "A treadmill is a large mechanical product that may need local support."],
    ],
    faqs: [
      ["Is a folding treadmill good for running?", "Some are. Judge the deck, drive, speed, capacity and stability in the open position rather than the folding feature alone."],
      ["Should I choose a curved treadmill?", "Choose one when self-paced intervals and sprint conditioning are central; it is not a direct substitute for controlled-pace motorised running."],
      ["How much room should be left behind a treadmill?", "Follow the manufacturer's safety clearance and keep the entry and dismount area unobstructed."],
      ["Can a treadmill go upstairs?", "Only after confirming the route, floor suitability, vibration implications and installation requirements."],
    ],
    finder: { slug: "treadmill-finder", title: "Match the treadmill to the session", body: "Filter by format, space and intended home use.", label: "Use the treadmill finder" },
  },
  {
    slug: "how-to-choose-a-power-rack",
    title: "How to Choose a Power Rack",
    deck: "Get the room geometry, safety depth and attachment standard right before comparing extras.",
    bullets: [
      "Rack height must leave room for installation, pull-ups and overhead work.",
      "Working width includes a loaded bar and access to both sleeves.",
      "Interior depth changes setup comfort and safety position.",
      "Attachments must match the exact upright and hole standard.",
    ],
    definition: [
      "A power rack is a four-upright strength frame that supports a bar and adjustable safeties inside or around the structure.",
      "Models vary in height, interior depth, upright section, hole diameter, spacing and anchoring requirements.",
      "Those dimensions form an equipment ecosystem. Choose the rack as a long-term platform, not an isolated steel frame.",
    ],
    why: [
      "A compatible rack can make solo barbell training more repeatable and organise a room around one anchor.",
      "An incompatible rack can miss the ceiling, block loading or strand attachments that almost—but do not actually—fit.",
    ],
    factors: [
      { name: "Height", what: "The assembled top height including pull-up hardware.", changes: "It determines ceiling and pull-up compatibility.", notice: "Allow assembly and body clearance, not a zero-gap fit." },
      { name: "Depth", what: "Inside lifting space and total front-to-back footprint.", changes: "More depth can ease setup but consumes the room.", notice: "Safeties and benches need usable positions." },
      { name: "Upright standard", what: "Tube dimensions, hole size and side-hole layout.", changes: "It controls attachment compatibility.", notice: "Nominal inch and metric sizes may not interchange." },
      { name: "Hole spacing", what: "Distance between adjustment positions.", changes: "Closer spacing helps dial in bench safeties and hooks.", notice: "Check the working zone, not only the product headline." },
      { name: "Anchoring", what: "Freestanding, stabilised or floor-fixed installation.", changes: "It affects stability, placement and landlord constraints.", notice: "Attachments can change leverage and anchoring needs." },
    ],
    comparison: {
      columns: ["Compact rack", "Full-depth rack"],
      rows: [
        ["Room use", "Smaller footprint", "More interior working room"],
        ["Stability", "May need stabiliser or anchoring", "Often heavier, still model-specific"],
        ["Attachments", "Space can limit use", "More clearance for accessories"],
        ["Best fit", "Tight home layouts", "Dedicated garage or gym room"],
      ],
    },
    gains: ["Adjustable safety positions", "A modular strength anchor", "Organised barbell training"],
    giveUps: ["Permanent room footprint", "Compatibility lock-in", "Possible anchoring and assembly work"],
    caution: "Follow the manufacturer's anchoring, loading and assembly instructions. A rack's presence does not make every lift or attachment setup safe.",
    steps: [
      ["Measure the full room", "Record ceiling, walls, doors, slope and bar-loading width."],
      ["Choose working depth", "Allow the bench, safeties and your preferred setup inside the rack."],
      ["Confirm installation", "Check anchoring, stabilisers and substrate requirements."],
      ["Select a standard", "Verify upright size, holes, spacing and attachment fit."],
      ["Map bar positions", "Test squat, bench and pull-up heights against obstructions."],
      ["Plan storage", "Keep plates and attachments reachable without blocking the lifting zone."],
    ],
    products: [
      ["prod-rogue-rml-390f", "Flat-foot rack", "Illustrates a freestanding-style footprint and established attachment family.", "Still needs full clearance and model-specific setup checks."],
      ["prod-rep-pr-4000", "Modular rack", "Shows an ecosystem-led rack with configuration choices.", "Options make exact dimensions and compatibility important."],
      ["prod-mirafit-m3", "UK/EU rack", "Represents a regionally available home strength platform.", "Accessories must match the specific series."],
    ],
    mistakes: [
      ["Matching rack height to ceiling exactly", "Leave installation, pull-up and movement clearance."],
      ["Measuring only upright width", "Include the loaded bar and plate access."],
      ["Assuming attachments are universal", "Verify every dimension and generation."],
      ["Ignoring anchoring instructions", "Stability requirements change with configuration and use."],
      ["Filling the rack with accessories", "Protect the core lifting and safety paths first."],
    ],
    faqs: [
      ["How tall should a power rack be?", "Choose the tallest model that still leaves installation, pull-up and overhead clearance for your room."],
      ["Does a power rack need to be bolted down?", "It depends on the model and configuration. Follow the manufacturer's instructions, including any stabiliser requirements."],
      ["Are power-rack attachments universal?", "No. Upright dimensions, hole diameters, spacing and offsets must all match."],
      ["How much space is needed around a rack?", "Include bar sleeves, plate loading, bench travel, attachments, entry and clear safety paths."],
    ],
    finder: { slug: "power-rack-finder", title: "Find racks that fit the room", body: "Filter rack geometry and configuration before comparing ecosystems.", label: "Use the power-rack finder" },
  },
  {
    slug: "how-to-choose-a-rowing-machine",
    title: "How to Choose a Rowing Machine",
    deck: "Choose resistance, monitor and storage around the sessions you will actually row.",
    bullets: [
      "Air rowers suit comparable performance work and race-specific practice.",
      "Magnetic and water formats can trade score comparability for a different sound and feel.",
      "Rail length and entry height matter as much as stored footprint.",
      "A good monitor should expose the metrics your programme uses.",
    ],
    definition: [
      "A rowing machine turns the drive and recovery of indoor rowing into resistance through air, magnetic, water or combined systems.",
      "Resistance type shapes feel and sound, while the monitor determines how sessions are paced, recorded and compared.",
      "The best home rower fits the athlete, room and training objective without becoming awkward to deploy.",
    ],
    why: [
      "Rowers can cover steady conditioning and hard intervals, but different ecosystems do not produce directly interchangeable scores.",
      "Storage claims also vary: standing, splitting or folding only helps if the transition is practical every session.",
    ],
    factors: [
      { name: "Resistance", what: "Air, magnetic, water or a hybrid braking system.", changes: "It shapes response, sound and maintenance.", notice: "Try the catch and drive feel if possible." },
      { name: "Monitor", what: "The display, metrics, connectivity and workout controls.", changes: "It determines whether programmed pace and interval targets are usable.", notice: "Subscription content is separate from core hardware quality." },
      { name: "Fit range", what: "Rail length, footplate adjustment, handle and seat access.", changes: "It affects comfortable setup for different users.", notice: "Tall users should verify published fit guidance." },
      { name: "Room use", what: "Operating length, width, storage method and deployment path.", changes: "Long rails dominate small rooms.", notice: "A rower that stores vertically still needs full workout length." },
      { name: "Specificity", what: "How closely the machine matches event or benchmark equipment.", changes: "Comparable scoring matters for HYROX and shared programmes.", notice: "Different resistance types can show different numbers for similar effort." },
    ],
    comparison: {
      columns: ["Air", "Magnetic / water"],
      rows: [
        ["Response", "More effort increases fan resistance", "Model-specific controlled or water feel"],
        ["Sound", "Fan noise", "Often quieter, though not silent"],
        ["Scores", "Strong benchmark ecosystem on common models", "Usually platform-specific"],
        ["Best fit", "Performance and event practice", "Home feel, guided or quieter sessions"],
      ],
    },
    gains: ["Full-body conditioning format", "Broad interval and steady-session range", "Compact width"],
    giveUps: ["Long operating footprint", "Technique learning curve", "Noise or ecosystem tradeoffs"],
    caution: "Use the setup and technique guidance supplied with the machine. Stop and inspect any unstable footplate, loose rail or damaged handle connection before continuing.",
    steps: [
      ["Choose the session goal", "Separate benchmark, event, guided and general-conditioning priorities."],
      ["Select resistance", "Match response and sound to the room and training style."],
      ["Check user fit", "Verify rail, footplates, seat access and published user limits."],
      ["Inspect the monitor", "Confirm required pace, interval and connectivity features."],
      ["Measure both states", "Plan the full operating length and realistic storage route."],
      ["Review upkeep", "Understand cleaning, water treatment if applicable, parts and local support."],
    ],
    products: [
      ["prod-concept2-rowerg", "Benchmark air rower", "Shows the common performance-monitor and comparable-score approach.", "Fan noise and a long operating footprint."],
      ["prod-hydrow-wave", "Connected magnetic rower", "Illustrates quieter guided home rowing.", "Connected content and scores are ecosystem-specific."],
      ["prod-waterrower-a1", "Water-resistance rower", "Shows a furniture-like home format with water feel.", "Requires water-system upkeep and lacks common air-rower score comparability."],
    ],
    mistakes: [
      ["Comparing unlike scores", "Numbers from different resistance ecosystems may not be equivalent."],
      ["Buying for storage photos", "Rehearse the actual fold, split or standing process."],
      ["Ignoring rail length", "Confirm both user fit and full workout footprint."],
      ["Choosing content before hardware", "Assess fit, feel and monitor basics independently of subscriptions."],
      ["Skipping maintenance", "Follow cleaning and resistance-system care guidance."],
    ],
    faqs: [
      ["Which rowing-machine resistance is best?", "There is no universal best: air suits benchmarks and event practice, while magnetic or water may better fit sound and feel preferences."],
      ["Is a rower suitable for a small room?", "Its width is modest, but the long operating footprint and deployment path must fit."],
      ["Do all rowing machines show comparable times?", "No. Scores and resistance curves differ by platform, so compare within the same ecosystem."],
      ["What should a rowing monitor show?", "At minimum, confirm it supports the pace, distance, time and interval information used by your programme."],
    ],
    finder: { slug: "home-gym-builder", title: "See whether the rower fits", body: "Place its full operating footprint alongside the rest of your gym.", label: "Add it to Home Gym Builder" },
  },
  {
    slug: "how-to-choose-a-weight-bench",
    title: "How to Choose a Weight Bench",
    deck: "Prioritise stability, useful adjustment positions and a footprint that works inside your rack.",
    bullets: [
      "Flat benches are simple, stable and easier to move.",
      "Adjustable benches add angles but also length, weight and hinge geometry.",
      "Check pad dimensions, rated capacity and foot placement together.",
      "Measure both the training position and storage position.",
    ],
    definition: [
      "A weight bench is a supported pad for pressing, rowing, seated work and other strength movements.",
      "Flat models keep one fixed plane; adjustable models add incline, and some add decline positions.",
      "A useful bench combines stable contact, suitable pad geometry and easy placement in the room or rack.",
    ],
    why: [
      "The bench is the contact point between athlete and loaded implement, so movement or poor positioning is immediately noticeable.",
      "Its frame can also interfere with feet, rack crossmembers and ideal bar position even when the overall size appears suitable.",
    ],
    factors: [
      { name: "Bench type", what: "Flat, adjustable or flat-incline-decline.", changes: "More angles increase exercise range and mechanical complexity.", notice: "Buy only the positions your programme uses." },
      { name: "Pad geometry", what: "Pad width, length, gap and edge shape.", changes: "It affects shoulder support and setup consistency.", notice: "Very wide pads may alter arm clearance for some users." },
      { name: "Stability", what: "Frame stance, feet and movement under load.", changes: "Stable contact helps repeatable setup.", notice: "Test every intended incline, not just flat." },
      { name: "Capacity", what: "The manufacturer's total rated load and usage conditions.", changes: "It must cover user plus external load with margin.", notice: "Ratings are not interchangeable test standards." },
      { name: "Mobility", what: "Bench weight, wheels, handle and upright storage approval.", changes: "Heavy benches are stable but harder to clear.", notice: "A small room may require moving it every session." },
    ],
    comparison: {
      columns: ["Flat bench", "Adjustable bench"],
      rows: [
        ["Positions", "One", "Several incline; model-specific decline"],
        ["Stability", "Simple frame", "Depends on hinge and frame"],
        ["Mobility", "Usually lighter", "Usually heavier"],
        ["Best fit", "Focused barbell pressing", "Mixed pressing and accessories"],
      ],
    },
    gains: ["A stable pressing surface", "More exercise options with adjustment", "Repeatable setup inside a rack"],
    giveUps: ["Floor and parking space", "Heavy models are awkward to move", "Adjustment adds cost and pinch points"],
    caution: "Use only published positions and load limits. Make sure adjustment pins or ladders are fully seated before loading the bench.",
    steps: [
      ["List required angles", "Separate positions used weekly from nice-to-have decline settings."],
      ["Measure the rack", "Check crossmembers, hooks and bar position with the bench in place."],
      ["Check the pad", "Compare width, length and gap with your preferred setup."],
      ["Review capacity", "Include body mass and external load with sensible margin."],
      ["Test adjustment", "Look for secure, easy-to-confirm locking positions."],
      ["Plan movement", "Confirm wheels, handle and an approved storage position fit the room."],
    ],
    products: [
      ["prod-rep-ab-5200", "Large adjustable bench", "Shows a wide-pad, high-capacity garage-gym approach.", "Large footprint and substantial moving weight."],
      ["prod-atx-fid-bench", "FID bench", "Illustrates broad angle adjustment for UK/EU home gyms.", "More mechanisms and bulk than a flat bench."],
      ["prod-rep-fb-5000", "Flat bench", "Shows the simplicity and focused stability of a fixed format.", "No incline or decline positions."],
    ],
    mistakes: [
      ["Buying every angle", "Unused adjustment adds cost, size and complexity."],
      ["Checking capacity alone", "Pad, feet and rack interaction matter just as much."],
      ["Ignoring the frame feet", "They can obstruct your stance or rack placement."],
      ["Assuming upright storage", "Only store vertically when the manufacturer permits it."],
      ["Forgetting bench movement", "Plan the route between storage and every training position."],
    ],
    faqs: [
      ["Should I buy a flat or adjustable bench?", "Choose flat for simple focused pressing; choose adjustable when incline or seated work appears regularly in your programme."],
      ["How wide should a bench pad be?", "Use published dimensions and your setup preference; wider is not automatically better for every body or movement."],
      ["What weight capacity do I need?", "Add your body mass and expected external load, then choose a published rating with sensible margin."],
      ["Can an adjustable bench be stored upright?", "Only if the manufacturer approves that storage position and it remains stable."],
    ],
    finder: { slug: "home-gym-builder", title: "Check bench and rack clearance", body: "Plan both the lifting position and the bench's parking spot.", label: "Place it in Home Gym Builder" },
  },
  {
    slug: "how-to-choose-adjustable-dumbbells",
    title: "How to Choose Adjustable Dumbbells",
    deck: "Match usable range, increments and handle design to every movement in your programme.",
    bullets: [
      "Start with minimum, maximum and increments—not the selector style.",
      "Fast adjustment helps circuits, while simpler systems may suit slower strength sessions.",
      "Handle length and balance can change across settings.",
      "Cradles need clear, level space and controlled re-racking.",
    ],
    definition: [
      "Adjustable dumbbells combine multiple load settings into one handle through dials, pins, twists or manually loaded plates.",
      "Each mechanism creates a different tradeoff between change speed, shape, durability, increments and expansion.",
      "The best set covers the user's real load curve while remaining comfortable to handle and practical to store.",
    ],
    why: [
      "One set can unlock broad home strength training, but a poor increment pattern can leave lighter movements stranded.",
      "Because both handles depend on a mechanism and cradle, reliability and replacement support matter more than with a single fixed pair.",
    ],
    factors: [
      { name: "Usable range", what: "Minimum and maximum settings per hand.", changes: "It determines exercise coverage and progression life.", notice: "Rows and presses often outgrow a set before curls do." },
      { name: "Increment pattern", what: "The available jumps between settings.", changes: "Smaller jumps support gradual progress on lighter movements.", notice: "Inspect the full sequence; jumps may not stay constant." },
      { name: "Selection system", what: "Dial, twist, pin or manual loading.", changes: "It balances speed against simplicity and plate security.", notice: "A fast selector is valuable only if it engages clearly." },
      { name: "Geometry", what: "Overall length, plate shape, handle and balance.", changes: "Some systems remain bulky at low weight.", notice: "Try goblet holds and dumbbells together at chest level." },
      { name: "Support", what: "Warranty, replacement plates, cradle and mechanism service.", changes: "One broken part can disable a broad weight range.", notice: "Regional parts access matters over a long ownership period." },
    ],
    comparison: {
      columns: ["Fast selector", "Manual plate-loaded"],
      rows: [
        ["Changes", "Seconds in a cradle", "Collars and plates changed by hand"],
        ["Shape", "System-specific", "Traditional short bar format"],
        ["Complexity", "More moving parts", "Mechanically simple"],
        ["Best fit", "Circuits and compact training", "Deliberate lifting and custom loading"],
      ],
    },
    gains: ["Many loads in one station", "Compact progression", "Faster setup than a full plate kit on many systems"],
    giveUps: ["Mechanism care", "Model-specific feel", "A shared failure point across settings"],
    caution: "Fully seat both handles and confirm selectors show the same load before lifting. Never force a selector that is misaligned.",
    steps: [
      ["Audit current loads", "Record working weights for compounds and accessories."],
      ["Add progression room", "Choose a realistic maximum for the expected ownership period."],
      ["Inspect every increment", "Make sure lighter movements have useful jumps."],
      ["Compare geometry", "Check handle length and balance at minimum and maximum."],
      ["Test change flow", "Confirm the selector and cradle suit your session pace."],
      ["Review support", "Check handling rules, warranty and replacement-part access."],
    ],
    products: [
      ["prod-nuobell-80", "Twist-selection set", "Illustrates rapid changes and a conventional-looking profile.", "Requires careful handling of its selector system."],
      ["prod-powerblock-pro-100", "Selector-pin set", "Shows an expandable block format with broad top-end potential.", "The enclosed geometry is not for everyone."],
      ["prod-bowflex-552", "Dial-selection set", "Represents an accessible multi-setting home option.", "Lower maximum can constrain long-term compound work."],
    ],
    mistakes: [
      ["Choosing maximum only", "Minimum load and increments determine accessory usefulness."],
      ["Assuming compact means short", "Some handles stay long at every setting."],
      ["Changing weight off the cradle", "Follow the system's specified selection procedure."],
      ["Dropping the handles", "Selector parts may not tolerate impact."],
      ["Ignoring parts support", "Check whether common components can be replaced in your region."],
    ],
    faqs: [
      ["What weight range should adjustable dumbbells have?", "It should span your lightest repeated accessory load through your heaviest expected compound load with useful increments."],
      ["Which adjustment system is fastest?", "Dial, twist and selector-pin systems can all be quick; test clarity, alignment and cradle use as well as speed."],
      ["Are expandable adjustable dumbbells better?", "Expansion can extend useful life, but only if the added range, dimensions and cost fit your plan."],
      ["Can adjustable dumbbells be repaired?", "It depends on the brand and region, so check replacement handles, plates, selectors and cradles before buying."],
    ],
    finder: { slug: "adjustable-dumbbell-finder", title: "Match range and increments", body: "Compare adjustable systems against your actual training loads.", label: "Find adjustable dumbbells" },
  },
  {
    slug: "how-to-choose-training-shoes",
    title: "How to Choose Training Shoes",
    deck: "Choose around the session's dominant demand: stable lifting, mixed movement or meaningful running.",
    bullets: [
      "Stable cross-trainers suit mixed gym work better than soft running shoes.",
      "Dedicated lifting shoes prioritise a planted base and raised heel.",
      "Run-heavy hybrid sessions need enough cushioning and flex for repeated kilometres.",
      "Fit and heel hold matter more than a category label.",
    ],
    definition: [
      "Training shoes are footwear built for gym movements such as lifting, jumping, short runs and lateral work.",
      "Cross-trainers balance these demands; weightlifting shoes specialise in stable squatting and Olympic lifting; hybrid race shoes lean further toward running.",
      "No shoe excels equally at every task, so selection begins with the session mix rather than a universal feature list.",
    ],
    why: [
      "A soft high running platform can feel unstable under heavy load, while a rigid lifting shoe can be awkward for running and jumps.",
      "Matching the shoe to the dominant work improves predictability without making performance or injury-prevention promises.",
    ],
    factors: [
      { name: "Session mix", what: "The proportion of lifting, lateral work, jumps and running.", changes: "It sets how specialised the shoe should be.", notice: "Use the longest or most demanding repeated block as the anchor." },
      { name: "Platform", what: "Midsole firmness, width and heel structure.", changes: "Firmer broad bases feel more planted under load.", notice: "Very soft foam can compress during heavy sets." },
      { name: "Flex and ride", what: "How the forefoot bends and cushioning responds.", changes: "More flex and cushioning generally suit longer run segments.", notice: "A shoe comfortable for 200 metres may not suit several kilometres." },
      { name: "Grip", what: "Outsole traction for floor, turf and sled work.", changes: "Surface and movement direction alter grip needs.", notice: "Check the actual facility surface." },
      { name: "Fit and lockdown", what: "Toe room, midfoot hold and heel security.", changes: "It affects control during lateral and loaded movement.", notice: "Test with the socks and movements used in training." },
    ],
    comparison: {
      columns: ["Cross-trainer", "Weightlifting shoe"],
      rows: [
        ["Platform", "Stable with some flex", "Rigid and highly planted"],
        ["Heel", "Usually modest", "Raised, model-specific height"],
        ["Running", "Short segments possible", "Not intended for running"],
        ["Best fit", "Mixed gym sessions", "Squats and Olympic lifts"],
      ],
    },
    gains: ["A platform matched to gym movement", "Better task-specific compromise", "Predictable fit across repeated sessions"],
    giveUps: ["One pair may not cover every session", "Specialised shoes have narrower use", "Grip and durability depend on surface"],
    caution: "Footwear is not medical treatment and cannot guarantee injury prevention. If pain persists or affects training, seek an appropriately qualified professional.",
    steps: [
      ["Break down the session", "Estimate lifting, running, jumping and lateral-work shares."],
      ["Choose the category", "Start with cross-training, lifting or run-heavy hybrid needs."],
      ["Set the platform", "Match firmness and heel geometry to the dominant loaded movements."],
      ["Check run demand", "Confirm flex and cushioning for the actual distance."],
      ["Test lockdown", "Try lateral cuts, a squat and a short jog where permitted."],
      ["Match the surface", "Confirm outsole grip and permitted use on gym floors or turf."],
    ],
    products: [
      ["prod-nike-metcon-9", "Stable cross-trainer", "Shows a lifting-biased mixed-training platform.", "Less suited to meaningful running distance."],
      ["prod-reebok-nano-x4", "Balanced cross-trainer", "Illustrates a broader mixed-session compromise.", "Still not a dedicated running shoe."],
      ["prod-nike-romaleos-5", "Weightlifting shoe", "Shows a rigid raised-heel specialist for lifting.", "Not intended for circuits with running."],
    ],
    mistakes: [
      ["Using soft running shoes for every lift", "A high compressible platform may feel unstable under load."],
      ["Running in lifting shoes", "Rigid raised-heel specialists are not built for run blocks."],
      ["Buying by sport label", "Inspect the actual session demands and shoe geometry."],
      ["Ignoring width", "Lockdown should not require crushing the forefoot."],
      ["Expecting one perfect hybrid", "Use separate shoes when sessions sit at opposite extremes."],
    ],
    faqs: [
      ["Can I lift in running shoes?", "Light general work may be manageable, but soft or high platforms can feel unstable for heavy loaded movements."],
      ["Do I need dedicated weightlifting shoes?", "They make sense when squats or Olympic lifts are central and you prefer their rigid raised-heel setup."],
      ["Can cross-training shoes be used for running?", "Usually for short segments, but assess cushioning and flex against the actual repeated distance."],
      ["How should training shoes fit?", "Aim for secure heel and midfoot hold with comfortable toe room and no painful pressure during loaded or lateral movement."],
    ],
    finder: { slug: "training-shoe-finder", title: "Match shoes to your session mix", body: "Balance lifting stability, movement and running demand.", label: "Use the training-shoe finder" },
    hero: SHOE_HERO,
  },
  {
    slug: "power-rack-sizing-and-hole-spacing",
    title: "Power Rack Sizing and Hole Spacing",
    deck: "Decode the dimensions that determine room fit, safety placement and attachment compatibility.",
    bullets: [
      "Overall height, width and depth are only the starting dimensions.",
      "Interior depth controls usable lifting room inside the cage.",
      "Hole diameter and spacing must match hooks, safeties and attachments.",
      "Metric and nominal imperial rack standards may look similar without fitting.",
    ],
    definition: [
      "Power-rack sizing describes the external frame, internal lifting area and upright geometry.",
      "Hole spacing is the centre-to-centre distance between adjustment positions; some racks use closer spacing through the bench zone.",
      "Together with hole diameter and upright section, these measurements determine placement precision and attachment compatibility.",
    ],
    why: [
      "Small dimensional differences can decide whether a rack clears the ceiling or whether safeties sit at a usable bench height.",
      "They also prevent expensive compatibility mistakes when adding lever arms, storage, cable systems or replacement hooks.",
    ],
    factors: [
      { name: "Overall height", what: "Floor to the highest assembled component.", changes: "It governs room, pull-up and installation clearance.", notice: "Pull-up bars may sit above the nominal upright." },
      { name: "Overall and inside width", what: "External frame span and bar space between uprights.", changes: "They affect room fit and bar handling.", notice: "The bar sleeves extend well beyond the frame." },
      { name: "Inside depth", what: "Clear front-to-back space between uprights.", changes: "It determines comfort inside the cage and safety length.", notice: "Attachments can consume part of the quoted depth." },
      { name: "Upright and holes", what: "Tube section, hole diameter and side-hole pattern.", changes: "These are primary attachment interfaces.", notice: "Measure in the same units as the accessory." },
      { name: "Hole spacing", what: "Vertical intervals between hook and safety positions.", changes: "Closer spacing permits finer bench setup.", notice: "Westside-style spacing may cover only part of the upright." },
    ],
    comparison: {
      columns: ["Standard spacing", "Closer bench-zone spacing"],
      rows: [
        ["Adjustment", "Larger vertical jumps", "Finer positions in a defined zone"],
        ["Simplicity", "Consistent pattern", "Pattern changes by height"],
        ["Best use", "General squat and storage positions", "Bench hooks and safeties"],
        ["Compatibility", "Still needs hole and upright match", "Still needs hole and upright match"],
      ],
    },
    gains: ["Predictable room planning", "Better safety-position selection", "Fewer attachment mismatches"],
    giveUps: ["Detailed measurement work", "Ecosystem lock-in", "Published dimensions may use different reference points"],
    caution: "Never drill, enlarge or improvise rack holes to force an attachment. Modification can change load paths and invalidate manufacturer guidance.",
    steps: [
      ["Record room geometry", "Measure ceiling, walls, slope and door or garage-door movement."],
      ["Read dimension drawings", "Separate overall, inside and working dimensions."],
      ["Add the bar envelope", "Include sleeves, collars and plate-loading access."],
      ["Verify the interface", "Match upright size, hole diameter, spacing and pin length."],
      ["Map bench positions", "Check hooks and safeties land where your setup needs them."],
      ["Confirm configuration", "Recalculate size after adding feet, storage or cable attachments."],
    ],
    products: [
      ["prod-rogue-rml-390f", "Flat-foot geometry", "Shows how base style changes total depth and placement.", "Attachment fit remains series-specific."],
      ["prod-rep-pr-4000", "Modular geometry", "Illustrates why configuration must be included in final dimensions.", "Many options increase specification-checking work."],
      ["prod-mirafit-m3", "Metric-market example", "Shows the need to verify regional dimensions rather than assume interchangeability.", "Near-matching accessories may still be incompatible."],
    ],
    mistakes: [
      ["Using only product width", "Add the bar sleeves and loading access."],
      ["Confusing inside and overall depth", "They answer different room and training questions."],
      ["Matching by hole diameter alone", "Upright size, spacing, offset and pin length also matter."],
      ["Assuming all holes share one spacing", "Inspect the complete upright diagram."],
      ["Forgetting added modules", "Storage and cable kits can change every external dimension."],
    ],
    faqs: [
      ["What is Westside hole spacing?", "It describes closer vertical hole intervals through a bench-focused zone, but exact implementation varies by rack."],
      ["Are 3x3 rack attachments interchangeable?", "Not automatically. Hole diameter, actual tube size, spacing, offset and pin length must also match."],
      ["What rack depth is best?", "Choose enough inside room for your setup while preserving circulation and bar access in the room."],
      ["Does rack width include the barbell?", "Usually not. Add bar sleeves, collars and space to load plates."],
    ],
    finder: { slug: "power-rack-finder", title: "Filter racks by geometry", body: "Use room and rack dimensions to eliminate incompatible options.", label: "Open the power-rack finder" },
  },
  {
    slug: "pull-up-bar-mounting-guide",
    title: "Pull-Up Bar Mounting Guide",
    deck: "Choose the mount from the structure first, then check grip height, movement clearance and installation.",
    bullets: [
      "Doorway bars depend on compatible trim and frame geometry.",
      "Wall bars need a suitable structural substrate and correct fixings.",
      "Freestanding stations avoid drilling but use more floor and can move.",
      "Dynamic skills need more clearance and a setup explicitly approved for them.",
    ],
    definition: [
      "A pull-up bar can transfer load through a doorway, wall, ceiling, rack or freestanding frame.",
      "Each format creates different load paths, clearance needs and installation requirements.",
      "The correct mount begins with verified structure and approved use, not with the most compact product photo.",
    ],
    why: [
      "Pulling bodyweight above the floor places repeated force through the bar, fixings and supporting structure.",
      "Mount choice also determines whether knees, feet or head meet walls, ceilings or door trim during strict and dynamic repetitions.",
    ],
    factors: [
      { name: "Structure", what: "The frame, studs, masonry or floor supporting the bar.", changes: "It determines which mounting method is viable.", notice: "Surface finish does not reveal what lies behind it." },
      { name: "Approved use", what: "Published load, movement and installation conditions.", changes: "Strict pull-ups and dynamic skills can impose different loads.", notice: "A static rating is not blanket approval for kipping." },
      { name: "Grip height", what: "Bar height relative to user reach and ceiling.", changes: "It affects mounting access, knee clearance and top position.", notice: "Plan how the shortest user reaches the bar safely." },
      { name: "Movement envelope", what: "Space around the body through the complete repetition.", changes: "Wall offset and overhead clearance limit exercise options.", notice: "Muscle-ups require far more space than strict pulls." },
      { name: "Removal and storage", what: "Whether the bar stays mounted, unhooks or occupies floor.", changes: "Rental and shared-room needs may rule out permanent mounts.", notice: "Freestanding does not mean compact." },
    ],
    comparison: {
      columns: ["Doorway / wall mount", "Freestanding station"],
      rows: [
        ["Floor use", "Minimal", "Permanent footprint"],
        ["Installation", "Structure-dependent", "Assembly on level floor"],
        ["Rigidity", "Can be high when correctly installed", "Model and base dependent"],
        ["Best fit", "Compact strict pulling", "No-drill rooms with available floor"],
      ],
    },
    gains: ["Vertical pulling at home", "Compact wall or doorway options", "Expandable calisthenics practice"],
    giveUps: ["Structure and clearance checks", "Possible permanent fixings", "Freestanding options consume floor"],
    caution: "If you cannot identify the substrate and correct fixing method, use a qualified installer. Never mount from plasterboard or trim alone unless the product explicitly specifies and supports that exact construction.",
    steps: [
      ["Choose movements", "Separate strict pulls, hangs and dynamic skills."],
      ["Identify the structure", "Verify frame, studs, masonry, ceiling or suitable floor."],
      ["Read installation rules", "Use the supplied fixing and substrate guidance."],
      ["Map the body envelope", "Check grip, head, knee and forward-swing clearance."],
      ["Install and inspect", "Torque and assemble as directed, then check for movement."],
      ["Recheck routinely", "Inspect fixings, joints and contact surfaces before use."],
    ],
    products: [
      ["prod-pullup-dip-doorway", "Doorway bar", "Shows a removable compact approach tied to frame compatibility.", "Door geometry and approved movement limit use."],
      ["prod-pullup-dip-wall", "Wall-mounted bar", "Illustrates greater offset with permanent structural installation.", "Correct substrate and fixings are essential."],
      ["prod-gravity-pullup-station", "Freestanding station", "Shows a no-drill route with broader room placement.", "Uses more floor and may feel less rigid."],
    ],
    mistakes: [
      ["Trusting trim alone", "Verify the supporting structure and product requirements."],
      ["Using generic wall plugs", "Fixings must match the load, substrate and instructions."],
      ["Checking only bar width", "Map the complete body and movement envelope."],
      ["Adding dynamic reps by assumption", "Use only movements approved for the installed setup."],
      ["Skipping inspections", "Repeated loading can loosen joints or reveal substrate movement."],
    ],
    faqs: [
      ["Is a doorway pull-up bar safe?", "It can be when the exact doorway is compatible and the product is installed and used within its instructions."],
      ["Can a pull-up bar be fixed to plasterboard?", "Do not rely on plasterboard alone unless the manufacturer explicitly approves that construction; structural support is usually required."],
      ["How high should a pull-up bar be?", "Set it within the product's installation rules while allowing safe access, knee clearance and headroom at the top."],
      ["Can I do muscle-ups on a home pull-up bar?", "Only when the product, mounting and surrounding clearance are explicitly suitable for dynamic above-bar movement."],
    ],
    finder: { slug: "pull-up-bar-finder", title: "Match the bar to the room", body: "Compare doorway, wall and freestanding options by mounting constraints.", label: "Use the pull-up-bar finder" },
    sportId: "sport-calisthenics",
  },
];

function toPlan(seed: FitnessPlanSeed): CompactExplainerPlan {
  const productIds = seed.products.map(([productId]) => productId);
  const fallbackHero =
    seed.hero ??
    (seed.slug.includes("shoe")
      ? SHOE_HERO
      : seed.slug.includes("choose")
        ? CHOOSING_HERO
        : HOME_GYM_HERO);

  return {
    slug: seed.slug,
    displayTitle: seed.title,
    deck: seed.deck,
    ...resolveHeroFromProductIds(
      productIds,
      fallbackHero,
      `${seed.title} equipment and training setup`,
    ),
    quickAnswerBullets: seed.bullets,
    methodologyNote:
      "Kitletics compares practical room fit, published specifications and current catalog examples. Verify final dimensions and installation requirements with the manufacturer.",
    finder: seed.finder
      ? {
          toolSlug: seed.finder.slug,
          title: seed.finder.title,
          description: seed.finder.body,
          ctaLabel: seed.finder.label,
        }
      : undefined,
    definition: {
      title: `${seed.title}: the essentials`,
      paragraphs: seed.definition,
    },
    whyItMatters: {
      title: "Why this decision matters",
      paragraphs: seed.why,
    },
    factors: {
      title: "The factors that change the answer",
      cards: seed.factors.map((factor, index) => ({
        id: `factor-${index + 1}`,
        title: factor.name,
        whatItIs: factor.what,
        howItChanges: factor.changes,
        whatYouNotice: factor.notice,
      })),
    },
    comparison: {
      title: "Quick comparison",
      columns: ["Decision point", ...seed.comparison.columns],
      rows: seed.comparison.rows.map(([label, left, right]) => ({
        label,
        values: [left, right],
      })),
      footnote: "Use this as a shortlist, then confirm current manufacturer specifications.",
    },
    tradeoffs: {
      title: "What you gain—and give up",
      gains: seed.gains,
      giveUps: seed.giveUps,
    },
    callouts: [
      {
        id: "safety-check",
        title: "Check before you commit",
        body: seed.caution,
        tone: "caution",
      },
    ],
    decision: {
      title: "A practical decision process",
      steps: seed.steps.map(([title, body], index) => ({
        id: `step-${index + 1}`,
        title,
        body,
      })),
    },
    examples: {
      title: "Three current product examples",
      disclaimer:
        "These are reference points, not automatic picks. Availability, specifications and pricing can change.",
      items: seed.products.map(([productId, role, why, tradeoff]) => ({
        productId,
        approachLabel: role,
        whyIllustrates: why,
        bestFor: [role, "Comparing this equipment approach"],
        tradeoff,
      })),
    },
    compareProductIds: productIds,
    mistakes: seed.mistakes.map(([title, body], index) => ({
      id: `mistake-${index + 1}`,
      title,
      body,
    })),
    ctaFinder: seed.finder
      ? {
          title: seed.finder.title,
          body: seed.finder.body,
          ctaLabel: seed.finder.label,
          href: `/tools/${seed.finder.slug}`,
        }
      : undefined,
    productExampleRoles: seed.products.map(([productId, role]) => ({
      productId,
      roleLabel: role,
    })),
    productRailTitle: `Product examples for ${seed.title.toLowerCase()}`,
  };
}

export const FITNESS_PLANS: CompactExplainerPlan[] = seeds.map(toPlan);

export const fitnessConfigs = FITNESS_PLANS.map(buildExplainerFromPlan);

export const fitnessFaqs: Array<{
  id: string;
  question: string;
  answer: string;
  sportId: string;
}> = seeds.flatMap((seed) =>
  seed.faqs.map(([question, answer], index) => ({
    id: `faq-${seed.slug}-${index + 1}`,
    question,
    answer,
    sportId: seed.sportId ?? "sport-training",
  })),
);

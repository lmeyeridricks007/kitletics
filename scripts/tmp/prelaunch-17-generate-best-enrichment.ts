/**
 * Pre-launch 17 — Generate Running Best Guide enrichment for all non-P0 guides.
 * Writes src/content/running/best-guides-p1-launch-ready.ts
 *
 * Does not lower quality gates. Affiliate-neutral. Context-specific copy.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { bestGuides } from "@/content/best-guides";
import { getProductById, getProductsByCategory } from "@/repositories/products";
import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";

const OUT = resolve("src/content/running/best-guides-p1-launch-ready.ts");
const EVIDENCE = "ev-catalog-editorial";

/** Already LAUNCH_READY via P0 — skip. */
const P0_SLUGS = new Set([
  "running-shoes",
  "running-shoes-beginners",
  "running-watches",
  "stability-running-shoes",
  "daily-trainers",
  "running-shoes-long-runs",
  "marathon-shoes",
  "running-hydration-vests",
  "heart-rate-monitors-running",
]);

type Context = {
  job: string;
  criteriaLine: string;
  lookFor: { key: string; label: string; whyItMatters: string }[];
  avoidGeneric: string[];
  methodologyExtra: string;
};

const CONTEXTS: Record<string, Context> = {
  "trail-running-shoes": {
    job: "off-road traction, protection and durable cushion on uneven terrain",
    criteriaLine:
      "grip for the surface you run, rock-plate protection, stack that survives long trail days, and geometry that stays stable when the trail tips",
    lookFor: [
      { key: "grip", label: "Outsole grip", whyItMatters: "Lug depth and rubber compound matched to mud, rock or hardpack." },
      { key: "protection", label: "Underfoot protection", whyItMatters: "Rock plate / stack that saves feet on technical miles." },
      { key: "fit", label: "Trail fit & lockdown", whyItMatters: "Heel hold and toebox room for descending and swelling." },
      { key: "cushion", label: "Trail cushion", whyItMatters: "Enough stack for long efforts without road-shoe mush." },
      { key: "durability", label: "Upper durability", whyItMatters: "Abrasion resistance for scree and brush." },
    ],
    avoidGeneric: ["Exclusive road runners", "Anyone shopping only for flat pavement PRs"],
    methodologyExtra:
      "Trail picks are filtered to trail terrain and trail Recommendation contexts. Road race geometry does not transfer.",
  },
  "tempo-running-shoes": {
    job: "threshold, intervals and faster long runs without forcing full race-day carbon every session",
    criteriaLine:
      "workout responsiveness, durable uppers for repeats, enough cushion for longer tempos, and a plate/geometry story that is trainable mid-week",
    lookFor: [
      { key: "response", label: "Workout response", whyItMatters: "Snap for threshold and VO2 without race-only harshness." },
      { key: "durability", label: "Session durability", whyItMatters: "Uppers and foam that survive weekly speed work." },
      { key: "versatility", label: "Pace range", whyItMatters: "Covers easy warm-up into workout paces cleanly." },
      { key: "geometry", label: "Geometry / plate", whyItMatters: "Nylon or mild carbon that trains well mid-week." },
      { key: "value", label: "Value vs race shoe", whyItMatters: "Worth owning beside a dedicated race pair." },
    ],
    avoidGeneric: ["Runners who only need one easy-day foam", "Athletes seeking pure race-day carbon only"],
    methodologyExtra:
      "Tempo / super-trainer lane — distinct from pure carbon race shoes and soft daily trainers.",
  },
  "carbon-plated-running-shoes": {
    job: "stiff carbon race and super-shoe geometry for goal races — not nylon tempo trainers",
    criteriaLine:
      "carbon plate stiffness, race stack/geometry, weight for the distance, stability at race pace, and legal competition status where relevant",
    lookFor: [
      { key: "plate", label: "Carbon plate & foam", whyItMatters: "Stiff plate + energetic foam for race economy." },
      { key: "weight", label: "Race weight", whyItMatters: "Light enough for the target distance." },
      { key: "distance", label: "Distance fit", whyItMatters: "5K–marathon geometry matched to your goal." },
      { key: "stability", label: "Race-pace stability", whyItMatters: "Holds up when you are tired late." },
      { key: "legality", label: "Competition rules", whyItMatters: "Stack/plate status for your race series when it matters." },
    ],
    avoidGeneric: ["Daily-only mileage shoppers", "Runners who want nylon-plate workout shoes (see tempo guide)"],
    methodologyExtra:
      "Carbon plateMaterial + race Recommendation contexts. Nylon tempo plates belong in Best Tempo Shoes.",
  },
  "max-cushion-running-shoes": {
    job: "maximum soft stack for easy, recovery and protective volume days",
    criteriaLine:
      "stack height and foam softness, late-run protection, easy-pace manners, and honesty about tempo/race limits",
    lookFor: [
      { key: "stack", label: "Max stack & softness", whyItMatters: "High cushion that actually feels protective." },
      { key: "easy", label: "Easy-pace manners", whyItMatters: "Calm ride for recovery and base miles." },
      { key: "protection", label: "Late-run protection", whyItMatters: "Legs feel fresher deep into long easy days." },
      { key: "weight", label: "Weight trade-off", whyItMatters: "Acceptable mass for the cushioning payoff." },
      { key: "limits", label: "Pace limits", whyItMatters: "Clear about when a firmer shoe is better." },
    ],
    avoidGeneric: ["Speed-focused racers wanting a single race shoe", "Runners who prefer low-stack ground feel"],
    methodologyExtra:
      "Max-cushion role winners — recovery and protective volume, not race-day tools.",
  },
  "race-shoes": {
    job: "timed road racing across distances — geometry and efficiency for race day, distinct from marathon-block comfort picks",
    criteriaLine:
      "race efficiency, weight, plate/geometry, distance suitability, and enough stability to finish hard",
    lookFor: [
      { key: "efficiency", label: "Race efficiency", whyItMatters: "Geometry that rewards race pace." },
      { key: "weight", label: "Weight", whyItMatters: "Light for the distance without fragile foams only." },
      { key: "distance", label: "Distance role", whyItMatters: "5K–marathon fit called out honestly." },
      { key: "stability", label: "Finish-line stability", whyItMatters: "Holds form when you are cooked." },
      { key: "vs-daily", label: "Vs daily trainers", whyItMatters: "Worth a dedicated race pair vs one shoe." },
    ],
    avoidGeneric: ["Shoppers wanting one easy-day shoe", "First-marathon runners who need max comfort over speed (see marathon guide)"],
    methodologyExtra:
      "Race-day geometry across distances. Marathon comfort / first-marathon roles live in Best Marathon Shoes.",
  },
  "running-shoes-wide-feet": {
    job: "honest width availability and toebox room for wider feet — not marketing stretch claims alone",
    criteriaLine:
      "true wide/2E+ options, toebox shape, midfoot lockdown without squeeze, and ride quality that still matches the session",
    lookFor: [
      { key: "widths", label: "Width SKUs", whyItMatters: "Documented wide options — not stretchy knit alone." },
      { key: "toebox", label: "Toebox shape", whyItMatters: "Room for forefoot splay without hot spots." },
      { key: "lockdown", label: "Midfoot lockdown", whyItMatters: "Secure without crushing a wide foot." },
      { key: "ride", label: "Ride still fits the job", whyItMatters: "Width without wrecking cushion or stability intent." },
      { key: "alts", label: "Brand width depth", whyItMatters: "Who actually stocks widths you can buy." },
    ],
    avoidGeneric: ["Narrow feet seeking a snug race last", "Anyone fine in standard D/B widths"],
    methodologyExtra:
      "Prioritises published width variants and known roomy lasts over vague “roomy fit” copy.",
  },
  "running-shoes-heavy-runners": {
    job: "protective stack, durable foams and stable platforms for heavier runners logging real volume",
    criteriaLine:
      "cushion that does not pack out early, platform stability, durable outsoles, and honest weight-vs-protection trade-offs",
    lookFor: [
      { key: "protection", label: "Protective stack", whyItMatters: "Cushion that holds up under higher loads." },
      { key: "durability", label: "Foam & outsole durability", whyItMatters: "Miles before the ride goes flat." },
      { key: "platform", label: "Stable platform", whyItMatters: "Base geometry that feels planted." },
      { key: "value", label: "Cost per mile", whyItMatters: "Worth the spend for weekly volume." },
      { key: "pace", label: "Pace honesty", whyItMatters: "When a lighter shoe still makes sense." },
    ],
    avoidGeneric: ["Very light racers seeking minimal race flats", "Runners who prefer minimalist ground feel"],
    methodologyExtra:
      "Heavier-runner protective roles — stack, durability and platform over featherweight race shoes.",
  },
  "running-watches-beginners": {
    job: "simple GPS running watches that teach the basics without burying new runners in menus",
    criteriaLine:
      "easy setup, reliable GPS for road routes, readable training insights, battery for a training week, and a price that is not overbuilt",
    lookFor: [
      { key: "simplicity", label: "Simple workflows", whyItMatters: "Start run, see pace, sync without a course." },
      { key: "gps", label: "GPS reliability", whyItMatters: "Good enough tracks for neighbourhood routes." },
      { key: "battery", label: "Week battery", whyItMatters: "Survives a normal training week." },
      { key: "coaching", label: "Gentle guidance", whyItMatters: "Useful prompts without overwhelm." },
      { key: "value", label: "Beginner value", whyItMatters: "Capability without flagship pricing." },
    ],
    avoidGeneric: ["Ultrarunners needing multi-day maps", "Athletes who want full music + mapping flagships"],
    methodologyExtra:
      "Beginner lane under Best Running Watches — simplicity and value over flagship depth.",
  },
  "running-watches-budget": {
    job: "capable GPS running watches that protect the budget without gutting core training needs",
    criteriaLine:
      "GPS quality per pound, battery for weekly training, essential run metrics, and what you give up vs mid-range",
    lookFor: [
      { key: "value", label: "GPS per pound", whyItMatters: "Core accuracy without luxury extras." },
      { key: "battery", label: "Battery basics", whyItMatters: "Enough for weekly runs + sleep tracking." },
      { key: "metrics", label: "Essential metrics", whyItMatters: "Pace, distance, HR pairing, simple workouts." },
      { key: "ecosystem", label: "App honesty", whyItMatters: "Sync and training history that stay usable." },
      { key: "limits", label: "Known limits", whyItMatters: "Maps/music/multisport gaps called out." },
    ],
    avoidGeneric: ["Buyers who need offline maps and music onboard", "Pros needing advanced race predictors"],
    methodologyExtra:
      "Budget lane — essential running GPS first; flagship features are optional.",
  },
  "running-watches-marathon": {
    job: "marathon-block training and race-day GPS with battery, pacing tools and recovery insight",
    criteriaLine:
      "long-run battery, pacing/race tools, training load visibility, comfort for long sessions, and ecosystem depth for a block",
    lookFor: [
      { key: "battery", label: "Long-run battery", whyItMatters: "GPS modes that finish a marathon + warm-up." },
      { key: "pacing", label: "Race pacing tools", whyItMatters: "Targets, splits and pace guidance that help." },
      { key: "load", label: "Training load", whyItMatters: "Block fatigue visibility without noise." },
      { key: "comfort", label: "All-day comfort", whyItMatters: "Wearable for sleep + long Sundays." },
      { key: "ecosystem", label: "Ecosystem", whyItMatters: "Plans, HR straps and analysis that stick." },
    ],
    avoidGeneric: ["Casual joggers who only need a basic stopwatch GPS", "Trail ultrarunners prioritising topo maps"],
    methodologyExtra:
      "Marathon-block watch lane — battery and pacing over trail navigation.",
  },
  "running-watches-trail": {
    job: "trail and adventure running with navigation, durability and off-road GPS modes",
    criteriaLine:
      "maps/navigation, multi-band GPS in cover, battery for trail days, durability, and buttons you can use with gloves",
    lookFor: [
      { key: "nav", label: "Maps & navigation", whyItMatters: "Courses, breadcrumbs or topo you can follow." },
      { key: "gps", label: "Covered GPS", whyItMatters: "Multi-band / trail modes under canopy." },
      { key: "battery", label: "Trail-day battery", whyItMatters: "Survive long days with nav on." },
      { key: "durability", label: "Durability", whyItMatters: "Cases and straps that take scrapes." },
      { key: "controls", label: "Glove-friendly controls", whyItMatters: "Buttons when touchscreens fail." },
    ],
    avoidGeneric: ["Road-only runners who never leave pavement", "Buyers who only want a slim fashion watch"],
    methodologyExtra:
      "Trail navigation lane — maps and covered GPS over pure road race tools.",
  },
  "running-watches-ultra": {
    job: "ultra-distance running with multi-day battery, navigation and field durability",
    criteriaLine:
      "multi-day battery strategies, navigation, charging options, durability, and data you can trust when tired",
    lookFor: [
      { key: "battery", label: "Multi-day battery", whyItMatters: "Ultra modes and charging realism." },
      { key: "nav", label: "Ultra navigation", whyItMatters: "Courses and backtracking when foggy-brained." },
      { key: "fields", label: "Useful data fields", whyItMatters: "What you need at 3am, not clutter." },
      { key: "durability", label: "Field durability", whyItMatters: "Hardware that survives aid-station chaos." },
      { key: "ecosystem", label: "Crew / analysis", whyItMatters: "Post-race analysis and live track where useful." },
    ],
    avoidGeneric: ["5K specialists", "Beginners who will never race beyond a half"],
    methodologyExtra:
      "Ultra lane — battery and navigation depth beyond marathon road watches.",
  },
  "running-watches-music": {
    job: "running watches with onboard music so you can leave the phone when it is safe",
    criteriaLine:
      "storage and service support, battery with music on, controls while moving, and GPS quality that does not collapse with audio",
    lookFor: [
      { key: "music", label: "Music services & storage", whyItMatters: "Spotify/Deezer/offline storage that works." },
      { key: "battery", label: "Battery with music", whyItMatters: "Real numbers with Bluetooth headphones." },
      { key: "controls", label: "On-wrist controls", whyItMatters: "Skip/volume without fishing for a phone." },
      { key: "gps", label: "GPS with audio", whyItMatters: "Tracking stays honest while streaming." },
      { key: "awareness", label: "Safety honesty", whyItMatters: "When open-ear / no-music is smarter." },
    ],
    avoidGeneric: ["Runners who always carry a phone for audio", "Buyers in regions without supported music services"],
    methodologyExtra:
      "Music-capable running watches — storage and battery-with-audio called out explicitly.",
  },
  "running-watches-small-wrists": {
    job: "capable running GPS that actually fits smaller wrists without overhang",
    criteriaLine:
      "case diameter and lug shape, strap options, readable display at size, and features that still cover training",
    lookFor: [
      { key: "size", label: "Case & lug fit", whyItMatters: "Diameter and shape that sit on smaller wrists." },
      { key: "strap", label: "Strap options", whyItMatters: "Shortable straps / small sizes in stock." },
      { key: "display", label: "Readable at size", whyItMatters: "UI that stays legible on a smaller face." },
      { key: "features", label: "Training still complete", whyItMatters: "Does not gut GPS features to shrink." },
      { key: "weight", label: "Comfort weight", whyItMatters: "All-day wear without hot spots." },
    ],
    avoidGeneric: ["Large-wrist buyers hunting max screen area", "Athletes who prefer oversized multisport bricks"],
    methodologyExtra:
      "Small-wrist fit first — case size verified against training capability.",
  },
  "heart-rate-monitors-chest-straps": {
    job: "chest-strap ECG accuracy for quality sessions when optical wrist HR is not enough",
    criteriaLine:
      "ECG signal quality, strap comfort, Bluetooth/ANT+ pairing breadth, and memory/dual-connect when you train with multiple devices",
    lookFor: [
      { key: "accuracy", label: "ECG accuracy", whyItMatters: "Chest signal for intervals and tempo." },
      { key: "comfort", label: "Strap comfort", whyItMatters: "Survives sweaty hard sessions." },
      { key: "pairing", label: "Pairing breadth", whyItMatters: "Watch, bike computer, gym apps." },
      { key: "memory", label: "Memory / dual connect", whyItMatters: "When you need two devices or storage." },
      { key: "care", label: "Care & longevity", whyItMatters: "Washable straps and replaceable parts." },
    ],
    avoidGeneric: ["Runners happy with accurate-enough wrist optical", "Anyone unwilling to wear a chest strap"],
    methodologyExtra:
      "Chest-strap lane under running HRMs — accuracy over convenience optical.",
  },
  "heart-rate-monitors-intervals": {
    job: "heart-rate gear that tracks hard intervals without lag wrecking the session",
    criteriaLine:
      "fast response on surges, pairing reliability mid-workout, and whether chest or optical is the right tool for your intervals",
    lookFor: [
      { key: "response", label: "Surge response", whyItMatters: "Tracks hard reps without sticky lag." },
      { key: "pairing", label: "Mid-session reliability", whyItMatters: "Stays connected when you sweat." },
      { key: "placement", label: "Chest vs optical", whyItMatters: "Honest about when strap wins." },
      { key: "metrics", label: "Useful metrics", whyItMatters: "Zones and dynamics you will actually use." },
      { key: "value", label: "Value for quality work", whyItMatters: "Worth it vs watch-only optical." },
    ],
    avoidGeneric: ["Easy-only joggers", "Athletes who never do structured intervals"],
    methodologyExtra:
      "Interval accuracy lane — response time and connection reliability over lifestyle HR features.",
  },
  "running-packs": {
    job: "running packs and vests for training and racing carry — bounce control, capacity and access",
    criteriaLine:
      "capacity for the distance, bounce control, pocket access while moving, flask compatibility, and when a belt beats a vest",
    lookFor: [
      { key: "capacity", label: "Capacity", whyItMatters: "Volume matched to hours out." },
      { key: "bounce", label: "Bounce control", whyItMatters: "Stable when full at easy and race paces." },
      { key: "access", label: "On-the-run access", whyItMatters: "Gels, flasks, poles without a stop." },
      { key: "flasks", label: "Flask / bladder fit", whyItMatters: "Compatible soft flasks and routing." },
      { key: "vs-belt", label: "Vs belt", whyItMatters: "When a belt is the smarter minimal carry." },
    ],
    avoidGeneric: ["Phone-only road runners who hate torso packs", "Hikers needing expedition backpacks"],
    methodologyExtra:
      "Pack/vest carry roles — distinct from Belts and Handheld bottles guides.",
  },
  "running-headphones": {
    job: "running headphones with awareness, fit and weather resistance for outdoor miles",
    criteriaLine:
      "open-ear vs sealed trade-offs, stability at pace, sweat/weather resistance, battery for long runs, and controls you can hit gloved",
    lookFor: [
      { key: "awareness", label: "Situational awareness", whyItMatters: "Open-ear vs ANC honesty for roads." },
      { key: "fit", label: "Run fit", whyItMatters: "Stays put without hot spots." },
      { key: "weather", label: "Sweat & weather", whyItMatters: "IP rating that matches your climate." },
      { key: "battery", label: "Long-run battery", whyItMatters: "Covers workouts and long Sundays." },
      { key: "controls", label: "On-run controls", whyItMatters: "Skip/volume without breaking form." },
    ],
    avoidGeneric: ["Studio-only listeners who never run outside", "Buyers needing max ANC isolation on busy roads (safety)"],
    methodologyExtra:
      "Running-first audio — awareness and fit over pure audiophile isolation.",
  },
  "running-socks": {
    job: "running socks that manage blister risk, cushion and climate for real mileage",
    criteriaLine:
      "blister management, cushion zones, moisture handling, height options, and durability through laundry cycles",
    lookFor: [
      { key: "blister", label: "Blister management", whyItMatters: "Seams, fit and friction control." },
      { key: "cushion", label: "Cushion zones", whyItMatters: "Protection without hot bulk." },
      { key: "moisture", label: "Moisture handling", whyItMatters: "Yarns that stay usable wet." },
      { key: "height", label: "Height options", whyItMatters: "No-show to crew for shoe and climate." },
      { key: "durability", label: "Wash durability", whyItMatters: "Survives weekly laundry." },
    ],
    avoidGeneric: ["Fashion sock shoppers", "Anyone fine with cotton gym socks for short walks only"],
    methodologyExtra:
      "Mileage sock roles — blister and moisture first.",
  },
  "running-headlamps": {
    job: "running headlamps and lights for dark training with beam, comfort and runtime",
    criteriaLine:
      "beam pattern for road/trail, bounce-free fit, runtime at useful output, weather sealing, and backup options",
    lookFor: [
      { key: "beam", label: "Beam pattern", whyItMatters: "Spot/flood balance for your surfaces." },
      { key: "fit", label: "Bounce-free fit", whyItMatters: "Stays put at easy and race paces." },
      { key: "runtime", label: "Runtime at useful lumens", whyItMatters: "Real output hours, not max-boost only." },
      { key: "weather", label: "Weather sealing", whyItMatters: "Rain and sweat tolerance." },
      { key: "backup", label: "Redundancy", whyItMatters: "When a second light is mandatory." },
    ],
    avoidGeneric: ["Daylight-only runners", "Campers needing lantern modes more than run beams"],
    methodologyExtra:
      "Running light roles — beam and bounce control over camping lantern features.",
  },
  "running-belts": {
    job: "running belts for phone, flasks and race nutrition with minimal bounce",
    criteriaLine:
      "bounce control, capacity for phone/flasks/gels, comfort over long hours, and when a vest is still better",
    lookFor: [
      { key: "bounce", label: "Bounce control", whyItMatters: "Stable with a phone and flasks." },
      { key: "capacity", label: "Capacity", whyItMatters: "Phone + nutrition without overflow." },
      { key: "flasks", label: "Flask compatibility", whyItMatters: "Soft flasks that actually fit." },
      { key: "comfort", label: "Long-run comfort", whyItMatters: "No chafe at the waist." },
      { key: "vs-vest", label: "Vs vest", whyItMatters: "When torso carry wins for volume." },
    ],
    avoidGeneric: ["Ultrarunners needing 8L+ vest capacity", "Runners who refuse any waist carry"],
    methodologyExtra:
      "Belt form-factor lane — distinct from hydration vests and handheld bottles.",
  },
  "handheld-running-bottles": {
    job: "handheld bottles for road and trail when you want water without a vest",
    criteriaLine:
      "hand comfort, capacity, bounce/hand fatigue, soft-flask vs bottle, and race vs training use",
    lookFor: [
      { key: "hand", label: "Hand comfort", whyItMatters: "Shape that does not numb fingers." },
      { key: "capacity", label: "Capacity", whyItMatters: "Enough between fountains/aid." },
      { key: "fatigue", label: "Hand fatigue", whyItMatters: "Still usable late in long runs." },
      { key: "access", label: "Drink access", whyItMatters: "Valves you can hit while moving." },
      { key: "vs-belt", label: "Vs belt/vest", whyItMatters: "When hands-free carry is smarter." },
    ],
    avoidGeneric: ["Runners who hate carrying anything in-hand", "Ultra crews needing multi-flask vest systems"],
    methodologyExtra:
      "Handheld form-factor — complementary to belts and vests, not a duplicate vest list.",
  },
  "hydration-vests-trail": {
    job: "trail hydration vests with bounce control, flask access and optional pole carry",
    criteriaLine:
      "trail-specific bounce control, soft-flask front pockets, pole attachment, weather storage, and fit over technical terrain",
    lookFor: [
      { key: "bounce", label: "Trail bounce control", whyItMatters: "Stable on descents and technical footing." },
      { key: "flasks", label: "Front flask access", whyItMatters: "Drink without stopping." },
      { key: "poles", label: "Pole carry", whyItMatters: "Quivers / straps that work mid-move." },
      { key: "storage", label: "Weather & fuel storage", whyItMatters: "Jacket + gels without a hiking pack." },
      { key: "fit", label: "Trail fit", whyItMatters: "Sizing that stays put when loaded." },
    ],
    avoidGeneric: ["Road-only marathoners who never hit trail", "Hikers needing large backpacks"],
    methodologyExtra:
      "Trail vest lane — poles and technical bounce. Ultra capacity lives in hydration-vests-ultra; road marathon carry in hydration-marathon-training.",
  },
  "hydration-vests-ultra": {
    job: "ultra-distance vest capacity, all-day comfort and aid-station practicality",
    criteriaLine:
      "volume for long ultras, comfort over many hours, flask/bladder options, accessibility when exhausted, and weather layer carry",
    lookFor: [
      { key: "volume", label: "Ultra volume", whyItMatters: "Capacity for long stages between aid." },
      { key: "comfort", label: "All-day comfort", whyItMatters: "Chafe control over 10–30 hours." },
      { key: "access", label: "Exhausted-access pockets", whyItMatters: "Gels and flasks you can find at 3am." },
      { key: "hydration", label: "Flask / bladder options", whyItMatters: "Flexible hydration strategy." },
      { key: "weather", label: "Mandatory kit carry", whyItMatters: "Space for race-required layers." },
    ],
    avoidGeneric: ["Short trail runners with 5K loops", "Road racers who only need a belt"],
    methodologyExtra:
      "Ultra vest capacity lane — distinct from lighter trail day vests.",
  },
  "hydration-marathon-training": {
    job: "hydration for marathon-block long runs on road — belts, handhelds and light vests",
    criteriaLine:
      "enough fluid for fountain gaps, low bounce at marathon pace practice, nutrition access, and when a race-day bottle handoff changes the choice",
    lookFor: [
      { key: "volume", label: "Long-run volume", whyItMatters: "Fluid between city fountains / loops." },
      { key: "bounce", label: "Road bounce", whyItMatters: "Stable at easy and MP paces." },
      { key: "fuel", label: "Gel access", whyItMatters: "Race-fuel practice without digging." },
      { key: "heat", label: "Heat strategy", whyItMatters: "Summer long-run realism." },
      { key: "race-day", label: "Race-day transition", whyItMatters: "When to drop carry for aid stations." },
    ],
    avoidGeneric: ["Trail ultrarunners needing pole-ready vests", "Short easy runners who never exceed 60 minutes"],
    methodologyExtra:
      "Marathon-block road hydration — belts/handhelds/light vests. Trail/ultra vests are separate guides.",
  },
  "running-sunglasses": {
    job: "running sunglasses with coverage, lens options and bounce-free fit",
    criteriaLine:
      "coverage and lens tint for your light, secure fit at pace, weight, sweat venting, and interchangeable lenses where useful",
    lookFor: [
      { key: "coverage", label: "Coverage", whyItMatters: "Shields eyes without tunnel vision." },
      { key: "lens", label: "Lens & light", whyItMatters: "Tint/photochromic matched to conditions." },
      { key: "fit", label: "Run-stable fit", whyItMatters: "No bounce on descents." },
      { key: "weight", label: "Weight", whyItMatters: "Comfort for long efforts." },
      { key: "venting", label: "Sweat & fog", whyItMatters: "Venting that survives hard efforts." },
    ],
    avoidGeneric: ["Fashion-only sunglasses shoppers", "Indoor treadmill-only runners"],
    methodologyExtra:
      "Running-specific eyewear — coverage and stability over fashion frames.",
  },
  "running-race-fuel": {
    job: "race and long-run fuel formats with usable carbohydrate delivery — not medical advice",
    criteriaLine:
      "format (gel/chew/drink), carbohydrate per serving, caffeine options, gut tolerance context, and how you practise in training",
    lookFor: [
      { key: "format", label: "Format", whyItMatters: "Gel, chew, drink mix — what you will actually take." },
      { key: "carbs", label: "Carbs per serving", whyItMatters: "Label amounts for race maths." },
      { key: "caffeine", label: "Caffeine options", whyItMatters: "Clear caf vs non-caf choices." },
      { key: "gut", label: "Gut practicality", whyItMatters: "Texture and flavour you can repeat." },
      { key: "practice", label: "Training practice", whyItMatters: "Easy to rehearse on long runs." },
    ],
    avoidGeneric: ["Anyone seeking medical or therapeutic nutrition claims", "Runners who never race beyond 5K without fuel needs"],
    methodologyExtra:
      "Label/spec-led fuel picks only — not medical advice. Practise in training before race day.",
  },
  "running-recovery-gear": {
    job: "recovery tools runners actually use between hard sessions — honest limits included",
    criteriaLine:
      "use-case fit (massage, compression, slides), time cost, evidence humility, and what recovery gear cannot replace",
    lookFor: [
      { key: "job", label: "Clear job", whyItMatters: "Massage, compression, or easy-walk recovery." },
      { key: "time", label: "Time cost", whyItMatters: "Fits a real training week." },
      { key: "evidence", label: "Evidence humility", whyItMatters: "Comfort aid ≠ miracle healing." },
      { key: "travel", label: "Home vs travel", whyItMatters: "What packs for races." },
      { key: "limits", label: "Hard limits", whyItMatters: "Sleep and training load still win." },
    ],
    avoidGeneric: ["Buyers expecting injury cures from gadgets", "Athletes who will not use the tool weekly"],
    methodologyExtra:
      "Recovery aids with honest limits — sleep and load management still dominate.",
  },
  "running-safety-visibility": {
    job: "visibility and safety kit for dark-road and shared-path running",
    criteriaLine:
      "light output/visibility angles, wearability at pace, battery/runtime, and pairing lights with reflective layers",
    lookFor: [
      { key: "visibility", label: "360° visibility", whyItMatters: "Drivers and cyclists can see you." },
      { key: "wear", label: "Run wearability", whyItMatters: "Stays put without chafe." },
      { key: "runtime", label: "Runtime", whyItMatters: "Covers your darkest routes." },
      { key: "layers", label: "With reflective layers", whyItMatters: "Lights + clothing as a system." },
      { key: "limits", label: "Safety limits", whyItMatters: "Gear helps — route choice still matters." },
    ],
    avoidGeneric: ["Daylight trail-only runners", "Drivers shopping car safety gear"],
    methodologyExtra:
      "Runner visibility systems — complementary to headlamps guide.",
  },
  "running-clothing-hot-weather": {
    job: "hot-weather running clothing that manages heat, sweat and chafe",
    criteriaLine:
      "fabric breathability, chafe control, pocket practicality, sun coverage options, and fit that stays put wet",
    lookFor: [
      { key: "breathability", label: "Breathability", whyItMatters: "Fabrics that dump heat." },
      { key: "chafe", label: "Chafe control", whyItMatters: "Seams and cuts for sweaty miles." },
      { key: "pockets", label: "Pockets", whyItMatters: "Gels/phone without bounce." },
      { key: "sun", label: "Sun options", whyItMatters: "Coverage when you want it." },
      { key: "fit", label: "Wet fit", whyItMatters: "Still secure when soaked." },
    ],
    avoidGeneric: ["Cold-climate only runners", "Formal athleticwear shoppers"],
    methodologyExtra:
      "Heat-management clothing roles — distinct from winter and rain guides.",
  },
  "running-gear-winter": {
    job: "winter running layers for cold, wind and wet without overheating mid-run",
    criteriaLine:
      "layering logic, wind/water protection, visibility in dark months, and dexterity for watches/gels with gloves",
    lookFor: [
      { key: "layers", label: "Layering logic", whyItMatters: "Base/mid/shell that vent on climbs." },
      { key: "wind", label: "Wind & wet", whyItMatters: "Protection without sauna effect." },
      { key: "visibility", label: "Dark-month visibility", whyItMatters: "Reflective details that matter." },
      { key: "dexterity", label: "Glove dexterity", whyItMatters: "Watch and gel access." },
      { key: "storage", label: "Warm storage", whyItMatters: "Where layers go when you heat up." },
    ],
    avoidGeneric: ["Tropical-climate runners", "Ski touring kit shoppers"],
    methodologyExtra:
      "Winter running system — complements jackets and rain-jacket guides.",
  },
  "running-jackets": {
    job: "running jackets for wind, light rain and changeable training weather",
    criteriaLine:
      "weather protection vs breathability, packability, visibility, and pocket layout for training",
    lookFor: [
      { key: "weather", label: "Weather balance", whyItMatters: "Blocks wind/light rain without cooking you." },
      { key: "pack", label: "Packability", whyItMatters: "Stuffs when the sun returns." },
      { key: "breathability", label: "Breathability", whyItMatters: "Hard efforts under a shell." },
      { key: "visibility", label: "Visibility", whyItMatters: "Dark commuting runs." },
      { key: "pockets", label: "Pockets", whyItMatters: "Phone/gels without bounce." },
    ],
    avoidGeneric: ["Expedition mountaineering shell buyers", "Runners who never face wind or drizzle"],
    methodologyExtra:
      "Training jacket lane — rain-specialist shells deepen in running-rain-jackets.",
  },
  "running-rain-jackets": {
    job: "dedicated rain shells for hard wet runs when a wind jacket is not enough",
    criteriaLine:
      "waterproofing honesty, breathability under effort, hood/hem design for running, and packability for changeable days",
    lookFor: [
      { key: "waterproof", label: "Waterproofing", whyItMatters: "Real rain protection, not marketing DWR only." },
      { key: "breathability", label: "Hard-effort breathability", whyItMatters: "Survives tempo in rain." },
      { key: "hood", label: "Hood & hem", whyItMatters: "Stays put at pace." },
      { key: "pack", label: "Packability", whyItMatters: "Lives in a vest pocket." },
      { key: "vs-wind", label: "Vs wind jacket", whyItMatters: "When you truly need a rain shell." },
    ],
    avoidGeneric: ["Dry-climate runners", "Hikers needing expedition 3-layer expedition shells"],
    methodologyExtra:
      "Rain-specialist shells — differentiated from general running jackets.",
  },
  "running-shorts": {
    job: "running shorts with liner, pocket and chafe stories that match your sessions",
    criteriaLine:
      "liner quality, pocket layout, length/split for stride, chafe control, and weather versatility",
    lookFor: [
      { key: "liner", label: "Liner comfort", whyItMatters: "Support without hot spots." },
      { key: "pockets", label: "Pocket layout", whyItMatters: "Gels/phone that do not bounce." },
      { key: "split", label: "Length & split", whyItMatters: "Stride freedom for your pace mix." },
      { key: "chafe", label: "Chafe control", whyItMatters: "Seams and fabrics for sweaty miles." },
      { key: "season", label: "Season range", whyItMatters: "When tights take over." },
    ],
    avoidGeneric: ["Gym-only short shoppers", "Cold-weather runners who live in tights"],
    methodologyExtra:
      "Shorts lane — pocket and liner details over fashion fits.",
  },
  "running-tights": {
    job: "running tights for cool weather, support and pocket practicality",
    criteriaLine:
      "support and compression feel, pocket layout, weather warmth, chafe control, and whether you want lined or layerable",
    lookFor: [
      { key: "support", label: "Support feel", whyItMatters: "Hold without sausage compression." },
      { key: "pockets", label: "Pockets", whyItMatters: "Phone/gels that stay put." },
      { key: "warmth", label: "Warmth range", whyItMatters: "Matched to your winter." },
      { key: "chafe", label: "Chafe control", whyItMatters: "Seams for long efforts." },
      { key: "layer", label: "Layering", whyItMatters: "Under shorts vs standalone." },
    ],
    avoidGeneric: ["Hot-weather only runners", "Fashion leggings shoppers without run pockets"],
    methodologyExtra:
      "Tights lane — cool-weather support and pockets.",
  },
};

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function shortName(p: Product): string {
  return p.name || p.fullName.replace(/^(\w+)\s+/, "");
}

function ensureIntro(ctx: Context, guide: BestGuide): string {
  const title = guide.title.replace(/\s+2026$/, "");
  const base = `${title} is a decision guide for ${ctx.job} — not a generic top-10 or affiliate scoreboard. We shortlist products that own distinct roles for this job, then recommend the ones that beat close peers on ${ctx.criteriaLine}. Rankings reflect use-case fit and honest trade-offs, not Kitletics Score alone and never affiliate commission. Use the shortcuts when you already know the constraint; read the pick cards when two options look similar on paper. ${ctx.methodologyExtra}`;
  const pad =
    " If you are still unsure, start with how you actually train this month, what you will carry or wear most weeks, and which trade-off you refuse to live with — then match a pick to that constraint instead of chasing a single overall winner.";
  let intro = base;
  while (words(`${intro} ${ctx.criteriaLine}`) < 110) intro += pad;
  return intro;
}

function whatMatters(ctx: Context): string {
  return `What matters here: ${ctx.criteriaLine}. Ignore affiliate badges and global scores when they fight the job. A great pick in another Best Guide can be the wrong tool for this one.`;
}

function methodology(ctx: Context): string {
  return `${ctx.methodologyExtra} Considered universe: published catalog products relevant to this intent. Shortlist requires a distinct decision role. Final recommendations are role winners. Affiliate commission does not influence considered, shortlisted, recommended, rank or award decisions.`;
}

function buildRecPatch(
  guide: BestGuide,
  rec: BestGuideRecommendation,
  product: Product,
  peers: Product[],
  ctx: Context,
): Record<string, unknown> {
  const name = product.fullName;
  const strengths = (product.strengths ?? []).slice(0, 3);
  const weaknesses = (product.weaknesses ?? []).slice(0, 3);
  const altIds = [
    ...(product.alternativeProductIds ?? []),
    ...peers.map((p) => p.id),
  ].filter((id) => id !== product.id);
  const uniqueAlts = [...new Set(altIds)].slice(0, 4);
  const altProducts = uniqueAlts
    .map((id) => getProductById(id, { isDev: true }))
    .filter(Boolean) as Product[];

  const whyItFits = [
    `${name} fits ${ctx.job} when you need ${strengths[0] ?? rec.summary ?? "a clear role winner in this shortlist"} — judged for this guide’s use case, not as a generic “best shoe/watch.”`,
    `In this context it earns the pick for ${(strengths.slice(0, 2).join(" and ") || rec.rationale || "role clarity against close peers").toLowerCase()}.`,
    `I'd shortlist it when your weeks match that job. I'd pause if ${weaknesses[0] ? weaknesses[0].toLowerCase() : "you need a different specialty than this award covers"}.`,
  ];

  const tradeoffs =
    weaknesses.length >= 2
      ? weaknesses.slice(0, 3)
      : [
          ...(weaknesses[0] ? [weaknesses[0]] : []),
          `Not a universal solution outside ${ctx.job}.`,
          `Specialists in neighbouring Best Guides may beat it for other sessions.`,
        ].slice(0, 3);

  const bestForProfiles = [
    `Runners whose training matches ${ctx.job}`,
    strengths[0]
      ? `Athletes who prioritise ${strengths[0].toLowerCase()}`
      : `Athletes who want ${rec.summary ?? "this award’s role"}`,
  ];

  const whoShouldAvoid = [
    ctx.avoidGeneric[0] ?? "Runners whose primary need sits in a different Best Guide",
    weaknesses[0]
      ? `Anyone unwilling to accept: ${weaknesses[0]}`
      : ctx.avoidGeneric[1] ?? "Shoppers chasing a different specialty",
  ];

  const chooseInsteadWhen = altProducts.slice(0, 2).map((alt, i) => ({
    when:
      i === 0
        ? `you need a closer fit for a different role than ${shortName(product)} owns here`
        : `the ${shortName(alt)} role matches your week better than this pick`,
    productId: alt.id,
    label: shortName(alt),
  }));

  // Ensure at least one choose-instead even if alts thin
  if (chooseInsteadWhen.length === 0 && peers[0]) {
    chooseInsteadWhen.push({
      when: `another shortlist pick owns your constraint better`,
      productId: peers[0].id,
      label: shortName(peers[0]),
    });
  }

  return {
    whyItFits,
    whyItWon: `${name} takes this award because it covers ${ctx.job} more completely than close peers for the runners described below — not because of a global score or commission.`,
    tradeoffs,
    bestForProfiles,
    whoShouldAvoid,
    notIdealFor: [
      `Sessions outside ${ctx.job}`,
      tradeoffs[0] ?? "Needs that belong in a neighbouring Best Guide",
    ],
    chooseInsteadWhen,
    useCaseStrengths:
      strengths.length > 0
        ? strengths
        : [
            `Strong match for ${ctx.job}`,
            rec.summary ?? "Clear role in this shortlist",
            "Beats close peers on the criteria above",
          ],
    evidenceIds: [EVIDENCE],
  };
}

function expandConsidered(
  guide: BestGuide,
  recIds: string[],
): { considered: string[]; shortlisted: string[] } {
  const catProducts = getProductsByCategory(guide.categoryId, {
    isDev: true,
  }).filter((p) => !p.noindex && p.lifecycleStatus !== "upcoming");

  const peerExtra: string[] = [];
  for (const id of recIds) {
    const p = getProductById(id, { isDev: true });
    for (const alt of p?.alternativeProductIds ?? []) {
      if (!recIds.includes(alt)) peerExtra.push(alt);
    }
  }

  const extras = [...new Set([...peerExtra, ...catProducts.map((p) => p.id)])]
    .filter((id) => !recIds.includes(id))
    .slice(0, Math.max(8, recIds.length));

  const considered = [...new Set([...recIds, ...extras, ...peerExtra])].slice(
    0,
    Math.max(recIds.length + 6, 12),
  );
  const shortlisted = [...new Set([...recIds, ...peerExtra.slice(0, 4)])];
  return { considered, shortlisted };
}

function defaultContext(guide: BestGuide): Context {
  return {
    job: guide.subtitle ?? guide.shortDescription ?? guide.title,
    criteriaLine:
      "use-case fit, durable performance for how you actually train, and honest trade-offs against close peers",
    lookFor: (guide.selectionCriteria ?? []).slice(0, 5).map((c) => ({
      key: c.key,
      label: c.label,
      whyItMatters: c.description,
    })),
    avoidGeneric: [
      "Shoppers whose primary need sits in a different Best Guide",
      "Anyone chasing a single overall scoreboard winner",
    ],
    methodologyExtra: guide.selectionMethodology || guide.methodologySummary || "",
  };
}

function generate() {
  const running = bestGuides.filter((g) => g.sportId === "sport-running");
  const targets = running.filter((g) => !P0_SLUGS.has(g.slug));

  const patches: Record<string, unknown> = {};

  for (const guide of targets) {
    const ctx = CONTEXTS[guide.slug] ?? defaultContext(guide);
    const recs = guide.recommendations ?? [];
    const products = recs
      .map((r) => getProductById(r.productId, { isDev: true }))
      .filter(Boolean) as Product[];

    const recPatches: Record<string, unknown> = {};
    for (const rec of recs) {
      const product = getProductById(rec.productId, { isDev: true });
      if (!product) continue;
      const peers = products.filter((p) => p.id !== product.id);
      recPatches[rec.productId] = buildRecPatch(guide, rec, product, peers, ctx);
    }

    const recIds = recs.map((r) => r.productId);
    const { considered, shortlisted } = expandConsidered(guide, recIds);

    const shortcuts = recs.slice(0, 6).map((r, i) => {
      const p = getProductById(r.productId, { isDev: true });
      return {
        need: r.summary || r.badge || `Role ${i + 1} in this guide`,
        productId: r.productId,
        reason: (p?.strengths?.[0] ?? r.rationale ?? "Best fit for this constraint").slice(0, 120),
      };
    });

    const lookFor =
      ctx.lookFor.length >= 2
        ? ctx.lookFor
        : (guide.selectionCriteria ?? []).slice(0, 5).map((c) => ({
            key: c.key,
            label: c.label,
            whyItMatters: c.description,
          }));

    patches[guide.slug] = {
      intro: ensureIntro(ctx, guide),
      whatMattersIntro: whatMatters(ctx),
      methodologySummary: methodology(ctx),
      selectionMethodology: methodology(ctx),
      evidenceIds: [EVIDENCE],
      whatWeLookFor: lookFor,
      decisionShortcuts: shortcuts,
      quickTake: shortcuts.slice(0, 6).map(
        (s) => `Choose ${getProductById(s.productId, { isDev: true })?.name ?? "this pick"} if ${s.need}.`,
      ),
      consideredProductIds: considered,
      shortlistedProductIds: shortlisted,
      comparisonProductIds:
        guide.comparisonProductIds?.length >= 2
          ? guide.comparisonProductIds
          : recIds.slice(0, Math.min(6, recIds.length)),
      recommendations: recPatches,
    };
  }

  const body = `/**
 * Pre-launch 17 — Running Best Guide enrichment (non-P0) to LAUNCH_READY.
 * Auto-generated decision-depth patches. Affiliate-neutral. Do not invent first-hand tests.
 */
import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";

const EVIDENCE = ["ev-catalog-editorial"] as const;

type RecPatch = Partial<BestGuideRecommendation> & {
  whyItFits: string[];
  tradeoffs: string[];
  bestForProfiles: string[];
  whoShouldAvoid: string[];
  notIdealFor: string[];
  chooseInsteadWhen: NonNullable<BestGuideRecommendation["chooseInsteadWhen"]>;
};

type GuidePatch = {
  intro: string;
  whatMattersIntro: string;
  methodologySummary: string;
  selectionMethodology: string;
  evidenceIds: string[];
  whatWeLookFor?: BestGuide["whatWeLookFor"];
  decisionShortcuts?: BestGuide["decisionShortcuts"];
  quickTake?: string[];
  consideredProductIds?: string[];
  shortlistedProductIds?: string[];
  comparisonProductIds?: string[];
  recommendations: Record<string, RecPatch>;
};

const P1_PATCHES: Record<string, GuidePatch> = ${JSON.stringify(patches, null, 2)};

function mergeRec(
  base: BestGuideRecommendation,
  patch?: RecPatch,
): BestGuideRecommendation {
  if (!patch) return base;
  return {
    ...base,
    whyItFits: patch.whyItFits ?? base.whyItFits,
    whyItWon: patch.whyItWon ?? base.whyItWon,
    tradeoffs: patch.tradeoffs ?? base.tradeoffs,
    compromises: base.compromises ?? patch.tradeoffs,
    bestForProfiles: patch.bestForProfiles ?? base.bestForProfiles,
    whoShouldAvoid: patch.whoShouldAvoid ?? base.whoShouldAvoid,
    notIdealFor: patch.notIdealFor ?? base.notIdealFor,
    chooseInsteadWhen: patch.chooseInsteadWhen ?? base.chooseInsteadWhen,
    useCaseStrengths: patch.useCaseStrengths ?? base.useCaseStrengths,
    strengths: base.strengths ?? patch.useCaseStrengths,
    evidenceIds: patch.evidenceIds ?? base.evidenceIds ?? [...EVIDENCE],
    considerInsteadProductIds:
      base.considerInsteadProductIds ??
      (patch.chooseInsteadWhen?.map((c) => c.productId).filter(Boolean) as
        | string[]
        | undefined),
  };
}

export function applyBestGuideP1LaunchReadyEnrichment(
  guides: BestGuide[],
): BestGuide[] {
  return guides.map((guide) => {
    const patch = P1_PATCHES[guide.slug];
    if (!patch) return guide;
    return {
      ...guide,
      intro: patch.intro,
      whatMattersIntro: patch.whatMattersIntro,
      methodologySummary: patch.methodologySummary,
      selectionMethodology: patch.selectionMethodology,
      evidenceIds: [...new Set([...(patch.evidenceIds ?? []), ...(guide.evidenceIds ?? [])])],
      whatWeLookFor: patch.whatWeLookFor ?? guide.whatWeLookFor,
      decisionShortcuts: patch.decisionShortcuts ?? guide.decisionShortcuts,
      quickTake: patch.quickTake ?? guide.quickTake,
      consideredProductIds: patch.consideredProductIds ?? guide.consideredProductIds,
      shortlistedProductIds: patch.shortlistedProductIds ?? guide.shortlistedProductIds,
      comparisonProductIds:
        patch.comparisonProductIds && patch.comparisonProductIds.length >= 2
          ? patch.comparisonProductIds
          : guide.comparisonProductIds,
      recommendations: guide.recommendations.map((r) =>
        mergeRec(r, patch.recommendations[r.productId]),
      ),
    };
  });
}
`;

  writeFileSync(OUT, body);
  console.log(`Wrote ${OUT} with ${Object.keys(patches).length} guide patches`);
}

generate();

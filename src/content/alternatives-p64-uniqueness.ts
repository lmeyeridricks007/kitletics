/**
 * Fix 64 — unique Alternatives intros for READY-but-non-indexable accessory pages.
 * Decision jobs, not paraphrases of the generic 4-frame intro.
 */
export const ALTERNATIVES_P64_UNIQUE_INTROS: Record<string, string> = {
  "salomon-adv-skin-5":
    "ADV Skin 5 is a 5L / 230g Sensifit race vest with twin 500 ml flasks, pole loops, and no bladder sleeve. Leave it when 5L fills (poles + jacket + food), when a reservoir is required, when you only need flasks and a phone (Duro LT / NNormal), or when 8L rear stash is the kit (VaporAir 4). Stay when bounce-controlled 5L race kit is the weekly job.",
  "nathan-vaporair-4":
    "VaporAir 4 is Nathan’s current 8L / 241g unisex flask vest — more rear stash than ADV Skin 5, still not bladder-first. Leave it for NDM bounce on technical trail (Pace 8), for a cheaper 6L race layout (UD / Alpha), or down to 5L when 8L is empty. Stay when 8L race kit plus front-flask workflow is why you outgrew VaporAir 2.",
  "osprey-duro-lt":
    "Duro LT is a men’s 1.5L / 160g flask-only Osprey — BioStretch, no pole loops, no whistle, almost no mandatory-kit volume. Leave it when race rules need 5–6L, when you need a women’s Dyna last, or when compression second-skin is the fit. Stay when Duro 6 / 15 would be empty dead weight on fast road or trail days.",
  "uswe-pace-8":
    "Pace 8 is the 8L / 290g NDM (no-dance) vest with optional bladder expansion — the bounce-first 8L, not a Salomon/Osprey sternum-ladder. Leave it for a lighter 5–6L flask race vest, for alpine pole carry without NDM (Distance 8), or when you cannot try USWE on. Stay when technical-trail bounce control plus 8L is the shopping trigger.",
  "compressport-ultrun-s-pack":
    "Ultrun S is a 5L / 180g compression second-skin vest — flasks planted like apparel, not a structured 8L pack. Leave it when sizing is unforgiving, when you need Osprey/Salomon pocket structure, or when 1.5L flask-only is enough. Stay when apparel-like bounce control on mountain/road ultras is the job and you will size the compression last carefully.",
  "nnormal-race-vest":
    "NNormal Race Vest is a 5L / 170g stripped mountain race vest — flasks and essentials, premium price, little jacket forgiveness. Leave it for Osprey value at similar minimal volume (Duro LT), for Sensifit pocket structure (ADV Skin 5), or for 6L mandatory kit (UD). Stay when you refuse adventure-pack bulk on fast trail/ultra days.",
  "hydrapak-softflask-speed-500":
    "SoftFlask Speed 500 is the 42g high-flow 500 ml vest-front flask — faster sipping than classic SoftFlask 500, still an accessory with no carry system. Leave it for a 250 ml belt flask, a handheld Skyflask, UD/Nathan pocket geometry, or the slower Salomon 500 if Speed valve is not the gap. Stay when high-flow 500 ml in a standard vest sleeve is the weekly drink.",
  "salomon-soft-flask-500":
    "Salomon Soft Flask 500 is the 38g standard-valve 500 ml vest flask — vest-pocket size, not Speed, not a handheld. Leave it when high-flow Speed sipping is the gap, when you need a Nathan 18 oz spare, a UD Body Bottle last, or a strapped ExoShot handheld. Stay when a simple 500 ml Salomon sleeve flask is the spare you actually refill.",
  "oakley-radar-ev-path":
    "Radar EV Path is a ~29g interchangeable Prizm wrap with Unobtainium grip — coverage without a frameless Encoder/Kato shield. Leave it for Tifosi Rail money, Flak XL on a larger face, Shift MAG swaps, or Goodr when you do not need wrap coverage. Stay when Prizm lens ecosystem plus sport retention is the weekly glare job.",
  "oakley-sutro-lite":
    "Sutro Lite is a ~32g open-rim Prizm shield for bright road/marathon glare — more airflow than closed Sutro, fixed lens, large last. Leave it for Kato’s uninterrupted race FOV, Cutline/S3 if you want spare lenses, Encoder if you want a different Oakley shield, or Julbo when trail photochromic is the week. Stay when sunny road coverage on a medium-to-large face is the point.",
  "oakley-encoder":
    "Encoder is Oakley’s frameless Prizm race shield — wide FOV, bold shape, no interchange, unpublished weight. Leave it for Radar EV Path if you want Prizm swaps, Sutro Lite when airflow on a large shield matters, S3/Cutline on price, or Aerolite when trail weight wins. Stay when a fixed Prizm shield FOV is the race-day glare tool.",
  "smith-attack-mag":
    "Attack MAG is Smith’s trail-first MAG wrap (~28g) with ventilation and optional photochromic ChromaPop. Leave it for Julbo Reactiv if you refuse spare lenses, Shift MAG when the road MAG last fits better, or Rush/Aerolite for a lighter Julbo trail wrap. Stay when foggy technical trail plus MAG swaps is why you are not buying a road shield.",
  "julbo-ultimate":
    "Ultimate is Julbo’s Reactiv photochromic trail wrap (~26g, 7–82% VLT) — auto-tint for canopy-to-alpine, no MAG swap. Leave it for Attack MAG if you want ChromaPop MAG spares, Shift MAG for road MAG speed, or Rush when a tighter Julbo wrap is enough. Stay when mixed-light ultra days make carrying spare lenses the problem.",
  "tifosi-rail":
    "Rail is the value interchangeable wrap (~32g) — Fototec SKUs and multi-lens kits without Prizm/MAG money. Leave it for Radar EV Path when Unobtainium/Prizm retention is the gap, Phantom Air when weight is the gap, or Vogel/Circle G when you do not want a race wrap. Stay when interchangeable coverage at value price is the only reason you opened this page.",
  "tifosi-vogel":
    "Vogel is a ~24g daily sport frame — UV400 for easy miles, not Rail coverage, not photochromic. Leave it for Rail when you need a wrap kit, Goodr OGs for no-slip value, or Circle G when polarized round is the look. Stay when a light everyday runner frame is enough and race shields would sit in the car.",
  "goodr-circle-gs":
    "Circle G is a ~19g polarized round Goodr — small last, low coverage, no-slip coating, not a wrap. Leave it for OGs if you want Goodr’s classic sport shape, Rail when glare coverage is the gap, or Vogel for a light daily sport frame. Stay when style-first easy miles beat marathon wrap coverage.",
  "ledlenser-neo9r":
    "NEO9R is Ledlenser’s 1200 lm / 199g night-trail lamp: split near/far beams you aim yourself, rear Li-ion pack with red, optional chest belt, magnetic charge, IP54. Not Petzl reactive, not BioLite SlimFit. Leave it when 199g on the skull is the complaint or when canopy needs auto-dim. Stay when you want to craft a descent beam and optionally move the pack off your head.",
  "biolite-headlamp-800-pro":
    "BioLite 800 Pro is 800 lm / 150g comfort lighting: 3D SlimFit band, 135 m reach, 30-second burst then revert, 3000 mAh micro-USB, Pass-Thru, IPX4. Leave it when you need 1200–1500 lm throw, reactive runtime, or a sealed storm lamp. Stay when no-bounce forehead comfort and rear-red on shared dark roads matter more than chasing lumens.",
  "petzl-swift-rl":
    "Swift RL is 1200 lm / 92g with REACTIVE LIGHTING and USB-C Li-ion — lumen-to-weight, IPX4, premium, overkill for lit-road jogs. Leave it for NAO RL when you want more throw and rear-red balance, BioLite/NU43/Spot when you will not pay Petzl reactive money, or NEO9R when you want manual near/far plus a chest belt. Stay when reactive 1200 lm at 92g is why the lamp is on your head.",
  "sis-beta-fuel-gel":
    "Beta Fuel gel is 40g carbs / 158 kcal, dual-source, thick, widely stocked, not high-sodium. Leave it for GO Isotonic if you want thinner 22g packets, PF30/C30 when 30g modular math plus (C30) sodium is the plan, Gel 160 when hydrogel 40g is the texture, or a caffeinated Maurten when late-race caffeine is separate. Stay when fewer 40g SiS packets is how you hit marathon carb targets.",
  "precision-pf30-gel":
    "PF30 gel is a mild 30g-carb unit (120 kcal) meant to count with PF drink mix — low-stick, not high-sodium, electrolytes live on the PH line. Leave it for Beta Fuel/Gel 160 when you want 40g per packet, GO when you want cheap isotonic, C30 when sodium belongs in the gel, or Maurten 100 when hydrogel 25g is the texture. Stay when 30g modular math without flavour fatigue is the race plan.",
  "neversecond-c30-gel":
    "C30 gel is 30g carbs plus ~200mg sodium in one packet, paired to C30 drink mix — modular, less race-table common than SiS/GU. Leave it for Beta Fuel when 40g + retail availability wins, Roctane when you want GU-format caffeine/sodium, PF30 when you want milder flavour and separate PH sodium, or Maurten when hydrogel is the gut story. Stay when gel + drink units that already include sodium is the system.",
  "clif-bar-original":
    "Clif Original is the 68g supermarket brick (~250 kcal, 45g carbs, 10g protein, soy, 150mg sodium). Fueling job: chewable calories you can buy anywhere on a slow ultra or long easy day. Leave it when race cadence cannot chew, soy is a no, or you want a specialty ultra bar / split chews / pouch. Stay when gas-station availability plus a filling bar is the point.",
  "naak-ultra-energy-bar":
    "Näak Ultra is a specialty trail bar (~28g carbs, 7g protein, 180mg sodium) positioned as ultra food, not a chocolate-chip grocery brick. Calories vary by flavour. Leave it when you need 45g Clif carbs at a petrol station, Bloks you can split mid-stride, Energize on European tables, or a pouch. Stay when you want an ultra-positioned chew with protein and sodium and will hunt the narrower shops.",
  "powerbar-energize":
    "Energize is the European race-table chewable (~39g carbs, 190mg sodium) — not Näak ‘real food’, dry without fluid, still not a gel. Leave it for Clif when grocery calories win, Näak/Veloforte when you want trail-food positioning, Bloks when split chewing is easier, or Awesome Sauce when a pouch replaces a bar. Stay when a familiar endurance bar on long training is enough.",
  "precision-pf30-drink-mix":
    "PF30 Drink Mix is a 30g-carb powder that matches PF30 gel — mild, vegan, sodium lives on PH 1500, not an 80g Maurten bottle. Leave it for Mix 320 when one bottle must hit ~80g, Tailwind when carbs+sodium belong in one scoop, Mix 160 for a 40g bottle, C30 drink when 200mg sodium per scoop is the system, or Beta Fuel drink when SiS dual-source retail matters. Stay when bottle + gel math in 30g units is the plan.",
  "neversecond-c30-sports-drink":
    "C30 Sports Drink is 30g carbs + 200mg sodium per 32g scoop — scale 1–3 scoops, pairs with C30 gel, not a single-sachet 80g bottle. Leave it for Mix 160/320 when Maurten bottles are the gut story, Tailwind when all-day sodium-in-mix is simpler, Beta Fuel drink when SiS retail/dual-source wins, or PF30 mix when you want gel-matched 30g with separate PH sodium. Stay when scalable 30g+sodium scoops plus C30 gels is the hour plan.",
  "nike-dri-fit-miler-men":
    "Miler (men) is Nike’s reflective Dri-FIT daily tee — wide sizes, hot/mild, can cling when soaked, not a singlet. Leave it for Janji when colorway/personality is the gap, Capilene when odor/travel days matter, Own the Run when budget+reflectivity is enough, Tracksmith when fabric hand is the spend, or women’s Miler when the last must be women’s. Stay when a widely sized reflective daily tee is the default heat shirt.",
  "janji-run-tee-men":
    "Janji Run tee is a breathable hot-weather daily with no reflectivity and more color story than Miler. Leave it for Miler when dusk reflective hits matter, Capilene when odor/hike-travel crossover matters, Tracksmith when merino-like hand is the spend, or Own the Run when price wins. Stay when a personality daily tee for road and easy trail is enough and night-road reflectivity is not weekly.",
  "patagonia-capilene-cool-daily-men":
    "Capilene Cool Daily is odor-managed recycled jersey for run/hike/travel — not reflective, not a singlet, not a thermal. Leave it for Own the Run when you want cheaper reflectivity, Miler when dusk road hits matter, Janji when you want a run-only colorway tee, Tracksmith when luxury hand is the spend, or Capilene Thermal when the block is actually cold. Stay when multi-day odor control across run and warm travel is the shirt’s job.",
};

export type P64CardVoice = {
  why: string;
  summary: string;
  betterHint: string;
  worseHint: string;
  switchTo: string;
  stay: string;
};

/** Unique switch grammar per source. Placeholders: {t} {tJob} {tCost} */
export const ALTERNATIVES_P64_CARD_VOICE: Record<string, P64CardVoice> = {
  "salomon-adv-skin-5": {
    why: "ADV Skin 5 is the 5L Sensifit flask vest with pole loops and no bladder. Consider {t} when you need {tJob} instead of a 5L race-kit ceiling.",
    summary: "Leave 5L Sensifit for {t} only if that job beats bounce-controlled race kit.",
    betterHint: "{t} is the out when 5L + no reservoir is the weekly problem",
    worseHint: "Switching drops Sensifit 5L race-kit balance for {t}",
    switchTo: "Move to {t} when 5L fills, you need a bladder, or you only wanted flasks — and {tJob} is the fix.",
    stay: "Keep ADV Skin 5 when 5L / twin 500s / poles still cover race week and {tCost} is worse.",
  },
  "nathan-vaporair-4": {
    why: "VaporAir 4 is Nathan’s 8L current flask vest — more rear stash than a 5L, still not a bladder pack. {t} is here for {tJob}.",
    summary: "Trade 8L Nathan front-flask workflow for {t} only when that gap is weekly.",
    betterHint: "{t} wins the week 8L unisex flask-only is the wrong default",
    worseHint: "You leave Nathan’s 8L upgrade-from-v2 rear stash",
    switchTo: "Choose {t} if you outgrew 8L flask-only, need NDM bounce, or want a cheaper 6L layout — {tJob}.",
    stay: "Keep VaporAir 4 when 8L race kit plus front flasks is why v2 was too small, even if {tCost}.",
  },
  "osprey-duro-lt": {
    why: "Duro LT is men’s 1.5L flask-only Osprey — no poles, no whistle, no kit volume. {t} exists when that minimalism breaks: {tJob}.",
    summary: "Duro 6/15 dead weight vs {t} — pick the vest that matches kit rules.",
    betterHint: "{t} restores volume, women’s last, or compression fit Duro LT refuses",
    worseHint: "You give up 160g men’s BioStretch flask-only simplicity",
    switchTo: "Switch to {t} when mandatory kit, poles, or a Dyna last is required — {tJob}.",
    stay: "Keep Duro LT when a 6–15L pack would run empty and {tCost} is extra vest you will not fill.",
  },
  "uswe-pace-8": {
    why: "Pace 8 is NDM 8L with optional bladder — bounce-first, niche to try on. {t} is the conventional-harness or lighter-flask answer: {tJob}.",
    summary: "NDM 8L vs {t} is harness philosophy, not a capacity tie.",
    betterHint: "{t} if you cannot commit to NDM or want a lighter 5–6L flask vest",
    worseHint: "Leaving Pace 8 drops no-dance 8L + bladder option",
    switchTo: "Move to {t} when NDM is unobtainable to fit, or 8L bladder expansion is unused — {tJob}.",
    stay: "Keep Pace 8 when technical-trail bounce plus 8L (and optional bladder) is the trigger and {tCost} is acceptable.",
  },
  "compressport-ultrun-s-pack": {
    why: "Ultrun S is compression second-skin 5L — flasks like apparel, unforgiving size. {t} is structured pack or flask-only Osprey: {tJob}.",
    summary: "Apparel-fit bounce vs {t} pocket structure / volume.",
    betterHint: "{t} if compression sizing or missing 8L structure is the fail",
    worseHint: "You lose second-skin flask plant and 180g race profile",
    switchTo: "Choose {t} if you will not gamble compression sizing or need zippered 5–6L kit — {tJob}.",
    stay: "Keep Ultrun when second-skin bounce on ultras is the job and {tCost} is extra pack you do not want.",
  },
  "nnormal-race-vest": {
    why: "NNormal is a premium 5L stripped mountain vest — little jacket room. {t} is value-minimal or more-pocketed race kit: {tJob}.",
    summary: "Pay for stripped 5L or buy {t} for pockets/price.",
    betterHint: "{t} when premium-minimal storage is the regret",
    worseHint: "You leave NNormal’s 170g mountain-race silhouette",
    switchTo: "Switch to {t} when jacket/food volume or Osprey money matters more than a stripped NNormal last — {tJob}.",
    stay: "Keep NNormal when refusing adventure bulk on fast trail days is worth the spend despite {tCost}.",
  },
  "hydrapak-softflask-speed-500": {
    why: "Speed 500 is HydraPak’s 42g high-flow 500 ml vest flask. {t} is a different sip or carry: {tJob}.",
    summary: "High-flow 500 vs {t} volume, valve, or handheld.",
    betterHint: "{t} when Speed valve is not the gap (smaller flask, handheld, other last)",
    worseHint: "You leave high-flow Speed sipping in a standard 500 ml sleeve",
    switchTo: "Move to {t} for 250 ml, Skyflask strap, UD/Nathan geometry, or a slower valve — {tJob}.",
    stay: "Keep Speed 500 when faster vest-front sipping is the drink and {tCost} is extra system you do not need.",
  },
  "salomon-soft-flask-500": {
    why: "Salomon’s 38g standard 500 ml flask is the slow-valve spare. {t} is Speed, handheld, or another brand last: {tJob}.",
    summary: "Standard Salomon 500 vs {t} flow or carry.",
    betterHint: "{t} when you outgrew a standard bite valve or vest-only carry",
    worseHint: "You drop the simple 38g Salomon sleeve spare",
    switchTo: "Switch to {t} when high-flow Speed, a handheld, or UD/Nathan pocket shape is the spare you actually want — {tJob}.",
    stay: "Keep the Salomon 500 when a basic vest-pocket flask is the refill and {tCost} is unnecessary.",
  },
  "oakley-radar-ev-path": {
    why: "Radar EV Path is interchangeable Prizm wrap + Unobtainium — not a frameless shield. {t} is cheaper wrap, MAG, or lifestyle: {tJob}.",
    summary: "Prizm wrap retention vs {t}.",
    betterHint: "{t} if Prizm money, Path bulk, or wrap coverage is the wrong default",
    worseHint: "You leave Unobtainium + Prizm spare-lens ecosystem",
    switchTo: "Choose {t} for value interchange, a larger Flak last, MAG speed, or no-wrap daily — {tJob}.",
    stay: "Keep Path when Prizm swaps plus sport grip is the glare job and {tCost} is a worse trade.",
  },
  "oakley-sutro-lite": {
    why: "Sutro Lite is a fixed Prizm open-rim shield for bright road miles on a large last. {t} is race FOV, spare lenses, or trail photochromic: {tJob}.",
    summary: "Fixed road shield vs {t}.",
    betterHint: "{t} when you need lens swaps, a smaller last, or trail auto-tint",
    worseHint: "You give up open-rim airflow on a large Prizm shield",
    switchTo: "Switch to {t} if the lens cannot stay fixed, the face is small, or canopy light is weekly — {tJob}.",
    stay: "Keep Sutro Lite when sunny marathon/road coverage on a medium-large face is the point and {tCost} is extra.",
  },
  "oakley-encoder": {
    why: "Encoder is a frameless Prizm race shield with no interchange. {t} is Path swaps, Sutro airflow, or cheaper shields: {tJob}.",
    summary: "Fixed Encoder FOV vs {t} lens system or price.",
    betterHint: "{t} if you need Prizm spares, more airflow, or a less polarizing shape",
    worseHint: "You leave Encoder’s uninterrupted shield FOV",
    switchTo: "Move to {t} when spare tints, a different Oakley shield, or value race coverage is the buy — {tJob}.",
    stay: "Keep Encoder when a bold fixed Prizm shield is the race glare tool and {tCost} is acceptable.",
  },
  "smith-attack-mag": {
    why: "Attack MAG is trail MAG + ventilation, optional photochromic ChromaPop. {t} is Reactiv no-swap or road MAG: {tJob}.",
    summary: "Trail MAG fog control vs {t}.",
    betterHint: "{t} if you refuse MAG spares or want a road MAG last",
    worseHint: "You leave trail-shaped MAG ventilation",
    switchTo: "Choose {t} for Julbo auto-tint, Shift MAG road last, or a lighter Julbo wrap — {tJob}.",
    stay: "Keep Attack MAG when foggy technical trail plus MAG swaps is why a road shield fails, even with {tCost}.",
  },
  "julbo-ultimate": {
    why: "Ultimate is Reactiv 7–82% photochromic trail wrap — no MAG. {t} is MAG spares or a tighter Julbo: {tJob}.",
    summary: "Auto-tint ultra wrap vs {t}.",
    betterHint: "{t} if photochromic lag makes you want MAG spares or a tighter wrap",
    worseHint: "You leave Reactiv mixed-light coverage without carrying lenses",
    switchTo: "Switch to {t} when rapid light changes need a swapped spare, or Rush/Aerolite is enough wrap — {tJob}.",
    stay: "Keep Ultimate when mixed-canopy ultras make spare lenses the problem and {tCost} is MAG complexity.",
  },
  "tifosi-rail": {
    why: "Rail is value interchangeable wrap / Fototec — not Prizm, not MAG. {t} is premium retention or a daily frame: {tJob}.",
    summary: "Value wrap kit vs {t}.",
    betterHint: "{t} when Rail lock-in or optics are the fail",
    worseHint: "You leave multi-lens value coverage",
    switchTo: "Switch to {t} for Unobtainium/Prizm, MAG, a lighter race frame, or a non-wrap daily — {tJob}.",
    stay: "Keep Rail when interchangeable coverage without Oakley money is the only reason you are shopping and {tCost} is premium tax.",
  },
  "tifosi-vogel": {
    why: "Vogel is a 24g daily sport frame — not Rail coverage. {t} is wrap kit or polarized round: {tJob}.",
    summary: "Easy-mile frame vs {t} coverage or look.",
    betterHint: "{t} if easy-mile coverage is no longer enough",
    worseHint: "You leave a light daily frame you will actually wear",
    switchTo: "Move to {t} for Rail wrap, Goodr no-slip, or polarized round — {tJob}.",
    stay: "Keep Vogel when a race shield would sit unused and {tCost} is coverage you do not need on easy days.",
  },
  "goodr-circle-gs": {
    why: "Circle G is 19g polarized round, low coverage, small last. {t} is Goodr sport shape or a real wrap: {tJob}.",
    summary: "Style-first polarized round vs {t}.",
    betterHint: "{t} when marathon glare or wrap retention is the fail",
    worseHint: "You leave polarized round no-slip daily",
    switchTo: "Choose {t} for OGs sport shape, Rail wrap, or Vogel daily sport — {tJob}.",
    stay: "Keep Circle G when you refuse race-shield look on easy miles and {tCost} is wrap bulk.",
  },
  "ledlenser-neo9r": {
    why: "NEO9R is the 1200 lm / 199g craft lamp: you aim near and far yourself, dump the Li-ion pack onto an optional chest belt, magnetic charge, IP54 rain. {t} is the out when 199g on the skull or no auto-dim is the complaint.",
    summary: "Split-beam + optional sternum pack vs {t}.",
    betterHint: "{t} if 199g on the head, IP54 rain (not storm), or button-only dimming is the night fail",
    worseHint: "You give up aiming near/far yourself and the option to move battery mass off the skull",
    switchTo: "Switch to {t} when you want auto-dim lumens-per-gram, a sealed hot-swap pack, a SlimFit band, or a lighter flood — not when you still want to craft a descent beam.",
    stay: "Keep NEO9R when manual near/far plus chest-belt mass-off-head is the descent job and {tCost} is extra weight, missing beam craft, or a lamp you will not aim.",
  },
  "biolite-headlamp-800-pro": {
    why: "800 Pro is BioLite’s 800 lm / 150g comfort lamp: 3D SlimFit band, 30-second timed burst then revert, 135 m reach, 3000 mAh micro-USB Pass-Thru, IPX4 splash. {t} is the out when burst lumens or splash rating is not enough throw or weather.",
    summary: "SlimFit comfort + timed burst vs {t}.",
    betterHint: "{t} if 800 lm timed burst, IPX4 splash, or micro-USB (not USB-C) is the limit",
    worseHint: "You give up 3D SlimFit no-bounce and rear-red on shared dark roads",
    switchTo: "Choose {t} when you need 1200–1500 lm throw, reactive runtime, a sealed storm pack, or split-beam craft — not when forehead comfort is the shopping trigger.",
    stay: "Keep 800 Pro when no-bounce SlimFit plus rear-red on dark roads beats chasing lumens, even with {tCost}.",
  },
  "petzl-swift-rl": {
    why: "Swift RL is 1200 lm / 92g REACTIVE — overkill for lit roads, IPX4. {t} is more throw, cheaper output, or manual beams: {tJob}.",
    summary: "Reactive 92g vs {t} budget/throw/belt.",
    betterHint: "{t} if you will not pay reactive money or need more throw/sealed/chest-belt",
    worseHint: "You leave 1200 lm auto-dim at 92g",
    switchTo: "Move to {t} for NAO throw, BioLite/NU43/Spot value, or NEO9R chest-belt craft — {tJob}.",
    stay: "Keep Swift RL when reactive 1200 lm at 92g is why the lamp is on your head and {tCost} is extra mass or missing auto-dim.",
  },
  "sis-beta-fuel-gel": {
    why: "Beta Fuel gel is 40g dual-source, thick, shop-common, not high-sodium. {t} is 22g isotonic, 30g modular, hydrogel, or caffeine: {tJob}.",
    summary: "40g SiS packets vs {t} carb math.",
    betterHint: "{t} if thickness, sodium, or packet count is the gut/plan fail",
    worseHint: "You leave 40g SiS availability",
    switchTo: "Switch to {t} for thinner GO, 30g+sodium C30, mild PF30, hydrogel 40g, or late caffeine — {tJob}.",
    stay: "Keep Beta Fuel when fewer 40g SiS packets is how you hit marathon carbs and {tCost} is extra packets or worse shops.",
  },
  "precision-pf30-gel": {
    why: "PF30 is mild 30g units for PF-system math — sodium is PH, not the gel. {t} is denser 40g, isotonic, sodium-in-gel, or hydrogel: {tJob}.",
    summary: "30g mild modular vs {t}.",
    betterHint: "{t} if 30g mild no-sodium-in-gel is the wrong hour plan",
    worseHint: "You leave clean 30g PF counting and low-stick texture",
    switchTo: "Choose {t} for 40g packets, cheap isotonic, C30 sodium, or Maurten hydrogel — {tJob}.",
    stay: "Keep PF30 when 30g modular without flavour fatigue is the race plan and {tCost} is worse math.",
  },
  "neversecond-c30-gel": {
    why: "C30 gel is 30g + ~200mg sodium, locked to C30 drink — not SiS-table common. {t} is 40g retail, GU caffeine, mild PF, or hydrogel: {tJob}.",
    summary: "Sodium-in-30g gel vs {t}.",
    betterHint: "{t} if Neversecond retail or flavour range is the fail",
    worseHint: "You leave sodium already in the 30g gel",
    switchTo: "Switch to {t} for Beta Fuel shops, Roctane caffeine, PF30+PH split, or Maurten texture — {tJob}.",
    stay: "Keep C30 when gel+drink units that already include sodium is the system and {tCost} is race-table rarity.",
  },
  "clif-bar-original": {
    why: "Clif Original is the 68g supermarket brick: ~250 kcal, 45g carbs, 10g protein, soy, 150mg sodium. Fueling job is chewable calories you can buy at a petrol station on a slow ultra. {t} is the out when soy, 68g chew, or grocery density is the fail.",
    summary: "Gas-station 250 kcal brick vs {t}.",
    betterHint: "{t} if chewing a 68g soy bar at race cadence, or needing a specialty ultra chew, is the fail",
    worseHint: "You give up anywhere-calories and 45g carbs in a single grocery brick",
    switchTo: "Switch to {t} when you cannot chew a 68g brick at pace, soy is a no, or you want a lighter ultra chew / split pieces / pouch instead of a chocolate-chip grocery bar.",
    stay: "Keep Clif when gas-station availability plus a filling 250 kcal chew is the point and {tCost} is a format you will not carry.",
  },
  "naak-ultra-energy-bar": {
    why: "Näak Ultra is a specialty trail bar (~28g carbs, 7g protein, 180mg sodium) sold as ultra food, not a chocolate-chip grocery brick. Calories vary by flavour; shops are narrower. {t} is the out when 45g Clif carbs at a petrol station, split chews, or a pouch is the real gap.",
    summary: "Specialty ultra chew vs {t} grocery or pouch.",
    betterHint: "{t} if Näak shop coverage, flavour-dependent calories, or still-chewing late is the fail",
    worseHint: "You give up ultra-positioned protein + 180mg sodium in a trail chew",
    switchTo: "Choose {t} when you need petrol-station 45g carbs, European aid-station familiarity, mid-stride split pieces, or a pouch you can squeeze — not when ultra-food positioning is why you left Clif.",
    stay: "Keep Näak when an ultra-positioned chew with protein and sodium is the point and {tCost} is grocery ease you do not need.",
  },
  "powerbar-energize": {
    why: "Energize is the European race-table chewable (~39g carbs, 190mg sodium), dry without fluid. {t} is grocery Clif, trail Näak, chews, or pouch: {tJob}.",
    summary: "Race-table bar vs {t} chew style.",
    betterHint: "{t} if dry texture or ‘not real food’ is the fail",
    worseHint: "You leave European aid-station familiarity",
    switchTo: "Move to {t} for Clif shops, Näak/Veloforte food story, Bloks, or a pouch — {tJob}.",
    stay: "Keep Energize when a familiar endurance bar plus some sodium is enough and {tCost} is a format you will not chew either.",
  },
  "precision-pf30-drink-mix": {
    why: "PF30 mix is 30g powder matched to PF gel — PH handles sodium, not an 80g bottle. {t} is dense Maurten, sodium-in-scoop, or SiS dual-source: {tJob}.",
    summary: "30g bottle math vs {t} density/sodium.",
    betterHint: "{t} if you need 80g in one bottle or sodium in the mix",
    worseHint: "You leave PF gel-matched 30g mild bottles",
    switchTo: "Switch to {t} for Mix 320 density, Tailwind all-in-one sodium, Mix 160 40g, C30 200mg/scoop, or Beta Fuel drink — {tJob}.",
    stay: "Keep PF30 mix when bottle+gel in 30g units is the plan and {tCost} is a denser bottle you have not trained.",
  },
  "neversecond-c30-sports-drink": {
    why: "C30 drink is 30g + 200mg sodium per scoop, scaled 1–3, paired to C30 gel. {t} is Maurten bottles, Tailwind simplicity, or PF+PH split: {tJob}.",
    summary: "Scalable 30g+sodium scoops vs {t}.",
    betterHint: "{t} if multi-scoop hassle or Neversecond shops are the fail",
    worseHint: "You leave sodium already in each 30g scoop",
    switchTo: "Choose {t} for Maurten 40/80g bottles, Tailwind one-mix sodium, Beta Fuel retail, or PF30+PH — {tJob}.",
    stay: "Keep C30 drink when scalable 30g+sodium plus C30 gels is the hour and {tCost} is a sachet system you do not want.",
  },
  "nike-dri-fit-miler-men": {
    why: "Men’s Miler is reflective Dri-FIT daily — wide sizes, can cling wet, not a singlet. {t} is personality, odor, budget, luxury, or women’s last: {tJob}.",
    summary: "Reflective Nike daily vs {t}.",
    betterHint: "{t} if cling, missing odor control, or the wrong gender last is the week",
    worseHint: "You leave wide-size reflective Dri-FIT",
    switchTo: "Switch to {t} for Janji colorway, Capilene odor/travel, Own the Run price, Tracksmith hand, or women’s Miler — {tJob}.",
    stay: "Keep men’s Miler when a widely sized dusk-reflective heat tee is the default and {tCost} is a shirt you will not actually run in.",
  },
  "janji-run-tee-men": {
    why: "Janji Run tee is breathable hot-weather daily with no reflectivity. {t} is dusk hits, odor crossover, luxury, or budget: {tJob}.",
    summary: "Colorway daily vs {t} reflectivity/fabric.",
    betterHint: "{t} if night-road hits or odor/luxury/price is the gap",
    worseHint: "You leave Janji color stories on a light daily",
    switchTo: "Choose {t} for Miler reflectivity, Capilene travel odor, Tracksmith hand, or Own the Run price — {tJob}.",
    stay: "Keep Janji when personality daily miles beat dusk reflectivity and {tCost} is a Nike default you do not want.",
  },
  "patagonia-capilene-cool-daily-men": {
    why: "Capilene Cool Daily is odor-managed run/hike/travel jersey — not reflective, not thermal. {t} is cheaper reflectivity, run-only tee, luxury, or actual warmth: {tJob}.",
    summary: "Odor travel tee vs {t}.",
    betterHint: "{t} if you needed dusk hits, a cheaper road tee, or real cold kit",
    worseHint: "You leave multi-day odor control",
    switchTo: "Switch to {t} for Own the Run reflectivity/price, Miler dusk, Janji run colorway, Tracksmith, or Thermal — {tJob}.",
    stay: "Keep Capilene Cool Daily when run+hike+travel odor is the shirt’s job and {tCost} is a road-only tee.",
  },
};

import type { ProductCategoryPageConfig } from "@/lib/catalog/types";

type Decision = NonNullable<ProductCategoryPageConfig["decision"]>;
type EducationFactor = ProductCategoryPageConfig["educationFactors"][number];

/** Compact discovery decision blocks — no SEO essays. */
export const RUNNING_CATEGORY_DECISIONS: Record<string, Decision> = {
  "running-shoes": {
    whatItIs:
      "Road and trail footwear for training and racing — sorted by job (daily, tempo, race, stability, trail), not brand hype.",
    productTypes: [
      { name: "Daily trainers", note: "Most easy/steady miles; durability first." },
      { name: "Tempo / workout", note: "Faster sessions without full race fragility." },
      { name: "Race day", note: "Light, plated or race foams for goal efforts." },
      { name: "Stability", note: "Guidance geometry when you want a more controlled road ride." },
      { name: "Trail", note: "Lugs, protection and rocker for off-road surfaces." },
    ],
    whatMatters: [
      "Fit (length, width, lockdown) before stack marketing",
      "Terrain you actually run",
      "Session job — easy vs workout vs race",
      "How many days per week one pair must cover",
    ],
    specsThatMatter: [
      { spec: "Stack / drop", why: "Feel and geometry — not a skill score." },
      { spec: "Weight", why: "Matters more on race/tempo days than easy miles." },
      { spec: "Stability class", why: "Neutral vs guided — pick from how you move, not fear." },
      { spec: "Width options", why: "Often the difference between ‘almost’ and usable." },
    ],
    tradeOffs: [
      {
        left: "Max cushion comfort",
        right: "Workout snap",
        note: "Soft daily stacks rarely feel sharp at tempo.",
      },
      {
        left: "Race economy",
        right: "Daily durability",
        note: "Race uppers and foams wear faster under high mileage.",
      },
      {
        left: "Trail grip",
        right: "Road efficiency",
        note: "Aggressive lugs are noisy and slow on pavement.",
      },
    ],
    useCaseShifts: [
      { useCase: "Beginner 3×/week", note: "One solid daily trainer beats a rotation." },
      { useCase: "Marathon block", note: "Daily + long + race (or tempo) roles pull apart." },
      { useCase: "Trail weekends", note: "Separate trail shoe; don’t force road lugs." },
    ],
    beginnerStart:
      "Start with a daily trainer in your width. Add stability only if you already prefer guided rides. Save race shoes for goal efforts.",
    relatedBestHref: "/best/running-shoes",
    relatedBestLabel: "Best running shoes",
    relatedGuideHref: "/guides/how-to-choose-running-shoes",
    relatedGuideLabel: "How to choose running shoes",
    relatedFinderHref: "/tools/running-shoe-finder",
    relatedFinderLabel: "Running Shoe Finder",
    usefulComparisonsNote:
      "Compare within the same job (daily vs daily, race vs race) — not a max-cushion daily against a carbon racer.",
  },

  "gps-watches": {
    whatItIs:
      "Wrist computers for pace, routes, training load and multisport — pick battery and features for your longest typical outing.",
    productTypes: [
      { name: "Entry / daily", note: "Solid GPS + HR for most road runners." },
      { name: "Performance", note: "Training metrics, maps, music without ultra bulk." },
      { name: "Ultra / adventure", note: "Long battery, offline maps, tougher builds." },
      { name: "Compact", note: "Smaller cases when fit or weight is the gate." },
    ],
    whatMatters: [
      "Battery on your longest session with GPS on",
      "Maps / navigation need",
      "Music storage vs phone dependency",
      "Ecosystem (phone OS, straps, training platforms)",
    ],
    specsThatMatter: [
      { spec: "GPS modes / battery", why: "Marketing max hours rarely match your map+music mix." },
      { spec: "Display type", why: "Always-on vs AMOLED changes outdoor readability." },
      { spec: "Sensors", why: "Optical HR convenience vs chest-strap accuracy for intervals." },
    ],
    tradeOffs: [
      {
        left: "Maps + music",
        right: "Battery",
        note: "Feature stacks eat runtime — match your longest outing.",
      },
      {
        left: "Premium polish",
        right: "Training-first value",
        note: "You often pay for screen and build, not better GPS.",
      },
    ],
    useCaseShifts: [
      { useCase: "Road 10K training", note: "Entry/performance watches are enough." },
      { useCase: "Ultra / adventure", note: "Prioritise battery and offline maps." },
      { useCase: "Intervals focus", note: "Pair any watch with a chest strap when HR targets matter." },
    ],
    beginnerStart:
      "Buy for battery and comfort on your longest run. Skip ultra maps until you leave marked roads.",
    relatedBestHref: "/best/running-watches",
    relatedBestLabel: "Best running watches",
    relatedGuideHref: "/guides/running-watch-battery-life-explained",
    relatedGuideLabel: "Watch battery life explained",
    relatedFinderHref: "/tools/fitness-watch-finder",
    relatedFinderLabel: "Fitness Watch Finder",
    usefulComparisonsNote:
      "Pair same tier (entry vs entry, ultra vs ultra) so battery and map claims stay comparable.",
  },

  "heart-rate-monitors": {
    whatItIs:
      "Chest straps, armbands and optical sensors for heart-rate training — accuracy vs convenience by session type.",
    productTypes: [
      { name: "Chest strap", note: "Accuracy default for intervals and HR zones." },
      { name: "Armband", note: "Optical away from the wrist when watches struggle." },
      { name: "Optical (wrist)", note: "Convenient for easy days; noisier under intervals." },
    ],
    whatMatters: [
      "Session type (easy vs intervals)",
      "Broadcast protocols your watch/phone accept",
      "Fit comfort for the full workout",
    ],
    specsThatMatter: [
      { spec: "Sensor type", why: "ECG strap vs optical changes interval reliability." },
      { spec: "Connectivity", why: "ANT+/Bluetooth dual broadcast matters for multi-device kits." },
    ],
    tradeOffs: [
      {
        left: "Strap accuracy",
        right: "Zero extra kit",
        note: "Wrist HR wins convenience; straps win hard efforts.",
      },
    ],
    useCaseShifts: [
      { useCase: "Easy aerobic", note: "Watch optical is usually fine." },
      { useCase: "VO2 / threshold", note: "Chest strap earns its keep." },
    ],
    beginnerStart:
      "If you only jog easy miles, skip a dedicated HRM. Add a strap when you start training by zones.",
    relatedBestHref: "/best/heart-rate-monitors-running",
    relatedBestLabel: "Best HRMs for running",
    relatedGuideHref: "/guides/optical-wrist-hr-vs-chest-strap",
    relatedGuideLabel: "Optical vs chest strap",
    relatedFinderHref: "/tools/running-hrm-finder",
    relatedFinderLabel: "HRM Finder",
  },

  "running-clothing": {
    whatItIs:
      "Shorts, tights, tops, jackets and bras built for run motion — choose by weather, distance and chafe risk, not fashion alone.",
    productTypes: [
      { name: "Shorts / tights", note: "Inseam, liner and pocket layout drive daily comfort." },
      { name: "Tops / singlets", note: "Breathability and seam placement for heat and long runs." },
      { name: "Jackets", note: "Wind vs rain protection and packability." },
      { name: "Sports bras", note: "Support level matched to impact and torso fit." },
      { name: "Base / cold layers", note: "Winter layering without overheating on tempo days." },
    ],
    whatMatters: [
      "Weather and temperature you actually train in",
      "Pocket needs (phone, gels, keys)",
      "Seam and liner chafe risk on your longest run",
      "Gendered fit ranges that match your body",
    ],
    specsThatMatter: [
      { spec: "Fit / inseam", why: "Ride-up and coverage beat fabric marketing." },
      { spec: "Pockets / phone pocket", why: "Decides belt vs pocket carry." },
      { spec: "Water / wind resistance", why: "Jacket job clarity — block wind or stay dry." },
      { spec: "Breathability", why: "Hot long runs punish overbuilt shells." },
    ],
    tradeOffs: [
      {
        left: "Max pocket storage",
        right: "Minimal bounce",
        note: "Big phone pockets can shift on hard efforts.",
      },
      {
        left: "Waterproofing",
        right: "Breathability",
        note: "Fully sealed shells cook on tempo; softshells wet out in storms.",
      },
      {
        left: "Compression support",
        right: "Relaxed all-day feel",
        note: "Tights that lock down may feel restrictive on easy shakeouts.",
      },
    ],
    useCaseShifts: [
      { useCase: "Hot summer 10K", note: "Shorts + singlet; prioritise breathability." },
      { useCase: "Winter dark miles", note: "Layers + reflective; see safety/lights too." },
      { useCase: "Marathon long runs", note: "Test pockets and chafe before race week." },
    ],
    beginnerStart:
      "Buy one reliable shorts/tights option and one top for your climate. Add a jacket only when wind or rain regularly cuts sessions short.",
    relatedBestHref: "/best/running-shorts",
    relatedBestLabel: "Best running shorts",
    relatedGuideHref: "/guides/hot-weather-running-apparel",
    relatedGuideLabel: "Hot-weather apparel",
    relatedFinderHref: "/tools/running-clothing-finder",
    relatedFinderLabel: "Apparel Finder",
    usefulComparisonsNote:
      "Compare within garment type (shorts vs shorts, jackets vs jackets) — weather job first.",
  },

  "nutrition-fuel": {
    whatItIs:
      "Gels, chews, drink mixes and electrolytes for training and racing — product decisions from labels and gut practice, not medical advice.",
    productTypes: [
      { name: "Energy gels", note: "Portable carbs; caffeine variants for late race." },
      { name: "Chews / bars", note: "Chewable carbs when gels feel monotonous." },
      { name: "Carb drink mixes", note: "Bottle/flask fuel for higher carb targets." },
      { name: "Electrolytes", note: "Sodium/fluid support — not a carb substitute." },
    ],
    whatMatters: [
      "Carbs per serving you can actually stomach",
      "Caffeine preference (and bedtime races)",
      "Format you’ll carry (gel vs flask mix)",
      "Practice in training before race day",
    ],
    specsThatMatter: [
      { spec: "Carbs / serving", why: "Match fuel plan math, not brand stories." },
      { spec: "Caffeine mg", why: "Late-race kick vs sleep and anxiety trade-off." },
      { spec: "Sodium", why: "Relevant in heat/sweat — not a cure-all." },
    ],
    tradeOffs: [
      {
        left: "High carb density",
        right: "Gut comfort",
        note: "Aggressive mixes need longer gut training.",
      },
      {
        left: "Caffeinated gels",
        right: "Even energy",
        note: "Caffeine helps some races and wrecks others.",
      },
    ],
    useCaseShifts: [
      { useCase: "Runs under ~75 min", note: "Water often enough unless you prefer carbs." },
      { useCase: "Marathon / long", note: "Rehearse timing and texture on long runs." },
      { useCase: "Ultra", note: "Mix formats; plan savoury/real food alongside gels." },
    ],
    beginnerStart:
      "For long runs over ~90 minutes, trial one gel or drink mix brand in training. Never debut a new caffeine gel on race day.",
    relatedBestHref: "/best/running-race-fuel",
    relatedBestLabel: "Best race fuel",
    relatedGuideHref: "/guides/gel-vs-drink-mix-vs-chews",
    relatedGuideLabel: "Gel vs drink mix vs chews",
    relatedFinderHref: "/tools/running-fuel-finder",
    relatedFinderLabel: "Fuel Finder",
    usefulComparisonsNote:
      "Compare similar formats (gel vs gel) on carbs, caffeine and texture — not gel vs jacket.",
  },

  sunglasses: {
    whatItIs:
      "Run-specific eyewear for glare, wind and debris — wrap, shield and photochromic options for road and trail brightness.",
    productTypes: [
      { name: "Performance wrap", note: "Light coverage for most road miles." },
      { name: "Shield", note: "More glare/wind block; can feel warmer." },
      { name: "Photochromic", note: "Variable light without lens swaps." },
      { name: "Everyday value", note: "Solid coverage when budget gates the buy." },
    ],
    whatMatters: [
      "Coverage vs venting on your hottest runs",
      "Lens tint for your typical light (road glare vs forest trail)",
      "Fit with hat / helmet / high ponytail",
      "Sweat grip that doesn’t bounce",
    ],
    specsThatMatter: [
      { spec: "Lens type", why: "Fixed dark vs photochromic changes dawn/dusk usability." },
      { spec: "Frame coverage", why: "Shield vs wrap alters wind and peripheral light." },
      { spec: "Weight / grip", why: "Bounce and pressure points kill long efforts." },
    ],
    tradeOffs: [
      {
        left: "Max coverage",
        right: "Ventilation",
        note: "Shields fog and cook more in humidity.",
      },
      {
        left: "Photochromic flexibility",
        right: "Peak dark tint",
        note: "Variable lenses may not go as dark as race shields.",
      },
    ],
    useCaseShifts: [
      { useCase: "Bright road summer", note: "Dark wrap or shield; prioritise grip." },
      { useCase: "Variable trail light", note: "Photochromic earns its keep." },
      { useCase: "Dawn / dusk commute", note: "Avoid fixed ultra-dark lenses." },
    ],
    beginnerStart:
      "Buy a secure wrap that stays put with sweat. Upgrade to photochromic when light changes mid-run often.",
    relatedBestHref: "/best/running-sunglasses",
    relatedBestLabel: "Best running sunglasses",
    relatedFinderHref: "/tools/running-accessories-finder",
    relatedFinderLabel: "Accessories Finder",
    usefulComparisonsNote:
      "Compare lens systems in the same coverage class — wrap vs wrap, shield vs shield.",
  },

  accessories: {
    whatItIs:
      "Anti-chafe finishers for long runs and race kits — stick balms and roll-on barriers. This is not audio, lights, sunglasses or belts; those jobs have their own categories.",
    productTypes: [
      {
        name: "Stick balms",
        note: "Body Glide Original and Squirrel’s Nut Butter — grab-and-go film on thighs, sports-bra lines, underarms.",
      },
      {
        name: "Roll-on barriers",
        note: "2Toms SportShield — thin liquid film under tight race kits when a stick feels messy.",
      },
    ],
    whatMatters: [
      "The exact rub (skin-on-skin vs seam/kit)",
      "How you will apply it in a start corral vs on the trail",
      "Whether you will reapply after 90+ minutes",
      "What else already lives in the kit (socks, shorts liner, sports bra)",
    ],
    specsThatMatter: [
      { spec: "Format", why: "Stick vs roll-on changes mess, dry-time and pocketability." },
      { spec: "Water resistance", why: "Sweat and rain decide whether the film lasts a marathon." },
      { spec: "Application speed", why: "Race morning favours a stick you can hit without looking." },
    ],
    tradeOffs: [
      {
        left: "Stick grab-and-go",
        right: "Roll-on thin film",
        note: "Sticks win pockets and speed; roll-ons win even coverage under lycra — trial both before you pick a race-week default.",
      },
      {
        left: "One barrier",
        right: "Fit and fabric first",
        note: "Balm does not fix a short that already rubs. Fix the garment, then add a barrier on known hotspots.",
      },
    ],
    useCaseShifts: [
      { useCase: "Weekly long <90 min", note: "One stick on known spots is usually enough." },
      { useCase: "Marathon / ultra", note: "Plan a reapply method; ultra kits often carry a tin or mini stick." },
      { useCase: "Tight race kit", note: "Roll-on dry-time before you pull the kit on." },
    ],
    beginnerStart:
      "If you already chafe on longs, buy one stick (Body Glide Original is the default starting format) and test it on a mid-week long — thighs, sports-bra line, underarms — not race morning.",
    relatedBestHref: "/best/running-anti-chafe",
    relatedBestLabel: "Best anti-chafe for runners",
    relatedGuideHref: "/guides/anti-chafe-for-runners",
    relatedGuideLabel: "How to choose anti-chafe",
    relatedFinderHref: "/tools/running-accessories-finder",
    relatedFinderLabel: "Accessories Finder",
    usefulComparisonsNote:
      "Compare stick vs stick on mess and pocketability, or stick vs roll-on for kit coverage — not anti-chafe vs headphones.",
  },

  hydration: {
    whatItIs:
      "Handhelds, soft flasks and reservoirs — choose carry format by volume, bounce and distance.",
    productTypes: [
      { name: "Handheld", note: "Simple short/medium carries." },
      { name: "Soft flasks", note: "Vest/belt compatible volume." },
      { name: "Reservoirs", note: "Higher volume for ultra/adventure days." },
    ],
    whatMatters: [
      "Volume for your longest session without aid",
      "Bounce and bounce control",
      "Whether you also need soft flasks in a vest",
    ],
    specsThatMatter: [
      { spec: "Capacity", why: "Match distance and heat, not Instagram kits." },
      { spec: "Bite valve / cleanability", why: "Hygiene and flow reliability." },
    ],
    tradeOffs: [
      {
        left: "Vest volume",
        right: "Belt simplicity",
        note: "Belts win phone+gels; vests win flask + jacket storage.",
      },
    ],
    useCaseShifts: [
      { useCase: "Road long <2h", note: "Handheld or belt often enough." },
      { useCase: "Trail ultra", note: "Vest + soft flasks become default." },
    ],
    beginnerStart:
      "Start with a handheld or simple belt. Move to a vest when you regularly carry >500 ml plus layers.",
    relatedBestHref: "/best/running-hydration-vests",
    relatedBestLabel: "Best hydration vests",
    relatedGuideHref: "/guides/hydration-vest-vs-running-belt",
    relatedGuideLabel: "Vest vs belt",
    relatedFinderHref: "/tools/running-hydration-finder",
    relatedFinderLabel: "Hydration Finder",
  },

  "running-packs-vests": {
    whatItIs:
      "Running vests and packs for flasks, layers and nutrition on long and trail days.",
    productTypes: [
      { name: "Race vests", note: "Tight, bounce-controlled flask carry." },
      { name: "Adventure packs", note: "More storage for layers and mandatory kit." },
    ],
    whatMatters: [
      "Fit torso length and bounce on descent",
      "Flask/reservoir compatibility",
      "Pocket access while moving",
    ],
    specsThatMatter: [
      { spec: "Volume", why: "Match mandatory kit lists, not max advertised litres." },
      { spec: "Flask size", why: "Front pocket geometry must match your flasks." },
    ],
    tradeOffs: [
      {
        left: "Storage",
        right: "Bounce / heat",
        note: "Bigger packs hold more and bounce/cook more.",
      },
    ],
    useCaseShifts: [
      { useCase: "Road marathon", note: "Often belt + handheld beats a vest." },
      { useCase: "Trail ultras", note: "Vest becomes the kit spine." },
    ],
    beginnerStart:
      "If you’re not carrying flasks yet, solve hydration with a belt first. Buy a vest when soft-flask volume is weekly.",
    relatedBestHref: "/best/running-hydration-vests",
    relatedBestLabel: "Best hydration vests",
    relatedGuideHref: "/guides/hydration-vest-vs-running-belt",
    relatedGuideLabel: "Vest vs belt",
    relatedFinderHref: "/tools/running-hydration-finder",
    relatedFinderLabel: "Hydration Finder",
  },

  "running-belts": {
    whatItIs:
      "Waist carry for phones, gels and small flasks — bounce control without a full vest.",
    productTypes: [
      { name: "Phone belts", note: "Secure phone + keys on daily runs." },
      { name: "Hydration belts", note: "Flask-capable waist packs." },
      { name: "Race belts", note: "Number + gel minimalism." },
    ],
    whatMatters: ["Bounce with your phone size", "Gel access", "When vest volume becomes necessary"],
    specsThatMatter: [
      { spec: "Capacity", why: "Phone + gels vs flask jobs differ." },
      { spec: "Adjustability", why: "Ride height changes bounce." },
    ],
    tradeOffs: [
      {
        left: "Belt simplicity",
        right: "Vest volume",
        note: "Belts lose when jacket + dual flasks appear.",
      },
    ],
    useCaseShifts: [
      { useCase: "Daily with phone", note: "Phone belt first." },
      { useCase: "Long road", note: "Hydration belt or handheld + gels." },
    ],
    beginnerStart: "If you carry a phone every run, start with a dedicated phone belt before buying a vest.",
    relatedBestHref: "/best/running-belts",
    relatedBestLabel: "Best running belts",
    relatedGuideHref: "/guides/how-to-choose-running-belt",
    relatedGuideLabel: "How to choose a running belt",
    relatedFinderHref: "/tools/running-hydration-finder",
    relatedFinderLabel: "Hydration Finder",
  },

  "running-socks": {
    whatItIs:
      "Run socks for blister control, cushion and moisture — height and fit matter as much as brand.",
    productTypes: [
      { name: "Quarter / crew", note: "Match shoe collar and debris needs." },
      { name: "Toe socks", note: "Toe-splay and blister targeting." },
      { name: "Compression light", note: "Hold, not medical treatment." },
    ],
    whatMatters: ["Blister history", "Shoe collar height", "Moisture on long hot runs"],
    specsThatMatter: [
      { spec: "Height", why: "Heel lock and debris entry change by collar." },
      { spec: "Cushion zones", why: "Forefoot vs heel needs differ by shoe." },
    ],
    tradeOffs: [
      {
        left: "Extra cushion",
        right: "Fit volume",
        note: "Thick socks can crowd a snug race last.",
      },
    ],
    useCaseShifts: [
      { useCase: "Daily road", note: "Reliable quarter height usually wins." },
      { useCase: "Trail", note: "Crew height helps debris." },
    ],
    beginnerStart: "Match sock height to your daily trainer and trial on a long run before race day.",
    relatedBestHref: "/best/running-socks",
    relatedBestLabel: "Best running socks",
    relatedGuideHref: "/guides/how-to-choose-running-socks",
    relatedGuideLabel: "How to choose running socks",
    relatedFinderHref: "/tools/running-clothing-finder",
    relatedFinderLabel: "Apparel Finder",
  },

  recovery: {
    whatItIs:
      "Foam rollers, massage guns, boots and recovery sandals — comfort adjuncts with honest evidence limits, not medical treatment.",
    productTypes: [
      { name: "Foam rollers", note: "Simple self-massage." },
      { name: "Massage guns", note: "Targeted percussive work." },
      { name: "Compression boots", note: "Home recovery ritual; cost vs benefit." },
      { name: "Recovery sandals", note: "Post-run comfort footwear." },
    ],
    whatMatters: [
      "Whether the tool fits your actual routine",
      "Evidence honesty — comfort ≠ healing claims",
      "Travel vs home use",
    ],
    specsThatMatter: [
      { spec: "Amplitude / speed (guns)", why: "Usable range beats max marketing number." },
      { spec: "Size / packability", why: "Tools you won’t travel with won’t get used." },
    ],
    tradeOffs: [
      {
        left: "Premium boots",
        right: "Simple roller",
        note: "Expensive tools don’t replace sleep and load management.",
      },
    ],
    useCaseShifts: [
      { useCase: "High mileage", note: "Routine beats gadget novelty." },
      { useCase: "Travel races", note: "Packable gun or roller only." },
    ],
    beginnerStart:
      "Start with a foam roller you’ll actually use. Skip medical claims — treat these as comfort tools.",
    relatedBestHref: "/best/running-recovery-gear",
    relatedBestLabel: "Best recovery gear",
    relatedGuideHref: "/guides/recovery-tools-what-evidence-shows",
    relatedGuideLabel: "What evidence shows",
    relatedFinderHref: "/tools/running-recovery-finder",
    relatedFinderLabel: "Recovery Finder",
  },

  headphones: {
    whatItIs:
      "Open-ear, bone conduction, true wireless and ear-hook designs for run audio — outdoor awareness first.",
    productTypes: [
      { name: "Open-ear / bone", note: "More environmental awareness outdoors." },
      { name: "True wireless", note: "Isolation and gym use; care outdoors." },
      { name: "Ear-hook", note: "Secure fit for hard efforts." },
    ],
    whatMatters: [
      "Outdoor awareness needs",
      "Sweat/secure fit",
      "Battery for your longest podcast run",
    ],
    specsThatMatter: [
      { spec: "Design type", why: "Open vs sealed changes traffic awareness." },
      { spec: "IP / sweat rating", why: "Longevity in rain and salt sweat." },
    ],
    tradeOffs: [
      {
        left: "Awareness",
        right: "Sound isolation",
        note: "No headphone makes traffic running inherently safe.",
      },
    ],
    useCaseShifts: [
      { useCase: "Road outdoors", note: "Lean open-ear / bone." },
      { useCase: "Treadmill / gym", note: "Sealed TWS is fine." },
    ],
    beginnerStart:
      "For outdoor road running, prefer open designs. Keep volume moderate regardless of type.",
    relatedBestHref: "/best/running-headphones",
    relatedBestLabel: "Best running headphones",
    relatedGuideHref: "/guides/open-ear-vs-in-ear-running-headphones",
    relatedGuideLabel: "Open-ear vs in-ear",
    relatedFinderHref: "/tools/running-accessories-finder",
    relatedFinderLabel: "Accessories Finder",
  },

  "running-lights": {
    whatItIs:
      "Headlamps, waist lights and high-output options for dark roads and technical trail.",
    productTypes: [
      { name: "Headlamps", note: "Hands-free primary beam." },
      { name: "Waist lights", note: "Lower beam, less head bounce." },
      { name: "High-output", note: "Technical trail throw." },
    ],
    whatMatters: ["Beam pattern for your terrain", "Comfort for longest dark session", "Runtime at usable brightness"],
    specsThatMatter: [
      { spec: "Lumens + pattern", why: "Throw/flood mix beats peak lumen brag." },
      { spec: "Battery / charge", why: "Match your longest night outing." },
    ],
    tradeOffs: [
      {
        left: "Max brightness",
        right: "Runtime / weight",
        note: "High output eats batteries and can bounce more.",
      },
    ],
    useCaseShifts: [
      { useCase: "Lit roads", note: "Modest clip/waist light may be enough." },
      { useCase: "Trail night", note: "Headlamp with real throw." },
    ],
    beginnerStart: "Buy a comfortable headlamp with a usable mid mode — not only the turbo number.",
    relatedBestHref: "/best/running-headlamps",
    relatedBestLabel: "Best headlamps",
    relatedFinderHref: "/tools/running-accessories-finder",
    relatedFinderLabel: "Accessories Finder",
  },

  "safety-gear": {
    whatItIs:
      "Clip lights, wearable lights, reflective layers and alarms — visibility tools, not a substitute for route judgment.",
    productTypes: [
      { name: "Clip / wearable lights", note: "Active visibility to drivers." },
      { name: "Reflective", note: "Passive return of headlight beams." },
      { name: "Personal alarms", note: "Personal security add-on — situational only." },
    ],
    whatMatters: ["Being seen at driver eye-lines", "Combining active + reflective", "Route choice still primary"],
    specsThatMatter: [
      { spec: "Light mode", why: "Flash patterns help conspicuity." },
      { spec: "Mount options", why: "Must stay put on pack/vest/waist." },
    ],
    tradeOffs: [
      {
        left: "More lights",
        right: "False security",
        note: "Visibility gear does not make traffic corridors safe.",
      },
    ],
    useCaseShifts: [
      { useCase: "Dark road commute", note: "Active light + reflective layer." },
      { useCase: "Dawn trail", note: "Pair with a real headlamp for footing." },
    ],
    beginnerStart:
      "Add a bright clip light and reflective detail before buying specialty alarms.",
    relatedBestHref: "/best/running-safety-visibility",
    relatedBestLabel: "Best visibility gear",
    relatedFinderHref: "/tools/running-accessories-finder",
    relatedFinderLabel: "Accessories Finder",
  },
};

/** Extra how-to-choose cards when a config only shipped one thin factor. */
export const RUNNING_EDUCATION_BOOSTS: Record<string, EducationFactor[]> = {
  "gps-watches": [
    {
      title: "Battery vs features",
      body: "More maps and music usually cost battery. Match the watch to your longest typical outing.",
      href: "/best/running-watches",
    },
    {
      title: "Wrist optical vs chest strap",
      body: "Wrist HR is convenient; chest straps remain the accuracy default for intervals.",
      href: "/best/heart-rate-monitors",
    },
    {
      title: "Maps only when needed",
      body: "Skip offline maps until you leave marked roads — you pay in battery and price.",
      href: "/guides/maps-navigation-running-watches",
    },
  ],
  "running-clothing": [
    {
      title: "Weather first",
      body: "Match fabric and coverage to heat, rain and winter darkness — then refine fit and storage.",
      href: "/best/running-gear-winter",
    },
    {
      title: "Pockets vs bounce",
      body: "Phone and gel pockets only help if they stay put at your longest pace.",
      href: "/best/running-shorts",
    },
    {
      title: "Chafe checkpoints",
      body: "Test seams and liners on a long run before race week — size and fabric both matter.",
      href: "/guides/hot-weather-running-apparel",
    },
  ],
  "nutrition-fuel": [
    {
      title: "Practice in training",
      body: "Format, carbs per serving and caffeine preference matter more than brand hype — trial fuel before race day.",
      href: "/guides/gel-vs-drink-mix-vs-chews",
    },
    {
      title: "Carbs vs electrolytes",
      body: "Electrolyte tabs are not a carb plan. Match gels/mixes to distance fuel math.",
      href: "/best/running-race-fuel",
    },
    {
      title: "Evidence honesty",
      body: "Kitletics compares sports products from labels and use-case fit — not medical nutrition advice.",
      href: "/guides/running-gels-explained",
    },
  ],
  sunglasses: [
    {
      title: "Coverage vs weight",
      body: "Shields block more glare and wind; lighter wraps feel freer on hot road miles.",
      href: "/best/running-sunglasses",
    },
    {
      title: "Lens for your light",
      body: "Fixed dark lenses fail at dawn; photochromic helps variable trail cover.",
      href: "/best/running-sunglasses",
    },
    {
      title: "Sweat grip",
      body: "If they slide on an easy run, they will bounce on a race effort — fit first.",
      href: "/tools/running-accessories-finder",
    },
  ],
  accessories: [
    {
      title: "Name the rub first",
      body: "Thighs, sports-bra line, underarms and seam rub are different jobs. Apply only where you already fail — not as a full-body coating.",
      href: "/guides/anti-chafe-for-runners",
    },
    {
      title: "Stick vs roll-on",
      body: "Sticks (Body Glide, Squirrel’s) win pocket speed. Roll-ons (SportShield) win thin coverage under race kits — they need dry-time.",
      href: "/best/running-anti-chafe",
    },
    {
      title: "Not audio or lights",
      body: "Headphones, headlamps, sunglasses and belts are separate shelves. Use the Accessories Finder only to route those jobs away from this chafe catalog.",
      href: "/tools/running-accessories-finder",
    },
  ],
  hydration: [
    {
      title: "Vest vs belt vs handheld",
      body: "Start with volume and bounce control, then choose the carry format that matches your longest sessions.",
      href: "/guides/hydration-vest-vs-running-belt",
    },
    {
      title: "Cleanability",
      body: "Flasks and reservoirs you won’t clean won’t stay in rotation.",
      href: "/guides/soft-flasks-vs-bladders-explained",
    },
    {
      title: "Aid-station reality",
      body: "Race vs unsupported long runs change how much capacity you need on body.",
      href: "/tools/running-hydration-finder",
    },
  ],
  "running-packs-vests": [
    {
      title: "Fit on the descent",
      body: "Bounce and hotspots show up downhill — size torso carefully.",
      href: "/best/hydration-vests",
    },
    {
      title: "Flask geometry",
      body: "Front pockets must match the flasks you actually own.",
      href: "/guides/soft-flasks-vs-bladders-explained",
    },
    {
      title: "When a belt is enough",
      body: "Road longs with phone + gels often don’t need a vest.",
      href: "/guides/hydration-vest-vs-running-belt",
    },
  ],
  "heart-rate-monitors": [
    {
      title: "Intervals favor straps",
      body: "Wrist optical is fine for easy runs; chest straps stay the accuracy default when HR targets matter.",
      href: "/best/heart-rate-monitors-intervals",
    },
    {
      title: "Broadcast pairing",
      body: "Confirm ANT+/Bluetooth dual broadcast if you use watch + bike computer or phone apps.",
      href: "/guides/optical-wrist-hr-vs-chest-strap",
    },
    {
      title: "Comfort = compliance",
      body: "An accurate strap you won’t wear loses to a good-enough optical you’ll use.",
      href: "/tools/running-hrm-finder",
    },
  ],
  headphones: [
    {
      title: "Awareness first outdoors",
      body: "Open designs aim to keep more environmental awareness — no headphone makes traffic running inherently safe.",
      href: "/guides/open-ear-vs-in-ear-running-headphones",
    },
    {
      title: "Secure fit",
      body: "Ear-hooks and open frames fail if they bounce — test on a hard effort.",
      href: "/best/running-headphones",
    },
    {
      title: "Gym vs road",
      body: "Sealed buds are fine indoors; prefer open designs on shared roads.",
      href: "/guides/open-ear-vs-in-ear-running-headphones",
    },
  ],
  recovery: [
    {
      title: "Adjuncts, not treatment",
      body: "These tools are comfort routines alongside rest and load management — not medical healing devices.",
      href: "/guides/recovery-tools-what-evidence-shows",
    },
    {
      title: "Routine over novelty",
      body: "A roller you’ll use beats a premium gadget that sits idle.",
      href: "/best/running-recovery-gear",
    },
    {
      title: "Travel reality",
      body: "Packable tools win race weekends; boots stay home.",
      href: "/tools/running-recovery-finder",
    },
  ],
  "running-belts": [
    {
      title: "Belt vs vest",
      body: "Belts win for phone + gels on road longs; vests win when flask volume and jacket storage grow.",
      href: "/guides/hydration-vest-vs-running-belt",
    },
    {
      title: "Bounce with your phone",
      body: "Test the belt with the phone you actually carry — case size changes everything.",
      href: "/best/running-belts",
    },
    {
      title: "Race minimalism",
      body: "Race belts are for numbers and gels — don’t expect daily phone comfort.",
      href: "/guides/how-to-choose-running-belt",
    },
  ],
  "running-socks": [
    {
      title: "Match height to shoe",
      body: "Quarter and crew heights change heel lock and debris entry — trial with your daily trainer before race day.",
      href: "/best/running-socks",
    },
    {
      title: "Blister history",
      body: "Target known hotspots (toes, heels) rather than buying max cushion everywhere.",
      href: "/guides/how-to-choose-running-socks",
    },
    {
      title: "Volume in race lasts",
      body: "Thick cushion socks can crowd snug race shoes — test the pair together.",
      href: "/best/running-socks",
    },
  ],
  "running-lights": [
    {
      title: "Lumens vs beam pattern",
      body: "Max lumens matter less than a usable throw/flood mix and stable on-head comfort for your longest dark session.",
      href: "/best/running-headlamps",
    },
    {
      title: "Runtime at usable mode",
      body: "Turbo numbers fade — judge the mid mode you’ll actually leave on.",
      href: "/best/running-headlamps",
    },
    {
      title: "Head vs waist",
      body: "Waist lights reduce head bounce; headlamps win technical trail throw.",
      href: "/tools/running-accessories-finder",
    },
  ],
  "safety-gear": [
    {
      title: "Be seen, stay aware",
      body: "Reflective and active lights help drivers see you — they do not make traffic corridors safe.",
      href: "/best/running-safety-visibility",
    },
    {
      title: "Active + reflective",
      body: "Combine a flashing light with reflective detail at driver eye-lines.",
      href: "/best/running-safety-visibility",
    },
    {
      title: "Route still wins",
      body: "Visibility gear is secondary to choosing safer roads and times.",
      href: "/running/lights",
    },
  ],
};

export function withRunningDecisionEnrichment(
  config: ProductCategoryPageConfig,
): ProductCategoryPageConfig {
  const decision = RUNNING_CATEGORY_DECISIONS[config.categorySlug];
  const boost = RUNNING_EDUCATION_BOOSTS[config.categorySlug];
  const educationFactors =
    boost && config.educationFactors.length < 3
      ? boost
      : config.educationFactors;

  if (!decision && educationFactors === config.educationFactors) {
    return config;
  }

  return {
    ...config,
    ...(decision ? { decision } : {}),
    educationFactors,
  };
}

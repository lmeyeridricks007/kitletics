import type { FAQ } from "@/domain/editorial/types";
import { GUIDE_BACKFILL_FAQS } from "@/lib/guides/guide-backfill-faqs";

export const faqs: FAQ[] = [
  {
    id: "faq-nb5-1",
    question: "Is the Novablast 5 a good first running shoe?",
    answer:
      "Yes for neutral beginners who want a soft, energetic daily trainer. Runners who need stability or wide widths should compare Ghost and Nimbus options.",
    productId: "prod-novablast-5",
  },
  {
    id: "faq-nb5-2",
    question: "Can I race a marathon in the Novablast 5?",
    answer:
      "Some runners do, but plated tempo/race shoes generally score higher for marathon racing. Novablast 5 shines as a daily and long-run shoe.",
    productId: "prod-novablast-5",
  },
  {
    id: "faq-nb5-3",
    question: "Is the Novablast 5 a stability shoe?",
    answer:
      "No. It is a neutral daily trainer. Runners who need guided stability should look at dedicated stability models rather than Novablast.",
    productId: "prod-novablast-5",
  },
  {
    id: "faq-nb5-4",
    question: "How does the Novablast 5 compare with the Gel-Nimbus?",
    answer:
      "Novablast is typically more lively and versatile for mixed easy/long pacing; Nimbus leans softer and more protective for easy miles. See the full Kitletics comparison for structured differences.",
    productId: "prod-novablast-5",
  },
  {
    id: "faq-drop-1",
    question: "What is shoe drop?",
    answer:
      "Drop is the height difference between heel and forefoot stack, measured in millimetres. It influences how the shoe encourages landing mechanics — it is not a quality ranking.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-best-shoes-1",
    question: "How does Kitletics choose best running shoes?",
    answer:
      "We map products to use cases with explainable recommendation factors (cushion, stability, weight, terrain fit) and require structured product data — not sponsorship rankings.",
  },
  {
    id: "faq-best-shoes-2",
    question: "What is the best running shoe for everyday training?",
    answer:
      "In our current shortlist, the ASICS Novablast 6 is the strongest all-round daily for neutral runners. Beginners who need width options may prefer the Brooks Ghost 18.",
  },
  {
    id: "faq-best-shoes-3",
    question: "Do I need different shoes for training and racing?",
    answer:
      "Not always. Many runners start with one daily trainer. As mileage or race goals grow, a faster workout or race shoe and a protective easy-day option often make sense — see the shoe rotation planner.",
  },
  {
    id: "faq-best-shoes-4",
    question: "How much should I spend on running shoes?",
    answer:
      "Expect mid to upper mid-range pricing for capable daily trainers. The cheapest pair is not automatically best value — match the shoe to your use case and fit first. Current regional prices update from Offers.",
  },
  {
    id: "faq-best-shoes-5",
    question: "Are carbon-plated shoes worth it?",
    answer:
      "They can help on race day for runners who train enough to use them well. For most weekly kilometres, a durable daily trainer remains the better investment.",
  },
  {
    id: "faq-best-shoes-6",
    question: "Should I rotate multiple pairs?",
    answer:
      "Rotation can reduce wear and let you match shoe character to the session. One reliable daily is enough to start; add pairs as mileage and goals grow. Not every runner needs multiple shoes.",
  },
  {
    id: "faq-compare-1",
    question: "Novablast 6 or Ghost 18 for beginners?",
    answer:
      "Ghost 18 is often easier for fit (width options). Novablast 6 is more energetic. Both are strong daily trainers for neutral runners.",
  },
  {
    id: "faq-cushion-1",
    question: "Is a higher stack always softer?",
    answer:
      "No. Stack height measures material underfoot; softness depends on foam and geometry. Kitletics separates cushioning, cushion feel and energy return on Product specs.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-1",
    question: "Do stability shoes fix overpronation?",
    answer:
      "Stability shoes provide guided platforms for runners who prefer support-oriented designs. They are not a diagnosis or guaranteed injury fix — seek clinical advice when needed.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-2",
    question: "What is a stability running shoe?",
    answer:
      "A stability running shoe is designed to create a more guided or secure platform than a typical neutral trainer. Brands use geometry, sidewalls, guidance systems, medial structures or heel design — often combined. The label describes product design, not a medical requirement.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-3",
    question: "Are stability shoes only for overpronators?",
    answer:
      "No. Some runners simply prefer a more secure platform. Kitletics does not diagnose overpronation. If you have pain or injury concerns, a qualified clinician can help; do not treat brand marketing as a gait analysis.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-4",
    question: "Can neutral runners wear stability shoes?",
    answer:
      "Often yes, if the shoe feels comfortable and the guided ride is preferred. Some runners find high-support shoes restrictive. Comfort and fit matter more than the category name. Compare a mild-stability option if you want to try guidance without a max-support package.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-5",
    question: "Do stability shoes prevent injury?",
    answer:
      "No footwear category can promise injury prevention. Stability shoes change platform feel and guidance; they are not medical devices. Training load, recovery, surface and individual history matter more than a stability label alone.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-6",
    question: "What is a medial post vs a guide rail?",
    answer:
      "A medial post is denser material on the inner midsole — a traditional support tool. Guide rails and modern guidance systems are structures designed to influence motion, often without a classic dense post. Brands implement these differently; read the midsole description on the product page.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-7",
    question: "Are max-cushion shoes stable?",
    answer:
      "Not automatically. Softness and stability are separate dimensions. Some max-cushion shoes are neutral; others add guidance, sidewalls or broader platforms. Soft foam can feel tippy without supportive geometry — and firm foam is not automatically stable.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-stability-8",
    question: "Can I race in stability shoes?",
    answer:
      "You can race in whatever is comfortable and race-legal for your event. Dedicated support-oriented race tools are uncommon. Many runners use a stability daily for easy miles and a separate neutral tempo or race shoe for faster efforts.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-heavy-1",
    question: "What weight counts as a heavy runner?",
    answer:
      "Kitletics does not define a universal kg cutoff. The heavy-runners use case reflects preferences for more protective cushioning and durable platforms — not a medical threshold.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-trail-1",
    question: "Can I use road shoes on trails?",
    answer:
      "Light paths sometimes work, but technical trail needs grip and protection that road outsoles lack. Prefer trail-classified shoes for off-road training.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-1",
    question: "Do beginners need a flagship GPS watch?",
    answer:
      "Usually no. A simpler GPS watch covers most early training. Add maps and advanced metrics when your routes and training actually need them.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-2",
    question: "Is multi-band GPS always better?",
    answer:
      "Multi-band can improve tracking in difficult environments but typically uses more battery. Use it when your routes need it — not by default for every easy run.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-choose-1",
    question: "How much GPS battery does a running watch need?",
    answer:
      "Choose enough runtime for your longest expected activity in the GPS mode and with the maps, sensors, music and display settings you will actually use, then leave a safety reserve. Smartwatch-mode battery is not the relevant figure for a long race.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-choose-2",
    question: "Do I need maps on a running watch?",
    answer:
      "Not for familiar road routes. Breadcrumb navigation is often enough for simple planned courses; full offline maps become more useful at complex trail junctions, on unfamiliar routes or when you need surrounding context after leaving the course.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-choose-3",
    question: "Is AMOLED or MIP better for a running watch?",
    answer:
      "Neither is universally better. AMOLED gives vivid contrast and richer graphics, while MIP is highly readable in bright outdoor light and usually supports longer always-visible battery life. Compare readability and battery in your preferred settings.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-choose-4",
    question: "Can I trust wrist heart rate for running?",
    answer:
      "Wrist optical heart rate is convenient for effort trends, but fit, cold, motion and rapid intensity changes can affect readings. Many runners use a compatible chest strap for intervals. Consumer watch data is not a medical diagnosis.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-watch-choose-5",
    question: "Are advanced training-readiness metrics worth paying for?",
    answer:
      "They can be useful when you wear the watch consistently and use the trend to inform training alongside how you feel. They are estimates, not instructions; skip them if you mainly need reliable GPS, pace, laps and simple workouts.",
    categoryId: "cat-gps-watches",
    sportId: "sport-running",
  },
  {
    id: "faq-hrm-1",
    question: "Is a chest strap more accurate than watch optical HR?",
    answer:
      "Many runners prefer chest straps for hard intervals because optical wrist HR can be more variable during intense efforts. Ease of use still favours watch optical for easy miles.",
    categoryId: "cat-hrm",
    sportId: "sport-running",
  },
  {
    id: "faq-vest-1",
    question: "When do I need a hydration vest instead of a belt?",
    answer:
      "When water volume, layers or trail logistics exceed what a belt can carry comfortably — especially longer trail efforts and races with mandatory kit.",
    categoryId: "cat-packs-vests",
    sportId: "sport-running",
  },
  {
    id: "faq-headphones-1",
    question: "Are open-ear headphones safer for outdoor running?",
    answer:
      "Open designs generally leave more awareness of surroundings, but no headphone makes outdoor running inherently safe. Manage volume and traffic deliberately.",
    categoryId: "cat-headphones",
    sportId: "sport-running",
  },
  {
    id: "faq-compare-nb5-nimbus-1",
    question: "Which is better for daily training — Novablast 5 or Nimbus 27?",
    answer:
      "Novablast 5 is usually the better daily training pick when you mix easy miles with occasional faster work. Nimbus 27 wins when almost all of your mileage is easy and comfort is the priority.",
  },
  {
    id: "faq-compare-nb5-nimbus-2",
    question: "Which is better for long runs?",
    answer:
      "Nimbus 27 edges long and recovery-focused miles with maximum cushioning. Novablast 5 remains a strong long-run option if you prefer a livelier ride.",
  },
  {
    id: "faq-compare-nb5-nimbus-3",
    question: "Which is more cushioned?",
    answer:
      "Nimbus 27 is positioned as maximum cushion; Novablast 5 is high cushion with a more energetic character. Specs and recommendation contexts should guide the final pick — not a universal winner.",
  },
  {
    id: "faq-compare-nb6-nimbus-1",
    question: "Which is better for long runs — Novablast 6 or Nimbus 27?",
    answer:
      "GEL-Nimbus 27 generally edges easy long runs with maximum cushioning. Novablast 6 remains a strong long-run option if you prefer a livelier ride over pure plush.",
    productId: "prod-nimbus-27",
  },
  {
    id: "faq-compare-nb6-nimbus-2",
    question: "Which is lighter?",
    answer:
      "Novablast 6 publishes a lighter men’s reference weight (~253 g). Nimbus 27 sits in a more protective max-cushion class — check each product page for the latest published figures.",
    productId: "prod-novablast-6",
  },
  {
    id: "faq-compare-nb6-nimbus-3",
    question: "Which is better for faster sessions?",
    answer:
      "Novablast 6 is the clearer pick for moderate tempos and mixed-pace days. Nimbus 27 is not aimed at dedicated faster work.",
    productId: "prod-novablast-6",
  },
  {
    id: "faq-compare-nb6-nimbus-4",
    question: "Which is better as a daily trainer?",
    answer:
      "Novablast 6 is usually the better single daily trainer when your week mixes easy miles with some steady or tempo work. Choose Nimbus 27 when almost all of your mileage is easy, recovery or high-volume long runs and you want maximum soft protection.",
    productId: "prod-novablast-6",
  },
  {
    id: "faq-compare-nb6-nimbus-5",
    question: "Which is more cushioned?",
    answer:
      "Nimbus 27 is positioned as maximum cushioning with a protective easy-pace platform. Novablast 6 is still a soft daily shoe, but with a livelier midsole character — not a pure plush recovery ride.",
    productId: "prod-nimbus-27",
  },
  {
    id: "faq-compare-nb6-nimbus-6",
    question: "Do they have the same drop?",
    answer:
      "Yes — both publish an 8 mm drop. Geometry differences here are mainly stack, foam recipe and intended pace range, not heel-to-toe offset. Fit and feel underfoot still matter more than the shared drop number.",
  },
  {
    id: "faq-compare-nb6-nimbus-7",
    question: "Which has better width options?",
    answer:
      "GEL-Nimbus 27 is the clearer pick when official width options matter. Confirm current width availability on each product page and retailer listing before you buy.",
    productId: "prod-nimbus-27",
  },
  {
    id: "faq-compare-nb6-nimbus-8",
    question: "Can I use either for recovery runs?",
    answer:
      "Both can handle easy recovery miles. Nimbus 27 is the stronger dedicated recovery / soft-protection pick. Novablast 6 works if you dislike a very soft, slow feel on ordinary easy days.",
    productId: "prod-nimbus-27",
  },
  {
    id: "faq-compare-nb6-nimbus-9",
    question: "Should I own both?",
    answer:
      "A rotation makes sense if you split roles: Novablast for mixed daily and moderate work, Nimbus for long and recovery. If you only buy one road pair for mixed training, Novablast 6 is usually the more complete single-shoe answer.",
  },
  {
    id: "faq-compare-nb6-nimbus-10",
    question: "Is there a universal winner?",
    answer:
      "No. This is a ride and role choice, not a quality ranking. Pick Novablast 6 for lively versatility; pick Nimbus 27 for maximum cushioning and easy / long-run comfort. Confirm fit and current pricing before buying.",
  },
  {
    id: "faq-compare-nb4-nb5-1",
    question: "Is it worth upgrading from Novablast 4 to Novablast 5?",
    answer:
      "Upgrade when the 4 is worn out or you want the current generation. Keep the 4 if it still feels good or you find a strong discount that fits easy-mileage training.",
  },
  {
    id: "faq-shoes-pairs",
    question: "How many pairs of running shoes do I need?",
    answer:
      "One reliable daily trainer is enough to start. Runners logging higher mileage often rotate a daily shoe with a faster or more protective option to manage wear and session type.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-shoes-fit",
    question: "How should running shoes fit?",
    answer:
      "Aim for a secure midfoot and heel with roughly a thumb’s width of space at the toes when standing. Width and volume matter as much as length — swelling on long runs is normal. Prefer official width options when you need wide lasts.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-shoes-replace",
    question: "How often should I replace running shoes?",
    answer:
      "Many road shoes feel worn between roughly 500–800 km, but foam, outsole wear and how the shoe feels under you matter more than a fixed number. Replace sooner if cushioning feels dead or pain appears.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-shoes-stability",
    question: "Do I need stability shoes?",
    answer:
      "Not automatically. Many runners do well in neutral shoes. Consider stability options if you notice excessive inward roll, recurring irritation, or a clinician has recommended guidance — Kitletics does not diagnose injuries.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-shoes-carbon",
    question: "Are carbon-plated shoes only for racing?",
    answer:
      "They are built primarily for race-day speed, but some runners use lighter plated shoes for workouts. Daily training usually favours durable trainers without a race plate.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Running shoe drop ——
  {
    id: "faq-drop-2",
    question: "Is a lower drop always better?",
    answer:
      "No. Lower drop changes geometry and calf/Achilles demand for some runners; it is not a quality ranking. Preference, history and gradual transition matter more than dogma.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-drop-3",
    question: "How is running shoe drop measured?",
    answer:
      "Drop is heel stack height minus forefoot stack height in millimetres. Two shoes can share a drop and feel very different because of total stack, foam and rocker.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-drop-4",
    question: "Should I change drop when I buy new shoes?",
    answer:
      "Large jumps can irritate calves or Achilles for some runners. If you move between very different drops, transition gradually across easy miles rather than racing immediately.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-drop-5",
    question: "Does drop determine foot strike?",
    answer:
      "Drop influences shoe geometry, but it does not force a single “correct” foot strike. Form, fatigue, speed and stack all interact. Kitletics does not prescribe form changes as medical treatment.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Cushioning ——
  {
    id: "faq-cushion-2",
    question: "What is the difference between stack height and softness?",
    answer:
      "Stack is how much material sits underfoot. Softness is how that material compresses. A tall stack can feel firm; a moderate stack can feel plush.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-cushion-3",
    question: "Is maximum cushion always best for long runs?",
    answer:
      "Many runners prefer max cushion for long easy miles, but weight, stability preference and rocker also matter. Match cushion to the session and how your legs feel — not to marketing adjectives alone.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-cushion-4",
    question: "Does high energy return mean a soft shoe?",
    answer:
      "Not necessarily. Race foams often prioritise rebound and speed over plush recovery feel. Separate energy return from cushion feel when comparing products.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-cushion-5",
    question: "How does Kitletics classify cushioning?",
    answer:
      "Products use structured cushioning categories (minimal through maximum) plus related ride attributes. Finders and Best Guides filter on those fields — not free-text “super soft” claims.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Carbon vs nylon plates ——
  {
    id: "faq-plates-1",
    question: "What does a plate do in a running shoe?",
    answer:
      "A plate (carbon, nylon or composite) adds longitudinal stiffness and can change how force transfers through the midsole. It is one part of a system with foam and geometry.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-plates-2",
    question: "Is carbon always better than nylon?",
    answer:
      "Carbon plates are typically stiffer and more race-oriented. Nylon or composite plates can feel more forgiving for workouts or everyday speed. Better depends on the session and your tolerance for stiffness.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-plates-3",
    question: "Can I train every day in a carbon-plated shoe?",
    answer:
      "Most runners should not. Race plates are built for speed sessions and race day. Daily volume usually belongs in durable trainers that recover better between easy miles.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-plates-4",
    question: "Do plates prevent injury?",
    answer:
      "No. Plates change stiffness and ride character. They are not protective medical devices. Seek clinical advice for pain or injury concerns.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-plates-5",
    question: "Who benefits most from a carbon plate?",
    answer:
      "Runners who race at paces where they can use the stiffness, have enough training volume, and accept a less forgiving daily-training ride. Beginners often get more value from a strong daily trainer first.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Rotation ——
  {
    id: "faq-rotation-1",
    question: "Do I need more than one pair of running shoes?",
    answer:
      "One reliable daily trainer is enough to start. As mileage or goals grow, a second pair (easy/long vs faster work) can match session demand and spread wear.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-rotation-2",
    question: "How many shoes should be in a rotation?",
    answer:
      "Two to three pairs cover most runners: a daily, a long/easy option if needed, and a faster workout or race shoe. More pairs help high-mileage athletes, not every beginner.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-rotation-3",
    question: "Does rotating shoes reduce injury risk?",
    answer:
      "Evidence is mixed and individual. Rotation can change loading patterns and reduce single-shoe wear. It is not a guaranteed injury prevention plan — Kitletics does not diagnose or treat injuries.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-rotation-4",
    question: "Should every shoe in my rotation feel the same?",
    answer:
      "Usually no. The point is complementary roles — protective easy miles, versatile daily work, and faster sessions — not three identical trainers.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-rotation-5",
    question: "How do I decide which shoe for which run?",
    answer:
      "Match character to the session: plush/protective for easy and long, lively daily for mixed weeks, plated or lighter shoes for workouts and races. The Shoe Rotation Planner can help structure this.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Daily trainer ——
  {
    id: "faq-daily-1",
    question: "What is a daily trainer running shoe?",
    answer:
      "A versatile shoe built for most easy and moderate training miles — durable enough for weekly volume, cushioned enough for recovery days, without race-plate extremes.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-daily-2",
    question: "Can a daily trainer replace a race shoe?",
    answer:
      "For many beginners and recreational races, yes. As you chase faster race paces, a dedicated tempo or race shoe often becomes useful while the daily remains your volume workhorse.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-daily-3",
    question: "Is a max-cushion shoe a daily trainer?",
    answer:
      "Sometimes. Soft max-cushion shoes can be excellent easy-day tools. If they feel too soft or heavy for mixed paces, keep a livelier daily alongside them.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-daily-4",
    question: "How long do daily trainers last?",
    answer:
      "Many lose protective feel around 500–800 km, but foam breakdown and outsole wear vary. Replace when the ride feels dead or discomfort appears — not only by calendar date.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-daily-5",
    question: "Should beginners start with a daily trainer?",
    answer:
      "Usually yes. A well-fitting daily trainer covers most early mileage better than a stiff race plate or a highly specialised trail shoe.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Terminology ——
  {
    id: "faq-term-1",
    question: "What does stack height mean?",
    answer:
      "Stack height is the amount of midsole material under the heel and/or forefoot. It is related to, but not the same as, how soft the shoe feels.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-term-2",
    question: "What is a rocker in a running shoe?",
    answer:
      "A rocker is curved geometry that encourages a rolling forward transition. It can make tall stacks feel smoother, especially late in long runs.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-term-3",
    question: "What does neutral mean for running shoes?",
    answer:
      "Neutral usually means the shoe has minimal dedicated guidance structures. It does not diagnose your gait or guarantee injury outcomes.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-term-4",
    question: "Where should I look up running shoe terms?",
    answer:
      "Use this terminology guide alongside Product pages — Kitletics maps terms to structured fields (drop, cushioning, stability) so Finders and comparisons stay consistent.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  // —— Road vs trail ——
  {
    id: "faq-road-trail-1",
    question: "Can I run trails in road shoes?",
    answer:
      "Light gravel or dry fire roads may be fine. Technical, muddy or rocky trails usually need trail outsoles and protection road shoes do not provide.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-road-trail-2",
    question: "Can I use trail shoes on the road?",
    answer:
      "Occasionally, yes, but aggressive lugs wear faster on asphalt and can feel harsh. Prefer road shoes for mostly paved volume.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-road-trail-3",
    question: "What is a hybrid or approach running shoe?",
    answer:
      "Hybrids sit between road and trail — often milder lugs and some protection. Useful for mixed surfaces, less ideal as a pure technical trail tool.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  {
    id: "faq-road-trail-4",
    question: "Do trail shoes need a rock plate?",
    answer:
      "Not always. Rock plates help on sharp rocky terrain. Softer trails and fire roads may not need one. Match protection to the trails you actually run.",
    categoryId: "cat-running-shoes",
    sportId: "sport-running",
  },
  ...GUIDE_BACKFILL_FAQS,
];

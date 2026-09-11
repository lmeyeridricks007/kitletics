import type { Discipline } from "@/domain/sports/types";
import { publishedMeta } from "@/content/config";

const meta = publishedMeta();

function d(
  id: string,
  sportId: string,
  name: string,
  slug: string,
  description: string,
  sortOrder: number,
): Discipline {
  return { id, sportId, name, slug, description, sortOrder, ...meta };
}

export const disciplines: Discipline[] = [
  // Running
  d(
    "disc-running-road",
    "sport-running",
    "Road Running",
    "road",
    "Daily trainers, race shoes, GPS watches and road essentials.",
    10,
  ),
  d(
    "disc-running-trail",
    "sport-running",
    "Trail Running",
    "trail",
    "Grip, protection, hydration, packs and technical clothing.",
    20,
  ),
  d(
    "disc-running-track",
    "sport-running",
    "Track Running",
    "track",
    "Spikes, flats, timing and session-ready apparel.",
    30,
  ),
  d(
    "disc-running-treadmill",
    "sport-running",
    "Treadmill Running",
    "treadmill",
    "Stable trainers, heart-rate gear and indoor-friendly setups.",
    40,
  ),
  d(
    "disc-running-racing",
    "sport-running",
    "Racing",
    "racing",
    "Lightweight race shoes, fueling, belts and race-day watches.",
    50,
  ),
  d(
    "disc-running-ultra",
    "sport-running",
    "Ultra Running",
    "ultra",
    "Durable shoes, vests, fueling and long-day recovery gear.",
    60,
  ),

  // Fitness & Training
  d("disc-training-gym", "sport-training", "Gym Training", "gym", "Commercial gym strength and conditioning.", 10),
  d("disc-training-strength", "sport-training", "Strength Training", "strength", "Barbell, dumbbell and rack-based strength.", 20),
  d("disc-training-functional", "sport-training", "Functional Fitness", "functional-fitness", "Multi-planar functional and conditioning training.", 30),
  d("disc-training-hyrox", "sport-training", "HYROX", "hyrox", "HYROX race and training equipment decisions.", 40),
  d("disc-training-calisthenics", "sport-training", "Calisthenics", "calisthenics", "Bars, rings, parallettes and bodyweight progression.", 50),
  d("disc-training-home", "sport-training", "Home Gym", "home-gym", "Garage and apartment training setups.", 60),
  d("disc-training-conditioning", "sport-training", "Conditioning", "conditioning", "Rowers, bikes, treadmills and cardio machines.", 70),
  d("disc-training-recovery", "sport-training", "Recovery", "recovery", "Massage, mobility, compression and recovery tools.", 80),
  d("disc-training-cross", "sport-training", "Cross-training", "cross-training", "Mixed-modality conditioning.", 90),

  // Combat
  d("disc-combat-boxing", "sport-combat", "Boxing", "boxing", "Gloves, wraps and boxing training gear.", 10),
  d("disc-combat-kickboxing", "sport-combat", "Kickboxing", "kickboxing", "Striking gear for kickboxing.", 20),
  d("disc-combat-mma", "sport-combat", "MMA", "mma", "Mixed martial arts training equipment.", 30),
  d("disc-combat-martial", "sport-combat", "Martial Arts", "martial-arts", "Traditional and modern martial arts gear.", 40),

  // Racket
  d("disc-racket-tennis", "sport-racket", "Tennis", "tennis", "Rackets, shoes and court apparel.", 10),
  d("disc-racket-padel", "sport-racket", "Padel", "padel", "Padel rackets, shoes and court gear.", 20),
  d("disc-racket-pickleball", "sport-racket", "Pickleball", "pickleball", "Paddles and court equipment.", 30),
  d("disc-racket-badminton", "sport-racket", "Badminton", "badminton", "Rackets, shuttlecocks and shoes.", 40),
  d("disc-racket-squash", "sport-racket", "Squash", "squash", "Squash rackets and protective eyewear.", 50),

  // Cycling
  d("disc-cycling-road", "sport-cycling", "Road", "road", "Road bikes and race equipment.", 10),
  d("disc-cycling-gravel", "sport-cycling", "Gravel", "gravel", "Gravel bikes and adventure gear.", 20),
  d("disc-cycling-mtb", "sport-cycling", "MTB", "mtb", "Mountain bike trail equipment.", 30),
  d("disc-cycling-commute", "sport-cycling", "Commuting", "commuting", "Urban and commute cycling.", 40),
  d("disc-cycling-indoor", "sport-cycling", "Indoor Cycling", "indoor", "Smart trainers and indoor setups.", 50),

  // Swimming
  d("disc-swim-pool", "sport-swimming", "Pool Swimming", "pool", "Lane swimming and pool training.", 10),
  d("disc-swim-open", "sport-swimming", "Open Water", "open-water", "Open water swimming gear.", 20),
  d("disc-swim-tri", "sport-swimming", "Triathlon Swimming", "triathlon", "Wetsuits and triathlon swim gear.", 30),

  // Watersports
  d("disc-water-sup", "sport-watersports", "SUP", "sup", "Stand-up paddleboarding.", 10),
  d("disc-water-kayak", "sport-watersports", "Kayaking", "kayaking", "Kayaks and paddling gear.", 20),
  d("disc-water-canoe", "sport-watersports", "Canoeing", "canoeing", "Canoes and canoeing equipment.", 30),
  d("disc-water-surf", "sport-watersports", "Surfing", "surfing", "Boards, wetsuits and surf accessories.", 40),

  // Diving
  d("disc-diving-scuba", "sport-diving", "Scuba", "scuba", "Scuba diving systems and computers.", 10),
  d("disc-diving-free", "sport-diving", "Freediving", "freediving", "Freediving fins, masks and computers.", 20),
  d("disc-diving-snorkel", "sport-diving", "Snorkeling", "snorkeling", "Snorkel sets and accessories.", 30),

  // Fishing
  d("disc-fish-carp", "sport-fishing", "Carp", "carp", "Carp fishing rods, reels and tackle.", 10),
  d("disc-fish-predator", "sport-fishing", "Predator", "predator", "Pike, bass and predator fishing.", 20),
  d("disc-fish-fly", "sport-fishing", "Fly", "fly", "Fly rods, lines and flies.", 30),
  d("disc-fish-sea", "sport-fishing", "Sea", "sea", "Saltwater and sea fishing.", 40),
  d("disc-fish-fresh", "sport-fishing", "Freshwater", "freshwater", "General freshwater fishing.", 50),
  d("disc-fish-kayak", "sport-fishing", "Kayak Fishing", "kayak-fishing", "Kayak angling setups.", 60),

  // Target
  d("disc-target-archery", "sport-target", "Archery", "archery", "Bows, arrows and archery accessories.", 10),
  d("disc-target-darts", "sport-target", "Darts", "darts", "Dartboards and dart sets.", 20),

  // Indoor
  d("disc-indoor-pool", "sport-indoor", "Pool", "pool", "Pool tables and cues.", 10),
  d("disc-indoor-snooker", "sport-indoor", "Snooker", "snooker", "Snooker tables and equipment.", 20),
  d("disc-indoor-tt", "sport-indoor", "Table Tennis", "table-tennis", "Table tennis bats and tables.", 30),
  d("disc-indoor-foosball", "sport-indoor", "Foosball", "foosball", "Foosball / table football.", 40),

  // Winter
  d("disc-winter-ski", "sport-winter", "Skiing", "skiing", "Ski boots, skis and apparel.", 10),
  d("disc-winter-snowboard", "sport-winter", "Snowboarding", "snowboarding", "Boards, boots and bindings.", 20),

  // Recovery
  d("disc-recovery-mobility", "sport-recovery", "Mobility", "mobility", "Mobility tools and routines.", 10),
  d("disc-recovery-massage", "sport-recovery", "Massage", "massage", "Massage guns and rollers.", 20),
  d("disc-recovery-compression", "sport-recovery", "Compression", "compression", "Compression boots and garments.", 30),
  d("disc-recovery-sauna", "sport-recovery", "Sauna", "sauna", "Home sauna and heat recovery.", 40),
  d("disc-recovery-cold", "sport-recovery", "Cold Plunge", "cold-plunge", "Cold plunge and ice baths.", 50),

  // Recreation
  d("disc-recreation-sim", "sport-recreation", "Sim Racing", "sim-racing", "Sim racing rigs and peripherals.", 10),
];

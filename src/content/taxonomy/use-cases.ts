import type { UseCase } from "@/domain/sports/types";
import { fitnessUseCases } from "@/content/fitness";
import { hyroxExtraUseCases } from "@/content/hyrox/editorial";
import { racketUseCases } from "@/content/racket";

function uc(
  id: string,
  group: UseCase["group"],
  name: string,
  slug: string,
  description: string,
  sportId?: string,
): UseCase {
  return { id, group, name, slug, description, sportId };
}

export const useCases: UseCase[] = [
  // Runner profile
  uc("uc-beginners", "runner", "Beginners", "beginners", "New runners building consistency.", "sport-running"),
  uc("uc-intermediate", "runner", "Intermediate Runners", "intermediate-runners", "Established runners progressing mileage or pace.", "sport-running"),
  uc("uc-advanced", "runner", "Advanced Runners", "advanced-runners", "Experienced athletes with structured training.", "sport-running"),
  uc("uc-heavy", "runner", "Heavier Runners", "heavy-runners", "Runners prioritizing protective cushioning, durable platforms and fit for higher-load training — not a medical weight threshold.", "sport-running"),
  uc("uc-lightweight", "runner", "Lightweight Runners", "lightweight-runners", "Lighter runners who can use raceier setups.", "sport-running"),
  uc("uc-wide-feet", "runner", "Wide Feet", "wide-feet", "Runners needing wider lasts or width options.", "sport-running"),
  uc("uc-narrow-feet", "runner", "Narrow Feet", "narrow-feet", "Runners needing a secure narrow fit.", "sport-running"),
  uc("uc-flat-feet", "runner", "Flat Feet", "flat-feet", "Low-arch runners often needing support options.", "sport-running"),
  uc("uc-high-arches", "runner", "High Arches", "high-arches", "High-arch runners often preferring softer cushioning.", "sport-running"),
  uc("uc-overpronators", "runner", "Overpronators", "overpronators", "Runners who overpronate and may need stability.", "sport-running"),
  uc("uc-neutral-runners", "runner", "Neutral Runners", "neutral-runners", "Neutral gait runners.", "sport-running"),

  // Training
  uc("uc-daily-training", "training", "Daily Training", "daily-training", "Everyday easy and steady runs.", "sport-running"),
  uc("uc-easy-runs", "training", "Easy Runs", "easy-runs", "Recovery-paced easy mileage.", "sport-running"),
  uc("uc-long-runs", "training", "Long Runs", "long-runs", "Weekend long runs and endurance sessions.", "sport-running"),
  uc("uc-recovery-runs", "training", "Recovery Runs", "recovery-runs", "Very easy recovery jogging.", "sport-running"),
  uc("uc-post-run-recovery", "training", "Post-Run Recovery Tools", "post-run-recovery-tools", "Using recovery tools after hard or long sessions — not medical treatment.", "sport-running"),
  uc("uc-travel-recovery", "training", "Travel Recovery Kit", "travel-recovery-kit", "Portable recovery tools for races and trips.", "sport-running"),
  uc("uc-home-recovery", "training", "Home Recovery Setup", "home-recovery-setup", "Home-based rollers, boots and massage devices.", "sport-running"),
  uc("uc-tempo-runs", "training", "Tempo Runs", "tempo-runs", "Threshold and tempo efforts.", "sport-running"),
  uc("uc-intervals", "training", "Intervals", "intervals", "Track and road interval sessions.", "sport-running"),
  uc("uc-speed-work", "training", "Speed Work", "speed-work", "Short, fast speed sessions.", "sport-running"),
  uc("uc-treadmill", "training", "Treadmill Running", "treadmill-running", "Indoor treadmill sessions.", "sport-running"),
  uc("uc-trail-training", "training", "Trail Running", "trail-running", "Off-road trail training.", "sport-running"),
  uc("uc-fastpacking", "training", "Fastpacking", "fastpacking", "Run-hike multi-day mountain travel with overnight kit.", "sport-running"),
  uc("uc-commute-running", "training", "Commute Running", "commute-running", "Run commuting with work clothes or day kit.", "sport-running"),
  uc("uc-night-running", "training", "Night Running", "night-running", "Road or trail running after dark.", "sport-running"),
  uc("uc-winter-running", "training", "Winter Running", "winter-running", "Cold, dark and low-light winter training.", "sport-running"),
  uc("uc-rain-running", "training", "Rain Running", "rain-running", "Wet-weather road and trail sessions.", "sport-running"),
  uc("uc-situational-awareness", "training", "Situational Awareness", "situational-awareness", "Outdoor runs where hearing traffic and surroundings matters.", "sport-running"),
  uc("uc-gym-training", "training", "Gym / Indoor Training", "gym-training", "Treadmill, indoor track and gym sessions.", "sport-running"),
  uc("uc-bright-sun", "training", "Bright Sun", "bright-sun", "High-glare road and desert sun conditions.", "sport-running"),
  uc("uc-mixed-light", "training", "Mixed Light", "mixed-light", "Changing light from shade to open sun on trail or road.", "sport-running"),
  uc("uc-short-training", "training", "Short Training", "short-training", "Sessions under ~75 minutes where fuel needs stay light.", "sport-running"),
  uc("uc-high-carb-fueling", "training", "High-Carb Fueling", "high-carb-fueling", "Sessions planned around higher carbohydrate delivery per hour.", "sport-running"),
  uc("uc-caffeinated-fuel", "training", "Caffeinated Fuel", "caffeinated-fuel", "Prefer fuel products that include caffeine.", "sport-running"),
  uc("uc-non-caffeinated-fuel", "training", "Non-Caffeinated Fuel", "non-caffeinated-fuel", "Prefer fuel products without caffeine.", "sport-running"),
  uc("uc-easy-carry-fuel", "training", "Easy-to-Carry Fuel", "easy-carry-fuel", "Compact single-serve fuel that packs easily in a vest or belt.", "sport-running"),
  uc("uc-drink-based-fueling", "training", "Drink-Based Fueling", "drink-based-fueling", "Prefer carbohydrate or electrolyte delivery from bottles/flasks.", "sport-running"),
  uc("uc-hyrox-training", "training", "HYROX Training", "hyrox-training", "HYROX station and run training.", "sport-hyrox"),

  // Racing
  uc("uc-5k", "racing", "5K", "5k", "5K racing.", "sport-running"),
  uc("uc-10k", "racing", "10K", "10k", "10K racing.", "sport-running"),
  uc("uc-half", "racing", "Half Marathon", "half-marathon", "Half marathon racing.", "sport-running"),
  uc("uc-marathon", "racing", "Marathon", "marathon", "Marathon racing.", "sport-running"),
  uc("uc-ultra", "racing", "Ultra", "ultra", "Ultra-distance racing.", "sport-running"),

  // Goals
  uc("uc-first-5k", "goals", "First 5K", "first-5k", "Training for a first 5K.", "sport-running"),
  uc("uc-first-10k", "goals", "First 10K", "first-10k", "Training for a first 10K.", "sport-running"),
  uc("uc-first-half", "goals", "First Half Marathon", "first-half-marathon", "First half marathon goal.", "sport-running"),
  uc("uc-first-marathon", "goals", "First Marathon", "first-marathon", "First marathon goal.", "sport-running"),
  uc("uc-pb", "goals", "PB / PR", "pb-pr", "Personal best / personal record chasing.", "sport-running"),
  uc("uc-high-mileage", "goals", "High Mileage", "high-mileage", "High weekly volume training.", "sport-running"),
  uc("uc-comfort", "goals", "Comfort", "comfort", "Maximum comfort as primary goal.", "sport-running"),
  uc("uc-injury-conscious", "goals", "Injury-conscious running", "injury-conscious", "Gear choices prioritizing injury risk reduction.", "sport-running"),

  ...fitnessUseCases,
  ...hyroxExtraUseCases,
  ...racketUseCases,
];

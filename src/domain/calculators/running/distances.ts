/**
 * Canonical running race distances (metres).
 * Shared by Pace Calculator and Race Time Predictor — do not duplicate.
 */
export const METERS_PER_KM = 1000;
export const METERS_PER_MILE = 1609.344;

export interface RaceDistancePreset {
  id: string;
  label: string;
  meters: number;
  /** Include in equivalent race prediction tables */
  predictionTable?: boolean;
  /** Ultra — less reliable for Riegel extrapolation messaging */
  ultra?: boolean;
}

export const RACE_DISTANCES: RaceDistancePreset[] = [
  { id: "1k", label: "1 km", meters: 1000, predictionTable: false },
  { id: "1mi", label: "1 mile", meters: METERS_PER_MILE, predictionTable: true },
  { id: "5k", label: "5K", meters: 5000, predictionTable: true },
  { id: "10k", label: "10K", meters: 10000, predictionTable: true },
  {
    id: "half",
    label: "Half Marathon",
    meters: 21097.5,
    predictionTable: true,
  },
  {
    id: "marathon",
    label: "Marathon",
    meters: 42195,
    predictionTable: true,
  },
  { id: "50k", label: "50K", meters: 50000, predictionTable: false, ultra: true },
  {
    id: "50mi",
    label: "50 miles",
    meters: 50 * METERS_PER_MILE,
    predictionTable: false,
    ultra: true,
  },
  {
    id: "100k",
    label: "100K",
    meters: 100000,
    predictionTable: false,
    ultra: true,
  },
  {
    id: "100mi",
    label: "100 miles",
    meters: 100 * METERS_PER_MILE,
    predictionTable: false,
    ultra: true,
  },
];

export const HALF_MARATHON_METERS = 21097.5;
export const MARATHON_METERS = 42195;

export function getRaceDistanceById(
  id: string,
): RaceDistancePreset | undefined {
  return RACE_DISTANCES.find((d) => d.id === id);
}

/** Marathon checkpoint distances in metres */
export const MARATHON_CHECKPOINTS: { id: string; label: string; meters: number }[] =
  [
    { id: "5k", label: "5K", meters: 5000 },
    { id: "10k", label: "10K", meters: 10000 },
    { id: "15k", label: "15K", meters: 15000 },
    { id: "20k", label: "20K", meters: 20000 },
    { id: "half", label: "Half", meters: HALF_MARATHON_METERS },
    { id: "25k", label: "25K", meters: 25000 },
    { id: "30k", label: "30K", meters: 30000 },
    { id: "35k", label: "35K", meters: 35000 },
    { id: "40k", label: "40K", meters: 40000 },
    { id: "finish", label: "Finish", meters: MARATHON_METERS },
  ];

/** Half marathon checkpoint distances */
export const HALF_MARATHON_CHECKPOINTS: {
  id: string;
  label: string;
  meters: number;
}[] = [
  { id: "5k", label: "5K", meters: 5000 },
  { id: "10k", label: "10K", meters: 10000 },
  { id: "15k", label: "15K", meters: 15000 },
  { id: "finish", label: "Finish", meters: HALF_MARATHON_METERS },
];

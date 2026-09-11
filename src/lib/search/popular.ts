/** Client-safe popular search shortcuts (no catalog imports). */
export const POPULAR_SEARCHES = [
  { label: "Running Shoes", href: "/running/shoes", query: "running shoes" },
  {
    label: "Running Shoe Finder",
    href: "/tools/running-shoe-finder",
    query: "shoe finder",
  },
  {
    label: "Best Running Shoes",
    href: "/best/running-shoes",
    query: "best running shoes",
  },
  { label: "Garmin", href: "/brands/garmin", query: "garmin" },
  {
    label: "Pace Calculator",
    href: "/tools/running-pace-calculator",
    query: "pace",
  },
  {
    label: "Race Time Predictor",
    href: "/tools/race-time-predictor",
    query: "race predictor",
  },
  {
    label: "Shoe Rotation Planner",
    href: "/tools/shoe-rotation-planner",
    query: "shoe rotation",
  },
] as const;

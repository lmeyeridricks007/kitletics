/**
 * Primary nav hover mega-menu content.
 * Visual panels for Shoes / Running / Fitness / Racket / etc.
 */

export interface PrimaryMenuLink {
  label: string;
  href: string;
  description?: string;
  badge?: string;
}

export interface PrimaryMenuColumn {
  title: string;
  links: PrimaryMenuLink[];
}

export interface PrimaryMenuPanel {
  /** Matches PRIMARY_NAV href */
  navHref: string;
  columns: PrimaryMenuColumn[];
  footer?: PrimaryMenuLink;
}

/** Static decision links — category columns filled at render from catalog */
export const PRIMARY_MENU_PANELS: Record<string, Omit<PrimaryMenuPanel, "navHref"> & { navHref: string }> = {
  "/running/shoes": {
    navHref: "/running/shoes",
    columns: [
      {
        title: "Shop shoes",
        links: [
          { label: "All running shoes", href: "/running/shoes" },
          {
            label: "Daily trainers",
            href: "/running/shoes/daily-trainers",
          },
          { label: "Race shoes", href: "/running/shoes/race" },
          { label: "Trail shoes", href: "/running/shoes/trail" },
          { label: "Stability shoes", href: "/running/shoes/stability" },
          {
            label: "Max cushion",
            href: "/running/shoes?type=max-cushion",
          },
        ],
      },
      {
        title: "Decide",
        links: [
          { label: "Best running shoes", href: "/best/running-shoes" },
          { label: "Shoe Finder", href: "/tools/running-shoe-finder" },
          { label: "Shoe Database", href: "/running/shoes/database" },
          { label: "Compare shoes", href: "/compare?domain=shoes&category=running-shoes" },
          {
            label: "How to choose",
            href: "/guides/how-to-choose-running-shoes",
          },
          { label: "Shoe reviews", href: "/reviews?domain=shoes" },
          { label: "Shoe guides", href: "/guides?domain=shoes" },
        ],
      },
      {
        title: "By use",
        links: [
          { label: "Daily trainers", href: "/best/daily-trainers" },
          { label: "Long runs", href: "/best/running-shoes-long-runs" },
          { label: "Stability", href: "/best/stability-running-shoes" },
          { label: "Trail", href: "/best/trail-running-shoes" },
          { label: "Race day", href: "/best/race-shoes" },
          { label: "Beginners", href: "/best/running-shoes-beginners" },
        ],
      },
    ],
    footer: { label: "View all running shoes →", href: "/running/shoes" },
  },
  "/racket": {
    navHref: "/racket",
    columns: [
      {
        title: "Sports",
        links: [
          { label: "Padel", href: "/padel" },
          { label: "Tennis", href: "/tennis", badge: "Soon" },
          { label: "Pickleball", href: "/pickleball", badge: "Soon" },
          { label: "Badminton", href: "/badminton", badge: "Soon" },
          { label: "Squash", href: "/squash", badge: "Soon" },
        ],
      },
      {
        title: "Learn",
        links: [
          { label: "Padel guides", href: "/guides?sport=padel" },
          { label: "Tennis guides", href: "/guides?sport=tennis", badge: "Soon" },
          { label: "Racket sports hub", href: "/racket" },
        ],
      },
    ],
    footer: { label: "Racket sports hub →", href: "/racket" },
  },
  "/running": {
    navHref: "/running",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "Running overview", href: "/running" },
          { label: "Running shoes", href: "/running/shoes" },
          { label: "Best gear", href: "/best?sport=running" },
          { label: "Reviews", href: "/reviews?sport=running" },
        ],
      },
      {
        title: "Decide",
        links: [
          { label: "Guides", href: "/guides?sport=running" },
          { label: "Compare", href: "/compare?sport=running&category=running-shoes" },
          { label: "Finders", href: "/tools?sport=running&type=finder" },
          { label: "Tools", href: "/tools?sport=running" },
          { label: "Gear sets", href: "/setups?sport=running" },
        ],
      },
    ],
    footer: { label: "Go to Running →", href: "/running" },
  },
  "/fitness": {
    navHref: "/fitness",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "Fitness overview", href: "/fitness" },
          { label: "Best gear", href: "/best?sport=fitness" },
        ],
      },
      {
        title: "Decide",
        links: [
          { label: "Guides", href: "/guides?sport=fitness" },
          { label: "Tools", href: "/tools?sport=fitness" },
        ],
      },
    ],
    footer: { label: "Go to Fitness →", href: "/fitness" },
  },
};

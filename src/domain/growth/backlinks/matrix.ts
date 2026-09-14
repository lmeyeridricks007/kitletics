/**
 * Opportunity → asset matrix. Commercial Best pages are not the default
 * cite when a neutral dataset would fit better.
 */
export const OPPORTUNITY_ASSET_MATRIX = [
  {
    audience: "Journalist / data story",
    primary: "Running Shoe Database",
    secondary: "Planned market / weight / stack / price studies (no URL until live)",
    avoid: "Homepage, retailer CTAs, Best-of as the primary cite",
  },
  {
    audience: "Running coach",
    primary: "How to Choose Running Shoes + Running Shoe Finder",
    secondary: "Best Daily Trainers when they need named easy-day picks",
    avoid: "Race-shoe roundups as the first pitch",
  },
  {
    audience: "Running publication",
    primary: "Database, named comparison, methodology",
    secondary: "Best Guides only for roundup/methodology stories",
    avoid: "Homepage",
  },
  {
    audience: "Running club",
    primary: "Running Shoe Finder",
    secondary: "How to Choose Running Shoes",
    avoid: "Unpublished research reports",
  },
  {
    audience: "Brand PR",
    primary: "Product comparison + database market context",
    secondary: "Planned market research when findings exist",
    avoid: "Asking a brand to link a competing Best-of page",
  },
  {
    audience: "Sports-science / university",
    primary: "Database + How we review",
    secondary: "Drop / cushioning explainers",
    avoid: "Commercial Best pages",
  },
  {
    audience: "Gear newsletter",
    primary: "Computable research finding, then a Best Guide",
    secondary: "Database as the supporting dataset",
    avoid: "Pitching unpublished numbers",
  },
  {
    audience: "Retailer resource page",
    primary: "Finder + buying guide",
    secondary: "Database only if they host editorial explainers",
    avoid: "Sitewide footer / paid-placement requests",
  },
] as const;

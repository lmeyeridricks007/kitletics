import { PADEL_RACKET_DATABASE_PATH } from "@/lib/padel-racket-database/constants";

export const RACKET_DATABASE_NAV_LABEL = "Racket Database";

export const RACKET_DATABASE_HREF = PADEL_RACKET_DATABASE_PATH;

export const RACKET_DATABASE_EDITORIAL_BLURB =
  "Explore specifications for the catalog-eligible padel racket cohort in the Kitletics Padel Racket Database.";

export interface RacketDatabaseDiscoveryLink {
  label: string;
  href: string;
  description: string;
}

export const RACKET_DATABASE_DISCOVERY_LINK: RacketDatabaseDiscoveryLink = {
  label: RACKET_DATABASE_NAV_LABEL,
  href: RACKET_DATABASE_HREF,
  description: RACKET_DATABASE_EDITORIAL_BLURB,
};

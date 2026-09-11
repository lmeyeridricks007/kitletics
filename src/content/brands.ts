import type { Brand } from "@/domain/products/types";
import { publishedMeta } from "@/content/config";
import { padelAllBrands } from "@/content/padel";
import { fitnessBrands } from "@/content/fitness";
import { racketBrands } from "@/content/racket";
import { runningCatalogBrands } from "@/content/running/brands";

const meta = publishedMeta();

export const brands: Brand[] = [
  {
    id: "brand-asics",
    name: "ASICS",
    slug: "asics",
    country: "Japan",
    foundedYear: 1949,
    originCity: "Kobe",
    positioning: "Innovation inspired by movement.",
    description:
      "From performance running to everyday comfort, ASICS creates footwear and equipment across road, trail, court and training.",
    homepage: "https://www.asics.com",
    logo: "/images/brands/asics-logo.svg",
    logoOnDark: "/images/brands/asics-logo-white.svg",
    ...meta,
  },
  { id: "brand-nike", name: "Nike", slug: "nike", country: "USA", description: "Running and training footwear and apparel.", homepage: "https://www.nike.com", logo: "/images/brands/nike-logo.svg", ...meta },
  { id: "brand-adidas", name: "Adidas", slug: "adidas", country: "Germany", description: "Road racing and training footwear.", homepage: "https://www.adidas.com", logo: "/images/brands/adidas-logo.svg", ...meta },
  { id: "brand-saucony", name: "Saucony", slug: "saucony", country: "USA", description: "Road racing and daily training footwear.", homepage: "https://www.saucony.com", logo: "/images/brands/saucony-logo.svg", ...meta },
  { id: "brand-new-balance", name: "New Balance", slug: "new-balance", country: "USA", description: "Running shoes with wide width options.", homepage: "https://www.newbalance.com", logo: "/images/brands/new-balance-logo.svg", ...meta },
  { id: "brand-hoka", name: "HOKA", slug: "hoka", country: "USA", description: "Max-cushion road and trail running shoes.", homepage: "https://www.hoka.com", logo: "/images/brands/hoka-logo.svg", ...meta },
  { id: "brand-brooks", name: "Brooks", slug: "brooks", country: "USA", description: "Road running shoes focused on comfort.", homepage: "https://www.brooksrunning.com", logo: "/images/brands/brooks-logo.svg", ...meta },
  {
    id: "brand-garmin",
    name: "Garmin",
    slug: "garmin",
    country: "USA",
    foundedYear: 1989,
    originCity: "Olathe",
    positioning: "GPS training tools for endurance athletes.",
    description:
      "GPS watches, cycling computers and training sensors built around navigation, battery life and structured workouts.",
    homepage: "https://www.garmin.com",
    logo: "/images/brands/garmin-logo.svg",
    logoOnDark: "/images/brands/garmin-logo-white.svg",
    ...meta,
  },
  {
    id: "brand-coros",
    name: "COROS",
    slug: "coros",
    country: "China",
    positioning: "Lightweight GPS watches for endurance training.",
    description:
      "COROS focuses on long-battery GPS watches and training tools for runners and multisport athletes.",
    homepage: "https://www.coros.com",
    logo: "/images/brands/coros-logo.svg",
    logoOnDark: "/images/brands/coros-logo-white.svg",
    ...meta,
  },
  { id: "brand-salomon", name: "Salomon", slug: "salomon", country: "France", description: "Trail running shoes and packs.", homepage: "https://www.salomon.com", logo: "/images/brands/salomon-logo.svg", ...meta },
  ...runningCatalogBrands,
  ...padelAllBrands,
  ...racketBrands,
  ...fitnessBrands,
];

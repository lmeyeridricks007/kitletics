import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { siteConfig } from "@/content/config";
import {
  getSports,
  getCategoriesBySport,
  getSportBySlug,
  getTools,
} from "@/repositories";

const aboutLinks = [
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Evidence Policy", href: "/evidence-policy" },
  { label: "Scoring Methodology", href: "/scoring-methodology" },
  { label: "How We Review", href: "/how-we-review" },
  { label: "Methodology", href: "/methodology" },
  { label: "Authors", href: "/authors" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "About Kitletics", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const gearLinks = [
  { label: "Products", href: "/gear" },
  { label: "Brands", href: "/brands" },
  { label: "Best", href: "/best" },
  { label: "Reviews", href: "/reviews" },
  { label: "Compare", href: "/compare" },
];

export function SiteFooter() {
  // Day-1: promote Running only — do not deep-link held vertical hubs
  const sports = getSports().filter((s) => s.slug === "running");
  const running = getSportBySlug("running");
  const gearCats = running ? getCategoriesBySport(running.id).slice(0, 0) : [];
  void gearCats;
  const tools = getTools()
    .filter(
      (t) =>
        t.available &&
        (t.type === "finder" || t.type === "calculator") &&
        t.sportIds.includes("sport-running"),
    )
    .slice(0, 4);

  return (
    <footer className="bg-background-dark text-white">
      <Container size="wide" className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-1">
          <Logo inverted />
          <p className="max-w-xs text-sm text-white/55">{siteConfig.tagline}</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/65 uppercase">
            Sports
          </p>
          <ul className="space-y-2">
            {sports.map((sport) => (
              <li key={sport.id}>
                <Link
                  href={`/${sport.slug}`}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {sport.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/gear"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                All Sports
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/65 uppercase">
            Gear
          </p>
          <ul className="space-y-2">
            {gearLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/65 uppercase">
            Tools
          </p>
          <ul className="space-y-2">
            {tools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/tools"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                All tools
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-white/65 uppercase">
            About
          </p>
          <ul className="space-y-2">
            {aboutLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container
          size="wide"
          className="flex flex-col gap-3 py-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p>Structured sports gear discovery — not sponsored rankings.</p>
        </Container>
      </div>
    </footer>
  );
}

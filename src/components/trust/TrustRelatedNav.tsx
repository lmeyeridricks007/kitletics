import Link from "next/link";

const TRUST_LINKS = [
  { href: "/editorial-policy", label: "Editorial policy" },
  { href: "/evidence-policy", label: "Evidence policy" },
  { href: "/scoring-methodology", label: "Scoring methodology" },
  { href: "/how-we-review", label: "How we review" },
  { href: "/methodology", label: "Methodology overview" },
  { href: "/authors", label: "Authors" },
  { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
] as const;

/** Cross-links between trust pages — avoid contradictory duplicate essays. */
export function TrustRelatedNav({ currentPath }: { currentPath: string }) {
  const links = TRUST_LINKS.filter((l) => l.href !== currentPath);
  return (
    <nav
      aria-label="Related trust pages"
      className="mt-10 border-t border-border pt-6"
    >
      <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
        Related
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm font-medium text-accent hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

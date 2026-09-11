import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "About",
  "Kitletics helps athletes find the right gear for how they train, compete and play.",
  "/about",
);

export default function AboutPage() {
  return (
    <TrustPageShell
      title="About Kitletics"
      description="Structured sports equipment discovery — not a news site, not a blog first."
    >
      <p>
        Kitletics is a sports gear platform built around products, use cases and
        explainable recommendations. Running is our first deep vertical; every
        future sport inherits the same taxonomy and discovery system.
      </p>
      <p>
        We map equipment to how you train — disciplines, goals and experience —
        so you can move from sport to category to product without hunting through
        disconnected articles.
      </p>
      <p>
        Content is published under{" "}
        <Link
          href="/authors/kitletics-editorial"
          className="text-accent hover:underline"
        >
          Kitletics Editorial
        </Link>
        . We do not invent named experts or first-hand tests. Policies:{" "}
        <Link href="/editorial-policy" className="text-accent hover:underline">
          editorial
        </Link>
        ,{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          evidence
        </Link>
        ,{" "}
        <Link
          href="/scoring-methodology"
          className="text-accent hover:underline"
        >
          scoring
        </Link>
        , and{" "}
        <Link
          href="/affiliate-disclosure"
          className="text-accent hover:underline"
        >
          affiliate disclosure
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/about" />
    </TrustPageShell>
  );
}

"use client";

import Link from "next/link";
import { Bookmark, Compass, Scale, Sparkles } from "lucide-react";
import { CopyCompareLinkButton } from "@/components/compare/CompareShareActions";

interface CompareHelpCardsProps {
  productNounPlural: string;
  shareUrl: string;
  finderHref?: string;
  finderCtaLabel?: string;
  /** Running shoes: link to Shoe Database */
  databaseHref?: string;
  databaseLabel?: string;
}

export function CompareHelpCards({
  productNounPlural,
  shareUrl,
  finderHref,
  finderCtaLabel,
  databaseHref,
  databaseLabel = "Shoe Database",
}: CompareHelpCardsProps) {
  const cards = [
    {
      icon: Scale,
      title: "How we score",
      body: "Scores are out of 10, based on verified specs, use-case fit and evidence.",
      action: (
        <Link href="/methodology" className="font-medium text-link hover:underline">
          See methodology →
        </Link>
      ),
    },
    {
      icon: Compass,
      title: `Why these ${productNounPlural}?`,
      body: "You selected these to compare.",
      action: databaseHref ? (
        <Link href={databaseHref} className="font-medium text-link hover:underline">
          Browse {databaseLabel} →
        </Link>
      ) : (
        <Link href="/methodology" className="font-medium text-link hover:underline">
          How comparisons work →
        </Link>
      ),
    },
    {
      icon: Bookmark,
      title: "Save & compare anytime",
      body: "Your comparison is saved on this device.",
      action: <CopyCompareLinkButton url={shareUrl} />,
    },
    {
      icon: Sparkles,
      title: "Personalized recommendations",
      body: "Answer a few questions to get a shortlist tailored to how you train.",
      action: finderHref ? (
        <Link href={finderHref} className="font-medium text-link hover:underline">
          {finderCtaLabel ?? "Try the finder →"}
        </Link>
      ) : (
        <Link href="/tools?type=finder" className="font-medium text-link hover:underline">
          Browse finders →
        </Link>
      ),
    },
  ];

  return (
    <section className="mt-12 border-t border-border pt-10" aria-label="Help">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="border border-border bg-white p-5"
          >
            <card.icon
              className="size-5 text-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <h3 className="mt-3 text-[14px] font-bold text-foreground">
              {card.title}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {card.body}
            </p>
            <div className="mt-3 text-[13px]">{card.action}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

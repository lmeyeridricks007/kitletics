import {
  GuideNumberedHeading,
  GuideSection,
  GuideTipCallout,
} from "@/components/guides/GuidePrimitives";
import type { GuideFitCard } from "@/lib/guides/long-form-config";

export function GuideFitSection({
  number,
  cards,
  tip,
}: {
  number: number;
  cards: GuideFitCard[];
  tip?: { title: string; body: string };
}) {
  return (
    <GuideSection id="fit">
      <GuideNumberedHeading number={number} title="Understanding fit" />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        Fit beats foam marketing. Length, width and lockdown determine whether
        a shoe works for your foot — independent of Kitletics Score.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li
            key={card.id}
            className="border border-border bg-white p-5 text-center"
          >
            <FitDiagram kind={card.id} />
            <p className="mt-4 text-[15px] font-bold">{card.title}</p>
            <p className="mt-2 text-[13px] leading-snug text-muted">
              {card.description}
            </p>
          </li>
        ))}
      </ul>
      {tip && <GuideTipCallout title={tip.title} body={tip.body} />}
    </GuideSection>
  );
}

function FitDiagram({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 120 72"
      className="mx-auto h-16 w-auto text-foreground"
      aria-hidden
    >
      <rect
        x="18"
        y="22"
        width="84"
        height="28"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
      <ellipse
        cx="58"
        cy="36"
        rx={kind === "width" ? 28 : 22}
        ry={kind === "width" ? 14 : 11}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {kind === "length" && (
        <path
          d="M22 36 H98"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
      {kind === "heel" && (
        <path
          d="M28 28 Q18 36 28 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

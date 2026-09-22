import Link from "next/link";
import type { ScoreBreakdownItem } from "@/domain/editorial/types";
import { ReviewScoreCommerce, ReviewScoreFromPrice } from "@/components/review/ReviewCommerceCtas";

function formatScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function ReviewScorePanel({
  displayScore,
  scoreBandLabel,
  heroCriteria,
  productName,
}: {
  displayScore: number;
  scoreBandLabel: string;
  heroCriteria: ScoreBreakdownItem[];
  productName?: string;
}) {
  return (
    <aside className="rounded-lg bg-[#14181c] p-5 text-white sm:p-6">
      <div className="flex items-end gap-3">
        <span className="font-display text-[3.25rem] leading-none font-bold tabular-nums tracking-tight">
          {formatScore(displayScore)}
        </span>
        <div className="pb-1.5">
          <p className="text-[12px] font-bold tracking-[0.08em] text-accent uppercase">
            {scoreBandLabel}
          </p>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-white/55 uppercase">
            Kitletics Score
          </p>
        </div>
      </div>

      <ReviewScoreFromPrice />

      {heroCriteria.length > 0 && (
        <ul className="mt-6 space-y-3.5 border-t border-white/10 pt-5">
          {heroCriteria.map((item) => {
            const pct = Math.max(0, Math.min(100, item.score));
            return (
              <li key={item.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-medium text-white/80">
                    {item.label}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-white">
                    {formatScore(item.score)}
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ReviewScoreCommerce productName={productName} />
      <Link
        href="/methodology"
        className="mt-3 inline-block text-[12px] font-semibold tracking-wide text-white/55 uppercase transition-colors hover:text-accent"
      >
        How we score →
      </Link>
    </aside>
  );
}

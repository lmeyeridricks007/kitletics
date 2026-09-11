import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  score: number;
  /** Show /10 or /100 scale label */
  max?: 10 | 100;
  className?: string;
}

/** Editorial rating badge — score is 0–100 internally. */
export function RatingBadge({
  score,
  max = 10,
  className,
}: RatingBadgeProps) {
  const display = max === 10 ? (score / 10).toFixed(1) : Math.round(score);
  const tone =
    score >= 85 ? "success" : score >= 70 ? "accent" : score >= 50 ? "warning" : "muted";

  return (
    <Badge variant={tone} className={cn("tabular-nums", className)}>
      <Star className="size-3 fill-current" aria-hidden />
      {display}
      <span className="text-subtle">/{max}</span>
    </Badge>
  );
}

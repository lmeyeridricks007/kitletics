import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface RecommendationPillProps {
  label: string;
  className?: string;
}

/** Short editorial recommendation chip, e.g. "Best daily trainer". */
export function RecommendationPill({
  label,
  className,
}: RecommendationPillProps) {
  return (
    <Badge variant="accent" className={cn("rounded-full px-2.5", className)}>
      {label}
    </Badge>
  );
}

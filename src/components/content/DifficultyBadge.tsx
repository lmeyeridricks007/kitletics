import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

const labels: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const variants: Record<Difficulty, "success" | "accent" | "warning" | "danger"> = {
  beginner: "success",
  intermediate: "accent",
  advanced: "warning",
  expert: "danger",
};

interface DifficultyBadgeProps {
  level: Difficulty;
  className?: string;
}

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  return (
    <Badge variant={variants[level]} className={cn(className)}>
      {labels[level]}
    </Badge>
  );
}

import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceBadgeProps {
  amount: number;
  currency?: string;
  className?: string;
  /** Show "from" prefix for multi-offer ranges */
  from?: boolean;
}

export function PriceBadge({
  amount,
  currency = "USD",
  className,
  from = false,
}: PriceBadgeProps) {
  return (
    <Badge variant="default" className={cn("tabular-nums", className)}>
      {from && <span className="text-subtle">from</span>}
      {formatPrice(amount, currency)}
    </Badge>
  );
}

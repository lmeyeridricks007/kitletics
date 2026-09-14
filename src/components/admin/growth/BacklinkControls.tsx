import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";
import type { PriorityBand, RiskBand } from "@/domain/growth/backlinks/types";
import { actionOutreach, actionReview } from "@/app/admin/growth/backlinks/actions";

export function ScoreBadge({ score, band }: { score: number; band: PriorityBand }) {
  const variant =
    band === "MUST_PURSUE" || band === "HIGH"
      ? "success"
      : band === "MEDIUM"
        ? "warning"
        : "muted";
  return (
    <Badge variant={variant}>
      {score} · {band.replace("_", " ")}
    </Badge>
  );
}

export function RiskBadge({ risk }: { risk: RiskBand }) {
  return (
    <Badge
      variant={risk === "AVOID" ? "danger" : risk === "REVIEW" ? "warning" : "success"}
    >
      {risk}
    </Badge>
  );
}

export function ReviewButtons({ id }: { id: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(["APPROVED", "DEFERRED", "REJECTED"] as const).map((status) => (
        <form key={status} action={actionReview}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={status} />
          <Button type="submit" size="sm" variant={status === "APPROVED" ? "primary" : "outline"}>
            {status}
          </Button>
        </form>
      ))}
    </div>
  );
}

export function OutreachButtons({ id }: { id: string }) {
  const statuses = [
    "draft_ready",
    "contacted",
    "follow_up_due",
    "responded",
    "interested",
    "declined",
    "link_earned",
    "mention_earned",
    "no_response",
  ] as const;
  return (
    <form action={actionOutreach} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
        defaultValue="contacted"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary">
        Update outreach
      </Button>
    </form>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

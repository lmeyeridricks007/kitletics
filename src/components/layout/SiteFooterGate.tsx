"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hasMockupSportHub } from "@/lib/sport-hub/config";
import { hasMockupDisciplineHub } from "@/lib/discipline-hub/config";

/**
 * Skip global footer on mockup Sport/Discipline Hubs that render their own footer.
 * Footer is passed as a Server Component child so repositories stay out of the client graph.
 */
export function SiteFooterGate({ footer }: { footer: ReactNode }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const sportSlug = parts[0];
  const segment = parts[1];

  if (sportSlug && segment && hasMockupDisciplineHub(sportSlug, segment)) {
    return null;
  }
  if (sportSlug && hasMockupSportHub(sportSlug)) return null;
  return <>{footer}</>;
}

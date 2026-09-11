import { getSports, getDisciplines } from "@/repositories";
import { getLaunchEligibility } from "@/domain/launch";
const PROD = { isDev: false as const };
for (const s of getSports()) {
  const e = getLaunchEligibility({ kind: "sport", entity: s }, PROD);
  console.log(s.slug, e.disposition, "discs", getDisciplines().filter((d) => d.sportId === s.id).map((d) => d.slug));
}

import type { GearSetup } from "@/domain/editorial/types";
import { getProductById } from "@/repositories";

export interface GearSetupPublishResult {
  ok: boolean;
  reasons: string[];
}

function itemImportance(item: GearSetup["items"][number]) {
  if (item.importance) return item.importance;
  if (item.optional) return "optional" as const;
  return "required" as const;
}

/**
 * Publication gate for GearSetup entities.
 * Prefer failing publish over shipping an incomplete core kit.
 */
export function canPublishGearSetup(setup: GearSetup): GearSetupPublishResult {
  const reasons: string[] = [];

  if (!setup.title?.trim()) reasons.push("Missing title");
  if (!setup.description?.trim()) reasons.push("Missing description");
  if (!setup.sportId) reasons.push("Missing sportId");
  if (!setup.slug?.trim()) reasons.push("Missing slug");
  if (!setup.items?.length) reasons.push("No items");
  if (!setup.scenario?.trim() || setup.scenario.trim().length < 40) {
    reasons.push("Missing concrete scenario");
  }
  if ((setup.whyReasons?.length ?? 0) < 2) {
    reasons.push("Fewer than 2 whyReasons");
  }

  const productIds = new Set<string>();
  const roleKeys = new Set<string>();
  let systemExplained = 0;

  for (const item of setup.items ?? []) {
    if (!item.productId) {
      reasons.push("Item missing productId");
      continue;
    }
    if (productIds.has(item.productId)) {
      reasons.push(`Duplicate product ${item.productId}`);
    }
    productIds.add(item.productId);

    const roleKey = (item.roleLabel ?? item.role).toLowerCase().trim();
    const importance = itemImportance(item);
    if (
      (importance === "required" || importance === "recommended") &&
      roleKeys.has(roleKey)
    ) {
      reasons.push(`Duplicate core role ${roleKey}`);
    }
    if (importance === "required" || importance === "recommended") {
      roleKeys.add(roleKey);
    }

    const product = getProductById(item.productId);
    if (!product) {
      reasons.push(`Unknown product ${item.productId}`);
    } else if (product.status !== "published") {
      reasons.push(`Unpublished product ${item.productId}`);
    }

    if (importance === "required" && !item.rationale && !item.notes) {
      reasons.push(`Required item ${item.productId} missing rationale`);
    }

    if (
      item.whyNeeded &&
      item.systemRole &&
      item.tradeOffs &&
      (item.canOmit || importance === "required")
    ) {
      systemExplained += 1;
    }
  }

  const coreCount = (setup.items ?? []).filter((i) => {
    const imp = itemImportance(i);
    return imp === "required" || imp === "recommended";
  }).length;

  if (coreCount < 2) {
    reasons.push("Fewer than 2 required/recommended roles");
  }

  if (systemExplained < Math.min(2, coreCount)) {
    reasons.push("Core items missing system explanation fields");
  }

  return { ok: reasons.length === 0, reasons };
}

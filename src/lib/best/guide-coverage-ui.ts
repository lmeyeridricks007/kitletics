import type { ConsideredProductNote } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";

export type GuideCandidateStatus =
  | "considered"
  | "shortlisted"
  | "recommended"
  | "rejected";

export interface GuideCandidateEvaluation {
  productId: string;
  product?: Product;
  eligible: boolean;
  recommendationScore?: number;
  contextScore?: number;
  status: GuideCandidateStatus;
  /** @deprecated Prefer publicReason — kept for legacy notes */
  rejectionReason?: string;
  /** Consumer-facing why this product is not a main pick (or role for recommended) */
  publicReason?: string;
  stillConsiderIf?: string;
  closestRecommendedProductId?: string;
  reasonCode?: ConsideredProductNote["reasonCode"];
  isPreviousGeneration?: boolean;
}

/** Consumer-safe status label — never “rejected / failed / eliminated” */
export function guideCandidateStatusLabel(
  status: GuideCandidateStatus,
): string {
  switch (status) {
    case "recommended":
      return "Recommended";
    case "shortlisted":
      return "Shortlisted";
    case "rejected":
    case "considered":
    default:
      return "Also evaluated";
  }
}

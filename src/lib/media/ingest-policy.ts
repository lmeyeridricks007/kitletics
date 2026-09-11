import policyJson from "./ingest-policy.json";

export const MEDIA_INGEST_POLICY = policyJson;

export type MediaIngestRole = "hero" | "gallery" | "section" | "other";

export type MediaIngestLevel = "ok" | "warn" | "error";

export interface MediaIngestInput {
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  hasAlpha?: boolean;
  role?: MediaIngestRole;
  /** Relative or absolute path intended under public/images */
  path?: string;
}

export interface MediaIngestAssessment {
  level: MediaIngestLevel;
  reasons: string[];
  maxEdgePx: number;
}

function maxEdge(width?: number, height?: number): number | undefined {
  if (width == null && height == null) return undefined;
  return Math.max(width ?? 0, height ?? 0);
}

function roleMaxEdge(role: MediaIngestRole = "hero"): number {
  if (role === "gallery") return MEDIA_INGEST_POLICY.galleryMaxEdgePx;
  if (role === "section") {
    return (
      (MEDIA_INGEST_POLICY as { sectionMaxEdgePx?: number }).sectionMaxEdgePx ??
      MEDIA_INGEST_POLICY.galleryMaxEdgePx
    );
  }
  return MEDIA_INGEST_POLICY.heroMaxEdgePx;
}

/**
 * Fix 86 — reject backup / QA / wrong-brand path names before they enter public/.
 * ERROR = do not write under public/images (relocate to data/qa or data/media-orphans).
 */
export function assessPublicMediaPath(path: string): MediaIngestAssessment {
  const reasons: string[] = [];
  const normalized = path.replace(/\\/g, "/");
  const base = normalized.split("/").pop() ?? normalized;

  for (const sub of MEDIA_INGEST_POLICY.forbiddenPathSubstrings ?? []) {
    if (normalized.includes(sub)) {
      reasons.push(`forbidden path fragment "${sub}" — not allowed under public/images`);
    }
  }
  for (const pat of MEDIA_INGEST_POLICY.forbiddenBasenamePatterns ?? []) {
    if (new RegExp(pat, "i").test(base)) {
      reasons.push(`forbidden basename pattern /${pat}/i`);
    }
  }

  // Flat slug-topic.png beside a sections/ tree is clutter once sections exist.
  if (
    /\/products\/[a-z0-9-]+-(overview|specs|fit|cushioning|ride|stability|upper|grip|durability|strengths|tradeoffs|performance|assessment|usecase|value|tech)\.(png|jpe?g|webp)$/i.test(
      normalized,
    )
  ) {
    reasons.push(
      "flat product topic file — use products/<slug>/sections/<topic>.* instead",
    );
  }

  const unique = [...new Set(reasons)];
  return {
    level: unique.length ? "error" : "ok",
    reasons: unique,
    maxEdgePx: MEDIA_INGEST_POLICY.heroMaxEdgePx,
  };
}

/**
 * Flag oversized masters before they enter `public/`.
 * WARN = review / run writeWebMaster. ERROR = do not copy the source as-is.
 * Never rejects a licensed product photo — humans still approve the asset.
 */
export function assessMediaIngest(
  input: MediaIngestInput,
): MediaIngestAssessment {
  const reasons: string[] = [];
  const role = input.role ?? "hero";
  const allowedEdge = roleMaxEdge(role);
  const edge = maxEdge(input.width, input.height);
  const format = (input.format ?? "").toLowerCase().replace("jpeg", "jpg");

  if (input.path) {
    const pathAssess = assessPublicMediaPath(input.path);
    reasons.push(...pathAssess.reasons);
  }

  if (input.bytes != null && input.bytes > MEDIA_INGEST_POLICY.errorBytes) {
    reasons.push(
      `source ${Math.round(input.bytes / 1024)}KB exceeds error threshold ${MEDIA_INGEST_POLICY.errorBytes / 1024 / 1024}MB`,
    );
  }
  if (edge != null && edge > MEDIA_INGEST_POLICY.errorMaxEdgePx) {
    reasons.push(
      `${edge}px edge exceeds ${MEDIA_INGEST_POLICY.errorMaxEdgePx}px error cap`,
    );
  }

  const hardError =
    reasons.some((r) => r.includes("forbidden") || r.includes("flat product")) ||
    (input.bytes != null && input.bytes > MEDIA_INGEST_POLICY.errorBytes) ||
    (edge != null && edge > MEDIA_INGEST_POLICY.errorMaxEdgePx);

  if (input.bytes != null && input.bytes > MEDIA_INGEST_POLICY.warnBytes) {
    reasons.push(
      `source ${Math.round(input.bytes / 1024)}KB exceeds ${MEDIA_INGEST_POLICY.warnBytes / 1024 / 1024}MB warn threshold`,
    );
  }
  if (edge != null && edge > allowedEdge) {
    reasons.push(
      `${edge}px edge exceeds ${role} web-master max ${allowedEdge}px`,
    );
  }
  if (format === "png" && input.hasAlpha === false) {
    reasons.push("opaque PNG — prefer JPEG web master for photography");
  }
  if (format === "png" && input.hasAlpha === true) {
    reasons.push(
      "PNG with alpha — keep only if the layout needs transparency; else flatten to JPEG",
    );
  }
  if (
    role === "section" &&
    format === "png" &&
    input.hasAlpha === false &&
    input.bytes != null &&
    input.bytes > MEDIA_INGEST_POLICY.warnBytes
  ) {
    reasons.push(
      "oversized opaque review-section PNG — generate JPEG web master unless diagram/alpha is required",
    );
  }

  const unique = [...new Set(reasons)];
  let level: MediaIngestLevel = "ok";
  if (hardError || unique.some((r) => r.includes("forbidden") || r.includes("flat product") || r.includes("error threshold") || r.includes("error cap"))) {
    level = "error";
  } else if (unique.length > 0) {
    level = "warn";
  }

  return { level, reasons: unique, maxEdgePx: allowedEdge };
}

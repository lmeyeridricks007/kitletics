import { randomUUID } from "node:crypto";
import type { Brand, Product, ProductFamily } from "@/domain/products/types";
import type {
  CommercialCandidateDraft,
  ConfidenceLevel,
  ContentImpactItem,
  DiscoveryCandidate,
  EditorialOpportunityDraft,
  OnboardingMode,
  OnboardingQuality,
  OnboardingSessionStatus,
  ProductOnboardingSession,
  ProductIdentityCandidate,
  RecommendationCandidateDraft,
  RelationshipCandidateDraft,
  ResearchFinding,
  ResearchProvider,
  ResearchSource,
  SourceConflict,
  StagedEvidenceDraft,
  StagedMediaDraft,
  StagedProductDraft,
} from "@/domain/onboarding/types";
import {
  ONBOARDING_AGENT_VERSION,
  ONBOARDING_PROMPT_VERSION,
} from "@/domain/onboarding/types";
import {
  findExistingProductCandidate,
  proposeProductId,
  resolveBrand,
  slugifyProduct,
} from "@/domain/onboarding/identity";
import {
  detectSpecOutlier,
  normalizeFindingValue,
} from "@/domain/onboarding/normalize";
import { getProductResearchConfig } from "@/domain/onboarding/research-config";
import { validateResearchProviderResult } from "@/domain/onboarding/schemas";
import { canPublishProduct } from "@/domain/catalog/publishability";
import { saveSession } from "@/domain/onboarding/staging";
import { assessProductReviewLifecycle } from "@/domain/review-agent/lifecycle";
import { computeReviewPriority } from "@/domain/review-agent/priority";
import {
  saveReviewAgentSession,
  ensureReviewStagingDirs,
} from "@/domain/review-agent/staging";
import type { ReviewAgentSession } from "@/domain/review-agent/types";
import { PRODUCT_REVIEW_AGENT_VERSION } from "@/domain/review-agent/types";
import type { SpecValue } from "@/domain/products/types";
import type { Evidence } from "@/domain/recommendations/types";
import { assessMediaIngest } from "@/lib/media/ingest-policy";

function nowIso(): string {
  return new Date().toISOString();
}

function nid(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

function emptyQuality(): OnboardingQuality {
  return {
    identity: "low",
    specsVerified: 0,
    specsUnknown: 0,
    specsConflicting: 0,
    evidenceCount: 0,
    mediaAccepted: 0,
    mediaFlagged: 0,
    recommendationCandidates: 0,
    relationshipCandidates: 0,
    commercialCandidates: 0,
    blockers: [],
    reviewReasons: [],
  };
}

function log(
  session: ProductOnboardingSession,
  stage: string,
  message: string,
  level: "info" | "warn" | "error" = "info",
): void {
  session.logs.push({ at: nowIso(), stage, level, message });
  session.updatedAt = nowIso();
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "invalid";
  }
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export interface OrchestratorCatalog {
  products: Product[];
  brands: Brand[];
  families: ProductFamily[];
}

export interface OnboardExplicitInput {
  brand: string;
  model: string;
  category?: string;
  sport?: string;
  dryRun?: boolean;
  publish?: boolean;
  provider: ResearchProvider;
}

export interface DiscoverBrandInput {
  brand: string;
  sport?: string;
  category?: string;
  dryRun?: boolean;
  limit?: number;
  knownLineup: DiscoveryCandidate[];
}

export interface RefreshProductInput {
  productId: string;
  dryRun?: boolean;
  provider: ResearchProvider;
}

function createSession(
  mode: OnboardingMode,
  opts: {
    brand?: string;
    model?: string;
    sport?: string;
    category?: string;
    productId?: string;
    dryRun?: boolean;
    limit?: number;
  },
): ProductOnboardingSession {
  const createdAt = nowIso();
  return {
    id: nid("onb"),
    mode,
    agentVersion: ONBOARDING_AGENT_VERSION,
    promptVersion: ONBOARDING_PROMPT_VERSION,
    requestedBrand: opts.brand,
    requestedModel: opts.model,
    requestedSport: opts.sport,
    requestedCategory: opts.category,
    requestedProductId: opts.productId,
    dryRun: Boolean(opts.dryRun),
    limit: opts.limit,
    sources: [],
    findings: [],
    conflicts: [],
    evidence: [],
    media: [],
    recommendations: [],
    relationships: [],
    commercial: [],
    editorialOpportunities: [],
    specDefinitionCandidates: [],
    contentImpact: [],
    quality: emptyQuality(),
    status: "created",
    logs: [],
    createdAt,
    updatedAt: createdAt,
  };
}

function deriveStatus(session: ProductOnboardingSession): OnboardingSessionStatus {
  if (
    session.status === "approved" ||
    session.status === "published" ||
    session.status === "rejected"
  ) {
    return session.status;
  }
  if (session.quality.blockers.length) return "blocked";
  if (session.conflicts.some((c) => c.status === "open")) return "needs-review";
  if (session.quality.reviewReasons.length) return "needs-review";
  if (session.identity?.kind === "ambiguous") return "needs-review";
  if (session.candidateProduct) return "ready";
  if (session.discoveryCandidates?.length) return "ready";
  return "needs-review";
}

function persist(session: ProductOnboardingSession): ProductOnboardingSession {
  session.status = deriveStatus(session);
  session.updatedAt = nowIso();
  if (!session.dryRun) saveSession(session);
  return session;
}

/**
 * MODE A — Explicit Product onboarding.
 * Default ends at READY FOR REVIEW (no auto-publish).
 */
export async function onboardExplicitProduct(
  input: OnboardExplicitInput,
  catalog: OrchestratorCatalog,
): Promise<ProductOnboardingSession> {
  const session = createSession("explicit", {
    brand: input.brand,
    model: input.model,
    category: input.category,
    sport: input.sport,
    dryRun: input.dryRun,
  });
  session.status = "researching";
  log(session, "orchestrator", "Starting explicit Product onboarding");

  const categoryKey = input.category ?? "running-shoes";
  const config = getProductResearchConfig(categoryKey);
  if (!config) {
    session.quality.blockers.push(`Unknown category config: ${categoryKey}`);
    log(session, "identity", `No research config for ${categoryKey}`, "error");
    return persist(session);
  }

  // Identity
  const brand = resolveBrand(catalog.brands, input.brand);
  if (!brand) {
    session.quality.blockers.push(`Unknown brand: ${input.brand}`);
    log(session, "identity", "Brand not in catalog", "error");
    return persist(session);
  }

  const familyGuess = catalog.families.find(
    (f) =>
      f.brandId === brand.id &&
      input.model.toLowerCase().includes(f.name.toLowerCase()),
  );
  const generationMatch = input.model.match(/(?:^|\s)(\d+)(?:\s|$)/);
  const generation = generationMatch?.[1];

  const identityCandidate: ProductIdentityCandidate = {
    brandName: brand.name,
    brandId: brand.id,
    modelName: input.model,
    fullName: `${brand.name} ${input.model}`,
    familyName: familyGuess?.name,
    familyId: familyGuess?.id,
    generation,
    categoryId: config.categoryId,
    categorySlug: config.categorySlug,
    sportId: config.sportId,
    aliases: [
      input.model,
      `${brand.name} ${input.model}`,
      input.model.replace(/\s+/g, ""),
    ],
  };

  const identity = findExistingProductCandidate(
    catalog.products,
    catalog.brands,
    catalog.families,
    identityCandidate,
  );
  session.identity = identity;
  session.quality.identity = identity.confidence;
  log(
    session,
    "identity",
    `Resolved identity: ${identity.kind} (${identity.reasons.join("; ")})`,
  );

  if (identity.kind === "exact" || identity.kind === "probable") {
    session.quality.reviewReasons.push(
      `Existing Product ${identity.existingProductId} — refresh/delta instead of duplicate`,
    );
  }
  if (identity.kind === "ambiguous") {
    session.quality.blockers.push("Ambiguous Product identity");
    return persist(session);
  }

  // Research via provider (mocked in tests; never invents facts)
  log(session, "research", `Invoking provider ${input.provider.id}`);
  let rawResult;
  try {
    rawResult = await input.provider.research({
      brand: brand.name,
      model: input.model,
      categorySlug: config.categorySlug,
      officialUrl: identity.candidate.officialUrl,
    });
  } catch (err) {
    session.quality.blockers.push(`Research provider failed: ${String(err)}`);
    log(session, "research", String(err), "error");
    return persist(session);
  }

  const validated = validateResearchProviderResult(rawResult);
  if (!validated.success) {
    session.quality.blockers.push("Research provider returned invalid schema");
    log(session, "research", validated.error.message, "error");
    return persist(session);
  }
  const research = validated.data;

  // Prompt-injection / URL safety: treat page content as data only
  for (const src of research.sources) {
    if (!isSafeHttpUrl(src.url)) {
      log(session, "research", `Rejected unsafe URL ${src.url}`, "warn");
      continue;
    }
    const source: ResearchSource = {
      id: nid("src"),
      url: src.url,
      domain: src.domain || domainFromUrl(src.url),
      sourceType: src.sourceType,
      title: src.title,
      publisher: src.publisher,
      publishedAt: src.publishedAt,
      retrievedAt: src.retrievedAt,
      authorityLevel: src.authorityLevel,
      productIds: [],
      status: src.authorityLevel === "untrusted" ? "rejected" : "active",
    };
    session.sources.push(source);
  }

  const sourceByUrl = new Map(
    session.sources.map((s) => [s.url, s] as const),
  );

  // Findings + conflicts
  const byField = new Map<string, ResearchFinding[]>();
  for (const fact of research.facts) {
    const source = sourceByUrl.get(fact.sourceUrl);
    if (!source || source.status === "rejected") continue;

    const normalized = normalizeFindingValue(
      fact.field,
      fact.rawValue,
      fact.unit,
    );
    if (
      normalized !== undefined &&
      typeof normalized === "number"
    ) {
      const outlier = detectSpecOutlier(fact.field, normalized, config);
      if (outlier) {
        session.quality.reviewReasons.push(`Outlier: ${outlier}`);
        log(session, "validate", outlier, "warn");
      }
    }

    // Spec key must exist in category schema or become a definition candidate
    const knownKeys = new Set([
      ...config.requiredSpecs,
      ...config.importantSpecs,
      ...config.optionalSpecs,
      "lifecycle",
      "releaseDate",
      "shortDescription",
      "verdict",
    ]);
    if (!knownKeys.has(fact.field) && !fact.field.startsWith("identity.")) {
      session.specDefinitionCandidates.push({
        id: nid("specdef"),
        categoryId: config.categoryId,
        proposedKey: fact.field,
        label: fact.field,
        rationale: "Research returned unregistered field",
        exampleValues: [String(fact.rawValue)],
        status: "needs-review",
      });
      continue;
    }

    const finding: ResearchFinding = {
      id: nid("find"),
      onboardingSessionId: session.id,
      field: fact.field,
      rawValue: fact.rawValue,
      normalizedValue: normalized,
      unit: fact.unit,
      sourceId: source.id,
      confidence: fact.confidence,
      context: fact.context,
      notes: fact.notes,
      status: "candidate",
    };
    session.findings.push(finding);
    const list = byField.get(fact.field) ?? [];
    list.push(finding);
    byField.set(fact.field, list);
  }

  for (const [field, findings] of byField) {
    const unique = new Map<string, ResearchFinding>();
    for (const f of findings) {
      unique.set(JSON.stringify(f.normalizedValue), f);
    }
    if (unique.size > 1) {
      const conflict: SourceConflict = {
        id: nid("conf"),
        onboardingSessionId: session.id,
        field,
        values: [...unique.values()].map((f) => ({
          value: f.normalizedValue ?? null,
          sourceId: f.sourceId,
          context: f.context,
        })),
        contextDifference: findings.some((f) => f.context)
          ? "Contexts differ — do not average"
          : undefined,
        recommendedResolution:
          "Prefer exact-context manufacturer specification; do not average",
        status: "open",
      };
      session.conflicts.push(conflict);
      for (const f of findings) f.status = "conflicting";
      session.quality.specsConflicting += 1;
    } else {
      for (const f of findings) {
        f.status =
          f.confidence === "high" || f.confidence === "medium"
            ? "verified"
            : "candidate";
        if (f.status === "verified") session.quality.specsVerified += 1;
      }
    }
  }

  // Build staged Product draft (never auto-published)
  const slugBrand = brand.slug;
  const productId =
    identity.kind === "new"
      ? proposeProductId(slugBrand, input.model)
      : identity.existingProductId!;
  const slug =
    identity.kind === "new"
      ? slugifyProduct(slugBrand, input.model)
      : identity.existingSlug!;

  const specs: Record<string, SpecValue> = {};
  for (const f of session.findings) {
    if (f.status !== "verified" || f.normalizedValue === undefined) continue;
    if (
      config.requiredSpecs.includes(f.field) ||
      config.importantSpecs.includes(f.field) ||
      config.optionalSpecs.includes(f.field)
    ) {
      specs[f.field] = f.normalizedValue;
    }
  }

  for (const key of config.requiredSpecs) {
    if (specs[key] === undefined || specs[key] === null) {
      session.quality.specsUnknown += 1;
    }
  }

  const shortFromResearch = session.findings.find(
    (f) => f.field === "shortDescription" && f.status === "verified",
  );

  const draft: StagedProductDraft = {
    id: productId,
    slug,
    brandId: brand.id,
    familyId: identity.candidate.familyId ?? familyGuess?.id,
    generation:
      research.identityHints?.generation ??
      identity.candidate.generation ??
      generation,
    name: input.model,
    fullName: `${brand.name} ${input.model}`,
    shortDescription:
      (typeof shortFromResearch?.normalizedValue === "string"
        ? shortFromResearch.normalizedValue
        : undefined) ??
      `${brand.name} ${input.model} — staged from research; summary pending editorial polish.`,
    lifecycleStatus:
      identity.candidate.lifecycleHint ??
      research.identityHints?.lifecycleHint ??
      "current",
    sportIds: [config.sportId],
    disciplineIds: [],
    categoryId: config.categoryId,
    subcategoryIds: [],
    useCaseIds: [],
    specifications: specs,
    strengths: [],
    weaknesses: [],
    experienceLevels: [],
    evidenceIds: [],
    aliases: identity.candidate.aliases,
    officialUrl: research.identityHints?.officialUrl,
    status: "needs-review",
  };
  session.candidateProduct = draft;

  // Evidence (never personal-test from automation)
  for (const src of session.sources.filter((s) => s.status === "active")) {
    const ev: StagedEvidenceDraft = {
      id: nid("ev"),
      type:
        src.sourceType === "manufacturer" ||
        src.sourceType === "manufacturer-documentation"
          ? "manufacturer"
          : src.sourceType === "lab"
            ? "lab-test"
            : src.sourceType === "independent-review"
              ? "independent-review"
              : src.sourceType === "retailer"
                ? "retailer"
                : "editorial-research",
      title: src.title ?? `Source ${src.domain}`,
      summary: `Staged evidence from ${src.domain} (${src.authorityLevel})`,
      sourceUrl: src.url,
      sourceId: src.id,
      productId: draft.id,
      confidence:
        src.authorityLevel === "primary"
          ? "high"
          : src.authorityLevel === "secondary"
            ? "medium"
            : "low",
      status: "candidate",
    };
    if (ev.type === "personal-test") {
      // Impossible path — guard anyway
      continue;
    }
    session.evidence.push(ev);
    draft.evidenceIds.push(ev.id);
  }
  session.quality.evidenceCount = session.evidence.length;

  // Media — reject AI / wrong generation / unsafe URLs
  for (const m of research.media) {
    const media: StagedMediaDraft = {
      id: nid("media"),
      productId: draft.id,
      src: m.src,
      alt: m.alt,
      sourceUrl: m.sourceUrl,
      usageType: m.usageType,
      width: m.width,
      height: m.height,
      verifiedAt: nowIso(),
      status: "candidate",
    };
    const expectedGeneration =
      draft.generation ?? research.identityHints?.generation;
    if (m.src.startsWith("data:") || m.src.includes("ai-generated")) {
      media.status = "rejected";
      media.rejectionReason = "AI-generated or unsafe media rejected";
      session.quality.mediaFlagged += 1;
    } else if (
      m.generationHint &&
      expectedGeneration &&
      m.generationHint !== expectedGeneration
    ) {
      media.status = "rejected";
      media.rejectionReason = `Wrong generation hint ${m.generationHint} ≠ ${expectedGeneration}`;
      session.quality.mediaFlagged += 1;
    } else if (
      m.sourceUrl &&
      !isSafeHttpUrl(m.sourceUrl) &&
      !m.src.startsWith("/")
    ) {
      media.status = "rejected";
      media.rejectionReason = "Unsafe media URL";
      session.quality.mediaFlagged += 1;
    } else {
      media.status = "needs-review";
      session.quality.mediaAccepted += 1;
      const ingest = assessMediaIngest({
        width: m.width,
        height: m.height,
        role: m.usageType === "hero" ? "hero" : "gallery",
      });
      media.ingestLevel = ingest.level;
      media.ingestReasons = ingest.reasons;
      if (ingest.level === "error") {
        session.quality.mediaFlagged += 1;
        session.quality.reviewReasons.push(
          `Media ingest ERROR (${m.usageType}): ${ingest.reasons.join("; ")} — write a web master before copying into public/`,
        );
      } else if (ingest.level === "warn") {
        session.quality.reviewReasons.push(
          `Media ingest WARN (${m.usageType}): ${ingest.reasons.join("; ")}`,
        );
      }
    }
    session.media.push(media);
  }
  if (session.quality.mediaAccepted === 0) {
    session.quality.reviewReasons.push(
      "No accepted Product media — use Kitletics image-unavailable fallback until licensed asset approved",
    );
  }

  // Recommendation candidates — only where enough evidence; no free-floating scores
  for (const useCaseId of config.recommendationContexts.slice(0, 4)) {
    const limitedEvidence = session.evidence.length < 2;
    const rec: RecommendationCandidateDraft = {
      id: nid("rec"),
      productId: draft.id,
      useCaseId,
      confidence: limitedEvidence ? "low" : "medium",
      explanation: limitedEvidence
        ? "Limited independent evidence — suitability candidate only"
        : "Structured candidate from verified specs + evidence; awaiting editorial factor scoring",
      strengths: [],
      compromises: [],
      evidenceIds: draft.evidenceIds.slice(0, 2),
      status: "needs-review",
      outlierFlags: [],
    };
    // Never assign a score without engine — leave undefined
    session.recommendations.push(rec);
  }
  session.quality.recommendationCandidates = session.recommendations.length;

  // Relationships — generation / competitors only when decision-relevant
  if (familyGuess && draft.generation) {
    const previous = catalog.products.find(
      (p) =>
        p.familyId === familyGuess.id &&
        p.generation &&
        String(Number(p.generation)) === String(Number(draft.generation) - 1),
    );
    if (previous) {
      const rel: RelationshipCandidateDraft = {
        id: nid("rel"),
        sourceProductId: draft.id,
        targetProductId: previous.id,
        type: "previous-generation",
        reason: "Same family, prior generation",
        priority: "HIGH",
        status: "candidate",
      };
      session.relationships.push(rel);
      session.contentImpact.push({
        contentId: `compare-${draft.slug}-vs-${previous.slug}`,
        contentType: "comparison-candidate",
        reason: "New generation vs previous generation",
        severity: "HIGH",
        suggestedAction: "Create ComparisonCandidate for editorial review — do not auto-publish",
      });
      session.editorialOpportunities.push({
        id: nid("ed"),
        kind: "comparison",
        productIds: [draft.id, previous.id],
        title: `${draft.fullName} vs ${previous.fullName}`,
        reason: "Generation change",
        priority: "HIGH",
        suggestedAction: "Draft generation comparison after Product approval",
        status: "candidate",
      });
      session.contentImpact.push({
        contentId: "best-guides-affected",
        contentType: "best-guide-review",
        reason: "New generation may affect Best Guide winners",
        severity: "HIGH",
        suggestedAction: "Flag GuideReviewCandidate — never auto-replace winners",
      });
    }
  }

  // Commercial stubs — never invent affiliate URLs
  const commercial: CommercialCandidateDraft = {
    id: nid("com"),
    productId: draft.id,
    retailerName: "Manufacturer (research)",
    region: "NL",
    url: research.identityHints?.officialUrl ?? brand.homepage ?? "https://example.invalid",
    status: "candidate",
  };
  if (isSafeHttpUrl(commercial.url)) {
    session.commercial.push(commercial);
    session.quality.commercialCandidates = 1;
  }

  // Soft publishability preview (staged, not published)
  const previewProduct = {
    ...draft,
    images: session.media
      .filter((m) => m.status !== "rejected")
      .map((m) => ({
        id: m.id,
        src: m.src,
        alt: m.alt,
        type: "image" as const,
        usageType: m.usageType === "other" ? "other" : m.usageType,
      })),
    videos: [],
    offerIds: [],
    relatedProductIds: [],
    alternativeProductIds: [],
    status: "draft" as const,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
  const gate = canPublishProduct(previewProduct as unknown as Product);
  if (!gate.ok) {
    session.quality.reviewReasons.push(
      `Publishability preview: ${gate.reasons.join("; ")}`,
    );
  }

  // --- Review readiness assessment (does not always block Product publish) ---
  log(session, "review-readiness", "Assessing Product Review readiness");
  const priority = computeReviewPriority(previewProduct as unknown as Product, {
    inBestGuide: false,
    inComparison: false,
    inGearSetup: false,
    featuredOnHub: false,
    finderCandidate: false,
    majorFamily: Boolean(draft.familyId),
  });
  const stagedEvidenceAsEvidence: Evidence[] = session.evidence.map((e) => ({
    id: e.id,
    type: (e.type || "editorial-research") as Evidence["type"],
    source: e.title || "Onboarding research source",
    sourceUrl: e.sourceUrl,
    summary: e.summary,
    verifiedAt: nowIso(),
    confidence: e.confidence,
  }));
  const reviewAssessment = assessProductReviewLifecycle({
    product: previewProduct as unknown as Product,
    brand,
    review: null,
    evidence: stagedEvidenceAsEvidence,
    recommendations: [],
    priority,
    alternativeProductIds: session.relationships.map((r) => r.targetProductId),
    sessionId: session.id,
  });
  session.quality.reviewCoverage = reviewAssessment.coverage;
  session.quality.reviewReadinessScore = reviewAssessment.readiness.score;
  session.quality.reviewAction = reviewAssessment.action;
  session.quality.reviewRequiredForPublish =
    reviewAssessment.reviewRequiredForPublish;
  session.quality.reviewReasons.push(
    `Review: coverage=${reviewAssessment.coverage}; action=${reviewAssessment.action}; readiness=${reviewAssessment.readiness.score}`,
  );
  if (reviewAssessment.editorialOpportunity) {
    session.editorialOpportunities.push(reviewAssessment.editorialOpportunity);
  }
  session.contentImpact.push(...reviewAssessment.contentImpact);

  if (
    reviewAssessment.action === "stage-review" &&
    reviewAssessment.stagedDraft &&
    !session.dryRun
  ) {
    ensureReviewStagingDirs();
    const now = nowIso();
    const praSession: ReviewAgentSession = {
      id: `pra-onb-${session.id.slice(-8)}`,
      mode: "generate",
      dryRun: false,
      status: "needs-review",
      filters: { productSlug: draft.slug },
      createdAt: now,
      updatedAt: now,
      report: {
        mode: "generate",
        dryRun: false,
        agentVersion: PRODUCT_REVIEW_AGENT_VERSION,
        startedAt: now,
        finishedAt: now,
        scanned: 1,
        byCoverage: {
          complete: 0,
          "needs-refresh": 0,
          "needs-research": 0,
          "needs-editorial-review": 1,
          blocked: 0,
          "not-required": 0,
        },
        byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, [priority]: 1 } as Record<
          "P0" | "P1" | "P2" | "P3",
          number
        >,
        byReviewType: { "expert-research": 1 },
        created: 1,
        refreshed: 0,
        repaired: 0,
        needsResearch: 0,
        needsEditorialReview: 1,
        blocked: 0,
        notRequired: 0,
        failures: [],
        rows: [],
        stagedReviewIds: [reviewAssessment.stagedDraft.id],
      },
      stagedReviews: [reviewAssessment.stagedDraft],
      logs: [
        {
          at: now,
          stage: "onboarding",
          level: "info",
          message: `Staged Review from onboarding session ${session.id}`,
          productId: draft.id,
        },
      ],
    };
    // Fix priority counts
    praSession.report.byPriority = { P0: 0, P1: 0, P2: 0, P3: 0 };
    praSession.report.byPriority[priority] = 1;
    saveReviewAgentSession(praSession);
    log(
      session,
      "product-review",
      `Staged Expert Research Review ${reviewAssessment.stagedDraft.id} → needs-review`,
    );
  } else if (reviewAssessment.action === "research-task") {
    log(
      session,
      "product-review",
      "Review research task created — insufficient evidence for Expert Research",
      "warn",
    );
  }

  if (
    reviewAssessment.reviewRequiredForPublish &&
    reviewAssessment.action !== "stage-review" &&
    reviewAssessment.action !== "none"
  ) {
    session.quality.reviewReasons.push(
      "P0/P1 policy: Review readiness incomplete — Product may still publish per category policy, but must not be strategically featured until Review is ready",
    );
  }

  if (input.publish) {
    session.quality.blockers.push(
      "Auto-publish refused by policy — use product:publish after human approval",
    );
  }

  log(session, "orchestrator", "Explicit onboarding complete — awaiting review");
  return persist(session);
}

/** MODE B — Brand catalog discovery (no auto Product creation) */
export function discoverBrandCatalog(
  input: DiscoverBrandInput,
  catalog: OrchestratorCatalog,
): ProductOnboardingSession {
  const session = createSession("brand-discovery", {
    brand: input.brand,
    sport: input.sport,
    category: input.category,
    dryRun: input.dryRun,
    limit: input.limit,
  });
  log(session, "discovery", `Brand discovery for ${input.brand}`);

  const brand = resolveBrand(catalog.brands, input.brand);
  if (!brand) {
    session.quality.blockers.push(`Unknown brand: ${input.brand}`);
    return persist(session);
  }

  const limit = input.limit ?? 20;
  const results: DiscoveryCandidate[] = [];

  for (const item of input.knownLineup.slice(0, limit)) {
    const identity = findExistingProductCandidate(
      catalog.products,
      catalog.brands,
      catalog.families,
      {
        brandName: brand.name,
        brandId: brand.id,
        modelName: item.modelName,
        fullName: item.fullName,
        familyName: item.familyName,
        generation: item.generation,
        categorySlug: item.categorySlug,
        aliases: [item.modelName, item.fullName],
        officialUrl: item.officialUrl,
      },
    );

    if (identity.kind === "exact" || identity.kind === "probable") {
      results.push({
        ...item,
        brandName: brand.name,
        kind: "existing",
        existingProductId: identity.existingProductId,
        priority: "LOW",
        reason: `Already in catalog as ${identity.existingSlug}`,
      });
    } else if (identity.kind === "ambiguous") {
      results.push({
        ...item,
        brandName: brand.name,
        kind: "ambiguous",
        priority: "MEDIUM",
        reason: identity.reasons.join("; "),
      });
    } else {
      const isNewGen =
        item.familyName &&
        catalog.families.some(
          (f) =>
            f.brandId === brand.id &&
            f.name.toLowerCase() === item.familyName!.toLowerCase(),
        );
      results.push({
        ...item,
        brandName: brand.name,
        kind: isNewGen ? "new-generation" : "new",
        priority: item.priority,
        reason: item.reason,
      });
    }
  }

  session.discoveryCandidates = results;
  session.quality.identity = "high";
  log(
    session,
    "discovery",
    `Found ${results.filter((r) => r.kind !== "existing").length} actionable candidates`,
  );
  return persist(session);
}

/** MODE C helper — market gap ranking from supplied candidates */
export function discoverMarketGaps(
  candidates: DiscoveryCandidate[],
  catalog: OrchestratorCatalog,
  opts?: { dryRun?: boolean; limit?: number; category?: string },
): ProductOnboardingSession {
  const session = createSession("market-discovery", {
    category: opts?.category,
    dryRun: opts?.dryRun,
    limit: opts?.limit,
  });
  log(session, "discovery", "Market gap discovery");

  const ranked = [...candidates]
    .map((c) => {
      const identity = findExistingProductCandidate(
        catalog.products,
        catalog.brands,
        catalog.families,
        {
          brandName: c.brandName,
          modelName: c.modelName,
          fullName: c.fullName,
          familyName: c.familyName,
          generation: c.generation,
          categorySlug: c.categorySlug,
          aliases: [c.modelName],
        },
      );
      if (identity.kind === "exact" || identity.kind === "probable") {
        return {
          ...c,
          kind: "existing" as const,
          existingProductId: identity.existingProductId,
          priority: "LOW" as const,
          reason: "Already catalogued",
        };
      }
      return c;
    })
    .filter((c) => c.kind !== "existing")
    .sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, opts?.limit ?? 20);

  session.discoveryCandidates = ranked;
  return persist(session);
}

/** Refresh existing Product — delta only, no silent overwrite of verified facts */
export async function refreshProduct(
  input: RefreshProductInput,
  catalog: OrchestratorCatalog,
): Promise<ProductOnboardingSession> {
  const existing = catalog.products.find((p) => p.id === input.productId);
  const session = createSession("refresh", {
    productId: input.productId,
    dryRun: input.dryRun,
  });
  if (!existing) {
    session.quality.blockers.push(`Product not found: ${input.productId}`);
    return persist(session);
  }
  const brand = catalog.brands.find((b) => b.id === existing.brandId);
  log(session, "refresh", `Refreshing ${existing.fullName}`);

  const onboarded = await onboardExplicitProduct(
    {
      brand: brand?.name ?? existing.brandId,
      model: existing.name,
      category: existing.categoryId,
      dryRun: input.dryRun,
      provider: input.provider,
    },
    catalog,
  );
  onboarded.mode = "refresh";
  onboarded.requestedProductId = existing.id;
  onboarded.quality.reviewReasons.push(
    "Refresh mode: do not silently overwrite verified facts — review delta",
  );
  // Attach simple delta notes
  for (const f of onboarded.findings.filter((x) => x.status === "verified")) {
    const prev = existing.specifications[f.field];
    if (prev === undefined || prev === null) {
      onboarded.logs.push({
        at: nowIso(),
        stage: "delta",
        level: "info",
        message: `NEW ${f.field}=${JSON.stringify(f.normalizedValue)}`,
      });
    } else if (JSON.stringify(prev) !== JSON.stringify(f.normalizedValue)) {
      onboarded.logs.push({
        at: nowIso(),
        stage: "delta",
        level: "warn",
        message: `CHANGED ${f.field}: ${JSON.stringify(prev)} → ${JSON.stringify(f.normalizedValue)}`,
      });
      onboarded.quality.reviewReasons.push(`Field change requires review: ${f.field}`);
      const { assessReviewImpactFromProductChange } = await import(
        "@/domain/review-agent/lifecycle"
      );
      const impact = assessReviewImpactFromProductChange({
        product: existing,
        field: f.field,
        previousValue: prev,
        nextValue: f.normalizedValue,
      });
      if (impact.impactsReview) {
        onboarded.contentImpact.push({
          contentId: `review-impact-${existing.id}-${f.field}`,
          contentType: "review-dependency",
          reason: impact.reasons.join("; "),
          severity: impact.classification === "generation-maintenance" ? "HIGH" : "MEDIUM",
          suggestedAction: impact.suggestedAction,
        });
      }
    }
  }
  return persist(onboarded);
}

export function approveSession(
  session: ProductOnboardingSession,
): ProductOnboardingSession {
  if (session.quality.blockers.length) {
    throw new Error("Cannot approve blocked session");
  }
  session.status = "approved";
  if (session.candidateProduct) {
    session.candidateProduct.status = "approved";
  }
  log(session, "approval", "Human approved session");
  return persist(session);
}

/**
 * Publication moves approved staging → content only when explicitly invoked.
 * This stub validates gates and records published status without mutating
 * production content files automatically (human merge / codegen step).
 */
export function publishApprovedSession(
  session: ProductOnboardingSession,
): ProductOnboardingSession {
  if (session.status !== "approved") {
    throw new Error("Session must be approved before publish");
  }
  if (session.quality.blockers.length) {
    throw new Error("Cannot publish with blockers");
  }
  session.status = "published";
  log(
    session,
    "publication",
    "Marked published in staging — merge staged Product into content catalog manually/codegen; public routes still use publication resolver",
  );
  return persist(session);
}

export type { ConfidenceLevel, ContentImpactItem, EditorialOpportunityDraft };

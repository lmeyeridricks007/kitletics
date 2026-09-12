/**
 * Semantic image classification for gates and remediation reporting.
 * UNKNOWN is never upgraded to CORRECT.
 */

import type {
  ImagePlacement,
  SemanticClass,
  SemanticClassification,
} from "./types";
import {
  classifyImageSubject,
  inferEditorialTopic,
  isSemanticallyCompatible,
  subjectSport,
  topicSport,
} from "./subjects";

export function classifySemanticPlacement(input: {
  src: string;
  slug?: string;
  title?: string;
  categoryId?: string;
  placement?: ImagePlacement;
  pageType?: string;
}): SemanticClassification {
  const topic = inferEditorialTopic({
    slug: input.slug,
    title: input.title,
    categoryId: input.categoryId,
  });
  const subject = classifyImageSubject(input.src);
  const placement = input.placement ?? "card";

  if (subject === "placeholder") {
    return {
      class: "DUPLICATE_PLACEHOLDER",
      topic,
      subject,
      reason: "SVG / catalog fallback, not product photography",
    };
  }

  if (subject === "unknown") {
    return {
      class: "UNKNOWN",
      topic,
      subject,
      reason: "subject not independently verified from filename",
    };
  }

  const expectedSport = topicSport(topic);
  const fileSport = subjectSport(subject);

  if (
    fileSport !== "unknown" &&
    fileSport !== "none" &&
    expectedSport !== "unknown" &&
    expectedSport !== "mixed" &&
    fileSport !== expectedSport &&
    !(expectedSport === "running" && fileSport === "running")
  ) {
    return {
      class: "WRONG_SPORT",
      topic,
      subject,
      reason: `${subject} (${fileSport}) on ${topic} (${expectedSport})`,
    };
  }

  if (!isSemanticallyCompatible(input.src, topic, placement)) {
    if (fileSport !== expectedSport && expectedSport !== "mixed" && expectedSport !== "unknown") {
      return {
        class: "WRONG_SPORT",
        topic,
        subject,
        reason: `${subject} used on ${topic}`,
      };
    }
    return {
      class: "WRONG_CONTENT_TYPE",
      topic,
      subject,
      reason: `${subject} is authentic but the wrong content type for ${topic}`,
    };
  }

  if (subject === "running_atmosphere") {
    return {
      class: "GENERIC_BUT_RELEVANT",
      topic,
      subject,
      reason: "running atmosphere on a mixed running hub",
    };
  }

  if (
    subject === "gps_watch" ||
    subject === "hrm" ||
    subject === "headphones" ||
    subject === "headlamp" ||
    subject === "running_shoes" ||
    subject === "padel_racket" ||
    subject === "tennis_racket"
  ) {
    return {
      class: "LIKELY_CORRECT",
      topic,
      subject,
      reason: "topic-matching photography",
    };
  }

  return {
    class: "GENERIC_BUT_RELEVANT",
    topic,
    subject,
    reason: "compatible editorial photography",
  };
}

export function isIndexableSemanticFail(cls: SemanticClass): boolean {
  return (
    cls === "WRONG_SPORT" ||
    cls === "WRONG_PRODUCT" ||
    cls === "WRONG_BRAND" ||
    cls === "WRONG_CONTENT_TYPE"
  );
}

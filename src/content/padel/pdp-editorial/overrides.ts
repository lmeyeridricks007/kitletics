import type { PadelSoftPdpCopy } from "@/domain/padel/soft-pdp-copy";

/** Forensic / hand-tuned soft PDP overrides — wins over generated store. */
export const padelSoftPdpOverrides: Record<string, Partial<PadelSoftPdpCopy>> =
  {};

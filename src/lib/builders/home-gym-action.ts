"use server";

import {
  runAdvancedHomeGymBuilder,
  type AdvancedBuilderProfile,
  type AdvancedBuildResult,
} from "@/domain/builders/home-gym";
import { fitnessProducts } from "@/content/fitness";
import { offers } from "@/content/offers";

export async function runHomeGymBuilderAction(
  profile: AdvancedBuilderProfile,
): Promise<AdvancedBuildResult> {
  return runAdvancedHomeGymBuilder({
    profile,
    products: fitnessProducts,
    offers,
  });
}

"use server";

import {
  buildHyroxRaceKit,
  type RaceKitProfile,
  type RaceKitResult,
} from "@/domain/hyrox/race-kit";
import { products } from "@/content/products";
import { offers } from "@/content/offers";

export async function buildHyroxRaceKitAction(
  profile: RaceKitProfile,
): Promise<RaceKitResult> {
  return buildHyroxRaceKit({
    profile,
    products,
    offers,
  });
}

import {
  Activity,
  ArrowLeftRight,
  Calculator,
  CircleDot,
  Dumbbell,
  Footprints,
  Layers,
  Minus,
  Package,
  RefreshCw,
  Square,
  Timer,
  Trophy,
  Warehouse,
  Watch,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Shared Lucide map for Tool.icon string names. */
export const TOOL_ICON_MAP: Record<string, LucideIcon> = {
  Footprints,
  Timer,
  Trophy,
  RefreshCw,
  Wrench,
  Watch,
  Dumbbell,
  Warehouse,
  Package,
  Calculator,
  CircleDot,
  Square,
  Minus,
  Activity,
  ArrowLeftRight,
  Layers,
};

export function resolveToolIcon(name: string): LucideIcon {
  return TOOL_ICON_MAP[name] ?? Wrench;
}

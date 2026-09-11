/**
 * Calculator analytics stub — no vendor wired.
 * Intentional telemetry sink (same pattern as commerce analytics).
 * Never log accidental debug from call sites.
 */

type CalculatorEvent =
  | "calculator_opened"
  | "calculator_calculated"
  | "calculator_unit_changed"
  | "calculator_shared"
  | "calculator_related_tool_opened";

type Sink = (
  event: CalculatorEvent,
  properties?: Record<string, string | number | boolean | undefined>,
) => void;

let sink: Sink = () => {
  // no-op until analytics vendor is configured
};

export function setCalculatorAnalyticsSink(next: Sink): void {
  sink = next;
}

export function trackCalculatorEvent(
  event: CalculatorEvent,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  try {
    sink(event, properties);
  } catch {
    // never break calculator UX for analytics
  }
}

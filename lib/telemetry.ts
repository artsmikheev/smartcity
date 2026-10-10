export type TelemetryEvent =
  | "screen_view"
  | "cta_tap"
  | "layout_filter"
  | "lead_form_started"
  | "lead_submitted";

type TelemetryPayload = Record<string, string | number | boolean | undefined>;

/**
 * App Insights-ready boundary. The mobile bundle never contains a connection string.
 * A server adapter can replace this implementation when Azure hosting is confirmed.
 */
export function track(event: TelemetryEvent, payload: TelemetryPayload = {}) {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.info(`[telemetry] ${event}`, payload);
  }
}

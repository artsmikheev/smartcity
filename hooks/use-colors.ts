import { COLORS } from "@/constants/theme";

// Starter component aliases are derived from the public tokens, not duplicated.
const palette = {
  ...COLORS,
  text: COLORS.foreground,
  tint: COLORS.accent,
  icon: COLORS.muted,
  surface: COLORS.cardBackground,
  primary: COLORS.accent,
  tabIconDefault: COLORS.muted,
  tabIconSelected: COLORS.accent,
};

/** This brand uses one dark palette regardless of the device scheme. */
export function useColors(_colorSchemeOverride?: "light" | "dark") {
  return palette;
}

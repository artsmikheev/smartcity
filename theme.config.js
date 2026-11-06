// Node-side adapter for Tailwind; actual values live only in constants/app-data.ts.
require("tsx/cjs");
const { COLORS } = require("./constants/theme.ts");

const palette = {
  primary: COLORS.accent,
  background: COLORS.background,
  surface: COLORS.cardBackground,
  foreground: COLORS.foreground,
  muted: COLORS.muted,
  border: COLORS.border,
  success: COLORS.success,
  warning: COLORS.accent,
  error: COLORS.error,
};

const themeColors = Object.fromEntries(
  Object.entries(palette).map(([name, value]) => [name, { light: value, dark: value }]),
);

module.exports = { themeColors };

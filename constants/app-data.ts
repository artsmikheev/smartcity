export const COLORS = {
  background: "#1C1B1A",
  cardBackground: "#262422",
  cardDeep: "#121212",
  foreground: "#EDEAE4",
  muted: "#BCB9B7",
  mutedDark: "#8A8887",
  accent: "#B88F00",
  accentForeground: "#1A1A1A",
  border: "#9A9896",
  error: "#F37A72",
  success: "#4ADE80",
};

export const TYPOGRAPHY = {
  display36: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 36, lineHeight: 40, letterSpacing: -0.5 },
  display32: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 32, lineHeight: 37, letterSpacing: -0.3 },
  display22: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 22, lineHeight: 26 },
  cardTitle: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 20, lineHeight: 25 },
  body15: { fontFamily: undefined, fontSize: 15, lineHeight: 22 },
  body13: { fontFamily: undefined, fontSize: 13, lineHeight: 18 },
  meta11: { fontFamily: undefined, fontSize: 11, lineHeight: 14, letterSpacing: 0.5, textTransform: "uppercase" },
  priceCard: { fontFamily: undefined, fontSize: 22, lineHeight: 26, fontWeight: "700" },
  priceDetail: { fontFamily: undefined, fontSize: 34, lineHeight: 37, fontWeight: "700" },
  buttonLabel: { fontFamily: undefined, fontSize: 15, lineHeight: 15, fontWeight: "600" },
} as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, max: 48 } as const;

export const RADIUS = { card: 20, image: 12, primary: 999, secondary: 12, tab: 32, sheet: 24, pill: 999 } as const;

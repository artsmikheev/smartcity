import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/app-data";

export function SignalDot({ color = COLORS.lime }: { color?: string }) {
  return <View style={[styles.signalDot, { backgroundColor: color }]} />;
}

export function Eyebrow({ children, color = COLORS.muted }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon = "arrow-forward" }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      {Platform.OS === "web" ? <Text style={[styles.webIcon, { color: COLORS.background }]}>{iconGlyph(icon)}</Text> : <Ionicons name={icon} size={17} color={COLORS.background} />}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, icon = "arrow-forward-outline" }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <Text style={styles.outlineButtonText}>{label}</Text>
      {Platform.OS === "web" ? <Text style={[styles.webIcon, { color: COLORS.foreground }]}>{iconGlyph(icon)}</Text> : <Ionicons name={icon} size={17} color={COLORS.foreground} />}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      {Platform.OS === "web" ? <Text style={styles.webIcon}>{iconGlyph(icon)}</Text> : <Ionicons name={icon} size={21} color={COLORS.foreground} />}
    </Pressable>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "lime" | "amber" }) {
  const color = tone === "lime" ? COLORS.lime : tone === "amber" ? COLORS.amber : COLORS.muted;
  return (
    <View style={[styles.tag, { borderColor: color + "55" }]}>
      {tone !== "neutral" ? <SignalDot color={color} /> : null}
      <Text style={[styles.tagText, { color }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Ionicons name="layers-outline" size={22} color={COLORS.lime} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  signalDot: { width: 8, height: 8, borderRadius: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: "700" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { color: COLORS.foreground, fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  sectionAction: { color: COLORS.lime, fontSize: 13, fontWeight: "700" },
  primaryButton: { minHeight: 54, paddingHorizontal: 17, borderRadius: 18, backgroundColor: COLORS.lime, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  primaryButtonText: { color: COLORS.background, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  outlineButton: { minHeight: 50, paddingHorizontal: 16, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  outlineButtonText: { color: COLORS.foreground, fontSize: 14, fontWeight: "700" },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.surfaceRaised, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  tag: { alignSelf: "flex-start", minHeight: 26, paddingHorizontal: 9, borderRadius: 8, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  tagText: { fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase", fontWeight: "800" },
  emptyState: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 22, padding: 20, alignItems: "center", backgroundColor: COLORS.surface },
  emptyIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: COLORS.foreground, fontSize: 17, fontWeight: "800", marginBottom: 7 },
  emptyCopy: { color: COLORS.muted, lineHeight: 20, textAlign: "center", fontSize: 13 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  webIcon: { color: COLORS.foreground, fontSize: 18, fontWeight: "900", lineHeight: 20 },
});

function iconGlyph(icon: keyof typeof Ionicons.glyphMap) {
  if (icon.includes("close")) return "×";
  if (icon.includes("chevron")) return "⌄";
  if (icon.includes("options") || icon.includes("settings")) return "≡";
  if (icon.includes("share") || icon.includes("arrow")) return "↗";
  if (icon.includes("notification")) return "•";
  if (icon.includes("call")) return "⌕";
  if (icon.includes("chat")) return "◌";
  return "·";
}

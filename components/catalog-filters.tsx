import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

const options = [
  { value: null, label: 'Все' }, { value: 0, label: 'Студия' },
  { value: 1, label: '1 комната' }, { value: 2, label: '2 комнаты' }, { value: 3, label: '3 комнаты' },
];

export function CatalogFilters({ visible, rooms, onChange, onClose }: { visible: boolean; rooms: number | null; onChange: (value: number | null) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Закрыть фильтры" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: SPACING.xxl + insets.bottom }]} accessibilityViewIsModal aria-modal>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Комнатность</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Закрыть фильтры" onPress={onClose} style={styles.close}>
              <Ionicons name="close-outline" size={24} color={COLORS.foreground} accessible={false} />
            </Pressable>
          </View>
          <View style={styles.options}>
            {options.map((option) => (
              <Pressable key={String(option.value)} accessibilityRole="button" accessibilityState={{ selected: rooms === option.value }} aria-pressed={rooms === option.value} onPress={() => onChange(option.value)} style={[styles.option, rooms === option.value && styles.activeOption]}>
                <Text style={[styles.label, rooms === option.value && styles.activeLabel]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.apply}>
            <Text style={styles.applyLabel}>Показать варианты</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: COLORS.cardBackground, borderTopLeftRadius: RADIUS.sheet, borderTopRightRadius: RADIUS.sheet, padding: SPACING.xxl, gap: SPACING.xxl },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...TYPOGRAPHY.display22, color: COLORS.foreground },
  close: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  option: { minHeight: 48, minWidth: 64, borderRadius: RADIUS.secondary, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  activeOption: { borderColor: COLORS.accent },
  label: { ...TYPOGRAPHY.body13, color: COLORS.foreground },
  activeLabel: { color: COLORS.accent },
  apply: { height: 52, borderRadius: RADIUS.primary, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  applyLabel: { ...TYPOGRAPHY.buttonLabel, color: COLORS.accentForeground },
});

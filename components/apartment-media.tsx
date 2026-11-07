import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { COLORS } from '@/constants/theme';
import { planXml } from '@/assets/images/plans/xml';
import { resolveMediaUrl } from '@/lib/storage';

export function ApartmentMedia({ path, label, style, testID }: { path: string | null; label: string; style?: StyleProp<ViewStyle>; testID?: string }) {
  const xml = path ? planXml[path] : undefined;
  const source = resolveMediaUrl(path);
  return (
    <View testID={testID} style={[styles.frame, style]} accessibilityLabel={label} accessibilityRole="image">
      {xml ? <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        : source !== null ? <Image source={source} style={styles.image} contentFit="cover" accessibilityLabel={label} transition={0} />
        : <Ionicons name="image-outline" size={32} color={COLORS.muted} accessible={false} />}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: { backgroundColor: COLORS.cardDeep, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});

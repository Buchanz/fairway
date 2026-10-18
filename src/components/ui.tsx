import {GlassPressable as Pressable} from './Glass';
import { StyleSheet, Text } from 'react-native';
export const colors = { ink: '#183C32', muted: '#65766D', paper: '#F7F7F0', green: '#1F503F', lime: '#C5EB65' };
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.selected]}><Text style={{ color: selected ? '#183C32' : colors.ink, fontWeight: '600' }}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ chip: { minHeight: 44, paddingHorizontal: 17, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#D5DDD1', backgroundColor: '#E8EEDD' }, selected: { backgroundColor: '#C5EB65', borderColor: '#8EBA36' } });

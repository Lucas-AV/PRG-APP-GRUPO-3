import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, Radius } from '@/constants/theme';

interface StatusBadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
}

export function StatusBadge({ label, color, backgroundColor }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  label: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});

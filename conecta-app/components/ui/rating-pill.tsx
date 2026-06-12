import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface RatingPillProps {
  rating: number;
  count: number;
  size?: 'sm' | 'md';
}

export function RatingPill({ rating, count, size = 'md' }: RatingPillProps) {
  const isSm = size === 'sm';
  return (
    <View style={[styles.pill, isSm && styles.pillSm]}>
      <MaterialIcons name="star" size={isSm ? 12 : 14} color="#F59E0B" />
      <Text style={[styles.rating, isSm && styles.ratingSm]}>
        {rating.toFixed(1)}
      </Text>
      <Text style={[styles.count, isSm && styles.countSm]}>
        ({count})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillSm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  rating: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  ratingSm: { fontSize: 11 },
  count: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  countSm: { fontSize: 10 },
});

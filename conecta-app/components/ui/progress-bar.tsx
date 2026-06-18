import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  label?: string;
  percentageLabel?: string;
}

export function ProgressBar({ progress, label, percentageLabel }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
        {percentageLabel && (
          <Text style={styles.percentage}>{percentageLabel}</Text>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs + 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1.5,
  },
  percentage: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 13,
    color: Colors.brand,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
  },
});

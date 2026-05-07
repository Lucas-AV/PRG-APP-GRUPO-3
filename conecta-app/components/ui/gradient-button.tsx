import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, GradientColors, Radius, Spacing } from '@/constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function GradientButton({ label, onPress, style, disabled }: GradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={GradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 0.2,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
});

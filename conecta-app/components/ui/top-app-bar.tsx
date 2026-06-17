import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

interface TopAppBarProps {
  title: string;
  badge?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function TopAppBar({ title, badge, onBack, showBack = true }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const backBtnScale = useSharedValue(1);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleBackPressIn = () => {
    backBtnScale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handleBackPressOut = () => {
    backBtnScale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const animBackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              style={styles.backBtn}
            >
              <Animated.View style={animBackStyle}>
                <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
              </Animated.View>
            </Pressable>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {badge && <Text style={styles.badge}>{badge}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm + 4,
    minHeight: 48,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  backBtn: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  badge: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 13,
    color: Colors.brand,
    letterSpacing: -0.2,
  },
});

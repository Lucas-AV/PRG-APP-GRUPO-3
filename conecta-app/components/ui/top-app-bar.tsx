import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

interface TopAppBarProps {
  title: string;
  badge?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function TopAppBar({ title, badge, onBack, showBack = true }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
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
    backgroundColor: Colors.surfaceBright,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
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
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  badge: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 13,
    color: Colors.primary,
    letterSpacing: -0.2,
  },
});

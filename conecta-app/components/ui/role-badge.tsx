import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

interface RoleBadgeProps {
  role: string | undefined;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isProvider = role === 'prestador';

  return (
    <View style={[styles.badge, isProvider ? styles.badgeProvider : styles.badgeClient]}>
      <MaterialIcons
        name={isProvider ? 'work' : 'person'}
        size={11}
        color={isProvider ? Colors.onTertiaryContainer : Colors.onPrimaryContainer}
      />
      <Text style={[styles.label, isProvider ? styles.labelProvider : styles.labelClient]}>
        {isProvider ? 'Prestador' : 'Cliente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm + 1,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeClient: {
    backgroundColor: Colors.primaryContainer,
  },
  badgeProvider: {
    backgroundColor: Colors.tertiaryContainer,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  labelClient: {
    color: Colors.onPrimaryContainer,
  },
  labelProvider: {
    color: Colors.onTertiaryContainer,
  },
});

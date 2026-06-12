import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

interface ListItemProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  showChevron?: boolean;
  danger?: boolean;
}

export function ListItem({
  icon,
  iconColor = Colors.primary,
  iconBg = Colors.primaryContainer,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = !!onPress,
  danger = false,
}: ListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      {!!icon && (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={danger ? Colors.error : iconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, danger && { color: Colors.error }]}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? (showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.outlineVariant} />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  pressed: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 2 },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});

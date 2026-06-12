import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

interface TransactionListItemProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  amount: string;
  statusLabel?: string;
  statusColor?: string;
  onPress?: () => void;
}

export function TransactionListItem({
  icon = 'receipt-long',
  iconColor = Colors.primary,
  iconBg = Colors.primaryContainer,
  title,
  subtitle,
  amount,
  statusLabel,
  statusColor = '#16a34a',
  onPress,
}: TransactionListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: Colors.surfaceContainerLow }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>
        {!!statusLabel && (
          <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: 2 },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  status: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 10,
  },
});

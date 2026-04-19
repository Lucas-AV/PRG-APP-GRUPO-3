import { TouchableOpacity, Text } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface CategoryChipProps {
  label: string;
  colorHex: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, colorHex, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        backgroundColor: selected ? colorHex : Colors.surfaceContainerLow,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        marginRight: Spacing.sm,
      }}
    >
      <Text
        style={{
          fontFamily: 'WorkSans_500Medium',
          fontSize: 13,
          color: selected ? '#ffffff' : Colors.onSurfaceVariant,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

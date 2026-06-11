import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

interface IconWrapperProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  shape?: 'circle' | 'rounded' | 'square';
}

export function IconWrapper({
  icon,
  size = 40,
  iconSize,
  color = Colors.primary,
  backgroundColor = Colors.primaryContainer,
  shape = 'circle',
}: IconWrapperProps) {
  const borderRadius =
    shape === 'circle' ? size / 2 : shape === 'rounded' ? Radius.md : Radius.sm;

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius, backgroundColor },
      ]}
    >
      <MaterialIcons name={icon} size={iconSize ?? size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

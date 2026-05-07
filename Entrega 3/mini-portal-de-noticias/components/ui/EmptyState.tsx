import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface EmptyStateProps {
  icon: FeatherIconName;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-surface-container-low items-center justify-center mb-6">
        <Feather name={icon} size={32} color={Colors.onSurfaceVariant} />
      </View>
      <Text
        className="text-[20px] leading-6 text-primary text-center mb-2"
        style={{ fontFamily: 'Newsreader_700Bold' }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          className="text-[15px] leading-[22px] text-on-surface-variant text-center mb-6"
          style={{ fontFamily: 'WorkSans_400Regular' }}
        >
          {subtitle}
        </Text>
      ) : null}
      {ctaLabel && onCta ? (
        <TouchableOpacity
          onPress={onCta}
          activeOpacity={0.8}
          accessibilityRole="button"
          className="bg-primary rounded-lg px-6 py-3"
        >
          <Text
            className="text-[14px] text-on-primary"
            style={{ fontFamily: 'WorkSans_700Bold' }}
          >
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

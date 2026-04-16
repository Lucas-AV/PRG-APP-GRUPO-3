import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const containerStyle: Record<ButtonVariant, string> = {
  primary: 'bg-primary rounded-lg px-6 py-4 flex-row items-center justify-center gap-2',
  secondary: 'bg-surface-container-high rounded-lg px-6 py-4 flex-row items-center justify-center gap-2',
  tertiary: 'px-4 py-3 flex-row items-center justify-center',
};

const labelStyle: Record<ButtonVariant, string> = {
  primary: 'font-sans-bold text-base text-on-primary',
  secondary: 'font-sans-bold text-base text-primary',
  tertiary: 'font-sans text-base text-primary',
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      className={`
        ${containerStyle[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50' : ''}
      `.trim()}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.onPrimary : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text className={labelStyle[variant]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

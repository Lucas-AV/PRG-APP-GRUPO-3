import { View, TextInput, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon?: FeatherIconName;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'off';
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  returnKeyType,
  onSubmitEditing,
}: InputProps) {
  return (
    <View>
      {label && (
        <Text className="font-sans-medium text-sm text-on-surface mb-2">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-surface-container-highest rounded-md px-4 ${
          error ? 'border border-error/30' : ''
        }`}
        style={{ minHeight: 52 }}
      >
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={Colors.onSurfaceVariant}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.onSurfaceVariant}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          className="flex-1 font-sans text-base text-on-surface"
          style={{ paddingVertical: 14 }}
        />
      </View>
      {error ? (
        <Text className="font-sans text-xs text-error mt-1">{error}</Text>
      ) : null}
    </View>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightAction?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

export function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  icon,
  rightAction,
  autoCapitalize,
  multiline,
  numberOfLines,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.inputRow}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={Colors.outline}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            (isPassword || rightAction) && styles.inputWithTrailing,
            multiline && styles.multiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {isPassword && (
          <Pressable
            style={styles.trailing}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.outline}
            />
          </Pressable>
        )}
        {rightAction && <View style={styles.trailing}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.md,
  },
  icon: {
    marginLeft: Spacing.base,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurface,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithTrailing: {
    paddingRight: Spacing.xxxl + Spacing.base,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.base,
  },
  trailing: {
    position: 'absolute',
    right: Spacing.base,
    padding: 4,
  },
});

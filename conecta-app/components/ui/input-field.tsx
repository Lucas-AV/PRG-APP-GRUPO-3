import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
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
  errorMessage?: string;
  maxLength?: number;
}

export const InputField = React.forwardRef<TextInput, InputFieldProps>(({
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
  errorMessage,
  maxLength,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry;

  // 0 = unfocused (border), 1 = focused (brand), 2 = error
  const borderProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (errorMessage) {
      shakeX.value = withSequence(
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 40 }),
      );
      borderProgress.value = withTiming(2, { duration: 100 });
    } else if (focused) {
      borderProgress.value = withTiming(1, { duration: 200 });
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  const animRowStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1, 2],
      [Colors.border, Colors.brand, Colors.error],
    ),
    transform: [{ translateX: shakeX.value }],
  }));

  const iconColor = errorMessage
    ? Colors.error
    : focused
    ? Colors.brand
    : Colors.inkMuted;

  const labelColor = focused ? Colors.brand : Colors.inkMuted;

  const handleFocus = () => {
    setFocused(true);
    if (!errorMessage) {
      borderProgress.value = withTiming(1, { duration: 200 });
    }
  };

  const handleBlur = () => {
    setFocused(false);
    if (!errorMessage) {
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: labelColor }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Animated.View style={[styles.inputRow, animRowStyle]}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            !!(isPassword || rightAction) && styles.inputWithTrailing,
            multiline && styles.multiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.inkMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isPassword && (
          <Pressable
            style={styles.trailing}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.inkMuted}
            />
          </Pressable>
        )}
        {rightAction && <View style={styles.trailing}>{rightAction}</View>}
      </Animated.View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  icon: {
    marginLeft: Spacing.base,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
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
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.error,
    marginLeft: 2,
  },
});

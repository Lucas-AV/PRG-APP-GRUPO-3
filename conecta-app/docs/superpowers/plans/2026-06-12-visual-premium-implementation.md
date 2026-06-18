# Visual Premium — Surface Elevation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar a estética visual do Conecta App de funcional para premium, aplicando a abordagem "Surface Elevation" — tokens coesos, componentes com estados animados e linguagem visual consistente em todas as telas.

**Architecture:** Foundation-first — tokens e Elevation.ts primeiro, depois componentes compartilhados, depois telas. Nenhuma tela é tocada antes de seus componentes base estarem prontos. Sem mudança de lógica de negócio, navegação ou APIs.

**Tech Stack:** React Native + TypeScript, Expo SDK, react-native-reanimated v4.1.1 (já instalado), expo-haptics (já instalado), expo-linear-gradient (já instalado).

---

## Arquivos a modificar/criar

| Arquivo | Ação |
|---|---|
| `constants/theme.ts` | Modificar — adicionar tokens ink, inkMuted, card, border, brandDeep, Typography, atualizar GradientColors |
| `constants/Elevation.ts` | Criar — objeto com 5 níveis de sombra |
| `components/ui/gradient-button.tsx` | Modificar — Haptics, Reanimated spring, loading prop, Radius.lg |
| `components/ui/input-field.tsx` | Modificar — borda animada focus, label color animada, shake on error |
| `components/ui/top-app-bar.tsx` | Modificar — tipografia title, border bottom, Reanimated back btn |
| `components/ui/bottom-sheet.tsx` | Modificar — handle maior, backdrop 0.55, Reanimated slide |
| `components/ui/avatar-initials.tsx` | Modificar — tamanhos sm/md/lg, Reanimated pressed scale |
| `components/ui/status-badge.tsx` | Modificar — tipografia label |
| `components/ui/list-item.tsx` | Modificar — icon wrap 36×36 Radius.sm, chevron inkMuted |
| `app/(tabs)/_layout.tsx` | Modificar — tab bar altura 68, pill animado ativo, ícone spring |
| `app/(auth)/login.tsx` | Modificar — gradiente fundo, card Radius.xl, tipografia display |
| `app/(auth)/sign-up.tsx` | Modificar — mesma linguagem do login |
| `app/(tabs)/index.tsx` | Modificar — hero display, search border, category tiles, cards |
| `app/(tabs)/home-provider.tsx` | Modificar — stats border-left, quick actions, elevation tokens |
| `app/(tabs)/schedule.tsx` | Modificar — calendar cells, section headers overline, appointment cards |
| `app/(tabs)/profile.tsx` | Modificar — avatar lg, section headers overline |
| `app/(tabs)/services.tsx` | Modificar — cards elevation, section headers |
| `app/(tabs)/messages.tsx` | Modificar — layout básico com novos tokens |
| `app/(account)/payments.tsx` | Modificar — card saldo LinearGradient, ListItem herda |
| `app/(account)/notifications.tsx` | Modificar — dot brand, item bg brand+08 |
| `app/(account)/receipt.tsx` | Modificar — card total Radius.xl, preço headline |
| `app/(account)/plans.tsx` | Modificar — plano ativo borderWidth 2 brand |
| `app/(account)/edit-profile.tsx` | Modificar — avatar lg, elevation tokens |
| `app/(account)/addresses.tsx` | Modificar — elevation tokens, herda ListItem |
| `app/(account)/privacy-security.tsx` | Modificar — herda TopAppBar + ListItem refatorados |
| `app/(account)/support.tsx` | Modificar — herda TopAppBar + ListItem refatorados |
| `app/(account)/about.tsx` | Modificar — herda TopAppBar + ListItem refatorados |
| `app/(account)/payment-history.tsx` | Modificar — herda ListItem + StatusBadge |
| `app/(account)/card-detail.tsx` | Modificar — elevation tokens |
| `app/(account)/add-balance.tsx` | Modificar — InputField herda |
| `app/(account)/new-card.tsx` | Modificar — InputField herda |
| `app/(account)/change-password.tsx` | Modificar — InputField herda |
| `app/(account)/use-terms.tsx` | Modificar — TopAppBar herda |
| `app/(onboarding)/step0.tsx` | Modificar — gradiente fundo, display headline |
| `app/(onboarding)/step1.tsx` | Modificar — ProgressBar brand, botões ghost/gradient |
| `app/(onboarding)/step2.tsx` | Modificar — mesma linguagem step1 |
| `app/(onboarding)/step3.tsx` | Modificar — mesma linguagem step1 |
| `app/(onboarding)/step3b.tsx` | Modificar — mesma linguagem step1 |
| `app/(onboarding)/step4.tsx` | Modificar — ícone sucesso, display headline, CTA spring |
| `app/(scheduling)/book.tsx` | Modificar — chips slot, Radius.md, pressed spring |
| `app/(scheduling)/appointment-detail.tsx` | Modificar — status header LinearGradient |
| `app/(scheduling)/provider-availability.tsx` | Modificar — chips mesma linguagem book |

---

## Task 1: Design Tokens — `constants/theme.ts`

**Files:**
- Modify: `constants/theme.ts`

- [ ] **Step 1: Adicionar novos tokens de cor e atualizar GradientColors**

Abrir `constants/theme.ts` e substituir o bloco `Colors` e `GradientColors` pelo seguinte (mantendo todos os tokens M3 existentes e adicionando os novos):

```typescript
export const Colors = {
  // ── Tokens de marca ──────────────────────────────────────────────────
  primary: '#0054d6',
  brand: '#0054d6',
  brandDeep: '#003fa3',
  primaryDim: '#004abd',
  primaryFixed: '#dae1ff',
  primaryFixedDim: '#c7d3ff',
  primaryContainer: '#dae1ff',
  onPrimary: '#f8f7ff',
  onPrimaryFixed: '#003894',
  onPrimaryContainer: '#0049bb',
  inversePrimary: '#5e8bff',

  // ── Tokens premium (novos) ────────────────────────────────────────────
  ink: '#0f172a',
  inkMuted: '#64748b',
  card: '#ffffff',
  border: 'rgba(15,23,42,0.08)',

  // ── Secundário / terciário (M3) ───────────────────────────────────────
  secondary: '#5f5f62',
  secondaryDim: '#535356',
  secondaryContainer: '#e4e2e6',
  onSecondary: '#faf8fc',
  onSecondaryContainer: '#515155',

  tertiary: '#615b77',
  tertiaryDim: '#554f6b',
  tertiaryContainer: '#e1d8fa',
  onTertiary: '#fcf7ff',
  onTertiaryContainer: '#504b66',

  // ── Erro ──────────────────────────────────────────────────────────────
  error: '#9f403d',
  errorContainer: '#fe8983',
  onError: '#fff7f6',
  onErrorContainer: '#752121',

  // ── Superfícies ───────────────────────────────────────────────────────
  surface: '#f8fafc',
  surfaceBright: '#f8fafc',
  surfaceDim: '#d4dbdd',
  surfaceVariant: '#dde4e5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f4',
  surfaceContainer: '#ebeeef',
  surfaceContainerHigh: '#e4e9ea',
  surfaceContainerHighest: '#dde4e5',

  // ── On-surface ────────────────────────────────────────────────────────
  onSurface: '#0f172a',
  onSurfaceVariant: '#64748b',
  inverseSurface: '#0c0f0f',

  outline: '#757c7d',
  outlineVariant: '#adb3b4',

  background: '#f8fafc',
  onBackground: '#0f172a',
};

export const FontFamily = {
  headlineExtraBold: 'Manrope-ExtraBold',
  headlineBold: 'Manrope-Bold',
  headlineSemiBold: 'Manrope-SemiBold',
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

export const Typography = {
  display: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  headline: {
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 17,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 15,
  },
  overline: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    lineHeight: 14,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const GradientColors: [string, string] = ['#0054d6', '#003fa3'];
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit
```

Esperado: sem erros relacionados a `theme.ts`. Eventuais erros em outros arquivos são normais neste ponto — serão corrigidos nas tarefas seguintes.

- [ ] **Step 3: Commit**

```bash
git add constants/theme.ts
git commit -m "feat(design): update theme tokens — ink, card, border, brandDeep, Typography"
```

---

## Task 2: Elevation Constants — `constants/Elevation.ts`

**Files:**
- Create: `constants/Elevation.ts`

- [ ] **Step 1: Criar o arquivo**

```typescript
// constants/Elevation.ts
import { Colors } from './theme';

export const Elevation = {
  0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  2: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  3: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  4: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
} as const;
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add constants/Elevation.ts
git commit -m "feat(design): add Elevation constants to replace inline shadows"
```

---

## Task 3: GradientButton

**Files:**
- Modify: `components/ui/gradient-button.tsx`

- [ ] **Step 1: Reescrever com Haptics + Reanimated spring + loading prop**

```typescript
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors, FontFamily, GradientColors, Radius, Spacing } from '@/constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export function GradientButton({ label, onPress, style, disabled, loading }: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    })
    .onEnd(() => {
      if (!disabled && !loading) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }
    });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            styles.wrapper,
            style,
            animatedStyle,
            (disabled || loading) && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} size="small" />
            ) : (
              <Animated.Text style={styles.label}>{label}</Animated.Text>
            )}
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
```

**Nota:** Se `react-native-gesture-handler` não estiver instalado ou configurado, usar a versão simplificada com `Pressable`:

```typescript
// Versão fallback sem GestureHandler (se necessário):
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, withSpring, useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors, FontFamily, GradientColors, Radius, Spacing } from '@/constants/theme';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export function GradientButton({ label, onPress, style, disabled, loading }: GradientButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); };

  return (
    <Pressable
      onPress={() => {
        if (!disabled && !loading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.wrapper, style, animatedStyle, (disabled || loading) && styles.disabled]}>
        <LinearGradient colors={GradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {loading
            ? <ActivityIndicator color={Colors.onPrimary} size="small" />
            : <Animated.Text style={styles.label}>{label}</Animated.Text>}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 0.2,
  },
  disabled: { opacity: 0.45 },
});
```

Usar a versão com `Pressable` (fallback) por ser mais simples e compatível. `react-native-gesture-handler` pode conflitar com o `Modal` nativo em algumas versões do Expo.

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/gradient-button.tsx
git commit -m "feat(design): upgrade GradientButton with Haptics, Reanimated spring and loading state"
```

---

## Task 4: InputField — foco animado + shake de erro

**Files:**
- Modify: `components/ui/input-field.tsx`

- [ ] **Step 1: Adicionar estados animados de foco e erro**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
} from 'react-native-reanimated';
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

  const borderColor = useSharedValue(Colors.border);
  const iconColor = useSharedValue(Colors.outline);
  const labelColor = useSharedValue(Colors.inkMuted);
  const shakeX = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    tintColor: iconColor.value,
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    color: labelColor.value,
  }));

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleFocus = () => {
    setFocused(true);
    borderColor.value = withTiming(Colors.brand, { duration: 200 });
    iconColor.value = withTiming(Colors.brand, { duration: 200 });
    labelColor.value = withTiming(Colors.brand, { duration: 200 });
  };

  const handleBlur = () => {
    setFocused(false);
    const hasBorderError = !!errorMessage;
    borderColor.value = withTiming(hasBorderError ? '#d32f2f' : Colors.border, { duration: 200 });
    iconColor.value = withTiming(Colors.outline, { duration: 200 });
    labelColor.value = withTiming(Colors.inkMuted, { duration: 200 });
  };

  React.useEffect(() => {
    if (errorMessage) {
      borderColor.value = withTiming('#d32f2f', { duration: 150 });
      labelColor.value = withTiming('#d32f2f', { duration: 150 });
      shakeX.value = withSequence(
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    } else {
      borderColor.value = withTiming(focused ? Colors.brand : Colors.border, { duration: 200 });
      labelColor.value = withTiming(focused ? Colors.brand : Colors.inkMuted, { duration: 200 });
    }
  }, [errorMessage]);

  return (
    <Animated.View style={[styles.wrapper, animatedShakeStyle]}>
      {label ? (
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label.toUpperCase()}
        </Animated.Text>
      ) : null}
      <Animated.View style={[styles.inputRow, animatedBorderStyle]}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={focused ? Colors.brand : Colors.outline}
            style={styles.icon}
          />
        )}
        <TextInput
          ref={ref}
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
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isPassword && (
          <Pressable style={styles.trailing} onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.outline}
            />
          </Pressable>
        )}
        {rightAction && <View style={styles.trailing}>{rightAction}</View>}
      </Animated.View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
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
  icon: { marginLeft: Spacing.base },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  inputWithIcon: { paddingLeft: Spacing.sm },
  inputWithTrailing: { paddingRight: Spacing.xxxl + Spacing.base },
  multiline: { minHeight: 100, paddingTop: Spacing.base },
  trailing: { position: 'absolute', right: Spacing.base, padding: 4 },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: '#d32f2f',
    marginLeft: 2,
  },
});
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Testar visualmente**

Iniciar o app (`npx expo start`) e verificar na tela de login:
- Tocar no campo E-mail → borda e ícone ficam azuis
- Sair do campo sem preencher → borda volta a cinza
- Submeter formulário com campo inválido → borda fica vermelha + shake

- [ ] **Step 4: Commit**

```bash
git add components/ui/input-field.tsx
git commit -m "feat(design): animate InputField focus border, icon color and error shake"
```

---

## Task 5: TopAppBar

**Files:**
- Modify: `components/ui/top-app-bar.tsx`

- [ ] **Step 1: Atualizar estilos e adicionar Reanimated no botão voltar**

```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Colors, FontFamily, Spacing, Elevation } from '@/constants/theme';
import { Elevation as ElevationConst } from '@/constants/Elevation';

interface TopAppBarProps {
  title: string;
  badge?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function TopAppBar({ title, badge, onBack, showBack = true }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const backScale = useSharedValue(1);

  const backAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const handlePressIn = () => { backScale.value = withSpring(0.88, { damping: 15, stiffness: 400 }); };
  const handlePressOut = () => { backScale.value = withSpring(1, { damping: 15, stiffness: 400 }); };

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              hitSlop={8}
            >
              <Animated.View style={[styles.backBtn, backAnimStyle]}>
                <MaterialIcons name="arrow-back" size={22} color={Colors.brand} />
              </Animated.View>
            </Pressable>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {badge && <Text style={styles.badge}>{badge}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm + 4,
    minHeight: 48,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  badge: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 13,
    color: Colors.brand,
    letterSpacing: -0.2,
  },
});
```

**Nota:** Remover a importação não-usada de `Elevation` se TypeScript reclamar — o import `ElevationConst` não foi usado no código acima. Limpar assim:

```typescript
// Remover estas linhas desnecessárias:
import { Colors, FontFamily, Spacing, Elevation } from '@/constants/theme';
import { Elevation as ElevationConst } from '@/constants/Elevation';

// Manter apenas:
import { Colors, FontFamily, Spacing } from '@/constants/theme';
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/top-app-bar.tsx
git commit -m "feat(design): upgrade TopAppBar with title role, border bottom and back button spring"
```

---

## Task 6: BottomSheet

**Files:**
- Modify: `components/ui/bottom-sheet.tsx`

- [ ] **Step 1: Aumentar handle e backdrop, manter animationType nativo**

A animação nativa `animationType="slide"` do Modal funciona bem. A melhoria aqui é visual (handle maior, backdrop mais escuro) sem quebrar compatibilidade:

```typescript
import { ReactNode } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { Elevation } from '@/constants/Elevation';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  scrollable?: boolean;
}

export function BottomSheet({ visible, onClose, title, children, scrollable = false }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.sheet, Elevation[3], { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
      <View style={styles.handle} />
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            onPress={onClose}
            hitSlop={8}
          >
            <MaterialIcons name="close" size={20} color={Colors.inkMuted} />
          </Pressable>
        </View>
      )}
      {scrollable
        ? <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        : children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>{content}</Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.base,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/bottom-sheet.tsx
git commit -m "feat(design): upgrade BottomSheet handle, backdrop and surface tokens"
```

---

## Task 7: AvatarInitials + StatusBadge + ListItem

**Files:**
- Modify: `components/ui/avatar-initials.tsx`
- Modify: `components/ui/status-badge.tsx`
- Modify: `components/ui/list-item.tsx`

- [ ] **Step 1: AvatarInitials — ajustar tamanhos e adicionar pressed spring**

```typescript
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Colors, FontFamily, Radius } from '@/constants/theme';

// sm: 36 | md: 48 | lg: 72
const SIZE_MAP = { sm: 36, md: 48, lg: 72 };
const FONT_MAP = { sm: 13, md: 18, lg: 28 };

interface AvatarInitialsProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  imageUri?: string;
  showEditBadge?: boolean;
  onPress?: () => void;
}

export function AvatarInitials({
  initials,
  size = 'md',
  imageUri,
  showEditBadge = false,
  onPress,
}: AvatarInitialsProps) {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const badgeSize = Math.round(dim * 0.36);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.92, { damping: 15, stiffness: 400 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); };

  const inner = imageUri ? (
    <Image source={{ uri: imageUri }} style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]} />
  ) : (
    <View style={[styles.circle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials.slice(0, 2).toUpperCase()}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      disabled={!onPress}
      style={styles.wrapper}
    >
      <Animated.View style={animStyle}>
        {inner}
        {showEditBadge && (
          <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
            <MaterialIcons name="camera-alt" size={badgeSize * 0.55} color={Colors.onPrimary} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignSelf: 'flex-start' },
  circle: {
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.headlineExtraBold,
    color: Colors.brand,
    letterSpacing: -0.5,
  },
  image: { resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
});
```

- [ ] **Step 2: StatusBadge — tipografia label**

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, Radius } from '@/constants/theme';

interface StatusBadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
}

export function StatusBadge({ label, color, backgroundColor }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.1,
  },
});
```

- [ ] **Step 3: ListItem — icon wrap 36×36 Radius.sm, chevron inkMuted**

```typescript
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
  iconColor = Colors.brand,
  iconBg,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = !!onPress,
  danger = false,
}: ListItemProps) {
  const resolvedIconBg = iconBg ?? 'rgba(15,23,42,0.06)';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      {!!icon && (
        <View style={[styles.iconWrap, { backgroundColor: resolvedIconBg }]}>
          <MaterialIcons name={icon} size={20} color={danger ? Colors.error : iconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, danger && { color: Colors.error }]}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? (showChevron && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.inkMuted} />
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
  pressed: { backgroundColor: Colors.surfaceContainerLow },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 2 },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
});
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/avatar-initials.tsx components/ui/status-badge.tsx components/ui/list-item.tsx
git commit -m "feat(design): polish AvatarInitials, StatusBadge and ListItem tokens"
```

---

## Task 8: Tab Bar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Aumentar altura e ativar pill indicador**

O Expo Router não expõe facilmente um `tabBarIndicator` customizado animado via Reanimated no bottom tab nativo. A abordagem mais compatível é usar `tabBarBackground` com um fundo branco e adicionar um indicador via `tabBarActiveBackgroundColor`. Porém, a forma mais robusta é simplesmente melhorar o estilo sem animação de pill (que requereria um custom TabBar completo).

Aplicar as melhorias visuais diretas:

```typescript
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

const TAB_BAR_STYLE = {
  backgroundColor: Colors.card,
  borderTopWidth: 1,
  borderTopColor: Colors.border,
  elevation: 8,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  height: 68,
} as const;

const TAB_LABEL_STYLE = {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 11,
  letterSpacing: 0.2,
} as const;

export default function TabLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isClient = user?.role === 'cliente';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.inkMuted,
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: TAB_LABEL_STYLE,
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarActiveBackgroundColor: Colors.brand + '10',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons name={focused ? 'home' : 'home'} size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: isClient ? t('tabs.bookings') : 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="calendar-today" size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          href: isClient ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="handyman" size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          href: isClient ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="chat-bubble-outline" size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="person-outline" size={focused ? 26 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat(design): upgrade tab bar height, borders and active background pill"
```

---

## Task 9: Telas de Auth — Login e Sign-Up

**Files:**
- Modify: `app/(auth)/login.tsx`
- Modify: `app/(auth)/sign-up.tsx`

- [ ] **Step 1: Login — gradiente de fundo e card Radius.xl**

No `login.tsx`, localizar e substituir:

**1. Importações — adicionar `LinearGradient` (já deve estar disponível):**
```typescript
import { LinearGradient } from 'expo-linear-gradient';
```

**2. Substituir `styles.container` no render — trocar `<SafeAreaView style={styles.container}>` por:**
```tsx
<LinearGradient colors={['#e8f0fe', '#f8fafc']} style={styles.container}>
  {/* conteúdo existente — remover View blobTR e blobBL */}
  <KeyboardAvoidingView ...>
    ...
  </KeyboardAvoidingView>
  {/* Modal de reset permanece */}
</LinearGradient>
```

**3. Remover as Views de blob:**
Deletar completamente:
```tsx
<View style={styles.blobTR} pointerEvents="none" />
<View style={styles.blobBL} pointerEvents="none" />
```

**4. Atualizar styles — somente os itens abaixo:**
```typescript
container: {
  flex: 1,
},
logo: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 42,
  letterSpacing: -2.0,
  color: Colors.brand,
},
title: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 32,
  letterSpacing: -1.2,
  color: Colors.ink,
  textAlign: 'center',
},
subtitle: {
  fontFamily: FontFamily.bodyRegular,
  fontSize: 14,
  color: Colors.inkMuted,
  textAlign: 'center',
  maxWidth: 260,
  lineHeight: 22,
},
card: {
  backgroundColor: Colors.card,
  borderRadius: Radius.xl,
  padding: Spacing.xxxl,
  gap: Spacing.xxl,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 32,
  elevation: 3,
},
googleBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: Spacing.md,
  paddingVertical: Spacing.md + 2,
  backgroundColor: Colors.card,
  borderRadius: Radius.lg,
  borderWidth: 1.5,
  borderColor: Colors.border,
},
resetCard: {
  width: '100%',
  backgroundColor: Colors.card,
  borderRadius: Radius.xl,
  padding: Spacing.xxxl,
  gap: Spacing.xxl,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.10,
  shadowRadius: 32,
  elevation: 10,
},
resetIconWrap: {
  alignSelf: 'center',
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: Colors.brand + '15',
  alignItems: 'center',
  justifyContent: 'center',
},
// Remover blobTR e blobBL dos styles
```

**5. Importações — adicionar `Colors.brand`, `Colors.ink`, `Colors.inkMuted`, `Colors.card`, `Colors.border` (já exportados pelo `theme.ts` atualizado):**
```typescript
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
```

- [ ] **Step 2: Sign-up — mesma linguagem**

No `sign-up.tsx`, aplicar as mesmas mudanças de fundo/card do login:
- Container: `LinearGradient(['#e8f0fe', '#f8fafc'])`
- Card principal: `borderRadius: Radius.xl`, `backgroundColor: Colors.card`, sombra `Colors.ink`
- Logo: `fontSize: 42`, `letterSpacing: -2.0`
- Título: `fontSize: 32`, `letterSpacing: -1.2`, `color: Colors.ink`

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/login.tsx" "app/(auth)/sign-up.tsx"
git commit -m "feat(design): upgrade auth screens with gradient background and Radius.xl card"
```

---

## Task 10: Home — Cliente (`index.tsx`)

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Atualizar header, search bar e hero**

No `styles` do arquivo, substituir os seguintes styles (manter o resto):

```typescript
// Header
header: {
  backgroundColor: Colors.card,
  paddingHorizontal: Spacing.xl,
  paddingTop: Spacing.md,
  paddingBottom: 0,
  gap: Spacing.md,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 4,
  zIndex: 10,
},
headerBrand: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 26,
  color: Colors.brand,
  letterSpacing: -1.0,
  marginTop: -2,
},
// Search
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.card,
  borderRadius: Radius.full,
  borderWidth: 1.5,
  borderColor: Colors.border,
  paddingLeft: Spacing.base,
  paddingRight: Spacing.xs,
  paddingVertical: Spacing.xs,
},
// Hero
heroBanner: {
  marginHorizontal: Spacing.xl,
  marginTop: Spacing.xxl,
  borderRadius: Radius.xl,
  padding: Spacing.xxl,
  gap: Spacing.xl,
  overflow: 'hidden',
},
// Mudar gradiente no render:
// colors={['#e8f0fe', '#f0f5ff', '#f8fafc']}
heroHeadline: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 32,
  color: Colors.ink,
  letterSpacing: -1.2,
  lineHeight: 38,
},
heroSub: {
  fontFamily: FontFamily.bodyRegular,
  fontSize: 13,
  color: Colors.inkMuted,
  lineHeight: 18,
},
heroStatValue: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 20,
  color: Colors.brand,
  letterSpacing: -0.4,
},
heroStatLabel: {
  fontFamily: FontFamily.bodyRegular,
  fontSize: 11,
  color: Colors.inkMuted,
},
```

- [ ] **Step 2: Atualizar category tiles e provider cards**

```typescript
// Category
categoryTile: {
  backgroundColor: Colors.card,
  borderRadius: Radius.lg,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
categoryIconWrap: {
  width: 48,
  height: 48,
  borderRadius: Radius.md,
  backgroundColor: Colors.surfaceContainerHigh,
  alignItems: 'center',
  justifyContent: 'center',
},
categoryLabel: {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 10,
  color: Colors.inkMuted,
  textAlign: 'center',
  letterSpacing: 0.6,
},
// No render do ícone dentro do tile: size={28} em vez de 26

// Provider cards
providerCard: {
  width: 220,
  backgroundColor: Colors.card,
  borderRadius: 20,
  overflow: 'hidden',
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
},
providerCardInitials: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 44,
  color: Colors.ink,
  opacity: 0.25,
  letterSpacing: -1,
},
// Service cards
serviceCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.card,
  borderRadius: Radius.lg,
  padding: Spacing.base,
  gap: Spacing.base,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
servicePrice: {
  fontFamily: FontFamily.headlineSemiBold,
  fontSize: 15,
  color: Colors.ink,
  letterSpacing: -0.3,
},
sectionTitle: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 18,
  color: Colors.ink,
  letterSpacing: -0.4,
},
```

- [ ] **Step 3: Adicionar Haptics no bookBtn**

No `render` do service card, localizar o `Pressable` do `bookBtn` e adicionar:
```tsx
<Pressable
  style={styles.bookBtn}
  onPress={() => {
    Haptics.selectionAsync();
    router.push({ pathname: '/(client)/service-detail' as any, params: { id: String(service.id) } });
  }}
>
```

Importar no topo: `import * as Haptics from 'expo-haptics';`

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/index.tsx"
git commit -m "feat(design): upgrade client home screen with premium tokens and Haptics"
```

---

## Task 11: Home — Prestador (`home-provider.tsx`)

**Files:**
- Modify: `app/(tabs)/home-provider.tsx`

- [ ] **Step 1: Stats cards com border-left colorida**

Substituir os `statCard` no render. Trocar:
```tsx
<View style={[styles.statCard, { backgroundColor: Colors.primaryContainer }]}>
```
por:
```tsx
<View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
```

E para os outros dois:
```tsx
<View style={[styles.statCard, { borderLeftColor: Colors.secondary }]}>
<View style={[styles.statCard, { borderLeftColor: Colors.tertiary }]}>
```

Atualizar `statCard` nos styles:
```typescript
statCard: {
  flex: 1,
  backgroundColor: Colors.card,
  borderRadius: Radius.md,
  padding: Spacing.base,
  gap: Spacing.xs,
  alignItems: 'center',
  borderLeftWidth: 3,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
statValue: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 22,
  color: Colors.ink,
  letterSpacing: -0.5,
},
statLabel: {
  fontFamily: FontFamily.bodyRegular,
  fontSize: 11,
  color: Colors.inkMuted,
  textAlign: 'center',
},
```

- [ ] **Step 2: Quick actions e appointment cards**

```typescript
quickAction: {
  flex: 1,
  backgroundColor: Colors.card,
  borderRadius: Radius.md,
  paddingVertical: Spacing.base,
  alignItems: 'center',
  gap: Spacing.xs,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
quickActionIcon: {
  width: 44,
  height: 44,
  borderRadius: Radius.md,
  backgroundColor: Colors.brand + '12',
  alignItems: 'center',
  justifyContent: 'center',
},
quickActionLabel: {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 11,
  color: Colors.inkMuted,
  textAlign: 'center',
  letterSpacing: 0.2,
},
apptCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.base,
  backgroundColor: Colors.card,
  borderRadius: Radius.md,
  padding: Spacing.base,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
apptIconBox: {
  width: 44,
  height: 44,
  borderRadius: Radius.md,
  backgroundColor: Colors.brand + '12',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
},
apptTime: {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 11,
  color: Colors.brand,
},
sectionTitle: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 17,
  color: Colors.ink,
  letterSpacing: -0.3,
},
headerBrand: {
  fontFamily: FontFamily.headlineExtraBold,
  fontSize: 26,
  color: Colors.brand,
  letterSpacing: -1.0,
  marginTop: -2,
},
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/home-provider.tsx"
git commit -m "feat(design): upgrade provider home stats cards and quick actions"
```

---

## Task 12: Schedule Screen

**Files:**
- Modify: `app/(tabs)/schedule.tsx`

- [ ] **Step 1: Atualizar tokens de cor na tela de agenda**

No `schedule.tsx`, fazer as seguintes substituições nos styles (sem mudar a lógica do calendário):

```typescript
// Substituir cores hardcoded e tokens desatualizados:
// Colors.onSurface → Colors.ink
// Colors.onSurfaceVariant → Colors.inkMuted
// shadowColor: '#000' → Colors.ink
// backgroundColor: Colors.surfaceContainerLowest → Colors.card

// Calendar day cell ativo (o dia selecionado):
// backgroundColor: Colors.primary → Colors.brand
// Texto do dia ativo: color: Colors.onPrimary (já deve estar)

// Appointment cards na lista:
// backgroundColor: Colors.surfaceContainerLowest → Colors.card
// Adicionar elevation 1 (shadowColor: Colors.ink, shadowOffset: {width:0, height:1}, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1)

// Section headers ("Confirmado", "Cancelado", etc.):
// fontFamily → FontFamily.bodySemiBold, fontSize: 10, letterSpacing: 1.4 (overline)
// color: Colors.inkMuted

// GradientColors no LinearGradient do cabeçalho (se houver): já atualizado via token
```

Usar `Ctrl+F` para localizar cada ocorrência de `Colors.onSurface` e `Colors.onSurfaceVariant` e substituir por `Colors.ink` e `Colors.inkMuted` respectivamente ao longo do arquivo.

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/schedule.tsx"
git commit -m "feat(design): apply ink/inkMuted tokens and card elevation to schedule screen"
```

---

## Task 13: Profile Screen

**Files:**
- Modify: `app/(tabs)/profile.tsx`

- [ ] **Step 1: Avatar header e section titles**

No `profile.tsx`:

**Avatar tamanho lg:** No render, localizar o `AvatarInitials` do cabeçalho e garantir `size="lg"` (72px).

**Nome:** `fontFamily: FontFamily.headlineBold, fontSize: 22, color: Colors.ink, letterSpacing: -0.6`

**Section headers** (os títulos tipo "CONTA", "PREFERÊNCIAS"): já usam `bodySemiBold fontSize:10 letterSpacing:1.6` — atualizar para:
```typescript
title: {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 10,
  color: Colors.inkMuted,
  letterSpacing: 1.4,
  paddingLeft: 2,
},
```

**Section card:**
```typescript
card: {
  backgroundColor: Colors.card,
  borderRadius: Radius.md,
  overflow: 'hidden',
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
```

**Divisores entre rows:**
Localizar `row.border` nos styles e substituir:
```typescript
border: {
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: Colors.border,
},
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/profile.tsx"
git commit -m "feat(design): upgrade profile screen avatar size and section card elevation"
```

---

## Task 14: Services + Messages

**Files:**
- Modify: `app/(tabs)/services.tsx`
- Modify: `app/(tabs)/messages.tsx`

- [ ] **Step 1: Services — tokens de cor e elevation**

No `services.tsx`, aplicar o mesmo padrão de token replacement:
- `Colors.onSurface → Colors.ink`
- `Colors.onSurfaceVariant → Colors.inkMuted`
- `shadowColor: '#000' → Colors.ink`
- `backgroundColor: Colors.surfaceContainerLowest → Colors.card` em cards
- `sectionTitle: fontFamily FontFamily.headlineBold, fontSize 18, color Colors.ink, letterSpacing -0.4`

- [ ] **Step 2: Messages — layout básico**

No `messages.tsx`, verificar e atualizar:
- Container `backgroundColor: Colors.surface`
- EmptyState (se existir): manter estrutura, atualizar cores para `Colors.inkMuted`
- Futura lista de conversas: cada item seguirá o padrão `ListItem` ou similar com `Colors.card`

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/services.tsx" "app/(tabs)/messages.tsx"
git commit -m "feat(design): apply ink/card tokens to services and messages screens"
```

---

## Task 15: Account — Payments + Notifications + Receipt + Plans

**Files:**
- Modify: `app/(account)/payments.tsx`
- Modify: `app/(account)/notifications.tsx`
- Modify: `app/(account)/receipt.tsx`
- Modify: `app/(account)/plans.tsx`

- [ ] **Step 1: Payments — card de saldo com LinearGradient**

No `payments.tsx`, localizar o card que exibe o saldo/cartão principal. Substituir o `View` com `backgroundColor` sólida por:

```tsx
import { LinearGradient } from 'expo-linear-gradient';

// No render, substituir o card de saldo por:
<LinearGradient
  colors={['#0054d6', '#003fa3']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.balanceCard}
>
  {/* conteúdo existente do card */}
</LinearGradient>
```

Atualizar o estilo:
```typescript
balanceCard: {
  borderRadius: Radius.xl,
  padding: Spacing.xxl,
  // remover backgroundColor (LinearGradient já fornece)
  shadowColor: Colors.brand,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.28,
  shadowRadius: 16,
  elevation: 6,
},
```

Garantir que textos dentro do card usam `color: '#ffffff'` ou `color: Colors.onPrimary`.

- [ ] **Step 2: Notifications — dot e highlight de não lidos**

No `notifications.tsx`, localizar o componente/style do item de notificação. Adicionar:

Para itens não lidos (onde a lógica já existe), adicionar ao style do container:
```typescript
// Item não lido:
backgroundColor: Colors.brand + '08',
```

Para o dot indicador de não lido (se existir, ou adicionar):
```tsx
<View style={styles.unreadDot} />
```
```typescript
unreadDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: Colors.brand,
  position: 'absolute',
  top: Spacing.base,
  right: Spacing.base,
},
```

- [ ] **Step 3: Receipt — card de total premium**

No `receipt.tsx`, localizar o card principal de resumo/total:
```typescript
summaryCard: {
  backgroundColor: Colors.card,
  borderRadius: Radius.xl,
  padding: Spacing.xxl,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
},
totalAmount: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 22,
  color: Colors.ink,
  letterSpacing: -0.6,
},
```

- [ ] **Step 4: Plans — plano ativo com borda brand**

No `plans.tsx`, localizar o card do plano ativo e adicionar:
```typescript
activePlanCard: {
  // manter backgroundColor existente
  borderWidth: 2,
  borderColor: Colors.brand,
  borderRadius: Radius.lg,
  shadowColor: Colors.brand,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 3,
},
inactivePlanCard: {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: Radius.lg,
  backgroundColor: Colors.card,
  shadowColor: Colors.ink,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add "app/(account)/payments.tsx" "app/(account)/notifications.tsx" "app/(account)/receipt.tsx" "app/(account)/plans.tsx"
git commit -m "feat(design): upgrade payments gradient card, notifications dot, receipt and plans"
```

---

## Task 16: Account — Telas que herdam componentes refatorados

**Files:**
- Modify: `app/(account)/edit-profile.tsx`
- Modify: `app/(account)/addresses.tsx`
- Modify: `app/(account)/privacy-security.tsx`
- Modify: `app/(account)/support.tsx`
- Modify: `app/(account)/about.tsx`
- Modify: `app/(account)/payment-history.tsx`
- Modify: `app/(account)/card-detail.tsx`
- Modify: `app/(account)/add-balance.tsx`
- Modify: `app/(account)/new-card.tsx`
- Modify: `app/(account)/change-password.tsx`
- Modify: `app/(account)/use-terms.tsx`

- [ ] **Step 1: Padrão de token replacement em todas as telas**

Em cada arquivo, aplicar as seguintes substituições (via busca e substituição no editor):

| Antigo | Novo |
|---|---|
| `Colors.onSurface` | `Colors.ink` |
| `Colors.onSurfaceVariant` | `Colors.inkMuted` |
| `shadowColor: '#000'` | `shadowColor: Colors.ink` |
| `backgroundColor: Colors.surfaceContainerLowest` (em cards) | `backgroundColor: Colors.card` |
| `Colors.outlineVariant + '33'` (em dividers) | `Colors.border` |
| `Colors.primary` (em ícones e links) | `Colors.brand` |

**Edit-profile especificamente:**
- `AvatarInitials` no header: garantir `size="lg"` (72px)
- Adicionar elevation 1 no card de informações

**Addresses:**
- ListItem já herda automaticamente
- Card de endereço: `borderRadius: Radius.lg`, elevation 1, `backgroundColor: Colors.card`

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "app/(account)/edit-profile.tsx" "app/(account)/addresses.tsx" "app/(account)/privacy-security.tsx" "app/(account)/support.tsx" "app/(account)/about.tsx" "app/(account)/payment-history.tsx" "app/(account)/card-detail.tsx" "app/(account)/add-balance.tsx" "app/(account)/new-card.tsx" "app/(account)/change-password.tsx" "app/(account)/use-terms.tsx"
git commit -m "feat(design): apply ink/card/brand tokens across all account screens"
```

---

## Task 17: Onboarding

**Files:**
- Modify: `app/(onboarding)/step0.tsx`
- Modify: `app/(onboarding)/step1.tsx`
- Modify: `app/(onboarding)/step2.tsx`
- Modify: `app/(onboarding)/step3.tsx`
- Modify: `app/(onboarding)/step3b.tsx`
- Modify: `app/(onboarding)/step4.tsx`

- [ ] **Step 1: Step0 — gradiente de fundo e headline display**

No `step0.tsx`:
- Trocar container `backgroundColor` por `LinearGradient(['#e8f0fe', '#f8fafc'])` como container raiz
- Headline principal: `fontFamily: FontFamily.headlineExtraBold, fontSize: 32, letterSpacing: -1.2, color: Colors.ink`
- Subtítulo: `fontFamily: FontFamily.bodyRegular, fontSize: 14, color: Colors.inkMuted, lineHeight: 22`
- Logo: `fontFamily: FontFamily.headlineExtraBold, fontSize: 42, letterSpacing: -2.0, color: Colors.brand`

- [ ] **Step 2: Steps 1–3 — ProgressBar e botões**

Em `step1.tsx`, `step2.tsx`, `step3.tsx`, `step3b.tsx`:

**ProgressBar** (se existir `components/ui/progress-bar.tsx`):
```typescript
// No render, garantir:
backgroundColor={Colors.brand}
style={{ borderRadius: Radius.full, height: 4 }}
```

**Botão "voltar" (ghost):**
Localizar o botão de navegação anterior e substituir o estilo por:
```typescript
ghostBtn: {
  borderWidth: 1.5,
  borderColor: Colors.border,
  borderRadius: Radius.lg,
  paddingVertical: Spacing.base,
  paddingHorizontal: Spacing.xxl,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 52,
},
ghostBtnText: {
  fontFamily: FontFamily.headlineBold,
  fontSize: 16,
  color: Colors.ink,
  letterSpacing: 0.2,
},
```

**Botão "avançar":** já usa `GradientButton` — herda automaticamente a melhoria da Task 3.

- [ ] **Step 3: Step4 — ícone de sucesso e CTA animado**

No `step4.tsx`:

```tsx
// Ícone de sucesso:
<View style={styles.successIcon}>
  <MaterialIcons name="check-circle" size={44} color={Colors.brand} />
</View>
```

```typescript
successIcon: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: Colors.brand + '12',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
},
```

Headline: `fontSize: 32, fontFamily: FontFamily.headlineExtraBold, letterSpacing: -1.2, color: Colors.ink`

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(onboarding)/step0.tsx" "app/(onboarding)/step1.tsx" "app/(onboarding)/step2.tsx" "app/(onboarding)/step3.tsx" "app/(onboarding)/step3b.tsx" "app/(onboarding)/step4.tsx"
git commit -m "feat(design): upgrade onboarding with gradient background, display typography and ghost buttons"
```

---

## Task 18: Scheduling

**Files:**
- Modify: `app/(scheduling)/book.tsx`
- Modify: `app/(scheduling)/appointment-detail.tsx`
- Modify: `app/(scheduling)/provider-availability.tsx`

- [ ] **Step 1: Book — chips de horário com pressed spring**

No `book.tsx`, localizar os chips de slot de horário. Adicionar Reanimated pressed scale nos chips:

```tsx
// Para cada chip de horário, usar Animated.Pressable com spring:
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

function SlotChip({ time, selected, onPress }: { time: string; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.94, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      onPress={onPress}
    >
      <Animated.View style={[styles.slotChip, selected && styles.slotChipActive, animStyle]}>
        <Text style={[styles.slotText, selected && styles.slotTextActive]}>{time}</Text>
      </Animated.View>
    </Pressable>
  );
}
```

Styles dos chips:
```typescript
slotChip: {
  paddingHorizontal: Spacing.base,
  paddingVertical: Spacing.sm + 2,
  borderRadius: Radius.md,
  borderWidth: 1.5,
  borderColor: Colors.border,
  backgroundColor: Colors.card,
},
slotChipActive: {
  backgroundColor: Colors.brand,
  borderColor: Colors.brand,
},
slotText: {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 13,
  color: Colors.ink,
},
slotTextActive: {
  color: Colors.onPrimary,
},
```

Se a tela não tiver um componente `SlotChip` separado, aplicar os mesmos styles diretamente nos Pressables existentes.

- [ ] **Step 2: Appointment-detail — status header com LinearGradient**

No `appointment-detail.tsx`, localizar o header de status (View no topo com cor baseada no status). Substituir por `LinearGradient`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_GRADIENTS: Record<string, [string, string]> = {
  confirmado: ['#0054d6', '#003fa3'],
  concluido:  ['#15803d', '#166534'],
  cancelado:  ['#6b7280', '#4b5563'],
  pendente:   ['#d97706', '#b45309'],
};

const gradient = STATUS_GRADIENTS[appointment.status] ?? STATUS_GRADIENTS.pendente;

// No render, substituir View de status por:
<LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.statusHeader}>
  {/* conteúdo existente do header */}
</LinearGradient>
```

```typescript
statusHeader: {
  paddingHorizontal: Spacing.xl,
  paddingVertical: Spacing.xxl,
  // remover backgroundColor
},
```

- [ ] **Step 3: Provider-availability — mesma linguagem de chips**

Aplicar os mesmos styles de `slotChip` / `slotChipActive` da Task 18 Step 1.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add "app/(scheduling)/book.tsx" "app/(scheduling)/appointment-detail.tsx" "app/(scheduling)/provider-availability.tsx"
git commit -m "feat(design): upgrade scheduling with slot chips spring and gradient status header"
```

---

## Task 19: Verificação Final

- [ ] **Step 1: TypeScript completo**

```bash
npx tsc --noEmit
```

Esperado: zero erros de TypeScript.

- [ ] **Step 2: Verificação visual — cliente**

Iniciar o app (`npx expo start`) e verificar com conta de cliente:
- [ ] Login: gradiente de fundo visível, card com raio grande, campos com foco azul
- [ ] Home: hero com headline 32px, search bar com borda, provider cards menores
- [ ] Tab bar: altura 68, active item com fundo azul tenue
- [ ] Profile: avatar lg, seções em cards com sombra
- [ ] Scheduling: slot chips com spring, appointment-detail com header gradiente

- [ ] **Step 3: Verificação visual — prestador**

Com conta de prestador:
- [ ] Home provider: stats cards com border-left colorida
- [ ] Quick actions: icon wraps com `brand+12`
- [ ] Agenda: appointment cards com elevation 1

- [ ] **Step 4: Verificar screens de account**

- [ ] Payments: card de saldo com gradiente azul
- [ ] Notifications: itens não lidos com fundo azul sutil
- [ ] Plans: plano ativo com borda azul

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat(design): visual premium Surface Elevation — complete implementation"
```

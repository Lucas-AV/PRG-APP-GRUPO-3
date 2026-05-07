/**
 * TELA COMPLETADA: O template step0.html continha conteúdo de verificação de documentos
 * por engano. Esta tela foi criada conforme descrição: seleção de tipo de conta (cliente/prestador).
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';

type AccountType = 'cliente' | 'prestador' | null;

const OPTIONS = [
  {
    type: 'cliente' as AccountType,
    icon: 'search' as const,
    title: 'Sou Cliente',
    description: 'Quero contratar serviços e encontrar profissionais qualificados perto de mim.',
    highlight: 'Acesso a centenas de prestadores verificados',
  },
  {
    type: 'prestador' as AccountType,
    icon: 'handyman' as const,
    title: 'Sou Prestador',
    description: 'Quero oferecer meus serviços e conectar com clientes na minha região.',
    highlight: 'Comece a receber pedidos hoje mesmo',
  },
];

export default function Step0Screen() {
  const [selected, setSelected] = useState<AccountType>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/(onboarding)/step1', params: { role: selected } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blobTR} pointerEvents="none" />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logo}>Conecta</Text>
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Como você quer{'\n'}usar o Conecta?</Text>
          <Text style={styles.subtitle}>
            Escolha o tipo de perfil para personalizar sua experiência.
          </Text>
        </View>

        {/* Option cards */}
        <View style={styles.optionList}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.type;
            return (
              <Pressable
                key={opt.type}
                onPress={() => setSelected(opt.type)}
                style={({ pressed }) => [
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  pressed && { opacity: 0.92 },
                ]}
              >
                {/* Icon container */}
                {isSelected ? (
                  <LinearGradient
                    colors={GradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <MaterialIcons name={opt.icon} size={28} color={Colors.onPrimary} />
                  </LinearGradient>
                ) : (
                  <View style={[styles.iconContainer, styles.iconContainerDefault]}>
                    <MaterialIcons name={opt.icon} size={28} color={Colors.primary} />
                  </View>
                )}

                <View style={styles.optionText}>
                  <Text
                    style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}
                  >
                    {opt.title}
                  </Text>
                  <Text style={styles.optionDescription}>{opt.description}</Text>

                  {/* Highlight badge */}
                  <View style={styles.highlightRow}>
                    <MaterialIcons
                      name="check-circle"
                      size={14}
                      color={isSelected ? Colors.primary : Colors.outline}
                    />
                    <Text
                      style={[
                        styles.highlightText,
                        isSelected && styles.highlightTextSelected,
                      ]}
                    >
                      {opt.highlight}
                    </Text>
                  </View>
                </View>

                {/* Selection indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <GradientButton
          label="Continuar"
          onPress={handleContinue}
          disabled={!selected}
          style={styles.cta}
        />

        {/* Footer */}
        <Text style={styles.footerNote}>
          Você poderá trocar o tipo de perfil depois nas configurações.
        </Text>
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  blobTR: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,84,214,0.05)',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
  },

  logoRow: {
    alignItems: 'center',
  },
  logo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    letterSpacing: -1,
    color: Colors.primary,
  },

  headline: {
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    letterSpacing: -1,
    color: Colors.onSurface,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },

  optionList: {
    gap: Spacing.base,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.primary + '33',
    backgroundColor: Colors.surfaceContainerLowest,
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerDefault: {
    backgroundColor: Colors.primaryContainer,
  },

  optionText: {
    flex: 1,
    gap: Spacing.xs,
  },
  optionTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 17,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  highlightText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.outline,
  },
  highlightTextSelected: {
    color: Colors.primary,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  cta: { marginTop: Spacing.xs },

  footerNote: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.outline,
    textAlign: 'center',
    lineHeight: 17,
  },
});

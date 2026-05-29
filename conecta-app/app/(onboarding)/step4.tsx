/**
 * TELA COMPLETADA: O template step4.html continha conteúdo duplicado de verificação.
 * Esta tela foi criada como a finalização do onboarding conforme descrição do projeto.
 */
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import Reanimated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, GradientColors, Spacing, Radius } from '@/constants/theme';

const NEXT_STEPS = [
  {
    icon: 'search' as const,
    title: 'Explore serviços',
    desc: 'Descubra profissionais verificados próximos a você.',
  },
  {
    icon: 'notifications' as const,
    title: 'Ative notificações',
    desc: 'Seja avisado assim que um profissional responder.',
  },
  {
    icon: 'star' as const,
    title: 'Complete seu perfil',
    desc: 'Adicione uma foto e ganhe mais visibilidade.',
  },
];

export default function Step4Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const isPrestador = role === 'prestador';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleEnterApp = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient circle */}
      <View style={styles.bgCircle} />

      <Reanimated.View entering={FadeIn.duration(300).delay(80)} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={GradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <MaterialIcons name="check" size={52} color={Colors.onPrimary} />
          </LinearGradient>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.headline, { opacity: fadeAnim }]}>
          <Text style={styles.title}>
            {isPrestador ? 'Perfil criado!' : 'Tudo pronto!'}
          </Text>
          <Text style={styles.subtitle}>
            {isPrestador
              ? 'Seu perfil de prestador está em análise. Você receberá uma notificação em até 24h.'
              : 'Seu cadastro foi concluído com sucesso. Bem-vindo ao Conecta!'}
          </Text>
        </Animated.View>

        {/* Info card */}
        <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
          <Text style={styles.infoCardTitle}>Bem-vindo ao Conecta</Text>
          <Text style={styles.infoCardDesc}>
            {isPrestador
              ? 'Conecta é a plataforma que conecta prestadores verificados com clientes que precisam de serviços de qualidade na sua região.'
              : 'Conecta é a plataforma que conecta você com prestadores verificados para serviços de qualidade sob demanda.'}
          </Text>
        </Animated.View>

        {/* Next steps */}
        <Animated.View style={[styles.nextSteps, { opacity: fadeAnim }]}>
          <Text style={styles.nextStepsTitle}>PRÓXIMOS PASSOS</Text>
          <View style={styles.stepList}>
            {NEXT_STEPS.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepIconBox}>
                  <MaterialIcons name={step.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <GradientButton
            label="Começar agora!"
            onPress={handleEnterApp}
          />
          <Pressable style={styles.laterBtn} onPress={handleEnterApp}>
            <Text style={styles.laterLabel}>Explorar o app →</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      </Reanimated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  bgCircle: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0,84,214,0.04)',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
    alignItems: 'center',
  },

  // Icon
  iconWrap: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Headline
  headline: {
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 36,
    letterSpacing: -1.2,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  infoCardTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  infoCardDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },

  // Next steps
  nextSteps: {
    width: '100%',
    gap: Spacing.base,
  },
  nextStepsTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  stepList: {
    gap: Spacing.base,
  },
  stepItem: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'center',
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: { flex: 1 },
  stepTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  stepDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
  },

  // CTA
  laterBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    marginTop: Spacing.xs,
  },
  laterLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
  },
});

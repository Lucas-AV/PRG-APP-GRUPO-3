import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { GradientButton } from '@/components/ui/gradient-button';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function Step1Screen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const isPrestador = role === 'prestador';
  const progress = isPrestador ? 1 / 5 : 1 / 3;
  const badge = isPrestador ? 'Passo 1 de 5' : 'Passo 1 de 3';

  const handleContinue = () => {
    router.push({ pathname: '/(onboarding)/step2', params: { role } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopAppBar title="Configuração do Perfil" badge={badge} />

      <Animated.View entering={FadeIn.duration(300).delay(80)} style={styles.scroll}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress */}
        <ProgressBar
          progress={progress}
          label="Progresso do Cadastro"
          percentageLabel={`${Math.round(progress * 100)}%`}
        />

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Informações Pessoais</Text>
          <Text style={styles.subtitle}>
            Vamos começar pelo básico. Essas informações ajudam os clientes a conhecer
            a pessoa por trás do serviço.
          </Text>
        </View>

        {/* Profile photo */}
        <View style={styles.photoSection}>
          <Pressable style={styles.photoWrapper}>
            <View style={styles.photoCircle}>
              <MaterialIcons name="person" size={48} color={Colors.outlineVariant} />
            </View>
            <View style={styles.cameraBtn}>
              <MaterialIcons name="camera-alt" size={18} color={Colors.onPrimary} />
            </View>
          </Pressable>
          <Text style={styles.photoLabel}>CARREGAR FOTO DE PERFIL</Text>
        </View>

        {/* Form fields */}
        <View style={styles.form}>
          <InputField
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {isPrestador && (
            <InputField
              label="Especialidade Principal"
              placeholder="ex: Encanador, Designer Gráfico..."
              value={specialty}
              onChangeText={setSpecialty}
              autoCapitalize="words"
              icon="work"
            />
          )}
        </View>

        {/* Tip card */}
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={22} color={Colors.primary} />
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Dica Rápida</Text>
            <Text style={styles.tipBody}>
              Perfis com fotos profissionais recebem até 4x mais solicitações do que
              perfis sem foto.
            </Text>
          </View>
        </View>
      </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Spacing.xl) }]}>
        <Pressable
          style={({ pressed }) => [styles.draftBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="save" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.draftLabel}>Salvar</Text>
        </Pressable>
        <GradientButton
          label="Continuar →"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
  },

  headline: {
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: Colors.onSurface,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Photo upload
  photoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.5,
  },

  form: {
    gap: Spacing.xxl,
  },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.base,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
  tipText: {
    flex: 1,
    gap: Spacing.xs,
  },
  tipTitle: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 14,
    color: Colors.onPrimaryContainer,
  },
  tipBody: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onPrimaryContainer,
    lineHeight: 17,
    opacity: 0.85,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 4,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  draftLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  continueBtn: {
    flex: 1,
  },
});

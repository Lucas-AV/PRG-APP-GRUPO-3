import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopAppBar title="Crie sua Conta" onBack={() => router.back()} />

      {/* Decorative background */}
      <View style={styles.blobTR} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editorial header */}
          <View style={styles.editorialHeader}>
            <Text style={styles.editorialTitle}>Comece agora</Text>
            <Text style={styles.editorialSubtitle}>
              Encontre os melhores profissionais perto de você.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Nome Completo"
              placeholder="Como quer ser chamado?"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <InputField
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Celular"
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <InputField
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <InputField
              label="Confirmar Senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Terms checkbox */}
            <Pressable
              style={styles.termsRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
              >
                {termsAccepted && (
                  <MaterialIcons name="check" size={14} color={Colors.onPrimary} />
                )}
              </View>
              <Text style={styles.termsText}>
                Aceito os{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text>
                {' e '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </Pressable>

            <GradientButton
              label="Criar Conta"
              onPress={() => router.push('/(onboarding)/step0')}
              disabled={!termsAccepted}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Já tem uma conta?{' '}
              <Text style={styles.footerLink} onPress={() => router.back()}>
                Entrar
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex1: { flex: 1 },

  blobTR: {
    position: 'absolute',
    top: 0,
    right: -40,
    width: '35%',
    height: '55%',
    backgroundColor: 'rgba(0,84,214,0.04)',
    borderRadius: 200,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxxl,
  },

  editorialHeader: {
    gap: Spacing.xs,
  },
  editorialTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 36,
    letterSpacing: -1,
    color: Colors.onSurface,
  },
  editorialSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },

  form: {
    gap: Spacing.xxl,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },
  termsLink: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },

  footer: { alignItems: 'center', paddingBottom: Spacing.xl },
  footerText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },
});

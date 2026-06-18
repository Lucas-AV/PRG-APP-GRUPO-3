import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const openReset = () => {
    setResetEmail('');
    setResetEmailError('');
    setResetSent(false);
    setResetVisible(true);
  };

  const handleResetSubmit = async () => {
    if (!EMAIL_REGEX.test(resetEmail.trim())) {
      setResetEmailError('Informe um e-mail válido.');
      return;
    }
    setResetEmailError('');
    setResetLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setResetLoading(false);
    setResetSent(true);
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Informe um e-mail válido.');
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      const completed = await SecureStore.getItemAsync(`onboarding_${user.id}`);
      if (completed === 'true' || user.onboarding_completed === 1) {
        await SecureStore.setItemAsync(`onboarding_${user.id}`, 'true');
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/step0');
      }
    } catch (e: any) {
      Alert.alert('Erro ao entrar', e.message ?? 'Verifique seus dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative blobs */}
      <View style={styles.blobTR} pointerEvents="none" />
      <View style={styles.blobBL} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + headline */}
          <View style={styles.header}>
            <Text style={styles.logo}>Conecta</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>Bem-vindo de volta!</Text>
              <Text style={styles.subtitle}>
                Entre para acessar seus serviços e agendamentos.
              </Text>
            </View>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <InputField
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              errorMessage={emailError}
            />

            <View style={styles.passwordGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.passwordLabel}>SENHA</Text>
                <Pressable onPress={openReset}>
                  <Text style={styles.forgotLink}>Esqueceu a senha?</Text>
                </Pressable>
              </View>
              <InputField
                label=""
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="lock"
                errorMessage={passwordError}
              />
            </View>

            <GradientButton
              label={loading ? 'Entrando…' : 'Entrar'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.ctaMargin}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou entre com</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button */}
            <Pressable
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
            >
              <MaterialIcons name="language" size={20} color="#4285F4" />
              <Text style={styles.googleLabel}>Entrar com Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ainda não tem uma conta?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/(auth)/sign-up')}
              >
                Cadastre-se
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Reset password modal */}
      <Modal
        visible={resetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setResetVisible(false)}>
          <Pressable style={styles.resetCard} onPress={() => {}}>
            {resetSent ? (
              <>
                <View style={styles.resetIconWrap}>
                  <MaterialIcons name="mark-email-read" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.resetTitle}>E-mail enviado!</Text>
                <Text style={styles.resetSubtitle}>
                  Se este endereço estiver cadastrado, você receberá um link para redefinir sua senha em breve.
                </Text>
                <GradientButton
                  label="Fechar"
                  onPress={() => setResetVisible(false)}
                  style={styles.resetCta}
                />
              </>
            ) : (
              <>
                <View style={styles.resetIconWrap}>
                  <MaterialIcons name="lock-reset" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.resetTitle}>Redefinir senha</Text>
                <Text style={styles.resetSubtitle}>
                  Insira seu e-mail e enviaremos um link para criar uma nova senha.
                </Text>
                <InputField
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChangeText={text => {
                    setResetEmail(text);
                    if (resetEmailError) setResetEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail"
                  errorMessage={resetEmailError}
                />
                <GradientButton
                  label={resetLoading ? 'Enviando…' : 'Enviar link'}
                  onPress={handleResetSubmit}
                  disabled={resetLoading}
                  style={styles.resetCta}
                />
                <Pressable onPress={() => setResetVisible(false)} style={styles.resetCancel}>
                  <Text style={styles.resetCancelLabel}>Cancelar</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex1: { flex: 1 },

  // Decorative background
  blobTR: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,84,214,0.05)',
  },
  blobBL: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(97,91,119,0.05)',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    gap: Spacing.xxxl,
  },

  // Header
  header: {
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  logo: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 38,
    letterSpacing: -1.5,
    color: Colors.primary,
  },
  headerText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 28,
    letterSpacing: -0.5,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.sm,
    padding: Spacing.xxxl,
    gap: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
  },

  // Password group (with "Esqueceu" link outside InputField)
  passwordGroup: {
    gap: Spacing.sm,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 2,
  },
  passwordLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  forgotLink: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  ctaMargin: { marginTop: Spacing.xs },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant + '33',
  },
  dividerText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '1A',
  },
  googleLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },

  // Reset modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  resetCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    gap: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 10,
  },
  resetIconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  resetSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetCta: { marginTop: Spacing.xs },
  resetCancel: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resetCancelLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.outline,
  },

  // Footer
  footer: { alignItems: 'center' },
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

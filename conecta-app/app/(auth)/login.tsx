import { useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

WebBrowser.maybeCompleteAuthSession();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
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

  const [_request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const handleGoogleResponse = async (accessToken: string) => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(accessToken);
      if ('isNewUser' in result) {
        router.push({
          pathname: '/(auth)/google-role' as any,
          params: {
            access_token: accessToken,
            name: result.googleName,
            email: result.googleEmail,
          },
        });
        return;
      }
      const completed = await SecureStore.getItemAsync(`onboarding_${result.id}`);
      router.replace(completed === 'true' ? '/(tabs)' : '/(onboarding)/step0');
    } catch (e: any) {
      Alert.alert('Erro ao entrar com Google', e.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) handleGoogleResponse(accessToken);
    }
  }, [response]);

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
      if (completed === 'true') {
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
              onPress={() => promptAsync()}
              disabled={loading}
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
    backgroundColor: '#f0f5ff',
  },
  flex1: { flex: 1 },

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
    fontSize: 42,
    letterSpacing: -2.0,
    color: Colors.primary,
  },
  headerText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    letterSpacing: -1.0,
    color: Colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  // Card
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
    color: Colors.inkMuted,
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
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },

  // Reset modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  resetCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxxl,
    gap: Spacing.xxl,
    shadowColor: Colors.ink,
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
    backgroundColor: Colors.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetTitle: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  resetSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
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
    color: Colors.inkMuted,
  },
  footerLink: {
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },
});

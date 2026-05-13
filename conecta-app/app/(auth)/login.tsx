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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
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
                <Pressable>
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

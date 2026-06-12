import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Informe seu nome completo.';
    if (!EMAIL_REGEX.test(email)) e.email = 'Informe um e-mail válido.';
    if (phone.replace(/\D/g, '').length < 10) e.phone = 'Informe um celular válido.';
    if (password.length < 6) e.password = 'A senha deve ter pelo menos 6 caracteres.';
    if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'cliente',
      });
      router.push('/(onboarding)/step0');
    } catch (e: any) {
      Alert.alert('Erro ao criar conta', e.message ?? 'Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopAppBar title="Crie sua Conta" onBack={() => router.back()} />

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
              errorMessage={errors.name}
            />
            <InputField
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              errorMessage={errors.email}
            />
            <InputField
              label="Celular"
              placeholder="(00) 00000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              errorMessage={errors.phone}
            />
            <InputField
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorMessage={errors.password}
            />
            <InputField
              label="Confirmar Senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              errorMessage={errors.confirmPassword}
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
              label={loading ? 'Criando conta…' : 'Criar Conta'}
              onPress={handleRegister}
              disabled={!termsAccepted || loading}
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
    backgroundColor: '#f0f5ff',
  },
  flex1: { flex: 1 },

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
    fontSize: 32,
    letterSpacing: -1.2,
    color: Colors.ink,
  },
  editorialSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 22,
  },

  form: {
    gap: Spacing.xxl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
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
    borderColor: Colors.border,
    backgroundColor: Colors.card,
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
    color: Colors.inkMuted,
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
    color: Colors.inkMuted,
  },
  footerLink: {
    fontFamily: FontFamily.headlineBold,
    color: Colors.primary,
  },
});

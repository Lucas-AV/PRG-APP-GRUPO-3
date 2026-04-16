import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!EMAIL_REGEX.test(email)) newErrors.email = 'E-mail inválido';
    if (password.length < 8) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não conferem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Clerk será plugado aqui na fase posterior
  function handleSignUp() {
    if (!validate()) return;
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-12">
          {/* Logo */}
          <Text
            className="text-primary text-center mb-10"
            style={{ fontFamily: 'Newsreader_700Bold', fontSize: 28 }}
          >
            CHRONICLE
          </Text>

          <Text
            className="text-primary mb-1"
            style={{ fontFamily: 'Newsreader_700Bold', fontSize: 26, lineHeight: 32 }}
          >
            Crie sua conta
          </Text>
          <Text
            className="text-on-surface-variant mb-8"
            style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, lineHeight: 22 }}
          >
            Junte-se à comunidade CHRONICLE
          </Text>

          {/* Campos */}
          <Input
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
            icon="user"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name}
            returnKeyType="next"
          />
          <View className="h-3" />
          <Input
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            icon="mail"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
            returnKeyType="next"
          />
          <View className="h-3" />
          <Input
            placeholder="Crie uma senha"
            value={password}
            onChangeText={setPassword}
            icon="lock"
            secureTextEntry
            autoComplete="password"
            error={errors.password}
            returnKeyType="next"
          />
          <View className="h-3" />
          <Input
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="lock"
            secureTextEntry
            error={errors.confirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleSignUp}
          />

          {/* Aceite de termos (RNF07 / LGPD) */}
          <TouchableOpacity
            className="flex-row items-center mt-5 mb-6 gap-3"
            onPress={() => setAcceptedTerms((v) => !v)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
          >
            <View
              className={`w-5 h-5 rounded border items-center justify-center ${
                acceptedTerms
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-lowest border-surface-container-high'
              }`}
            >
              {acceptedTerms && (
                <Text
                  className="text-on-primary"
                  style={{ fontSize: 12, lineHeight: 14 }}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text
              className="text-on-surface-variant flex-1"
              style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, lineHeight: 20 }}
            >
              Aceito os{' '}
              <Text className="text-primary" style={{ fontFamily: 'WorkSans_500Medium' }}>
                Termos de Uso
              </Text>{' '}
              e a{' '}
              <Text className="text-primary" style={{ fontFamily: 'WorkSans_500Medium' }}>
                Política de Privacidade
              </Text>
            </Text>
          </TouchableOpacity>

          <Button
            label="Cadastrar"
            onPress={handleSignUp}
            variant="primary"
            fullWidth
            disabled={!acceptedTerms || !name.trim() || !EMAIL_REGEX.test(email) || password.length < 8}
          />

          {/* Link login */}
          <View className="flex-row justify-center mt-8">
            <Text
              className="text-on-surface-variant"
              style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14 }}
            >
              Já tem conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                className="text-primary"
                style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14 }}
              >
                Faça Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// app/(auth)/sign-in.tsx
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
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/theme';
import { useChronicleStore } from '@/store/chronicleStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const users = useChronicleStore((s) => s.users);
  const setCurrentUser = useChronicleStore((s) => s.setCurrentUser);

  function handleSignIn() {
    setLoginError('');
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      setLoginError('E-mail não encontrado. Verifique e tente novamente.');
      return;
    }

    setCurrentUser(user);

    if (user.role === 'superadmin') {
      router.replace('/admin');
    } else {
      router.replace('/(tabs)');
    }
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
            className="text-primary text-center mb-12"
            style={{ fontFamily: 'Newsreader_700Bold', fontSize: 28 }}
          >
            CHRONICLE
          </Text>

          {/* Título */}
          <Text
            className="text-primary mb-1"
            style={{ fontFamily: 'Newsreader_700Bold', fontSize: 26, lineHeight: 32 }}
          >
            Bem-vindo de volta
          </Text>
          <Text
            className="text-on-surface-variant mb-8"
            style={{ fontFamily: 'WorkSans_400Regular', fontSize: 15, lineHeight: 22 }}
          >
            Entre na sua conta para continuar
          </Text>

          {/* Campos */}
          <Input
            placeholder="seu@email.com"
            value={email}
            onChangeText={(v) => { setEmail(v); setLoginError(''); }}
            icon="mail"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />
          <View className="h-3" />
          <Input
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            icon="lock"
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />

          {/* Erro de login */}
          {loginError !== '' && (
            <Text
              style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13, color: Colors.error, marginTop: 8 }}
            >
              {loginError}
            </Text>
          )}

          {/* Esqueceu a senha */}
          <TouchableOpacity
            className="self-end mt-3 mb-6"
            onPress={() => router.push('/(auth)/reset-password')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              className="text-primary"
              style={{ fontFamily: 'WorkSans_500Medium', fontSize: 13 }}
            >
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>

          <Button
            label="Entrar"
            onPress={handleSignIn}
            variant="primary"
            fullWidth
            disabled={!EMAIL_REGEX.test(email) || password.length < 1}
          />

          {/* Separador */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 bg-surface-container-high" style={{ height: 1 }} />
            <Text
              className="text-on-surface-variant mx-4"
              style={{ fontFamily: 'WorkSans_400Regular', fontSize: 13 }}
            >
              ou
            </Text>
            <View className="flex-1 bg-surface-container-high" style={{ height: 1 }} />
          </View>

          {/* Google */}
          <Button
            label="Entrar com Google"
            onPress={() => {}}
            variant="secondary"
            fullWidth
            leftIcon={<Feather name="globe" size={16} color={Colors.primary} />}
          />

          {/* Link cadastro */}
          <View className="flex-row justify-center mt-8">
            <Text
              className="text-on-surface-variant"
              style={{ fontFamily: 'WorkSans_400Regular', fontSize: 14 }}
            >
              Não tem conta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text
                className="text-primary"
                style={{ fontFamily: 'WorkSans_700Bold', fontSize: 14 }}
              >
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
